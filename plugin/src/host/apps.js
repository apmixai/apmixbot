// Apps: the services a user connects so that Bots work in them as the user (docs/apps.md).
// Each is a remote MCP server, mounted with the engine's MCP client on the plugin context,
// as the GitHub connector is, so every Bot gets its tools as mcp__<server>__<tool>.
//
// state.json keeps what is not secret. A key, an OAuth client and the tokens are one JSON
// value per app in the engine's credential store; they reach the app's server only in the
// request headers built here, and never a Bot's shell, a model or the browser.
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { APP_CATALOG, catalogApp } from '../shared/app-catalog.js'
import * as oauth from './mcp-oauth.js'
import { checkKey } from './providers.js'
import { own } from './store.js'

const MCP_CLIENT = '@apmixbot/dsh-mcp-client'
// Fixed, so that one OAuth client the user registered works on every start.
const CALLBACK_PORT = 47321
const CALLBACK_PATH = '/oauth/callback'
const SIGN_IN_MS = 10 * 60_000
const REFRESH_AHEAD_MS = 60_000
const REFRESH_RETRY_MS = 5 * 60_000
// An app that did not connect is tried again: after half a minute, then twice as long each time.
const RECONNECT_FIRST_MS = 30_000
const RECONNECT_MAX_MS = 30 * 60_000
const TIMER_MAX_MS = 2 ** 31 - 1
const HEADER_NAME = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/
// How the MCP client words a server that no longer takes the token.
const WANTS_SIGN_IN = /\b401\b|unauthori[sz]ed|invalid_token/i
// The HTTP status of the server's answer, which the MCP client keeps on the error it wraps.
const statusOf = error => [error, error?.cause, error?.cause?.cause].map(part => part?.status).find(status => typeof status === 'number')

const invalid = message => Object.assign(new Error(message), { code: 'bot/invalid' })
const text = value => (typeof value === 'string' ? value.trim() : '')
export const serverNameOf = id => id.replace(/_/g, '-')
const refOf = id => `APMIXBOT_APP_${id.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}`
const version = (() => {
  try { return JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).version ?? '' } catch { return '' }
})()

// An address as the page shows it, without the query or fragment that can carry a key.
const shown = (address) => {
  const url = new URL(address)
  return `${url.origin}${url.pathname === '/' ? '' : url.pathname}`
}
// A name for an app added by its address alone: mcp.example.com is "Example".
function nameFromHost(url) {
  const label = url.hostname.replace(/^mcp\./, '').split('.')[0] || 'app'
  return label[0].toUpperCase() + label.slice(1)
}

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => `&#${char.charCodeAt(0)};`)
function page(res, status, title, message) {
  // `connection: close`: the listener is closed after the answer, and must not wait for an idle browser.
  res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', connection: 'close', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'" })
  res.end(`<!doctype html><meta charset="utf-8"><title>${escapeHtml(title)}</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0b0c;color:#f4f4f5;font:15px system-ui,sans-serif"><main style="max-width:420px;padding:28px;border:1px solid #2a2a2e;border-radius:16px;background:#151517;text-align:center"><h1 style="margin:0 0 8px;font-size:20px">${escapeHtml(title)}</h1><p style="margin:0;color:#a1a1aa">${escapeHtml(message)}</p></main>`)
}

export function install(rt) {
  const { ctx, state } = rt
  const port = rt.config.apps?.port ?? CALLBACK_PORT
  // Per app id: its mounted MCP client, what the page shows of it, its chain of changes,
  // and the timer that renews its token.
  const mounts = new Map()
  const statuses = new Map()
  const queues = new Map()
  const timers = new Map()
  // Per app id: how many times in a row it did not connect.
  const failures = new Map()
  // Browser sign-ins under way, by their OAuth `state`.
  const pending = new Map()
  let listeners = []
  let stopped = false
  // Apps a reading host did not mount; they mount once it may write.
  let heldBack = false

  const credentials = () => ctx.get?.('credentials')
  const usable = () => rt.config.apps !== false && credentials() !== undefined
    && typeof ctx.get?.('loader')?.import === 'function' && typeof ctx.plugin === 'function'
  const apps = () => state.apps ?? {}
  const appOf = (id) => {
    const app = own(apps(), text(id))
    if (app === undefined) throw invalid('No such app')
    return app
  }
  const redirectOf = at => `http://localhost:${at}${CALLBACK_PATH}`

  // ---------------------------------------------------------------------------
  // Secrets: `{ key?, client?, registered?, grant? }` per app

  async function readSecret(id) {
    const found = await credentials()?.resolve(refOf(id)).catch(() => undefined)
    try {
      const value = JSON.parse(found?.value ?? '{}')
      return value !== null && typeof value === 'object' ? value : {}
    } catch {
      return {}
    }
  }
  const writeSecret = (id, secret) => credentials().set(refOf(id), JSON.stringify(secret))
  async function dropSecret(id) {
    const store = credentials()
    if ((await store?.describe(refOf(id)).catch(() => undefined))?.configured) await store.unset(refOf(id))
  }

  // An error as the page and the log may show it. The MCP client wraps the server's
  // answer as the cause, and either may quote a header.
  const reason = (error, secret = {}) => {
    let line = [error, error?.cause].filter(Boolean).map(part => String(part?.message ?? part)).join(': ') || 'error'
    const values = [secret.key, secret.client?.secret, secret.registered?.client?.secret, secret.grant?.access, secret.grant?.refresh, secret.grant?.client?.secret]
    for (const value of values) {
      if (typeof value === 'string' && value !== '') line = line.replaceAll(value, '[hidden]')
    }
    return rt.redactSecrets(line).slice(0, 300)
  }

  // ---------------------------------------------------------------------------
  // Mounting

  const setTimer = (id, delay, run) => {
    clearTimeout(timers.get(id))
    const timer = setTimeout(run, Math.min(Math.max(delay, 5_000), TIMER_MAX_MS))
    timer.unref?.()
    timers.set(id, timer)
  }

  async function unmount(id) {
    clearTimeout(timers.get(id))
    timers.delete(id)
    const fiber = mounts.get(id)
    mounts.delete(id)
    if (fiber !== undefined) await Promise.resolve().then(() => fiber.dispose()).catch(() => {})
  }

  const headersFor = (app, secret) => {
    if (app.auth === 'oauth') return { Authorization: `Bearer ${secret.grant.access}` }
    if (app.auth === 'bearer') return { Authorization: `Bearer ${secret.key}` }
    if (app.auth === 'header') return { [app.header ?? 'X-API-Key']: secret.key }
    return {}
  }

  // False when the app was changed again while its server answered.
  async function mountApp(app, secret) {
    const loader = ctx.get('loader')
    const exports = await loader.import(MCP_CLIENT)
    const plugin = loader.unwrapExports?.(exports) ?? exports?.default ?? exports
    const fiber = ctx.plugin(plugin, { transport: 'streamable-http', serverName: serverNameOf(app.id), url: app.url, headers: headersFor(app, secret), failOnStartupError: true })
    mounts.set(app.id, fiber)
    await fiber.await()
    return mounts.get(app.id) === fiber
  }

  // A new access token from the refresh token: the secret with it, or undefined. Turned
  // down, the user signs in again; a sign-in server that only does not answer is asked later.
  async function renew(app, secret) {
    const { grant } = secret
    try {
      const fresh = await oauth.refresh({ token: grant.token, client: grant.client, refresh: grant.refresh, resource: grant.resource })
      // The old token's end is not the new one's: an answer without one would otherwise
      // leave the app due for renewal at every look.
      const { expires: _, ...kept } = grant
      const next = { ...secret, grant: { ...kept, ...fresh, refresh: fresh.refresh ?? grant.refresh } }
      await writeSecret(app.id, next)
      return next
    } catch (error) {
      if (error?.refused === true) statuses.set(app.id, signInAgain(app))
      else {
        statuses.set(app.id, { state: 'error', error: reason(error, secret) })
        setTimer(app.id, REFRESH_RETRY_MS, () => { void sync(app.id) })
      }
      return undefined
    }
  }

  // An app that was signed in, and whose server no longer takes what was saved.
  const signInAgain = app => ({ state: 'sign-in', error: `${app.name} no longer takes the saved sign-in. Sign in again.` })

  const expiring = grant => typeof grant.expires === 'number' && grant.expires - Date.now() < REFRESH_AHEAD_MS

  // What the app is mounted with, or undefined with the status set: off, held back,
  // waiting for a sign-in, or without its key.
  async function secretToMount(app) {
    if (app.enabled === false) {
      statuses.set(app.id, { state: 'off' })
      return undefined
    }
    if (rt.readOnly() !== undefined) {
      heldBack = true
      statuses.set(app.id, { state: 'off' })
      return undefined
    }
    const secret = await readSecret(app.id)
    if (app.auth === 'oauth') {
      if (typeof secret.grant?.access !== 'string') {
        statuses.set(app.id, { state: 'sign-in' })
        return undefined
      }
      if (!secret.grant.refresh) {
        // A token that ran out and cannot be renewed: only a new sign-in brings one.
        if (typeof secret.grant.expires !== 'number' || secret.grant.expires > Date.now()) return secret
        statuses.set(app.id, signInAgain(app))
        return undefined
      }
      if (!expiring(secret.grant)) return secret
      // A token that still holds mounts while the sign-in server is away.
      return await renew(app, secret) ?? (statuses.get(app.id)?.state === 'error' && secret.grant.expires > Date.now() ? secret : undefined)
    }
    if (app.auth !== 'none' && typeof secret.key !== 'string') {
      statuses.set(app.id, { state: 'error', error: 'Its key is missing. Connect the app again.' })
      return undefined
    }
    return secret
  }

  async function reconcile(id) {
    await rt.load()
    await unmount(id)
    const app = own(apps(), id)
    if (app === undefined || stopped || !usable()) {
      statuses.delete(id)
      failures.delete(id)
      return
    }
    let secret = await secretToMount(app)
    if (secret === undefined) failures.delete(id)
    for (let attempt = 0; secret !== undefined; attempt += 1) {
      statuses.set(id, { state: 'connecting' })
      try {
        if (!await mountApp(app, secret)) return
        statuses.set(id, { state: 'ready' })
        failures.delete(id)
        const { grant } = secret
        if (app.auth === 'oauth' && typeof grant.expires === 'number') {
          // Already due: the sign-in server did not answer just now, and is asked again later.
          // A token that cannot be renewed is looked at again when it runs out.
          const wait = grant.expires - Date.now() - (grant.refresh ? REFRESH_AHEAD_MS : 0)
          setTimer(id, wait > 0 || !grant.refresh ? wait : REFRESH_RETRY_MS, () => { void sync(id) })
        }
        return
      } catch (error) {
        await unmount(id)
        const line = reason(error, secret)
        const expired = app.auth === 'oauth' && (statusOf(error) === 401 || WANTS_SIGN_IN.test(line))
        if (expired && attempt === 0 && secret.grant.refresh) {
          secret = await renew(app, secret)
          continue
        }
        statuses.set(id, expired ? signInAgain(app) : { state: 'error', error: line })
        if (expired) {
          failures.delete(id)
          return
        }
        // A server that was away, or a computer still offline at the start, comes back by itself.
        const tries = failures.get(id) ?? 0
        failures.set(id, tries + 1)
        if (tries === 0) rt.warn('apmixbot: the app %s did not connect: %s', app.name, line)
        setTimer(id, Math.min(RECONNECT_FIRST_MS * 2 ** tries, RECONNECT_MAX_MS), () => { void sync(id) })
        return
      }
    }
  }

  // One change at a time for each app; a slow server holds up only its own app.
  function sync(id) {
    const next = (queues.get(id) ?? Promise.resolve()).then(() => reconcile(id)).catch((error) => { rt.warn('apmixbot: apps: %s', reason(error)) })
    queues.set(id, next)
    return next
  }
  const syncAll = () => Promise.all(Object.keys(apps()).map(sync))

  // ---------------------------------------------------------------------------
  // The browser sign-in

  const bind = (host, at) => new Promise((resolve, reject) => {
    const server = createServer((req, res) => { void callback(req, res) })
    server.once('error', reject)
    server.listen(at, host, () => {
      server.off('error', reject)
      resolve(server)
    })
  })

  // The port the browser comes back to, open only while a sign-in is under way.
  async function listen() {
    if (listeners.length > 0) return listeners[0].address().port
    let first
    try {
      first = await bind('127.0.0.1', port)
    } catch (error) {
      throw invalid(error?.code === 'EADDRINUSE'
        ? `Port ${port} on this computer is in use, so the sign-in cannot come back. Close the program that uses it and try again.`
        : `The sign-in cannot come back to this computer: ${error?.code ?? error?.message ?? error}`)
    }
    const actual = first.address().port
    // `localhost` may also mean ::1; a computer without it still has 127.0.0.1.
    const second = await bind('::1', actual).catch(() => undefined)
    listeners = second ? [first, second] : [first]
    return actual
  }
  // `now` also drops a browser that is still connected, for when the plugin stops.
  function closeListeners(now = false) {
    for (const server of listeners.splice(0)) {
      server.close()
      if (now) server.closeAllConnections?.()
    }
  }

  function endPending(key) {
    const entry = pending.get(key)
    if (entry === undefined) return
    clearTimeout(entry.timer)
    pending.delete(key)
    if (pending.size === 0) closeListeners()
  }
  const pendingOf = id => [...pending.values()].filter(entry => entry.appId === id)

  // The user's own client, then the one registered before with this sign-in server, then a new one.
  async function clientFor(app, secret, server, redirect) {
    if (secret.client?.id) return oauth.ownClient(secret.client.id, secret.client.secret)
    const known = secret.registered
    if (known?.issuer === server.issuer && known.redirect === redirect) return known.client
    let client
    try {
      client = await oauth.register(server, redirect, { version })
    } catch (error) {
      if (error?.code !== 'no-registration') throw error
      throw invalid(`${app.name} does not let apps register themselves. Connect it again with a client ID you create on its developer site, with the redirect address ${redirect}.`)
    }
    secret.registered = { issuer: server.issuer, redirect, client }
    await writeSecret(app.id, secret)
    return client
  }

  /** Prepares the sign-in and returns the address the browser opens. */
  async function startSignIn(app, secret) {
    const { challenge = {} } = await oauth.probe(app.url)
    const found = await oauth.discover(app.url, challenge)
    // A sign-in started again takes the place of the one before.
    for (const entry of pendingOf(app.id)) {
      clearTimeout(entry.timer)
      pending.delete(entry.state)
    }
    try {
      const redirect = redirectOf(await listen())
      const client = await clientFor(app, secret, found.server, redirect)
      const keys = oauth.pkce()
      const resource = found.resource?.resource ?? oauth.canonicalResource(app.url)
      const scope = oauth.scopesFor({ challenge, resource: found.resource, server: found.server, granted: secret.grant?.scope })
      const timer = setTimeout(() => endPending(keys.state), SIGN_IN_MS)
      timer.unref?.()
      pending.set(keys.state, { appId: app.id, state: keys.state, verifier: keys.verifier, redirect, issuer: found.server.issuer, iss: found.server.iss, token: found.server.token, client, resource, timer })
      if (!mounts.has(app.id)) statuses.set(app.id, { state: 'sign-in' })
      return oauth.authorizeUrl({ server: found.server, client, redirect, challenge: keys.challenge, state: keys.state, resource, scope })
    } finally {
      if (pending.size === 0) closeListeners()
    }
  }

  async function callback(req, res) {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname !== CALLBACK_PATH) return page(res, 404, 'Not found', 'There is nothing here.')
    const entry = pending.get(url.searchParams.get('state') ?? '')
    const app = entry === undefined ? undefined : own(apps(), entry.appId)
    if (app === undefined) return page(res, 400, 'Sign-in expired', 'This sign-in is no longer valid. Start it again from ApmixBot.')
    // One use; the listener closes only after this answer is on its way.
    clearTimeout(entry.timer)
    pending.delete(entry.state)
    let secret = {}
    try {
      const code = oauth.callbackCode(url.searchParams, entry)
      secret = await readSecret(app.id)
      const fresh = await oauth.exchange({ token: entry.token, client: entry.client, code, verifier: entry.verifier, redirect: entry.redirect, resource: entry.resource })
      await writeSecret(app.id, { ...secret, grant: { issuer: entry.issuer, token: entry.token, client: entry.client, resource: entry.resource, ...fresh } })
      app.issuer = entry.issuer
      await rt.save()
      page(res, 200, `Signed in to ${app.name}`, 'You can close this tab and go back to ApmixBot.')
      void sync(app.id)
    } catch (error) {
      const line = reason(error, secret)
      if (!mounts.has(app.id)) statuses.set(app.id, { state: 'sign-in', error: `The sign-in did not finish: ${line}` })
      page(res, 400, 'Sign-in failed', `${line} Try again from ApmixBot.`)
    } finally {
      if (pending.size === 0) closeListeners()
    }
  }

  // ---------------------------------------------------------------------------
  // The page

  const appsView = () => {
    if (heldBack && rt.readOnly() === undefined) {
      heldBack = false
      void syncAll()
    }
    const redirect = redirectOf(listeners[0]?.address()?.port ?? port)
    if (!usable()) return { available: false, redirect, apps: [] }
    return {
      available: true,
      redirect,
      apps: Object.values(apps()).map((app) => {
        const status = statuses.get(app.id) ?? { state: app.enabled === false ? 'off' : 'connecting' }
        const listed = status.state === 'ready' ? rt.appToolCounts?.().get(serverNameOf(app.id)) : undefined
        return {
          id: app.id,
          name: app.name,
          catalog: app.catalog ?? null,
          url: shown(app.url),
          auth: app.auth,
          enabled: app.enabled !== false,
          state: status.state,
          ...(status.error !== undefined ? { error: status.error } : {}),
          ...(listed !== undefined ? { tools: listed.count, lookedUp: listed.lookedUp } : {}),
          signingIn: pendingOf(app.id).length > 0,
        }
      }),
    }
  }

  const writeCheck = () => {
    const readOnly = rt.readOnly()
    if (readOnly !== undefined) throw new Error(readOnly)
    if (!usable()) throw invalid('This engine cannot connect apps')
  }
  // Capabilities mount MCP servers under their own names; two servers of one name would
  // offer their tools under the same names.
  const capabilityNamed = name => own(state.capabilities?.items, name) !== undefined
  const taken = name => name === 'github' || capabilityNamed(name) || Object.keys(apps()).some(id => serverNameOf(id) === name)
    || APP_CATALOG.some(entry => serverNameOf(entry.id) === name)
  function freeId(name) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const stem = (/^[a-z]/.test(slug) ? slug : `app-${slug}`).slice(0, 24).replace(/-+$/, '')
    let id = stem
    for (let index = 2; taken(id); index += 1) id = `${stem}-${index}`
    return id
  }
  const ownClientOf = (body) => {
    const id = text(body.clientId)
    const secret = text(body.clientSecret)
    return id === '' ? undefined : { id, ...(secret ? { secret } : {}) }
  }

  // Saves the app and what it signs in with, then connects it: an OAuth app through the browser.
  async function connect(app, secret) {
    const added = own(apps(), app.id) === undefined
    state.apps = { ...apps(), [app.id]: app }
    if (Object.keys(secret).length > 0) await writeSecret(app.id, secret)
    await rt.save()
    await sync(app.id)
    if (app.auth !== 'oauth') return appsView()
    try {
      return { ...appsView(), signIn: await startSignIn(app, secret) }
    } catch (error) {
      // A new app whose sign-in cannot start is not kept: its row would ask for a sign-in
      // without the reason, and connecting it again would add a second app.
      if (added) {
        delete state.apps[app.id]
        await rt.save()
        await sync(app.id)
        await dropSecret(app.id)
      }
      throw error
    }
  }

  const endpoints = {
    async 'app-connect'(body) {
      const entry = catalogApp(text(body.id))
      if (entry === undefined) throw invalid('No such app')
      const previous = own(apps(), entry.id)
      if (previous === undefined && capabilityNamed(serverNameOf(entry.id))) {
        throw invalid(`A capability is named ${serverNameOf(entry.id)}. Rename or delete it in Settings → Capabilities, then connect ${entry.name}.`)
      }
      const app = {
        id: entry.id, name: entry.name, url: entry.url, catalog: entry.id, auth: entry.auth,
        ...(entry.header ? { header: entry.header } : {}), enabled: true, addedAt: previous?.addedAt ?? Date.now(),
      }
      if (entry.auth === 'none') return connect(app, {})
      if (entry.auth !== 'oauth') return connect(app, { key: checkKey(body.key) })
      const before = previous === undefined ? {} : await readSecret(entry.id)
      const client = ownClientOf(body) ?? before.client
      if (entry.needsClient && client === undefined) throw invalid(`${entry.name} takes only an OAuth client you made for it. Enter its client ID.`)
      // Tokens and a registration made for another client are of no use to this one.
      return connect(app, client === undefined ? before : { client, ...(before.client?.id === client.id && before.grant ? { grant: before.grant } : {}) })
    },
    async 'app-add'(body) {
      const url = oauth.safeAddress(text(body.url))
      if (url === undefined) throw invalid('Use the app\'s https:// address.')
      const name = (text(body.name) || nameFromHost(url)).slice(0, 40)
      const app = { id: freeId(name), name, url: url.href, catalog: null, enabled: true, addedAt: Date.now() }
      if (body.auth === 'none') return connect({ ...app, auth: 'none' }, {})
      if (body.auth === 'bearer') return connect({ ...app, auth: 'bearer' }, { key: checkKey(body.key) })
      if (body.auth === 'header') {
        const header = text(body.header) || 'X-API-Key'
        if (!HEADER_NAME.test(header)) throw invalid('A header name has no spaces or special characters')
        return connect({ ...app, auth: 'header', header }, { key: checkKey(body.key) })
      }
      // 'auto': the app signs in when its server asks for it.
      const client = ownClientOf(body)
      const signsIn = client !== undefined || (await oauth.probe(url.href)).signIn
      return connect({ ...app, auth: signsIn ? 'oauth' : 'none' }, client === undefined ? {} : { client })
    },
    async 'app-sign-in'(body) {
      const app = appOf(body.id)
      if (app.auth !== 'oauth') throw invalid(`${app.name} needs no sign-in`)
      return { ...appsView(), signIn: await startSignIn(app, await readSecret(app.id)) }
    },
    async 'app-enable'(body) {
      const app = appOf(body.id)
      app.enabled = body.enabled === true
      await rt.save()
      await sync(app.id)
      return appsView()
    },
    async 'app-retry'(body) {
      await sync(appOf(body.id).id)
      return appsView()
    },
    async 'app-remove'(body) {
      const { id } = appOf(body.id)
      for (const entry of pendingOf(id)) endPending(entry.state)
      delete state.apps[id]
      await rt.save()
      await sync(id)
      await dropSecret(id)
      return appsView()
    },
  }

  async function appEndpoint(endpoint, body) {
    writeCheck()
    return endpoints[endpoint](body ?? {})
  }

  ctx.effect(() => {
    stopped = false
    void rt.load().then(() => syncAll()).catch(() => {})
    return () => {
      stopped = true
      for (const key of pending.keys()) endPending(key)
      closeListeners(true)
      for (const id of new Set([...mounts.keys(), ...timers.keys()])) void unmount(id)
    }
  }, 'apmixbot: apps')

  Object.assign(rt, { appsView, appEndpoint, appServerNames: () => Object.keys(apps()).map(serverNameOf) })
}
