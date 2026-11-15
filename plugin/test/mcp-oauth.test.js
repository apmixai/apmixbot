import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { test } from 'node:test'
import * as oauth from '../src/host/mcp-oauth.js'

// A web of addresses: each answers `[status, body, headers]`, anything else is a 404.
// `calls` keeps what was asked, in order.
function web(routes) {
  const calls = []
  const fetch = async (address, init = {}) => {
    const url = String(address)
    calls.push({ url, method: init.method ?? 'GET', headers: init.headers ?? {}, body: init.body, redirect: init.redirect })
    const route = routes[`${init.method ?? 'GET'} ${url}`] ?? routes[url]
    const [status, body, headers = {}] = route === undefined ? [404, {}] : typeof route === 'function' ? route(init) : route
    const text = typeof body === 'string' ? body : JSON.stringify(body)
    return new Response(text, { status, headers })
  }
  return { fetch, calls, asked: () => calls.map(call => call.url) }
}

const SERVER = 'https://mcp.example.com/mcp'
const ISSUER = 'https://auth.example.com'
const METADATA = {
  issuer: ISSUER,
  authorization_endpoint: `${ISSUER}/authorize`,
  token_endpoint: `${ISSUER}/token`,
  registration_endpoint: `${ISSUER}/register`,
  scopes_supported: ['read', 'offline_access'],
  authorization_response_iss_parameter_supported: true,
}

test('only https addresses pass, and http on this computer', () => {
  for (const address of ['https://mcp.example.com/mcp', 'http://localhost:47321/oauth/callback', 'http://127.0.0.1:9/x', 'http://[::1]:9/x']) assert.ok(oauth.safeAddress(address), address)
  for (const address of ['http://mcp.example.com/mcp', 'http://localhost.evil.test/', 'ftp://x/', 'javascript:alert(1)', 'not an address', '', undefined]) assert.equal(oauth.safeAddress(address), undefined, String(address))
})

test('the Bearer challenge of a 401 is read, and only it', () => {
  assert.deepEqual(oauth.parseChallenge('Bearer resource_metadata="https://mcp.example.com/.well-known/oauth-protected-resource/mcp", scope="read write"'), {
    resource_metadata: 'https://mcp.example.com/.well-known/oauth-protected-resource/mcp', scope: 'read write',
  })
  // Another scheme before and after, a comma and an escaped quote inside a value.
  assert.deepEqual(oauth.parseChallenge('Basic realm="x", bearer error="invalid_token", error_description="No token, \\"sign in\\" first", Digest qop="auth"'), {
    error: 'invalid_token', error_description: 'No token, "sign in" first',
  })
  assert.deepEqual(oauth.parseChallenge('Bearer'), {})
  assert.equal(oauth.parseChallenge('Basic realm="x"'), undefined)
  assert.equal(oauth.parseChallenge(null), undefined)
})

test('a server that answers 401 wants a sign-in; one that answers the greeting does not', async () => {
  const closed = web({ [`POST ${SERVER}`]: [401, {}, { 'www-authenticate': 'Bearer resource_metadata="https://mcp.example.com/meta", scope="read"' }] })
  assert.deepEqual(await oauth.probe(SERVER, closed), { signIn: true, challenge: { resource_metadata: 'https://mcp.example.com/meta', scope: 'read' } })
  assert.equal(closed.calls[0].headers.authorization, undefined)
  assert.equal(JSON.parse(closed.calls[0].body).method, 'initialize')

  assert.deepEqual(await oauth.probe(SERVER, web({ [`POST ${SERVER}`]: [401, {}] })), { signIn: true, challenge: {} })
  assert.deepEqual(await oauth.probe(SERVER, web({ [`POST ${SERVER}`]: [403, {}, { 'www-authenticate': 'Bearer error="insufficient_scope"' }] })), { signIn: true, challenge: { error: 'insufficient_scope' } })
  assert.deepEqual(await oauth.probe(SERVER, web({ [`POST ${SERVER}`]: [200, { jsonrpc: '2.0', id: 1, result: {} }] })), { signIn: false })
  assert.deepEqual(await oauth.probe(SERVER, web({ [`POST ${SERVER}`]: [403, {}] })), { signIn: false })
  await assert.rejects(oauth.probe(SERVER, { fetch: async () => { throw new Error('ENOTFOUND') } }), /No connection to the app/)
})

test('the resource document is looked for where the 401 points, then at the two well-known addresses', async () => {
  const document = { resource: SERVER, authorization_servers: [ISSUER], scopes_supported: ['read'] }
  const pointed = web({ 'https://mcp.example.com/meta': [200, document] })
  assert.deepEqual(await oauth.findResource(SERVER, { resource_metadata: 'https://mcp.example.com/meta' }, pointed), { resource: SERVER, servers: [ISSUER], scopes: ['read'] })
  assert.deepEqual(pointed.asked(), ['https://mcp.example.com/meta'])

  const root = web({ 'https://mcp.example.com/.well-known/oauth-protected-resource': [200, { authorization_servers: [ISSUER] }] })
  assert.deepEqual(await oauth.findResource(SERVER, { resource_metadata: 'https://mcp.example.com/meta' }, root), { servers: [ISSUER], scopes: [] })
  assert.deepEqual(root.asked(), [
    'https://mcp.example.com/meta',
    'https://mcp.example.com/.well-known/oauth-protected-resource/mcp',
    'https://mcp.example.com/.well-known/oauth-protected-resource',
  ])
  // A server at the root of its site has one well-known address.
  const bare = web({})
  assert.equal(await oauth.findResource('https://mcp.example.com', {}, bare), undefined)
  assert.deepEqual(bare.asked(), ['https://mcp.example.com/.well-known/oauth-protected-resource'])
})

test('a resource document for another site, without a sign-in server, or at a plain http address does not count', async () => {
  const at = 'https://mcp.example.com/.well-known/oauth-protected-resource'
  const refused = async document => oauth.findResource('https://mcp.example.com', {}, web({ [at]: [200, document] }))
  assert.equal(await refused({ resource: 'https://other.example.com/mcp', authorization_servers: [ISSUER] }), undefined)
  assert.equal(await refused({ resource: 'https://mcp.example.com:8443/mcp', authorization_servers: [ISSUER] }), undefined)
  assert.equal(await refused({ resource: 'https://mcp.example.com/mcp', authorization_servers: [] }), undefined)
  assert.equal(await refused({ resource: 'https://mcp.example.com/mcp', authorization_servers: ['http://auth.example.com'] }), undefined)
  assert.equal(await refused(['not', 'a', 'document']), undefined)
  // The 401 may not send the client to a plain http address either.
  const plainHttp = web({ 'http://mcp.example.com/meta': [200, { authorization_servers: [ISSUER] }] })
  assert.equal(await oauth.findResource('https://mcp.example.com', { resource_metadata: 'http://mcp.example.com/meta' }, plainHttp), undefined)
  assert.equal(plainHttp.asked().includes('http://mcp.example.com/meta'), false)
})

test('the sign-in server\'s document is asked for in the order its issuer gives, and must name that issuer', async () => {
  const oidc = web({ [`${ISSUER}/.well-known/openid-configuration`]: [200, METADATA] })
  const server = await oauth.findServer(ISSUER, oidc)
  assert.deepEqual(server, { issuer: ISSUER, authorize: `${ISSUER}/authorize`, token: `${ISSUER}/token`, registration: `${ISSUER}/register`, scopes: ['read', 'offline_access'], iss: true })
  assert.deepEqual(oidc.asked(), [`${ISSUER}/.well-known/oauth-authorization-server`, `${ISSUER}/.well-known/openid-configuration`])

  const tenant = `${ISSUER}/tenant1`
  const pathed = web({})
  assert.equal(await oauth.findServer(tenant, pathed), undefined)
  assert.deepEqual(pathed.asked(), [
    `${ISSUER}/.well-known/oauth-authorization-server/tenant1`,
    `${ISSUER}/.well-known/openid-configuration/tenant1`,
    `${ISSUER}/tenant1/.well-known/openid-configuration`,
  ])

  const at = `${ISSUER}/.well-known/oauth-authorization-server`
  // Another issuer in the document could hand the sign-in to someone else.
  assert.equal(await oauth.findServer(ISSUER, web({ [at]: [200, { ...METADATA, issuer: 'https://evil.example.com' }] })), undefined)
  // A trailing slash is the same issuer.
  assert.equal((await oauth.findServer(`${ISSUER}/`, web({ [at]: [200, METADATA] }))).token, `${ISSUER}/token`)
  // Its sign-in and token addresses must be https.
  assert.equal(await oauth.findServer(ISSUER, web({ [at]: [200, { ...METADATA, token_endpoint: 'http://auth.example.com/token' }] })), undefined)
  assert.equal(await oauth.findServer('http://auth.example.com', web({})), undefined)
  // A server that registers no apps still signs in, with a client the user made.
  const { registration_endpoint: _none, ...closed } = METADATA
  assert.equal('registration' in await oauth.findServer(ISSUER, web({ [at]: [200, closed] })), false)
})

test('discovery joins the two documents, and falls back on the server\'s own origin', async () => {
  const both = web({
    'https://mcp.example.com/.well-known/oauth-protected-resource/mcp': [200, { resource: SERVER, authorization_servers: ['https://down.example.com', ISSUER], scopes_supported: ['read'] }],
    [`${ISSUER}/.well-known/oauth-authorization-server`]: [200, METADATA],
  })
  const found = await oauth.discover(SERVER, {}, both)
  assert.equal(found.resource.resource, SERVER)
  assert.equal(found.server.issuer, ISSUER)

  // No resource document: the server's own origin is asked as the sign-in server.
  const own = web({ 'https://mcp.example.com/.well-known/oauth-authorization-server': [200, { ...METADATA, issuer: 'https://mcp.example.com' }] })
  assert.deepEqual((await oauth.discover(SERVER, {}, own)).server.issuer, 'https://mcp.example.com')
  // Nothing at all: the addresses of servers from before the documents.
  assert.deepEqual((await oauth.discover(SERVER, {}, web({}))).server, {
    issuer: 'https://mcp.example.com', authorize: 'https://mcp.example.com/authorize', token: 'https://mcp.example.com/token', registration: 'https://mcp.example.com/register', scopes: [], iss: false,
  })
  const dead = web({ 'https://mcp.example.com/.well-known/oauth-protected-resource': [200, { authorization_servers: ['https://down.example.com'] }] })
  await assert.rejects(oauth.discover(SERVER, {}, dead), /sign-in server that does not answer/)
})

test('ApmixBot registers itself as a public client, or says the server takes none', async () => {
  const server = await oauth.findServer(ISSUER, web({ [`${ISSUER}/.well-known/oauth-authorization-server`]: [200, METADATA] }))
  const redirect = 'http://localhost:47321/oauth/callback'
  const open = web({ [`POST ${ISSUER}/register`]: [201, { client_id: 'c-1' }] })
  assert.deepEqual(await oauth.register(server, redirect, { ...open, version: '0.2.0' }), { id: 'c-1', method: 'none' })
  const sent = JSON.parse(open.calls[0].body)
  assert.deepEqual([sent.client_name, sent.redirect_uris, sent.token_endpoint_auth_method, sent.grant_types, sent.software_version], ['ApmixBot', [redirect], 'none', ['authorization_code', 'refresh_token'], '0.2.0'])
  assert.equal(open.calls[0].redirect, 'error')

  // A server that hands out a secret says how it wants it, or gets it in a Basic header.
  assert.deepEqual(await oauth.register(server, redirect, web({ [`POST ${ISSUER}/register`]: [201, { client_id: 'c-2', client_secret: 's-2' }] })), { id: 'c-2', secret: 's-2', method: 'client_secret_basic' })
  assert.deepEqual(await oauth.register(server, redirect, web({ [`POST ${ISSUER}/register`]: [201, { client_id: 'c-3', client_secret: 's-3', token_endpoint_auth_method: 'client_secret_post' }] })), { id: 'c-3', secret: 's-3', method: 'client_secret_post' })

  const { registration: _none, ...closed } = server
  await assert.rejects(oauth.register(closed, redirect, web({})), { code: 'no-registration' })
  await assert.rejects(oauth.register(server, redirect, web({})), { code: 'no-registration' })
  await assert.rejects(oauth.register(server, redirect, web({ [`POST ${ISSUER}/register`]: [400, { error: 'invalid_redirect_uri', error_description: 'Only web addresses' }] })), /did not register ApmixBot: Only web addresses/)
  await assert.rejects(oauth.register({ ...server, registration: 'http://auth.example.com/register' }, redirect, web({})), /not https/)

  assert.deepEqual(oauth.ownClient('mine'), { id: 'mine', method: 'none' })
  assert.deepEqual(oauth.ownClient('mine', 'hush'), { id: 'mine', secret: 'hush', method: 'client_secret_post' })
})

test('the scopes are what the 401 named, else what the resource lists, with what was granted before', () => {
  const server = { scopes: ['read', 'offline_access'] }
  assert.equal(oauth.scopesFor({ challenge: { scope: 'read write' }, resource: { scopes: ['all'] }, server }), 'read write offline_access')
  assert.equal(oauth.scopesFor({ challenge: {}, resource: { scopes: ['all'] }, server: { scopes: [] } }), 'all')
  assert.equal(oauth.scopesFor({ challenge: { scope: 'read' }, server: { scopes: [] }, granted: 'write read' }), 'read write')
  // Nothing to ask for stays nothing: offline access alone is not a request.
  assert.equal(oauth.scopesFor({ challenge: {}, server }), '')
  assert.equal(oauth.scopesFor({ challenge: { scope: 'https://www.googleapis.com/auth/gmail.modify https://mail.google.com/' }, server: { scopes: [] } }), 'https://www.googleapis.com/auth/gmail.modify')
})

test('the sign-in address carries the PKCE challenge, the state and the resource', () => {
  const keys = oauth.pkce()
  assert.equal(keys.challenge, createHash('sha256').update(keys.verifier).digest('base64url'))
  assert.ok(keys.verifier.length >= 43 && keys.state.length >= 32)
  assert.notEqual(oauth.pkce().state, keys.state)

  const server = { issuer: ISSUER, authorize: `${ISSUER}/authorize?tenant=1` }
  const url = new URL(oauth.authorizeUrl({ server, client: { id: 'c-1' }, redirect: 'http://localhost:47321/oauth/callback', challenge: keys.challenge, state: keys.state, resource: SERVER, scope: 'read' }))
  assert.equal(url.origin + url.pathname, `${ISSUER}/authorize`)
  assert.deepEqual(Object.fromEntries(url.searchParams), {
    tenant: '1', response_type: 'code', client_id: 'c-1', redirect_uri: 'http://localhost:47321/oauth/callback',
    code_challenge: keys.challenge, code_challenge_method: 'S256', state: keys.state, resource: SERVER, scope: 'read',
  })
  const google = new URL(oauth.authorizeUrl({ server: { issuer: 'https://accounts.google.com', authorize: 'https://accounts.google.com/o/oauth2/v2/auth' }, client: { id: 'g' }, redirect: 'r', challenge: 'c', state: 's', resource: 'x', scope: '' }))
  assert.deepEqual([google.searchParams.get('access_type'), google.searchParams.get('prompt'), google.searchParams.has('scope')], ['offline', 'consent', false])

  assert.equal(oauth.canonicalResource('HTTPS://MCP.Example.com/mcp/#part'), 'https://mcp.example.com/mcp')
  assert.equal(oauth.canonicalResource('https://mcp.example.com/'), 'https://mcp.example.com')
})

test('what the browser brings back is checked: the state, who sent it, and a refusal', () => {
  const pending = { state: 's-1', issuer: ISSUER, iss: true }
  const back = query => new URLSearchParams(query)
  assert.equal(oauth.callbackCode(back(`code=abc&state=s-1&iss=${encodeURIComponent(ISSUER)}`), pending), 'abc')
  assert.equal(oauth.callbackCode(back(`code=abc&state=s-1&iss=${encodeURIComponent(`${ISSUER}/`)}`), pending), 'abc')
  assert.throws(() => oauth.callbackCode(back('code=abc&state=other'), pending), /no longer valid/)
  // The server said it names itself: an answer without its name is not taken.
  assert.throws(() => oauth.callbackCode(back('code=abc&state=s-1'), pending), /did not say who it is/)
  assert.throws(() => oauth.callbackCode(back('code=abc&state=s-1&iss=https%3A%2F%2Fevil.example.com'), pending), /another server/)
  // A server that does not name itself is not asked to, but a wrong name is still refused.
  const quiet = { ...pending, iss: false }
  assert.equal(oauth.callbackCode(back('code=abc&state=s-1'), quiet), 'abc')
  assert.throws(() => oauth.callbackCode(back('code=abc&state=s-1&iss=https%3A%2F%2Fevil.example.com'), quiet), /another server/)
  assert.throws(() => oauth.callbackCode(back('error=access_denied&state=s-1'), quiet), /You did not allow ApmixBot in/)
  assert.throws(() => oauth.callbackCode(back('error=server_error&error_description=Try+later&state=s-1'), quiet), /Try later/)
  assert.throws(() => oauth.callbackCode(back('state=s-1'), quiet), /without a code/)
})

test('the code is traded for tokens with the verifier, and the client\'s secret goes the way it asked', async () => {
  const token = `${ISSUER}/token`
  const form = call => Object.fromEntries(new URLSearchParams(call.body))
  const open = web({ [`POST ${token}`]: [200, { access_token: 'at-1', refresh_token: 'rt-1', expires_in: 3600, scope: 'read' }] })
  const before = Date.now()
  const grant = await oauth.exchange({ token, client: { id: 'c-1', method: 'none' }, code: 'abc', verifier: 'v-1', redirect: 'http://localhost:47321/oauth/callback', resource: SERVER }, open)
  assert.deepEqual([grant.access, grant.refresh, grant.scope], ['at-1', 'rt-1', 'read'])
  assert.ok(grant.expires >= before + 3600_000 && grant.expires <= Date.now() + 3600_000)
  assert.deepEqual(form(open.calls[0]), { grant_type: 'authorization_code', code: 'abc', redirect_uri: 'http://localhost:47321/oauth/callback', code_verifier: 'v-1', resource: SERVER, client_id: 'c-1' })
  assert.deepEqual([open.calls[0].redirect, open.calls[0].headers.authorization], ['error', undefined])

  const basic = web({ [`POST ${token}`]: [200, 'access_token=at-2&token_type=bearer', { 'content-type': 'application/x-www-form-urlencoded' }] })
  assert.deepEqual(await oauth.exchange({ token, client: { id: 'c 2', secret: 's:2', method: 'client_secret_basic' }, code: 'abc', verifier: 'v', redirect: 'r' }, basic), { access: 'at-2' })
  assert.equal(basic.calls[0].headers.authorization, `Basic ${Buffer.from('c%202:s%3A2').toString('base64')}`)
  assert.equal('client_secret' in form(basic.calls[0]), false)

  const inBody = web({ [`POST ${token}`]: [200, { access_token: 'at-3' }] })
  await oauth.exchange({ token, client: { id: 'c-3', secret: 's-3', method: 'client_secret_post' }, code: 'abc', verifier: 'v', redirect: 'r' }, inBody)
  assert.deepEqual([form(inBody.calls[0]).client_secret, inBody.calls[0].headers.authorization], ['s-3', undefined])

  await assert.rejects(oauth.exchange({ token: 'http://auth.example.com/token', client: { id: 'c' }, code: 'abc', verifier: 'v', redirect: 'r' }, web({})), /not https/)
  await assert.rejects(oauth.exchange({ token, client: { id: 'c' }, code: 'abc', verifier: 'v', redirect: 'r' }, web({ [`POST ${token}`]: [200, {}] })), { refused: true })
})

test('a refresh that is turned down is told apart from a server that only does not answer', async () => {
  const token = `${ISSUER}/token`
  const ask = routes => oauth.refresh({ token, client: { id: 'c-1', method: 'none' }, refresh: 'rt-1', resource: SERVER }, web(routes))
  const renewed = web({ [`POST ${token}`]: [200, { access_token: 'at-2', expires_in: '60' }] })
  const grant = await oauth.refresh({ token, client: { id: 'c-1', method: 'none' }, refresh: 'rt-1', resource: SERVER }, renewed)
  assert.deepEqual([grant.access, 'refresh' in grant, typeof grant.expires], ['at-2', false, 'number'])
  assert.deepEqual(Object.fromEntries(new URLSearchParams(renewed.calls[0].body)), { grant_type: 'refresh_token', refresh_token: 'rt-1', resource: SERVER, client_id: 'c-1' })

  await assert.rejects(ask({ [`POST ${token}`]: [400, { error: 'invalid_grant', error_description: 'The token was revoked' }] }), (error) => {
    assert.equal(error.refused, true)
    assert.match(error.message, /The token was revoked/)
    return true
  })
  await assert.rejects(ask({ [`POST ${token}`]: [401, {}] }), { refused: true })
  for (const status of [500, 503, 429]) await assert.rejects(ask({ [`POST ${token}`]: [status, {}] }), { refused: false })
  await assert.rejects(oauth.refresh({ token, client: { id: 'c-1' }, refresh: 'rt-1' }, { fetch: async () => { throw new Error('ECONNRESET') } }), { refused: false })
})
