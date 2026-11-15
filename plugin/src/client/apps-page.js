// Settings → Apps, below the GitHub connector: the apps the user connected, the catalog of
// apps to connect in one step, and an app added by its address. The host connects them
// (docs/apps.md); a key or an OAuth client only ever travels from these forms to the host.
import { createElement as h, Fragment, useEffect, useRef, useState } from 'react'
import { APP_CATALOG, APP_CATEGORIES, catalogApp } from '../shared/app-catalog.js'
import { logoOf } from './app-logos.js'
import { DEFAULT_COLORS, fnv1a } from './characters.js'
import { inkEye, inkFill } from './inks.js'
import { KeyIcon, MaskedInput } from './secret-card.js'
import { Switch } from './bot-settings.js'
import { CheckIcon, ChevronRightIcon, TrashIcon } from './icons.js'
import { t } from './i18n.js'

const CONFIRM_MS = 4000
const COPIED_MS = 2000

export const appsOf = roster => ({ available: false, redirect: '', ...roster?.apps, apps: Array.isArray(roster?.apps?.apps) ? roster.apps.apps : [] })

// The tile of an app with no logo: the first letter of its name on one of the bright robot colors.
export function tileOf(id, name) {
  const color = DEFAULT_COLORS[fnv1a(String(id)) % DEFAULT_COLORS.length]
  return { letter: (String(name ?? '').trim()[0] ?? '?').toUpperCase(), color }
}

export function statusLine(app) {
  if (app.signingIn) return t('Finish signing in in your browser…')
  if (app.enabled === false || app.state === 'off') return t('Switched off')
  if (app.state === 'connecting') return t('Connecting…')
  if (app.state === 'ready') {
    if (!(app.tools > 0)) return t('Ready')
    return app.lookedUp ? t('Ready · {count} tools, found by your Bots as they need them', { count: app.tools }) : t('Ready · {count} tools', { count: app.tools })
  }
  if (app.state === 'sign-in') return app.error || t('Sign in to finish connecting')
  return app.error || t('Could not connect')
}

// The tools Bots use without asking, by app: "Vercel: list_deployments, get_project · GitHub: get_me".
export function allowedLine(allowed = []) {
  if (allowed.length === 0) return t('None. A Bot asks before it uses a tool of an app, and "Always allow" on its card puts the tool here.')
  const byApp = new Map()
  for (const entry of allowed) byApp.set(entry.app, [...(byApp.get(entry.app) ?? []), entry.tool])
  return [...byApp].map(([app, tools]) => `${app}: ${tools.join(', ')}`).join(' · ')
}

// The catalog by category, keeping the entries that hold every word of the search.
export function searchCatalog(query = '') {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const holds = entry => words.every(word => `${entry.name} ${entry.about} ${entry.category}`.toLowerCase().includes(word))
  return APP_CATEGORIES
    .map(category => ({ category, entries: APP_CATALOG.filter(entry => entry.category === category && holds(entry)) }))
    .filter(group => group.entries.length > 0)
}

// What the connect form of a catalog entry asks for. `client`: 'required' for a service that
// takes only an OAuth client the user made, 'optional' for one that may refuse to register
// ApmixBot itself.
export function connectFields(entry) {
  if (entry.auth === 'oauth') return { key: false, client: entry.needsClient ? 'required' : 'optional', button: t('Sign in with {name}', { name: entry.name }), signsIn: true }
  if (entry.auth === 'bearer' || entry.auth === 'header') return { key: true, client: 'none', button: t('Connect'), signsIn: false }
  return { key: false, client: 'none', button: t('Connect'), signsIn: false }
}

export const SIGN_INS = [
  ['auto', 'Find out for me', 'Signs in when the app asks'],
  ['bearer', 'An API key or token', 'Sent as Authorization: Bearer'],
  ['header', 'A key in a header of its own', 'Sent in the header you name'],
  ['none', 'No sign-in', 'The app needs no account'],
]
// The fields the form of an app added by its address shows for a way to sign in.
export function addFields(auth) {
  return { header: auth === 'header', key: auth === 'bearer' || auth === 'header', client: auth === 'auto' }
}

const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]']
// An app's address is https; http only reaches a server on this computer.
export function addressProblem(address) {
  const text = String(address ?? '').trim()
  if (text === '') return ''
  let url
  try { url = new URL(text) } catch { return t('Use the app\'s https:// address.') }
  const local = url.protocol === 'http:' && LOCAL_HOSTS.includes(url.hostname)
  return url.protocol === 'https:' || local ? '' : t('Use the app\'s https:// address.')
}

const filled = value => (typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined)
const ownClient = ({ clientId, clientSecret }) => (filled(clientId) ? { clientId: filled(clientId), ...(filled(clientSecret) ? { clientSecret: filled(clientSecret) } : {}) } : {})
export const connectBody = (entry, form = {}) => ({
  id: entry.id,
  ...(connectFields(entry).key && filled(form.key) ? { key: filled(form.key) } : {}),
  ...(connectFields(entry).client === 'none' ? {} : ownClient(form)),
})
export function addBody(form) {
  const fields = addFields(form.auth)
  return {
    ...(filled(form.name) ? { name: filled(form.name).slice(0, 40) } : {}),
    url: String(form.url ?? '').trim(),
    auth: form.auth,
    ...(fields.header && filled(form.header) ? { header: filled(form.header) } : {}),
    ...(fields.key && filled(form.key) ? { key: filled(form.key) } : {}),
    ...(fields.client ? ownClient(form) : {}),
  }
}

// Where an app's sign-in page opens. In a browser the tab is reserved inside the click and
// addressed once the host answers: opened after the await, it would hit the popup blocker.
// The Desktop makes no window; it hands an http(s) address to the system browser.
export function signInWindow(win = window) {
  if (win.dshDesktop !== undefined) return { go: (url) => { win.open(url, '_blank'); return true }, drop: () => {} }
  const reserved = win.open('', '_blank')
  if (reserved !== null) reserved.opener = null
  return {
    go: (url) => {
      if (reserved === null) return false
      reserved.location.href = url
      return true
    },
    drop: () => reserved?.close(),
  }
}

// Opens the sign-in page an answer names, in `target`; an answer without one, or a failure,
// closes the reserved tab. Resolves to the page's address when the browser blocked the tab,
// for a link to show, and to null otherwise.
export function followSignIn(target, task) {
  return Promise.resolve(task).then((answer) => {
    const url = typeof answer?.signIn === 'string' && /^https?:\/\//i.test(answer.signIn) ? answer.signIn : null
    if (url === null) { target.drop(); return null }
    return target.go(url) ? null : url
  }, (failure) => { target.drop(); throw failure })
}

// One request at a time, with its failure shown where it was made.
function useTask() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const start = (task, after) => {
    setBusy(true)
    setError(null)
    return Promise.resolve(task).then(value => after?.(value), failure => setError(failure?.message ?? String(failure))).finally(() => setBusy(false))
  }
  return { busy, error, start, clear: () => setError(null) }
}

// An app of the catalog shows its logo, on a white tile every logo reads on in both themes.
// `catalog` is the catalog entry's id: an app added by its address has none, whatever its name.
let logoSerial = 0
function Tile({ id, name, catalog }) {
  const prefix = useRef('')
  if (prefix.current === '') prefix.current = `bt-app-logo-${logoSerial += 1}-`
  const logo = catalog ? logoOf(catalog) : undefined
  if (logo) {
    const [width, height, markup] = logo
    return h('span', { className: 'bt-connector-mark bt-app-tile bt-app-logo', 'aria-hidden': true },
      h('svg', { viewBox: `0 0 ${width} ${height}`, dangerouslySetInnerHTML: { __html: markup.replaceAll('%ID%', prefix.current) } }))
  }
  const { letter, color } = tileOf(id, name)
  return h('span', { className: 'bt-connector-mark bt-app-tile', 'aria-hidden': true, style: { background: inkFill(color), color: inkEye(color) } }, letter)
}

const copyText = text => (navigator.clipboard === undefined ? Promise.resolve(false) : navigator.clipboard.writeText(text).then(() => true, () => false))

// The address to register with an OAuth client the user makes.
function RedirectAddress({ redirect }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return undefined
    const timer = setTimeout(() => setCopied(false), COPIED_MS)
    return () => clearTimeout(timer)
  }, [copied])
  if (!redirect) return null
  return h('div', { className: 'bt-secret-edit-block' },
    h('div', { className: 'bt-secret-edit-label' }, t('Redirect address')),
    h('div', { className: 'bt-secret-inline' },
      h('code', { className: 'bt-app-code' }, redirect),
      h('button', { type: 'button', className: 'bt-soft bt-soft-sm', onClick: () => { void copyText(redirect).then(setCopied) } }, copied ? t('Copied') : t('Copy'))))
}

function ClientFields({ form, set, redirect }) {
  return [
    h(RedirectAddress, { key: 'redirect', redirect }),
    h('input', { key: 'id', className: 'bt-input', 'aria-label': t('Client ID'), placeholder: t('Client ID'), value: form.clientId, spellCheck: false, autoComplete: 'off', onChange: event => set({ clientId: event.target.value }) }),
    h('label', { key: 'secret', className: 'bt-q-field bt-secret-field' }, h(KeyIcon), h(MaskedInput, { value: form.clientSecret, onChange: clientSecret => set({ clientSecret }), label: t('Client secret (if it has one)') })),
  ]
}

// A link to the sign-in page the browser did not open by itself.
const BlockedLink = ({ url }) => (url ? h('a', { className: 'bt-connector-link', href: url, target: '_blank', rel: 'noopener noreferrer' }, t('Open the sign-in page')) : null)

// The connect form of a catalog entry, opened in place under its row.
function CatalogForm({ entry, redirect, actions, onDone }) {
  const fields = connectFields(entry)
  const [form, setForm] = useState({ key: '', clientId: '', clientSecret: '' })
  const [own, setOwn] = useState(fields.client === 'required')
  const [blocked, setBlocked] = useState(null)
  const task = useTask()
  const set = patch => setForm(current => ({ ...current, ...patch }))
  const ready = !task.busy && (!fields.key || form.key.trim() !== '') && (fields.client !== 'required' || form.clientId.trim() !== '')
  const connect = () => {
    if (!ready) return
    const body = connectBody(entry, own ? form : { key: form.key })
    const request = () => actions.appConnect(body)
    const run = fields.signsIn ? followSignIn(signInWindow(), request()) : Promise.resolve(request()).then(() => null)
    void task.start(run, (url) => { if (url) setBlocked(url); else onDone() })
  }
  return h('div', { className: 'bt-connector-form' },
    entry.note ? h('div', { className: 'bt-app-note' }, entry.note, entry.docs ? [' ', h('a', { key: 'docs', href: entry.docs, target: '_blank', rel: 'noopener noreferrer' }, t('How to set it up'))] : null) : null,
    entry.auth === 'none' ? h('div', { className: 'bt-app-note' }, t('{name} needs no account.', { name: entry.name })) : null,
    fields.key ? h('label', { className: 'bt-q-field bt-secret-field' }, h(KeyIcon), h(MaskedInput, { value: form.key, onChange: key => set({ key }), onEnter: connect, label: entry.keyLabel ?? t('API key'), autoFocus: true })) : null,
    own ? h(ClientFields, { form, set, redirect }) : null,
    fields.signsIn ? h('div', { className: 'bt-app-note' }, t('ApmixBot opens {name}\'s own sign-in page in your browser. You sign in there and choose what to allow; ApmixBot never sees your password.', { name: entry.name })) : null,
    h('div', { className: 'bt-connector-form-row' },
      fields.key && entry.keyUrl
        ? h('a', { className: 'bt-connector-link', href: entry.keyUrl, target: '_blank', rel: 'noopener noreferrer' }, t('Get one'))
        : fields.client === 'optional'
          ? h('button', { type: 'button', className: 'bt-connector-link bt-app-linkish', 'aria-expanded': own, onClick: () => setOwn(!own) }, t('Use my own OAuth client'))
          : h('span', { className: 'bt-connector-link' }),
      h('button', { type: 'button', className: 'bt-soft bt-soft-sm', disabled: task.busy, onClick: onDone }, t('Cancel')),
      h('button', { type: 'button', className: 'bt-soft bt-soft-sm', disabled: !ready, onClick: connect }, task.busy ? t('Connecting…') : fields.button)),
    h(BlockedLink, { url: blocked }),
    task.error ? h('div', { className: 'bt-app-error', role: 'alert' }, task.error) : null)
}

function CatalogRow({ entry, connected, open, onToggle, redirect, actions }) {
  return h('div', { className: 'bt-connector' },
    h('div', { className: 'bt-connector-head' },
      h(Tile, { id: entry.id, name: entry.name, catalog: entry.id }),
      h('button', { type: 'button', className: 'bt-app-head', disabled: connected, 'aria-expanded': connected ? undefined : open, onClick: onToggle },
        h('span', { className: 'bt-connector-name' }, entry.name),
        h('span', { className: 'bt-connector-status bt-app-about' }, entry.about)),
      connected
        ? h('span', { className: 'bt-set-hint bt-app-done' }, h(CheckIcon), t('Connected'))
        : h('span', { className: 'bt-chevron', 'data-open': open || undefined, 'aria-hidden': true }, h(ChevronRightIcon))),
    open && !connected ? h(CatalogForm, { entry, redirect, actions, onDone: onToggle }) : null)
}

function Catalog({ view, actions }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(null)
  const connected = new Set(view.apps.map(app => app.catalog).filter(Boolean))
  const groups = searchCatalog(query)
  return h(Fragment, null,
    h('div', { className: 'bt-app-search' },
      h('input', { className: 'bt-input', role: 'searchbox', 'aria-label': t('Search apps'), placeholder: t('Search {count} apps', { count: APP_CATALOG.length }), value: query, onChange: event => setQuery(event.target.value) })),
    groups.length === 0 ? h('div', { className: 'bt-set-row' }, h('span', { className: 'bt-set-hint' }, t('No app by that name. Add it by its address below.'))) : null,
    groups.map(group => h('div', { key: group.category, className: 'bt-app-group', role: 'group', 'aria-label': t(group.category) },
      h('div', { className: 'bt-app-cat' }, t(group.category)),
      group.entries.map(entry => h(CatalogRow, {
        key: entry.id, entry, connected: connected.has(entry.id), open: open === entry.id, redirect: view.redirect, actions,
        onToggle: () => setOpen(open === entry.id ? null : entry.id),
      })))))
}

// An app the user connected: its state, its switch, and when opened what can be done about it.
function ConnectedRow({ app, actions, run, open, onToggle }) {
  const [confirm, setConfirm] = useState(false)
  const [blocked, setBlocked] = useState(null)
  const task = useTask()
  useEffect(() => {
    if (!confirm) return undefined
    const timer = setTimeout(() => setConfirm(false), CONFIRM_MS)
    return () => clearTimeout(timer)
  }, [confirm])
  useEffect(() => { if (!open) setConfirm(false) }, [open])
  const signIn = () => { void task.start(followSignIn(signInWindow(), actions.appSignIn(app.id)), setBlocked) }
  const remove = () => {
    if (!confirm) { setConfirm(true); return }
    setConfirm(false)
    void run(actions.appRemove(app.id))
  }
  const name = app.name || catalogApp(app.catalog)?.name || app.id
  const state = app.enabled === false ? 'off' : app.state
  return h('div', { className: 'bt-connector', 'data-state': state },
    h('div', { className: 'bt-connector-head' },
      h(Tile, { id: app.catalog ?? app.id, name, catalog: app.catalog }),
      h('button', { type: 'button', className: 'bt-app-head', 'aria-expanded': open, onClick: onToggle },
        h('span', { className: 'bt-connector-name' }, name),
        h('span', { className: 'bt-connector-status' }, statusLine(app))),
      h('span', { className: 'bt-connector-actions' },
        h(Switch, { on: app.enabled !== false, label: t('Use {name}', { name }), onChange: enabled => run(actions.appEnable(app.id, enabled)) }))),
    open ? h('div', { className: 'bt-connector-form' },
      app.url ? h('div', { className: 'bt-set-hint bt-app-url' }, app.url) : null,
      h('div', { className: 'bt-connector-form-row' },
        h('span', { className: 'bt-connector-link' }),
        app.state === 'error' ? h('button', { type: 'button', className: 'bt-soft bt-soft-sm', disabled: task.busy, onClick: () => run(actions.appRetry(app.id)) }, t('Try again')) : null,
        app.auth === 'oauth' || app.state === 'sign-in'
          ? h('button', { type: 'button', className: 'bt-soft bt-soft-sm', disabled: task.busy, onClick: signIn }, app.state === 'sign-in' ? t('Sign in') : t('Sign in again'))
          : null,
        h('button', { type: 'button', className: 'bt-soft bt-soft-sm bt-secret-danger', 'data-confirm': confirm || undefined, onClick: remove }, h(TrashIcon), confirm ? t('Click again to remove') : t('Remove'))),
      h(BlockedLink, { url: blocked }),
      task.error ? h('div', { className: 'bt-app-error', role: 'alert' }, task.error) : null) : null)
}

// An app that is not in the catalog, by the address of its MCP server.
function AddByAddress({ redirect, actions, onDone }) {
  const [form, setForm] = useState({ name: '', url: '', auth: 'auto', header: '', key: '', clientId: '', clientSecret: '' })
  const [own, setOwn] = useState(false)
  const [blocked, setBlocked] = useState(null)
  const task = useTask()
  const set = patch => setForm(current => ({ ...current, ...patch }))
  const fields = addFields(form.auth)
  const problem = addressProblem(form.url)
  const ready = !task.busy && form.url.trim() !== '' && problem === '' && (!fields.key || form.key.trim() !== '')
  const add = () => {
    if (!ready) return
    const body = addBody(own ? form : { ...form, clientId: '', clientSecret: '' })
    // Only "Find out for me" can end in a sign-in page.
    const run = fields.client ? followSignIn(signInWindow(), actions.appAdd(body)) : Promise.resolve(actions.appAdd(body)).then(() => null)
    void task.start(run, (url) => { if (url) setBlocked(url); else onDone() })
  }
  const hint = SIGN_INS.find(([id]) => id === form.auth)[2]
  return h('div', { className: 'bt-set-row bt-set-paste bt-secret-add' },
    h('input', { className: 'bt-input', 'aria-label': t('Name'), placeholder: t('Name, e.g. My app'), maxLength: 40, value: form.name, autoComplete: 'off', autoFocus: true, onChange: event => set({ name: event.target.value }) }),
    h('input', { className: 'bt-input', 'aria-label': t('Address'), placeholder: t('Address, e.g. https://mcp.example.com/mcp'), value: form.url, spellCheck: false, autoComplete: 'off', 'aria-invalid': problem !== '' || undefined, onChange: event => set({ url: event.target.value }) }),
    problem ? h('div', { className: 'bt-app-error', role: 'alert' }, problem) : null,
    h('div', { className: 'bt-secret-edit-block' },
      h('div', { className: 'bt-secret-edit-label' }, t('How it signs in')),
      h('select', { className: 'bt-select', 'aria-label': t('How it signs in'), value: form.auth, onChange: event => set({ auth: event.target.value }) },
        SIGN_INS.map(([id, label]) => h('option', { key: id, value: id }, t(label)))),
      h('div', { className: 'bt-set-hint' }, t(hint))),
    fields.header ? h('input', { className: 'bt-input', 'aria-label': t('Header'), placeholder: t('Header, e.g. X-API-Key'), value: form.header, spellCheck: false, autoComplete: 'off', onChange: event => set({ header: event.target.value }) }) : null,
    fields.key ? h('label', { className: 'bt-q-field bt-secret-field' }, h(KeyIcon), h(MaskedInput, { value: form.key, onChange: key => set({ key }), onEnter: add, label: t('Key') })) : null,
    fields.client && own ? h(ClientFields, { form, set, redirect }) : null,
    fields.client && own ? h('div', { className: 'bt-set-hint' }, t('For an app that does not register apps itself. Register a client on its developer site with the redirect address above.')) : null,
    h('div', { className: 'bt-secret-row-actions' },
      fields.client
        ? h('button', { type: 'button', className: 'bt-set-hint bt-app-linkish', 'aria-expanded': own, onClick: () => setOwn(!own) }, t('Use my own OAuth client'))
        : h('span', { className: 'bt-set-hint' }),
      h('button', { type: 'button', className: 'bt-soft bt-soft-sm', disabled: task.busy, onClick: onDone }, t('Cancel')),
      h('button', { type: 'button', className: 'bt-soft bt-soft-sm', disabled: !ready, onClick: add }, task.busy ? t('Connecting…') : t('Add the app'))),
    h(BlockedLink, { url: blocked }),
    task.error ? h('div', { className: 'bt-app-error', role: 'alert' }, task.error) : null)
}

export function AppsPage({ roster, actions, run, Section }) {
  const [open, setOpen] = useState(null)
  const [adding, setAdding] = useState(false)
  const view = appsOf(roster)
  const allowed = Array.isArray(roster?.allowedTools) ? roster.allowedTools : []
  const intro = h('p', { key: 'about', className: 'bt-secret-about bt-app-intro' }, t('Connect the apps you use, and your Bots work in them as you: your email, calendar, files, code and payments.'))
  if (!view.available) return [intro, h('p', { key: 'off', className: 'bt-set-hint' }, t('This engine cannot connect apps.'))]
  return [
    intro,
    h(Section, { key: 'connected', title: t('Connected · {count}', { count: view.apps.length }) },
      view.apps.length === 0 ? h('div', { className: 'bt-set-row' }, h('span', { className: 'bt-set-hint' }, t('No apps yet. Pick one below.'))) : null,
      view.apps.map(app => h(ConnectedRow, { key: app.id, app, actions, run, open: open === app.id, onToggle: () => setOpen(open === app.id ? null : app.id) }))),
    h(Section, { key: 'asking', title: t('Approvals') },
      h('div', { className: 'bt-set-row' },
        h('div', { className: 'bt-set-copy' },
          h('span', null, t('Tools your Bots use without asking')),
          h('span', { className: 'bt-set-hint bt-app-url' }, allowedLine(allowed))),
        allowed.length > 0
          ? h('div', { className: 'bt-set-control' }, h('button', { type: 'button', className: 'bt-soft bt-soft-sm', onClick: () => run(actions.resetAllowedTools()) }, t('Ask again')))
          : null)),
    h(Section, { key: 'catalog', title: t('Add an app') }, h(Catalog, { view, actions })),
    h(Section, { key: 'other', title: t('Another app') },
      adding
        ? h(AddByAddress, { redirect: view.redirect, actions, onDone: () => setAdding(false) })
        : h('button', { type: 'button', className: 'bt-set-row bt-secret-summary', onClick: () => setAdding(true) },
            h('span', { className: 'bt-set-copy' },
              h('span', null, t('Add an app by its address')),
              h('span', { className: 'bt-set-hint' }, t('Any MCP server that answers at an https address'))),
            h('span', { className: 'bt-chevron', 'aria-hidden': true }, h(ChevronRightIcon)))),
  ]
}

export const APPS_CSS = `
.bt-app-intro{margin-top:16px}
.bt-connector-mark.bt-app-tile{border:0;font-size:15px;line-height:20px;font-weight:600}
.bt-connector-mark.bt-app-logo{background:var(--bt-logo-tile);padding:7px;box-sizing:border-box;box-shadow:inset 0 0 0 .5px rgba(0,0,0,.1)}
.bt-app-logo svg{width:100%;height:100%;display:block}
.bt-app-head{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;margin:0;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
.bt-app-head:disabled{cursor:default}
.bt-app-about{white-space:normal;color:var(--bt-ink-2)}
.bt-app-done{flex:none;display:inline-flex;align-items:center;gap:4px}
.bt-app-done svg{width:13px;height:13px}
.bt-app-search{padding:10px 12px}
.bt-app-cat{padding:12px 12px 2px;font-size:12px;line-height:16px;font-weight:600;color:var(--bt-ink-2)}
.bt-app-group>.bt-connector+.bt-connector{border-top:.5px solid var(--bt-line)}
.bt-app-note{font-size:12px;line-height:17px;color:var(--bt-ink-2);overflow-wrap:anywhere}
.bt-app-note a{color:var(--bt-accent)}
.bt-app-url{overflow-wrap:anywhere}
.bt-app-code{flex:1;min-width:0;padding:6px 8px;border-radius:8px;background:var(--bt-hover);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:16px;overflow-wrap:anywhere;user-select:all}
.bt-app-linkish{border:0;padding:0;background:none;font:inherit;font-size:12px;text-align:left;text-decoration:underline;cursor:pointer}
.bt-app-error{font-size:12px;line-height:16px;color:var(--bt-danger);overflow-wrap:anywhere}
.bt-connector .bt-secret-danger[data-confirm]{background:var(--bt-danger);color:var(--bt-accent-ink)}
.bt-connector .bt-chevron{transition:rotate .16s ease}
.bt-connector .bt-chevron[data-open]{rotate:90deg}
@media (prefers-reduced-motion:reduce){.bt-connector .bt-chevron{transition:none}}
`
