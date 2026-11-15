// OAuth for remote MCP servers, as the MCP authorization rules have it: the server's 401
// names its protected-resource document (RFC 9728), that names the authorization server
// (RFC 8414), the client registers itself there (RFC 7591) and signs in with PKCE
// (RFC 7636). Plain functions over `fetch`; apps.js keeps the state and the secrets.
import { createHash, randomBytes } from 'node:crypto'

const REQUEST_MS = 20_000
const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]'])
const PARAM = /([A-Za-z_][A-Za-z0-9_-]*)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|([^,\s]+))/g
const NOT_ANSWERING = 'The sign-in server is not answering now.'

const fail = (message, more) => Object.assign(new Error(message), more)
const strings = value => (Array.isArray(value) ? value.filter(item => typeof item === 'string' && item !== '') : [])
const words = text => String(text ?? '').split(/\s+/).filter(Boolean)
const plain = text => String(text ?? '').replace(/\/+$/, '')

// https everywhere; http only on this computer, for local servers and tests.
export function safeAddress(value) {
  let url
  try { url = new URL(String(value ?? '')) } catch { return undefined }
  return url.protocol === 'https:' || (url.protocol === 'http:' && LOOPBACK.has(url.hostname)) ? url : undefined
}

// The parameters of the Bearer challenge in a WWW-Authenticate header; undefined without one.
export function parseChallenge(header) {
  const text = String(header ?? '')
  const start = /(?:^|[\s,])Bearer(?=[\s,]|$)/i.exec(text)
  if (start === null) return undefined
  const rest = text.slice(start.index + start[0].length)
  const params = {}
  let last = 0
  for (const match of rest.matchAll(PARAM)) {
    // A bare word between two parameters starts another scheme's challenge.
    if (/[^\s,]/.test(rest.slice(last, match.index))) break
    params[match[1].toLowerCase()] = match[2] !== undefined ? match[2].replace(/\\(.)/g, '$1') : match[3]
    last = match.index + match[0].length
  }
  return params
}

async function getJson(address, { fetch: request = fetch } = {}) {
  const url = safeAddress(address)
  if (url === undefined) return undefined
  try {
    const response = await request(url.href, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(REQUEST_MS) })
    if (!response.ok) return undefined
    const value = await response.json()
    return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : undefined
  } catch {
    return undefined
  }
}

// Greets the server with no credentials: a 401 says it wants a sign-in, and how.
export async function probe(serverUrl, { fetch: request = fetch } = {}) {
  let response
  try {
    response = await request(serverUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'ApmixBot', version: '1' } } }),
      signal: AbortSignal.timeout(REQUEST_MS),
    })
  } catch (error) {
    throw fail('No connection to the app: check the internet, and the address.', { cause: error })
  }
  await response.body?.cancel().catch(() => {})
  const challenge = parseChallenge(response.headers.get('www-authenticate'))
  const wanted = response.status === 401 || (response.status === 403 && challenge?.error === 'insufficient_scope')
  return wanted ? { signIn: true, challenge: challenge ?? {} } : { signIn: false }
}

// The server's protected-resource document: where the challenge points, then the two
// well-known addresses. One counts only when it names a sign-in server, and is this server's.
export async function findResource(serverUrl, challenge = {}, options = {}) {
  const server = new URL(serverUrl)
  const path = server.pathname.replace(/\/+$/, '')
  const addresses = [
    challenge.resource_metadata,
    path === '' ? undefined : `${server.origin}/.well-known/oauth-protected-resource${path}`,
    `${server.origin}/.well-known/oauth-protected-resource`,
  ].filter(Boolean)
  for (const address of new Set(addresses)) {
    const document = await getJson(address, options)
    const servers = strings(document?.authorization_servers).filter(item => safeAddress(item) !== undefined)
    if (servers.length === 0) continue
    const named = typeof document.resource === 'string' ? safeAddress(document.resource) : undefined
    if (typeof document.resource === 'string' && named?.origin !== server.origin) continue
    return { ...(named ? { resource: document.resource } : {}), servers, scopes: strings(document.scopes_supported) }
  }
  return undefined
}

function serverFrom(document) {
  const authorize = safeAddress(document.authorization_endpoint)
  const token = safeAddress(document.token_endpoint)
  if (authorize === undefined || token === undefined) return undefined
  const registration = safeAddress(document.registration_endpoint)
  return {
    issuer: document.issuer,
    authorize: authorize.href,
    token: token.href,
    ...(registration ? { registration: registration.href } : {}),
    scopes: strings(document.scopes_supported),
    // RFC 9207: the server says who it is when the browser comes back.
    iss: document.authorization_response_iss_parameter_supported === true,
  }
}

// The sign-in server's own document. Its `issuer` must be the one asked for: a document
// that names another issuer could hand the sign-in to someone else.
export async function findServer(issuer, options = {}) {
  const url = safeAddress(issuer)
  if (url === undefined) return undefined
  const path = url.pathname.replace(/\/+$/, '')
  const addresses = path === ''
    ? [`${url.origin}/.well-known/oauth-authorization-server`, `${url.origin}/.well-known/openid-configuration`]
    : [`${url.origin}/.well-known/oauth-authorization-server${path}`, `${url.origin}/.well-known/openid-configuration${path}`, `${url.origin}${path}/.well-known/openid-configuration`]
  for (const address of addresses) {
    const document = await getJson(address, options)
    if (document === undefined || plain(document.issuer) !== plain(issuer)) continue
    const server = serverFrom(document)
    if (server !== undefined) return server
  }
  return undefined
}

// A server from before the discovery documents keeps its sign-in at its own origin.
export function guessServer(serverUrl) {
  const { origin } = new URL(serverUrl)
  return { issuer: origin, authorize: `${origin}/authorize`, token: `${origin}/token`, registration: `${origin}/register`, scopes: [], iss: false }
}

/** Where the app signs in: its resource document (when it has one) and its sign-in server. */
export async function discover(serverUrl, challenge = {}, options = {}) {
  const resource = await findResource(serverUrl, challenge, options)
  if (resource === undefined) return { server: await findServer(new URL(serverUrl).origin, options) ?? guessServer(serverUrl) }
  for (const issuer of resource.servers) {
    const server = await findServer(issuer, options)
    if (server !== undefined) return { resource, server }
  }
  throw fail('The app names a sign-in server that does not answer as one.')
}

async function post(address, init, request) {
  if (safeAddress(address) === undefined) throw fail('The sign-in server gave an address that is not https.')
  try {
    // No redirect is followed: the request carries, or is answered with, a secret.
    return await request(address, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(REQUEST_MS), ...init })
  } catch {
    throw fail(NOT_ANSWERING, { refused: false })
  }
}

// The client the user made on the app's developer site.
export const ownClient = (id, secret) => (secret ? { id, secret, method: 'client_secret_post' } : { id, method: 'none' })

/** Registers ApmixBot with the sign-in server (RFC 7591). `code: 'no-registration'`: it takes none. */
export async function register(server, redirect, { fetch: request = fetch, version = '' } = {}) {
  if (server.registration === undefined) throw fail('The sign-in server registers no apps.', { code: 'no-registration' })
  const response = await post(server.registration, {
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      client_name: 'ApmixBot',
      redirect_uris: [redirect],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'none',
      application_type: 'native',
      software_id: 'apmixbot',
      ...(version ? { software_version: version } : {}),
    }),
  }, request)
  const reply = await response.json().catch(() => ({}))
  if ([404, 405, 501].includes(response.status)) throw fail('The sign-in server registers no apps.', { code: 'no-registration' })
  if (!response.ok || typeof reply?.client_id !== 'string') {
    throw fail(`The sign-in server did not register ApmixBot: ${reply?.error_description || reply?.error || `HTTP ${response.status}`}`)
  }
  const secret = typeof reply.client_secret === 'string' && reply.client_secret !== '' ? reply.client_secret : undefined
  const method = typeof reply.token_endpoint_auth_method === 'string' ? reply.token_endpoint_auth_method : secret ? 'client_secret_basic' : 'none'
  return { id: reply.client_id, ...(secret ? { secret } : {}), method }
}

// What to ask for: what the server's 401 named, else what its document lists, and what
// was granted before. `offline_access` is what brings a refresh token where it is listed.
export function scopesFor({ challenge = {}, resource, server, granted } = {}) {
  const asked = words(challenge.scope).length > 0 ? words(challenge.scope) : resource?.scopes ?? []
  const scopes = new Set([...asked, ...words(granted)])
  if (scopes.size > 0 && server?.scopes?.includes('offline_access')) scopes.add('offline_access')
  // The scope for the whole mailbox adds nothing beside the one that reads and changes mail.
  if (scopes.has('https://www.googleapis.com/auth/gmail.modify')) scopes.delete('https://mail.google.com/')
  return [...scopes].join(' ')
}

export function pkce() {
  const verifier = randomBytes(48).toString('base64url')
  return { verifier, challenge: createHash('sha256').update(verifier).digest('base64url'), state: randomBytes(24).toString('base64url') }
}

// The server's address as the `resource` of a token: no fragment and no trailing slash.
export function canonicalResource(serverUrl) {
  const url = new URL(serverUrl)
  url.hash = ''
  return url.href.replace(/\/$/, '')
}

export function authorizeUrl({ server, client, redirect, challenge, state, resource, scope }) {
  const url = new URL(server.authorize)
  const params = { response_type: 'code', client_id: client.id, redirect_uri: redirect, code_challenge: challenge, code_challenge_method: 'S256', state, resource, ...(scope ? { scope } : {}) }
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value)
  // Google gives a refresh token only when asked for offline access, with consent.
  if (/(^|\.)accounts\.google\.com$/.test(safeAddress(server.issuer)?.hostname ?? '')) {
    url.searchParams.set('access_type', 'offline')
    url.searchParams.set('prompt', 'consent')
  }
  return url.href
}

/** The code the browser brought back for the sign-in `pending`; throws the reason there is none. */
export function callbackCode(params, pending) {
  if (params.get('state') !== pending.state) throw fail('This sign-in is no longer valid.')
  const iss = params.get('iss')
  if (pending.iss && iss === null) throw fail('The sign-in server did not say who it is.')
  if (iss !== null && plain(iss) !== plain(pending.issuer)) throw fail('The sign-in came back from another server.')
  const error = params.get('error')
  if (error !== null) throw fail(error === 'access_denied' ? 'You did not allow ApmixBot in.' : params.get('error_description') || error)
  const code = params.get('code')
  if (!code) throw fail('The sign-in came back without a code.')
  return code
}

// Some servers answer the token request as a form instead of JSON.
function tokenReply(text) {
  try {
    const value = JSON.parse(text)
    if (value !== null && typeof value === 'object') return value
  } catch {}
  return Object.fromEntries(new URLSearchParams(text))
}

// `refused`: the server turned the request down (true), or only did not answer (false).
async function tokenRequest(endpoint, client, fields, { fetch: request = fetch } = {}) {
  const body = new URLSearchParams({ ...fields, client_id: client.id })
  const headers = { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' }
  if (client.secret) {
    if (client.method === 'client_secret_basic') headers.authorization = `Basic ${Buffer.from(`${encodeURIComponent(client.id)}:${encodeURIComponent(client.secret)}`).toString('base64')}`
    else body.set('client_secret', client.secret)
  }
  const response = await post(endpoint, { headers, body: body.toString() }, request)
  const reply = tokenReply(await response.text().catch(() => ''))
  if (response.status >= 500 || response.status === 429) throw fail(NOT_ANSWERING, { refused: false })
  if (!response.ok || typeof reply.access_token !== 'string' || reply.access_token === '') {
    throw fail(`The sign-in server turned it down: ${reply.error_description || reply.error || `HTTP ${response.status}`}`, { refused: true })
  }
  const seconds = Number(reply.expires_in)
  return {
    access: reply.access_token,
    ...(typeof reply.refresh_token === 'string' && reply.refresh_token !== '' ? { refresh: reply.refresh_token } : {}),
    ...(seconds > 0 ? { expires: Date.now() + seconds * 1000 } : {}),
    ...(typeof reply.scope === 'string' && reply.scope !== '' ? { scope: reply.scope } : {}),
  }
}

/** Trades the code for tokens: `{ access, refresh?, expires?, scope? }`. */
export const exchange = ({ token, client, code, verifier, redirect, resource }, options) => tokenRequest(token, client, {
  grant_type: 'authorization_code', code, redirect_uri: redirect, code_verifier: verifier, ...(resource ? { resource } : {}),
}, options)

/** A new access token from a refresh token. The error's `refused` says whether to sign in again. */
export const refresh = ({ token, client, refresh: value, resource }, options) => tokenRequest(token, client, {
  grant_type: 'refresh_token', refresh_token: value, ...(resource ? { resource } : {}),
}, options)
