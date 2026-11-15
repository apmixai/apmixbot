import assert from 'node:assert/strict'
import { createHash, randomBytes } from 'node:crypto'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { hostname, tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { apply } from '../index.js'
import { fakeContext } from './fake-ctx.js'

const fresh = prefix => `${prefix}-${randomBytes(12).toString('hex')}`
const TEAM = {
  version: 1,
  mainBotIds: ['m1'],
  revision: 1,
  bots: { m1: { id: 'm1', sessionId: 'm1', name: 'Chief', role: 'Chief of Staff', instructions: '', createdAt: 1 } },
  rooms: {},
  exchanges: [],
  exchangeTurns: {},
  questions: {},
}

// The plugin with a credential store in memory (`vault`) and a loader that hands out a fake
// MCP client and records each mount. `failing(config)` returns the error a mount ends in.
// `home` and `vault` of an earlier setup start the same team again.
function setup(t, { config = { apps: { port: 0 } }, failing = () => undefined, services = {}, home = newHome(), vault = {} } = {}) {
  const mounts = []
  const plugin = { name: 'mcp-client', apply() {} }
  const loader = {
    import: async (name) => { assert.equal(name, '@apmixbot/dsh-mcp-client'); return { default: plugin } },
    unwrapExports: exports => exports.default,
  }
  const credentials = {
    resolve: async ref => (ref in vault ? { value: vault[ref] } : undefined),
    describe: async ref => ({ configured: ref in vault, writable: true }),
    set: async (ref, value) => { vault[ref] = value },
    unset: async (ref) => { delete vault[ref] },
  }
  const ctx = fakeContext({ services: { loader, credentials, ...services } })
  ctx.plugin = (given, mountConfig) => {
    assert.equal(given, plugin)
    const mount = { config: mountConfig, disposed: false }
    mounts.push(mount)
    return {
      await: async () => {
        const error = failing(mountConfig)
        if (error) throw error
      },
      dispose: () => { mount.disposed = true },
    }
  }
  const register = ctx.connection.fetch.register
  ctx.connection.fetch.register = (route) => { ctx.route = route; return register(route) }
  apply(ctx, { home, github: false, ...config })
  t.after(async () => { await ctx.dispose(); rmSync(home, { recursive: true, force: true, maxRetries: 5 }) })
  const call = async (endpoint, payload) => {
    const response = await ctx.route.fetch(new Request('http://localhost/api/bot', { method: 'POST', body: JSON.stringify({ endpoint, payload }) }))
    return response.json()
  }
  const view = async () => (await call('state', {})).value.apps
  const appNamed = async id => (await view()).apps.find(app => app.id === id)
  const saved = () => readFileSync(join(home, 'state.json'), 'utf8')
  return { ctx, call, view, appNamed, saved, mounts, vault, home }
}

function newHome() {
  const home = mkdtempSync(join(tmpdir(), 'apmixbot-apps-'))
  writeFileSync(join(home, 'state.json'), JSON.stringify(TEAM))
  return home
}

const until = async (check, what = 'the wait') => {
  for (let tries = 0; tries < 300; tries += 1) {
    if (await check()) return
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  assert.fail(`${what} did not come`)
}

// An MCP server with its own sign-in, on this computer. /mcp wants a token, /open does not.
// `refresh(form)` answers a refresh request as `[status, body]`.
async function fakeSite(t, { expiresIn = 3600, registers = true, refresh = () => [400, { error: 'invalid_grant' }] } = {}) {
  const site = { calls: [], access: fresh('access'), refreshToken: fresh('refresh'), challenge: '' }
  const server = createServer(async (req, res) => {
    let raw = ''
    for await (const chunk of req) raw += chunk
    const url = new URL(req.url, site.origin)
    const form = Object.fromEntries(new URLSearchParams(raw))
    site.calls.push({ method: req.method, path: url.pathname, form, authorization: req.headers.authorization })
    const send = (status, value, headers = {}) => { res.writeHead(status, { 'content-type': 'application/json', ...headers }); res.end(JSON.stringify(value)) }
    if (url.pathname === '/mcp') return send(401, {}, { 'www-authenticate': `Bearer resource_metadata="${site.origin}/.well-known/oauth-protected-resource/mcp", scope="read"` })
    if (url.pathname === '/open') return send(200, { jsonrpc: '2.0', id: 1, result: {} })
    if (url.pathname === '/.well-known/oauth-protected-resource/mcp') return send(200, { resource: `${site.origin}/mcp`, authorization_servers: [site.origin], scopes_supported: ['read'] })
    if (url.pathname === '/.well-known/oauth-authorization-server') {
      return send(200, {
        issuer: site.origin, authorization_endpoint: `${site.origin}/authorize`, token_endpoint: `${site.origin}/token`,
        ...(registers ? { registration_endpoint: `${site.origin}/register` } : {}),
        scopes_supported: ['read', 'offline_access'], authorization_response_iss_parameter_supported: true,
      })
    }
    if (url.pathname === '/register') return send(201, { client_id: 'client-1' })
    if (url.pathname === '/token' && form.grant_type === 'refresh_token') return send(...refresh(form))
    if (url.pathname === '/token') {
      const proven = createHash('sha256').update(form.code_verifier ?? '').digest('base64url') === site.challenge
      if (form.code !== 'good-code' || !proven) return send(400, { error: 'invalid_grant', error_description: 'This code is not valid' })
      return send(200, { access_token: site.access, refresh_token: site.refreshToken, expires_in: expiresIn, scope: 'read' })
    }
    return send(404, {})
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  site.origin = `http://127.0.0.1:${server.address().port}`
  t.after(() => new Promise((resolve) => { server.closeAllConnections(); server.close(resolve) }))
  return site
}

// What the browser does with the sign-in address: comes back to the app with a code.
async function comeBack(site, signIn, query = {}) {
  const asked = new URL(signIn).searchParams
  site.challenge = asked.get('code_challenge')
  const back = new URL(asked.get('redirect_uri').replace('localhost', '127.0.0.1'))
  for (const [name, value] of Object.entries({ code: 'good-code', state: asked.get('state'), iss: site.origin, ...query })) {
    if (value !== undefined) back.searchParams.set(name, value)
  }
  const response = await fetch(back)
  return { status: response.status, text: await response.text(), back }
}

test('an app that takes a key is mounted with it in the right header, and the key stays in the credential store', async (t) => {
  const { call, view, saved, mounts, vault } = setup(t)
  assert.deepEqual(await view(), { available: true, redirect: 'http://localhost:0/oauth/callback', apps: [] })

  const key = fresh('kagi')
  const connected = await call('app-connect', { id: 'kagi', key: ` ${key} ` })
  assert.equal(connected.ok, true, JSON.stringify(connected))
  assert.deepEqual(connected.value.apps, [{ id: 'kagi', name: 'Kagi', catalog: 'kagi', url: 'https://mcp.kagi.com/mcp', auth: 'bearer', enabled: true, state: 'ready', signingIn: false }])
  assert.equal('signIn' in connected.value, false)
  assert.deepEqual(mounts[0].config, { transport: 'streamable-http', serverName: 'kagi', url: 'https://mcp.kagi.com/mcp', headers: { Authorization: `Bearer ${key}` }, failOnStartupError: true })

  const mapsKey = fresh('maps')
  await call('app-connect', { id: 'google_maps', key: mapsKey })
  assert.deepEqual([mounts[1].config.serverName, mounts[1].config.headers], ['google-maps', { 'X-Goog-Api-Key': mapsKey }])

  // An app with no account is mounted with no header and keeps no secret.
  await call('app-connect', { id: 'deepwiki' })
  assert.deepEqual([mounts[2].config.serverName, mounts[2].config.headers], ['deepwiki', {}])

  assert.deepEqual(Object.keys(vault).sort(), ['APMIXBOT_APP_GOOGLE_MAPS', 'APMIXBOT_APP_KAGI'])
  assert.deepEqual(JSON.parse(vault.APMIXBOT_APP_KAGI), { key })
  const answer = JSON.stringify(await call('state', {}))
  for (const secret of [key, mapsKey]) assert.ok(!answer.includes(secret) && !saved().includes(secret))
  assert.deepEqual(Object.keys(JSON.parse(saved()).apps), ['kagi', 'google_maps', 'deepwiki'])
})

test('a key app without its key, an unknown app and a plain http address are refused, and nothing is kept', async (t) => {
  const { call, view, mounts, vault } = setup(t)
  assert.deepEqual((await call('app-connect', { id: 'kagi' })).error, { code: 'bot/invalid', message: 'Enter the API key', details: {} })
  assert.equal((await call('app-connect', { id: 'kagi', key: 'two words' })).ok, false)
  assert.equal((await call('app-connect', { id: 'github', key: 'x' })).error.message, 'No such app')
  assert.equal((await call('app-add', { url: 'http://mcp.example.com/mcp', auth: 'none' })).error.message, 'Use the app\'s https:// address.')
  assert.equal((await call('app-add', { url: 'https://mcp.example.com/mcp', auth: 'header', header: 'Bad Header', key: 'k-123456' })).error.message, 'A header name has no spaces or special characters')
  // Google's own servers take only a client the user made: nothing is asked of Google without one.
  assert.match((await call('app-connect', { id: 'gmail' })).error.message, /^Gmail takes only an OAuth client you made for it/)
  for (const endpoint of ['app-sign-in', 'app-enable', 'app-retry', 'app-remove']) assert.equal((await call(endpoint, { id: 'nope' })).error.message, 'No such app')
  assert.deepEqual([(await view()).apps, mounts.length, Object.keys(vault)], [[], 0, []])
})

test('an app added by its address signs in through the browser and is mounted with the token', async (t) => {
  const site = await fakeSite(t)
  const { call, view, appNamed, saved, mounts, vault } = setup(t)

  const added = await call('app-add', { url: `${site.origin}/mcp`, name: 'Fake Notes', auth: 'auto' })
  assert.equal(added.ok, true, JSON.stringify(added))
  const asked = new URL(added.value.signIn)
  assert.equal(asked.origin + asked.pathname, `${site.origin}/authorize`)
  assert.deepEqual([asked.searchParams.get('client_id'), asked.searchParams.get('resource'), asked.searchParams.get('scope'), asked.searchParams.get('code_challenge_method')], ['client-1', `${site.origin}/mcp`, 'read offline_access', 'S256'])
  assert.match(asked.searchParams.get('redirect_uri'), /^http:\/\/localhost:\d+\/oauth\/callback$/)
  // The page shows the redirect address the sign-in listens on.
  assert.equal((await view()).redirect, asked.searchParams.get('redirect_uri'))
  assert.deepEqual(await appNamed('fake-notes'), { id: 'fake-notes', name: 'Fake Notes', catalog: null, url: `${site.origin}/mcp`, auth: 'oauth', enabled: true, state: 'sign-in', signingIn: true })
  assert.equal(mounts.length, 0)
  // ApmixBot registered itself with the address it listens on.
  assert.equal(site.calls.some(entry => entry.path === '/register'), true)

  const { status, text, back } = await comeBack(site, added.value.signIn)
  assert.equal(status, 200)
  assert.match(text, /Signed in to Fake Notes/)
  await until(async () => (await appNamed('fake-notes')).state === 'ready', 'the mount')
  assert.deepEqual(await appNamed('fake-notes'), { id: 'fake-notes', name: 'Fake Notes', catalog: null, url: `${site.origin}/mcp`, auth: 'oauth', enabled: true, state: 'ready', signingIn: false })
  assert.deepEqual(mounts[0].config, { transport: 'streamable-http', serverName: 'fake-notes', url: `${site.origin}/mcp`, headers: { Authorization: `Bearer ${site.access}` }, failOnStartupError: true })

  // The token request proved the code with the verifier, and named the resource.
  const token = site.calls.find(entry => entry.path === '/token').form
  assert.deepEqual([token.grant_type, token.code, token.client_id, token.resource, token.redirect_uri], ['authorization_code', 'good-code', 'client-1', `${site.origin}/mcp`, asked.searchParams.get('redirect_uri')])

  const kept = JSON.parse(vault.APMIXBOT_APP_FAKE_NOTES)
  assert.deepEqual([kept.grant.access, kept.grant.refresh, kept.grant.issuer, kept.registered.client.id], [site.access, site.refreshToken, site.origin, 'client-1'])
  const answer = JSON.stringify(await call('state', {}))
  for (const secret of [site.access, site.refreshToken]) assert.ok(!answer.includes(secret) && !saved().includes(secret))
  assert.equal(JSON.parse(saved()).apps['fake-notes'].issuer, site.origin)
  // The listener was only there for the sign-in.
  await assert.rejects(fetch(back))
})

// A port that is free now, for a host that comes back to the same redirect address each time.
const freePort = () => new Promise((resolve) => {
  const server = createServer()
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address()
    server.close(() => resolve(port))
  })
})

test('a sign-in that comes back wrong is refused and can be started again', async (t) => {
  const site = await fakeSite(t)
  const { call, appNamed, mounts, vault } = setup(t, { config: { apps: { port: await freePort() } } })
  const added = await call('app-add', { url: `${site.origin}/mcp`, name: 'Fake' })

  // Another `state`: not this sign-in, which stays open.
  assert.equal((await comeBack(site, added.value.signIn, { state: 'someone-else' })).status, 400)
  assert.equal((await appNamed('fake')).signingIn, true)
  // The sign-in server names itself; an answer in another server's name is not taken.
  const wrong = await comeBack(site, added.value.signIn, { iss: 'https://evil.example.com' })
  assert.equal(wrong.status, 400)
  assert.match(wrong.text, /another server/)
  assert.deepEqual(await appNamed('fake'), { id: 'fake', name: 'Fake', catalog: null, url: `${site.origin}/mcp`, auth: 'oauth', enabled: true, state: 'sign-in', error: 'The sign-in did not finish: The sign-in came back from another server.', signingIn: false })
  assert.equal(site.calls.some(entry => entry.path === '/token'), false)
  assert.equal('grant' in JSON.parse(vault.APMIXBOT_APP_FAKE), false)

  // The user said no; then signs in again, with the client registered the first time.
  const again = await call('app-sign-in', { id: 'fake' })
  assert.match((await comeBack(site, again.value.signIn, { code: undefined, error: 'access_denied' })).text, /You did not allow ApmixBot in/)
  const third = await call('app-sign-in', { id: 'fake' })
  // A code the server does not know.
  assert.match((await comeBack(site, third.value.signIn, { code: 'stale-code' })).text, /This code is not valid/)
  const last = await call('app-sign-in', { id: 'fake' })
  assert.equal((await comeBack(site, last.value.signIn)).status, 200)
  await until(async () => (await appNamed('fake')).state === 'ready', 'the mount')
  assert.equal(mounts.length, 1)
  assert.equal(site.calls.filter(entry => entry.path === '/register').length, 1)
  assert.equal((await call('app-sign-in', { id: 'nope' })).ok, false)
})

test('a server that asks for no sign-in is connected without one', async (t) => {
  const site = await fakeSite(t)
  const { call, mounts, vault } = setup(t)
  const added = await call('app-add', { url: `${site.origin}/open` })
  assert.equal('signIn' in added.value, false)
  // Named after its host when the user gave no name.
  assert.deepEqual(added.value.apps.map(app => [app.id, app.name, app.auth, app.state]), [['app-127', '127', 'none', 'ready']])
  assert.deepEqual([mounts[0].config.headers, Object.keys(vault)], [{}, []])
  assert.equal((await call('app-sign-in', { id: 'app-127' })).error.message, '127 needs no sign-in')
})

test('a token about to run out is renewed before the app is mounted; a refusal asks for a new sign-in', async (t) => {
  const renewedAccess = fresh('access')
  const answers = { next: () => [200, { access_token: renewedAccess, expires_in: 3600 }] }
  const site = await fakeSite(t, { expiresIn: 30, refresh: form => answers.next(form) })
  const { call, appNamed, mounts, vault } = setup(t)
  const added = await call('app-add', { url: `${site.origin}/mcp`, name: 'Fake' })
  await comeBack(site, added.value.signIn)
  await until(async () => (await appNamed('fake')).state === 'ready', 'the mount')
  assert.equal(mounts[0].config.headers.Authorization, `Bearer ${renewedAccess}`)
  const kept = JSON.parse(vault.APMIXBOT_APP_FAKE).grant
  // The refresh token stays when the server sends no new one.
  assert.deepEqual([kept.access, kept.refresh], [renewedAccess, site.refreshToken])
  const refresh = site.calls.find(entry => entry.form.grant_type === 'refresh_token').form
  assert.deepEqual([refresh.refresh_token, refresh.client_id, refresh.resource], [site.refreshToken, 'client-1', `${site.origin}/mcp`])

  // Make the token due again; the sign-in server is away: the app stays connected on the token it has.
  const due = () => { vault.APMIXBOT_APP_FAKE = JSON.stringify({ ...JSON.parse(vault.APMIXBOT_APP_FAKE), grant: { ...kept, expires: Date.now() + 20_000 } }) }
  due()
  answers.next = () => [503, {}]
  assert.equal((await call('app-retry', { id: 'fake' })).value.apps[0].state, 'ready')
  assert.deepEqual([mounts[0].disposed, mounts.length], [true, 2])

  // The sign-in server turns the refresh down: the user signs in again.
  due()
  answers.next = () => [400, { error: 'invalid_grant' }]
  assert.deepEqual((await call('app-retry', { id: 'fake' })).value.apps[0], {
    id: 'fake', name: 'Fake', catalog: null, url: `${site.origin}/mcp`, auth: 'oauth', enabled: true, state: 'sign-in',
    error: 'Fake no longer takes the saved sign-in. Sign in again.', signingIn: false,
  })
  assert.deepEqual([mounts[1].disposed, mounts.length], [true, 2])
})

test('a renewed token keeps no end but its own; one that ran out and cannot be renewed asks for a new sign-in', async (t) => {
  const site = await fakeSite(t, { expiresIn: 30, refresh: () => [200, { access_token: fresh('access') }] })
  const { call, appNamed, mounts, vault } = setup(t)
  const added = await call('app-add', { url: `${site.origin}/mcp`, name: 'Fake' })
  await comeBack(site, added.value.signIn)
  await until(async () => (await appNamed('fake')).state === 'ready', 'the mount')
  const renewals = () => site.calls.filter(entry => entry.form.grant_type === 'refresh_token').length
  // The answer named no end: the first token's end must not make every later look renew again.
  assert.deepEqual(['expires' in JSON.parse(vault.APMIXBOT_APP_FAKE).grant, renewals()], [false, 1])
  assert.equal((await call('app-retry', { id: 'fake' })).value.apps[0].state, 'ready')
  assert.equal(renewals(), 1)

  const secret = JSON.parse(vault.APMIXBOT_APP_FAKE)
  const { refresh: _, ...grant } = secret.grant
  vault.APMIXBOT_APP_FAKE = JSON.stringify({ ...secret, grant: { ...grant, expires: Date.now() - 1000 } })
  const mounted = mounts.length
  const retried = (await call('app-retry', { id: 'fake' })).value.apps[0]
  assert.deepEqual([retried.state, retried.error, mounts.length], ['sign-in', 'Fake no longer takes the saved sign-in. Sign in again.', mounted])
})

test('a server that no longer takes the token gets a renewed one once, then the user signs in again', async (t) => {
  const renewedAccess = fresh('access')
  let renewals = 0
  const site = await fakeSite(t, { refresh: () => { renewals += 1; return [200, { access_token: renewedAccess, expires_in: 3600 }] } })
  const stale = new Set()
  const { call, appNamed, mounts } = setup(t, { failing: mount => (stale.has(mount.headers.Authorization) ? new Error('Error POSTing to endpoint (HTTP 401): invalid_token') : undefined) })
  stale.add(`Bearer ${site.access}`)
  const added = await call('app-add', { url: `${site.origin}/mcp`, name: 'Fake' })
  await comeBack(site, added.value.signIn)
  await until(async () => (await appNamed('fake')).state === 'ready', 'the second mount')
  assert.deepEqual(mounts.map(mount => [mount.config.headers.Authorization, mount.disposed]), [[`Bearer ${site.access}`, true], [`Bearer ${renewedAccess}`, false]])

  // The renewed token is turned away too: no second renewal in the same attempt.
  stale.add(`Bearer ${renewedAccess}`)
  renewals = 0
  const retried = await call('app-retry', { id: 'fake' })
  assert.equal(retried.value.apps[0].state, 'sign-in')
  assert.equal(renewals, 1)
})

// The MCP client's error keeps the server's status on its cause; its words need not name it.
test('a server that answers 401 asks for a new sign-in, whatever the error says', async (t) => {
  const site = await fakeSite(t, { refresh: () => [200, { access_token: fresh('access'), expires_in: 3600 }] })
  const refused = () => Object.assign(new Error('initial connection failed'), { cause: Object.assign(new Error('Error POSTing to endpoint: '), { status: 401 }) })
  const { call, appNamed, mounts } = setup(t, { failing: refused })
  const added = await call('app-add', { url: `${site.origin}/mcp`, name: 'Fake' })
  await comeBack(site, added.value.signIn)
  await until(async () => (await appNamed('fake')).state === 'sign-in' && mounts.length === 2, 'the renewed token to be turned away too')
  assert.equal((await appNamed('fake')).error, 'Fake no longer takes the saved sign-in. Sign in again.')
})

test('an app that did not connect is tried again by itself, a little later each time', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const settled = async (check, what) => {
    for (let tries = 0; tries < 2000; tries += 1) {
      if (await check()) return
      await new Promise(resolve => setImmediate(resolve))
    }
    assert.fail(`${what} did not come`)
  }
  let failing = true
  const { call, appNamed, mounts } = setup(t, { failing: () => (failing ? new Error('fetch failed') : undefined) })
  assert.equal((await call('app-connect', { id: 'kagi', key: fresh('kagi') })).value.apps[0].state, 'error')
  t.mock.timers.tick(30_000)
  await settled(() => mounts.length === 2, 'the second try')
  await settled(async () => (await appNamed('kagi')).state === 'error', 'its failure')
  // The next one waits twice as long.
  t.mock.timers.tick(30_000)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(mounts.length, 2)
  failing = false
  t.mock.timers.tick(30_000)
  await settled(async () => (await appNamed('kagi')).state === 'ready', 'the app')
  assert.equal(mounts.length, 3)
  // Connected, it is left alone.
  t.mock.timers.tick(60 * 60_000)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(mounts.length, 3)
})

test('a server that registers no apps takes the client the user made', async (t) => {
  const site = await fakeSite(t, { registers: false })
  const { call, view, appNamed, vault } = setup(t)
  const refused = await call('app-add', { url: `${site.origin}/mcp`, name: 'Fake' })
  assert.match(refused.error.message, /^Fake does not let apps register themselves\. Connect it again with a client ID you create on its developer site, with the redirect address http:\/\/localhost:\d+\/oauth\/callback\.$/)
  // Nothing is kept of an app whose sign-in could not start, so connecting it again adds no second one.
  assert.deepEqual([(await view()).apps, Object.keys(vault)], [[], []])

  const clientSecret = fresh('client')
  const added = await call('app-add', { url: `${site.origin}/mcp`, name: 'Fake', clientId: 'my-client', clientSecret })
  assert.equal(new URL(added.value.signIn).searchParams.get('client_id'), 'my-client')
  await comeBack(site, added.value.signIn)
  await until(async () => (await appNamed('fake')).state === 'ready', 'the mount')
  const token = site.calls.find(entry => entry.path === '/token')
  assert.deepEqual([token.form.client_id, token.form.client_secret, token.authorization], ['my-client', clientSecret, undefined])
  assert.equal(site.calls.some(entry => entry.path === '/register'), false)
  assert.equal(JSON.stringify(await call('state', {})).includes(clientSecret), false)
  assert.equal(JSON.parse(vault.APMIXBOT_APP_FAKE).client.secret, clientSecret)
})

test('a mount that fails shows why without the key; the switch and Remove take the app down', async (t) => {
  let failing = true
  const { call, saved, mounts, vault } = setup(t, { failing: mount => (failing ? new Error(`refused ${mount.headers.Authorization}`) : undefined) })
  const key = fresh('kagi')
  const [app] = (await call('app-connect', { id: 'kagi', key })).value.apps
  assert.equal(app.state, 'error')
  assert.ok(!app.error.includes(key), app.error)
  assert.match(app.error, /refused Bearer \[hidden\]/)

  failing = false
  assert.equal((await call('app-retry', { id: 'kagi' })).value.apps[0].state, 'ready')
  assert.equal(mounts.length, 2)

  const off = await call('app-enable', { id: 'kagi', enabled: false })
  assert.deepEqual([off.value.apps[0].enabled, off.value.apps[0].state, mounts[1].disposed], [false, 'off', true])
  assert.equal(JSON.parse(saved()).apps.kagi.enabled, false)
  const on = await call('app-enable', { id: 'kagi', enabled: true })
  assert.deepEqual([on.value.apps[0].state, mounts.length], ['ready', 3])

  const removed = await call('app-remove', { id: 'kagi' })
  assert.deepEqual([removed.value.apps, mounts[2].disposed, Object.keys(vault), JSON.parse(saved()).apps], [[], true, [], {}])
})

test('an app and a capability never share a name', async (t) => {
  const { call, mounts } = setup(t)
  assert.equal((await call('capability-save', { name: 'kagi', kind: 'skill', content: 'Search first.' })).ok, true)
  assert.equal((await call('capability-save', { name: 'notes', kind: 'skill', content: 'Keep notes.' })).ok, true)
  const refused = await call('app-connect', { id: 'kagi', key: fresh('kagi') })
  assert.match(refused.error.message, /^A capability is named kagi\. Rename or delete it in Settings → Capabilities, then connect Kagi\.$/)
  assert.equal(mounts.length, 0)

  // An app added by its address takes a free name instead.
  const added = await call('app-add', { url: 'https://mcp.example.com/mcp', name: 'Notes', auth: 'none' })
  assert.deepEqual(added.value.apps.map(app => [app.id, app.name]), [['notes-2', 'Notes']])
  // So does one named like an app of the catalog or the GitHub connector.
  const more = await call('app-add', { url: 'https://mcp.example.com/mcp', name: 'Google Calendar', auth: 'none' })
  const hub = await call('app-add', { url: 'https://mcp.example.com/mcp', name: 'GitHub', auth: 'none' })
  assert.deepEqual(hub.value.apps.map(app => app.id), ['notes-2', 'google-calendar-2', 'github-2'])
  assert.equal(more.ok, true)

  await call('app-connect', { id: 'deepwiki' })
  const taken = await call('capability-save', { name: 'deepwiki', kind: 'skill', content: 'x' })
  assert.equal(taken.error.message, 'The app deepwiki already uses that name. Pick another name for the capability.')
  assert.equal((await call('capability-save', { name: 'notes-2', kind: 'skill', content: 'x' })).ok, false)
  // A capability saved before stays changeable.
  assert.equal((await call('capability-save', { name: 'notes', kind: 'skill', content: 'Keep better notes.' })).ok, true)
})

test('connected apps are mounted again at the next start, each from its own secret', async (t) => {
  const first = setup(t)
  const key = fresh('kagi')
  await first.call('app-connect', { id: 'kagi', key })
  await first.call('app-connect', { id: 'deepwiki' })
  await first.call('app-enable', { id: 'deepwiki', enabled: false })
  await first.ctx.dispose()
  assert.deepEqual(first.mounts.map(mount => mount.disposed), [true, true])

  const second = setup(t, { home: first.home, vault: first.vault })
  await until(async () => second.mounts.length === 1 && (await second.view()).apps.every(app => app.state !== 'connecting'), 'the mounts')
  assert.deepEqual((await second.view()).apps.map(app => [app.id, app.state]), [['kagi', 'ready'], ['deepwiki', 'off']])
  assert.deepEqual(second.mounts.map(mount => [mount.config.serverName, mount.config.headers.Authorization]), [['kagi', `Bearer ${key}`]])
  // Before the first setup's cleanup removes the folder both used.
  await second.ctx.dispose()
  assert.equal(second.mounts[0].disposed, true)
})

test('a host that only reads the team mounts no app and changes none, until it takes the team over', async (t) => {
  const writer = setup(t)
  const key = fresh('kagi')
  await writer.call('app-connect', { id: 'kagi', key })
  await writer.ctx.dispose()

  // Another program holds the team: this test's parent process, which is alive.
  const lock = join(writer.home, 'state.lock')
  writeFileSync(lock, JSON.stringify({ pid: process.ppid, host: hostname(), token: 'other' }))
  const reader = setup(t, { home: writer.home, vault: writer.vault })
  await until(async () => (await reader.view()).apps[0].state === 'off', 'the reading host to leave the app off')
  for (const [endpoint, payload] of [['app-connect', { id: 'deepwiki' }], ['app-remove', { id: 'kagi' }], ['app-enable', { id: 'kagi', enabled: false }]]) {
    assert.equal((await reader.call(endpoint, payload)).error.code, 'bot/read-only')
  }
  assert.deepEqual([reader.mounts.length, Object.keys(reader.vault)], [0, ['APMIXBOT_APP_KAGI']])

  rmSync(lock)
  await until(async () => (await reader.view()).apps[0].state === 'ready', 'the mount after the takeover')
  assert.deepEqual(reader.mounts.map(mount => mount.config.headers.Authorization), [`Bearer ${key}`])
  await reader.ctx.dispose()
})

test('without a credential store, or with apps turned off, there are no apps', async (t) => {
  const off = setup(t, { config: { apps: false } })
  assert.deepEqual(await off.view(), { available: false, redirect: 'http://localhost:47321/oauth/callback', apps: [] })
  assert.deepEqual((await off.call('app-connect', { id: 'deepwiki' })).error, { code: 'bot/invalid', message: 'This engine cannot connect apps', details: {} })

  const bare = setup(t, { config: {}, services: { credentials: undefined } })
  assert.equal((await bare.view()).available, false)
  assert.equal((await bare.call('app-add', { url: 'https://mcp.example.com/mcp', auth: 'none' })).ok, false)
  assert.equal(bare.mounts.length + off.mounts.length, 0)

  // The address a client of the user's own is registered with does not change between starts.
  const usual = setup(t, { config: {} })
  assert.equal((await usual.view()).redirect, 'http://localhost:47321/oauth/callback')
})
