import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import { build } from 'esbuild'

const bundle = await build({
  entryPoints: [fileURLToPath(new URL('../src/client/approval-dock.js', import.meta.url))],
  bundle: true, format: 'cjs', platform: 'node', write: false,
  external: ['react', 'react-dom', '@apmixbot/dsh-client-ui-primitives'],
})
const react = {
  createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat(Infinity) }),
  Fragment: 'fragment',
  useState: initial => [initial, () => {}],
  useEffect: () => {},
  useRef: current => ({ current }),
  useLayoutEffect: () => {},
}
const module = { exports: {} }
runInNewContext(bundle.outputFiles[0].text, {
  module, exports: module.exports, URL, setTimeout, clearTimeout,
  require: (name) => {
    if (name === 'react') return react
    if (name === 'react-dom' || name === '@apmixbot/dsh-client-ui-primitives') return {}
    throw new Error(`no platform module ${name}`)
  },
})
const dock = module.exports

// Draws a component and the components inside it, down to plain elements.
const draw = (node) => {
  if (Array.isArray(node)) return node.flatMap(draw)
  if (node === null || typeof node !== 'object') return node === null || node === undefined || node === false ? [] : [node]
  if (typeof node.type === 'function') return draw(node.type({ ...node.props, children: node.children }))
  return [{ ...node, children: draw(node.children) }]
}
const walk = nodes => nodes.flatMap(node => (typeof node === 'object' ? [node, ...walk(node.children)] : []))
const textsOf = nodes => walk(nodes).flatMap(node => node.children.filter(child => typeof child === 'string'))

const chief = { id: 'a', name: 'Chief', sessionId: 'a' }
const writer = { id: 'b', name: 'Writer', sessionId: 'b' }
const roster = { byId: { a: chief, b: writer }, roomsById: { r1: { id: 'r1', name: 'Ops', members: ['a', 'b'] } } }
const approval = (more = {}) => ({ id: 'p1', kind: 'app', app: 'Vercel', tool: 'list_deployments', botId: 'a', sessionId: 'a', answerable: true, always: true, detail: { code: '{"limit":10}' }, ...more })
const link = (more = {}) => ({ id: 'l1', app: 'Vercel', tool: 'authorize_team_access', url: 'https://vercel.com/sso/session-requests/abc123?x=1', botId: 'a', sessionId: 'a', ...more })

test('a conversation shows the cards of its own Bot, and a group those of its members', () => {
  const work = {
    approvals: [approval(), approval({ id: 'p2', botId: 'b', sessionId: 'gb', roomId: 'r1' }), approval({ id: 'p3', kind: undefined }), approval({ id: 'p4', answerable: false })],
    links: [link(), link({ id: 'l2', botId: 'b', sessionId: 'gb', roomId: 'r1' })],
  }
  // Array.from: the page's arrays belong to the other context, which deepEqual tells apart.
  const ids = cards => [Array.from(cards.approvals, entry => entry.id), Array.from(cards.links, entry => entry.id)]
  assert.deepEqual(ids(dock.cardsFor('a', roster, work)), [['p1'], ['l1']])
  assert.deepEqual(ids(dock.cardsFor('r1', roster, work)), [['p2'], ['l2']])
  assert.deepEqual(ids(dock.cardsFor('b', roster, work)), [[], []])
  assert.deepEqual(ids(dock.cardsFor('a', roster, undefined)), [[], []])
})

test('the approval card names the Bot, the app and the tool, and offers decline, always allow and allow once', () => {
  const answers = []
  const actions = { answerApproval: (id, choice) => { answers.push([id, choice]) }, reportError() {} }
  const tree = draw(react.createElement(dock.AppApprovalCard, { approval: approval(), bot: chief, actions }))
  const shown = textsOf(tree)
  assert.ok(shown.includes('Chief wants to use Vercel') && shown.includes('list_deployments') && shown.includes('{"limit":10}'))
  const buttons = walk(tree).filter(node => node.type === 'button')
  assert.deepEqual(buttons.map(button => button.children[0]), ['Decline', 'Always allow', 'Allow once'])
  // An approval that offers no lasting answer has two buttons.
  const once = draw(react.createElement(dock.AppApprovalCard, { approval: approval({ always: false }), bot: chief, actions }))
  assert.deepEqual(walk(once).filter(node => node.type === 'button').map(button => button.children[0]), ['Decline', 'Allow once'])
})

test('the link card shows the whole address with its site set apart, and a button that opens it outside', () => {
  assert.deepEqual({ ...dock.addressParts('https://vercel.com/sso/session-requests/abc123?x=1') }, { site: 'vercel.com', rest: '/sso/session-requests/abc123?x=1' })
  assert.deepEqual({ ...dock.addressParts('not an address') }, { site: '', rest: 'not an address' })
  const tree = draw(react.createElement(dock.AppLinkCard, { link: link(), actions: { dismissAppLink() {}, reportError() {} } }))
  const shown = textsOf(tree)
  assert.ok(shown.includes('Vercel has a link for you to open') && shown.includes('vercel.com') && shown.includes('/sso/session-requests/abc123?x=1'))
  const open = walk(tree).find(node => node.type === 'a')
  assert.deepEqual([open.props.href, open.props.target, open.props.rel, open.children[0]], ['https://vercel.com/sso/session-requests/abc123?x=1', '_blank', 'noopener noreferrer', 'Open link'])
  assert.deepEqual(walk(tree).filter(node => node.type === 'button').map(button => button.children[0]), ['Done'])
})

test('the dock draws nothing without a card, and every card of the conversation with them', () => {
  const hooks = work => ({ sessionId: 'a', useRoster: pick => pick(roster), useWork: pick => pick(work), actions: {} })
  assert.equal(dock.ApprovalDock(hooks({ approvals: [], links: [] })), null)
  const tree = draw(dock.ApprovalDock(hooks({ approvals: [approval()], links: [link()] })))
  const shown = textsOf(tree)
  assert.ok(shown.includes('Chief wants to use Vercel') && shown.includes('Vercel has a link for you to open'))
})
