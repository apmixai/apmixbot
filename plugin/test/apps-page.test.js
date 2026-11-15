import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import { build } from 'esbuild'
import { APP_CATALOG, APP_CATEGORIES, catalogApp } from '../src/shared/app-catalog.js'

const bundle = await build({
  entryPoints: [fileURLToPath(new URL('../src/client/apps-page.js', import.meta.url))],
  bundle: true, format: 'cjs', platform: 'node', write: false,
  external: ['react', 'react-dom', '@apmixbot/dsh-client-ui-primitives'],
})

// The page's module in a window of its own; `states` holds what each useState starts on, by
// the order the hooks run in, so a form can be drawn in the state a test needs.
function load({ window = {}, states = [] } = {}) {
  let hook = 0
  const react = {
    createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat(Infinity) }),
    Fragment: 'fragment',
    useState: (initial) => {
      const at = hook++
      return [at in states ? states[at] : initial, () => {}]
    },
    useEffect: () => {},
    useLayoutEffect: () => {},
    useRef: current => ({ current }),
    useMemo: make => make(),
    useCallback: fn => fn,
    useId: () => 'id',
  }
  const module = { exports: {} }
  runInNewContext(bundle.outputFiles[0].text, {
    module, exports: module.exports, window, URL, URLSearchParams, setTimeout, clearTimeout,
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    require: (name) => {
      if (name === 'react') return react
      if (name === 'react-dom' || name === '@apmixbot/dsh-client-ui-primitives') return {}
      throw new Error(`no platform module ${name}`)
    },
  })
  return module.exports
}

// Every node of a drawn tree, with the function components in it drawn too. A tree is
// walked once: a second walk would run the components again, past the states given to load().
function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes)
  if (tree === null || typeof tree !== 'object') return []
  if (typeof tree.type === 'function') return nodes(tree.type({ ...tree.props, children: tree.children }))
  return [tree, ...nodes(tree.children)]
}
// Of a list of nodes. Copied into this realm: the page's arrays are the vm context's, which
// deepEqual tells apart.
const texts = list => list.flatMap(node => [...node.children].filter(child => typeof child === 'string'))
const labels = list => list.map(node => node.props['aria-label'] ?? node.props.label).filter(Boolean)

const page = load()
const plain = value => JSON.parse(JSON.stringify(value))

test('the catalog is searched by every word, in names, descriptions and categories, and stays in category order', () => {
  const all = page.searchCatalog('')
  assert.deepEqual(plain(all.map(group => group.category)), APP_CATEGORIES)
  assert.equal(all.reduce((count, group) => count + group.entries.length, 0), APP_CATALOG.length)
  assert.deepEqual(plain(page.searchCatalog('  NOTION ').map(group => [group.category, group.entries.map(entry => entry.id)])), [['Work and notes', ['notion']]])
  // Both words must be there; a category name finds its apps.
  assert.deepEqual(plain(page.searchCatalog('google calendar').flatMap(group => group.entries.map(entry => entry.id))), ['google_calendar'])
  assert.deepEqual(plain(page.searchCatalog('travel').map(group => group.category)), ['Travel'])
  assert.deepEqual(plain(page.searchCatalog('no such app at all')), [])
})

test('a connect form asks for what the app signs in with', () => {
  const fields = id => plain(page.connectFields(catalogApp(id)))
  assert.deepEqual(fields('notion'), { key: false, client: 'optional', button: 'Sign in with Notion', signsIn: true })
  // Google takes only a client the user made.
  assert.deepEqual(fields('gmail'), { key: false, client: 'required', button: 'Sign in with Gmail', signsIn: true })
  assert.deepEqual(fields('kagi'), { key: true, client: 'none', button: 'Connect', signsIn: false })
  assert.deepEqual(fields('google_maps'), { key: true, client: 'none', button: 'Connect', signsIn: false })
  assert.deepEqual(fields('deepwiki'), { key: false, client: 'none', button: 'Connect', signsIn: false })
  for (const entry of APP_CATALOG) assert.ok(['oauth', 'bearer', 'header', 'none'].includes(entry.auth), entry.id)

  assert.deepEqual(plain(page.SIGN_INS.map(([id, label]) => [id, label])), [['auto', 'Find out for me'], ['bearer', 'An API key or token'], ['header', 'A key in a header of its own'], ['none', 'No sign-in']])
  assert.deepEqual(plain(page.addFields('auto')), { header: false, key: false, client: true })
  assert.deepEqual(plain(page.addFields('bearer')), { header: false, key: true, client: false })
  assert.deepEqual(plain(page.addFields('header')), { header: true, key: true, client: false })
  assert.deepEqual(plain(page.addFields('none')), { header: false, key: false, client: false })
})

test('only what a sign-in kind takes goes to the host', () => {
  const typed = { key: ' k-1 ', clientId: ' cid ', clientSecret: ' sec ' }
  assert.deepEqual(plain(page.connectBody(catalogApp('kagi'), typed)), { id: 'kagi', key: 'k-1' })
  assert.deepEqual(plain(page.connectBody(catalogApp('gmail'), typed)), { id: 'gmail', clientId: 'cid', clientSecret: 'sec' })
  assert.deepEqual(plain(page.connectBody(catalogApp('notion'), {})), { id: 'notion' })
  assert.deepEqual(plain(page.connectBody(catalogApp('deepwiki'), typed)), { id: 'deepwiki' })
  // A secret without a client ID is no client.
  assert.deepEqual(plain(page.connectBody(catalogApp('notion'), { clientSecret: 'sec' })), { id: 'notion' })

  const form = { name: ' My app ', url: ' https://mcp.example.com/mcp ', header: 'X-Key', key: 'k', clientId: 'cid', clientSecret: '' }
  assert.deepEqual(plain(page.addBody({ ...form, auth: 'auto' })), { name: 'My app', url: 'https://mcp.example.com/mcp', auth: 'auto', clientId: 'cid' })
  assert.deepEqual(plain(page.addBody({ ...form, auth: 'bearer' })), { name: 'My app', url: 'https://mcp.example.com/mcp', auth: 'bearer', key: 'k' })
  assert.deepEqual(plain(page.addBody({ ...form, auth: 'header' })), { name: 'My app', url: 'https://mcp.example.com/mcp', auth: 'header', header: 'X-Key', key: 'k' })
  assert.deepEqual(plain(page.addBody({ ...form, name: '', auth: 'none' })), { url: 'https://mcp.example.com/mcp', auth: 'none' })
})

test('an address is https, or http on this computer', () => {
  const refused = 'Use the app\'s https:// address.'
  for (const address of ['', '  ', 'https://mcp.example.com/mcp', 'HTTPS://MCP.EXAMPLE.COM', 'http://localhost:3000/mcp', 'http://127.0.0.1:8080', 'http://[::1]:8080/mcp']) assert.equal(page.addressProblem(address), '', address)
  for (const address of ['http://mcp.example.com/mcp', 'mcp.example.com', 'ftp://example.com', 'javascript:alert(1)', 'http://localhost.example.com/', 'not an address']) assert.equal(page.addressProblem(address), refused, address)
})

test('the status line says what state an app is in', () => {
  const app = { id: 'notion', name: 'Notion', enabled: true, state: 'ready', signingIn: false }
  assert.equal(page.statusLine(app), 'Ready')
  assert.equal(page.statusLine({ ...app, tools: 12, lookedUp: false }), 'Ready · 12 tools')
  assert.equal(page.statusLine({ ...app, tools: 250, lookedUp: true }), 'Ready · 250 tools, found by your Bots as they need them')
  assert.equal(page.statusLine({ ...app, state: 'connecting' }), 'Connecting…')
  assert.equal(page.statusLine({ ...app, state: 'sign-in' }), 'Sign in to finish connecting')
  assert.equal(page.statusLine({ ...app, state: 'sign-in', error: 'Notion no longer takes the saved sign-in. Sign in again.' }), 'Notion no longer takes the saved sign-in. Sign in again.')
  assert.equal(page.statusLine({ ...app, state: 'sign-in', signingIn: true }), 'Finish signing in in your browser…')
  assert.equal(page.statusLine({ ...app, state: 'error', error: 'HTTP 502: Bad gateway' }), 'HTTP 502: Bad gateway')
  assert.equal(page.statusLine({ ...app, state: 'error' }), 'Could not connect')
  assert.equal(page.statusLine({ ...app, state: 'off' }), 'Switched off')
  assert.equal(page.statusLine({ ...app, enabled: false }), 'Switched off')
})

test('a tile is the first letter on one of the bright colors, the same for an app every time', () => {
  const tile = plain(page.tileOf('notion', 'notion'))
  assert.equal(tile.letter, 'N')
  assert.deepEqual(plain(page.tileOf('notion', 'Notion')), tile)
  assert.equal(page.tileOf('x', '').letter, '?')
  const colors = new Set(APP_CATALOG.map(entry => page.tileOf(entry.id, entry.name).color))
  assert.ok(colors.size > 3)
  for (const color of colors) assert.match(color, /^[a-z]+$/)
})

// A browser window whose `open` hands out one tab, and what happened to it.
function browser() {
  const tab = { location: { href: '' }, opener: 'page', closed: false, close() { this.closed = true } }
  const opened = []
  return { tab, opened, window: { open: (url = '') => { opened.push(String(url)); return tab } } }
}

test('a sign-in answer sends the tab reserved during the click to the sign-in page', async () => {
  const { tab, opened, window } = browser()
  const { signInWindow, followSignIn } = load({ window })
  const target = signInWindow(window)
  assert.deepEqual(opened, [''])
  assert.equal(tab.opener, null)
  assert.equal(await followSignIn(target, Promise.resolve({ apps: [], signIn: 'https://auth.example.com/authorize?state=1' })), null)
  assert.equal(tab.location.href, 'https://auth.example.com/authorize?state=1')
  assert.equal(tab.closed, false)
})

test('an answer with no sign-in page, an address that is no web page, or a failure closes the reserved tab', async () => {
  for (const answer of [{ apps: [] }, undefined, { signIn: 'javascript:alert(1)' }, { signIn: 42 }]) {
    const { tab, window } = browser()
    const { signInWindow, followSignIn } = load({ window })
    assert.equal(await followSignIn(signInWindow(window), Promise.resolve(answer)), null)
    assert.deepEqual([tab.location.href, tab.closed], ['', true])
  }
  const { tab, window } = browser()
  const { signInWindow, followSignIn } = load({ window })
  await assert.rejects(followSignIn(signInWindow(window), Promise.reject(new Error('Notion does not answer'))), /does not answer/)
  assert.deepEqual([tab.location.href, tab.closed], ['', true])
})

test('a browser that blocks the tab gets the address back for a link, and the Desktop opens it after the answer', async () => {
  const blocked = { open: () => null }
  const web = load({ window: blocked })
  assert.equal(await web.followSignIn(web.signInWindow(blocked), Promise.resolve({ signIn: 'https://auth.example.com/a' })), 'https://auth.example.com/a')

  // The Desktop makes no window: it hands the address to the system browser, once.
  const opened = []
  const desktop = { dshDesktop: { protocolVersion: 1 }, open: (url = '') => { opened.push(String(url)); return null } }
  const app = load({ window: desktop })
  const target = app.signInWindow(desktop)
  assert.deepEqual(opened, [])
  assert.equal(await app.followSignIn(target, Promise.resolve({ signIn: 'https://auth.example.com/a' })), null)
  assert.deepEqual(opened, ['https://auth.example.com/a'])
  // Nothing opens for an answer without a sign-in page.
  assert.equal(await app.followSignIn(app.signInWindow(desktop), Promise.resolve({ apps: [] })), null)
  assert.deepEqual(opened, ['https://auth.example.com/a'])
})

const VIEW = {
  available: true,
  redirect: 'http://localhost:47321/oauth/callback',
  apps: [
    { id: 'notion', name: 'Notion', catalog: 'notion', url: 'https://mcp.notion.com/mcp', auth: 'oauth', enabled: true, state: 'ready', signingIn: false },
    { id: 'my-app', name: 'My app', catalog: null, url: 'https://mcp.example.com/mcp', auth: 'bearer', enabled: true, state: 'error', error: 'HTTP 401: no', signingIn: false },
  ],
}
const draw = (roster, states) => [...nodes(load({ states }).AppsPage({ roster, actions: {}, run: () => {}, Section: 'section' }))]

test('the page lists the connected apps, then the catalog, then an app by its address', () => {
  const tree = draw({ apps: VIEW })
  const sections = tree.filter(node => node.type === 'section').map(node => node.props.title)
  assert.deepEqual(sections, ['Connected · 2', 'Approvals', 'Add an app', 'Another app'])
  const shown = texts(tree)
  assert.ok(shown.includes('Connect the apps you use, and your Bots work in them as you: your email, calendar, files, code and payments.'))
  // Each connected app with its state, and the catalog's entry for a connected one marked so.
  assert.ok(shown.includes('Ready') && shown.includes('HTTP 401: no') && shown.includes('My app'))
  assert.equal(shown.filter(text => text === 'Connected').length, 1)
  assert.ok(labels(tree).includes('Use Notion'))
  assert.equal(tree.find(node => node.props.placeholder?.startsWith('Search'))?.props.placeholder, `Search ${APP_CATALOG.length} apps`)
  for (const category of APP_CATEGORIES) assert.ok(shown.includes(category), category)
  assert.ok(shown.includes('Add an app by its address'))
})

test('the page names the tools Bots use without asking, by app, and offers to ask again', () => {
  assert.match(page.allowedLine([]), /^None\. A Bot asks before it uses a tool of an app/)
  const allowed = [
    { name: 'mcp__vercel__list_deployments', app: 'Vercel', tool: 'list_deployments' },
    { name: 'mcp__github__get_me', app: 'GitHub', tool: 'get_me' },
    { name: 'mcp__vercel__get_project', app: 'Vercel', tool: 'get_project' },
  ]
  assert.equal(page.allowedLine(allowed), 'Vercel: list_deployments, get_project · GitHub: get_me')
  assert.equal(texts(draw({ apps: VIEW })).includes('Ask again'), false)
  const shown = texts(draw({ apps: VIEW, allowedTools: allowed }))
  assert.ok(shown.includes('Ask again') && shown.includes('Vercel: list_deployments, get_project · GitHub: get_me'))
})

test('without the host\'s apps the page says so and offers nothing', () => {
  for (const roster of [{}, { apps: { available: false, apps: [] } }, undefined]) {
    const tree = draw(roster)
    assert.ok(texts(tree).includes('This engine cannot connect apps.'))
    assert.equal(tree.some(node => node.type === 'section'), false)
  }
})

test('an opened connected app offers what its state calls for', () => {
  // useState order in AppsPage: the opened app, then the address form.
  const buttons = (view, open) => texts(draw({ apps: view }, [open]).filter(node => node.type === 'button' && /bt-soft/.test(node.props.className ?? '')))
  assert.deepEqual(buttons(VIEW, 'notion'), ['Sign in again', 'Remove'])
  // A key that fails is tried again; there is nothing to sign in to.
  assert.deepEqual(buttons(VIEW, 'my-app'), ['Try again', 'Remove'])
  const waiting = { ...VIEW, apps: [{ ...VIEW.apps[1], auth: 'none', state: 'sign-in', error: undefined }] }
  assert.deepEqual(buttons(waiting, 'my-app'), ['Sign in', 'Remove'])
})

test('the address form shows the fields of the chosen sign-in, and the redirect address for an own client', () => {
  // AppsPage: opened app, adding. Catalog: query, opened entry. AddByAddress: form, own client.
  const form = auth => ({ name: '', url: 'https://mcp.example.com/mcp', auth, header: '', key: '', clientId: '', clientSecret: '' })
  const shown = (auth, own = false) => {
    const tree = draw({ apps: { ...VIEW, apps: [] } }, [null, true, '', null, form(auth), own])
    return { labels: labels(tree), texts: texts(tree) }
  }
  const fields = list => list.filter(label => ['Name', 'Address', 'How it signs in', 'Header', 'Key', 'Client ID', 'Client secret (if it has one)'].includes(label))
  assert.deepEqual(fields(shown('auto').labels), ['Name', 'Address', 'How it signs in'])
  assert.deepEqual(fields(shown('bearer').labels), ['Name', 'Address', 'How it signs in', 'Key'])
  assert.deepEqual(fields(shown('header').labels), ['Name', 'Address', 'How it signs in', 'Header', 'Key'])
  assert.deepEqual(fields(shown('none').labels), ['Name', 'Address', 'How it signs in'])
  const own = shown('auto', true)
  assert.deepEqual(fields(own.labels), ['Name', 'Address', 'How it signs in', 'Client ID', 'Client secret (if it has one)'])
  assert.ok(own.texts.includes(VIEW.redirect))
  assert.ok(shown('auto').texts.includes('Use my own OAuth client'))
  assert.equal(shown('bearer').texts.includes('Use my own OAuth client'), false)
})

test('every app of the catalog has a logo, drawn as plain shapes; an app added by its address has none', async () => {
  const { logoOf } = await import('../src/client/app-logos.js')
  for (const entry of APP_CATALOG) {
    const logo = logoOf(entry.id)
    assert.ok(logo, entry.id)
    const [width, height, markup] = logo
    assert.ok(width > 0 && height > 0, entry.id)
    assert.match(markup, /<path d="/, entry.id)
    // Shapes and their paints only: nothing that runs or loads.
    assert.doesNotMatch(markup, /<(?!\/?(?:path|g|defs|clipPath|linearGradient|radialGradient|stop)\b)/, entry.id)
    assert.doesNotMatch(markup, /\son\w+=|href|url\((?!#%ID%\d+\))/i, entry.id)
  }
  // The two documentation sites show their company's logo.
  assert.equal(logoOf('microsoft_learn'), logoOf('microsoft'))
  assert.equal(logoOf('wiki-two'), undefined)
})
