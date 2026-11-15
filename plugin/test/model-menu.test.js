import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import { build } from 'esbuild'

const bundle = await build({
  entryPoints: [fileURLToPath(new URL('../src/client/model-menu.js', import.meta.url))],
  bundle: true, format: 'cjs', platform: 'node', write: false,
  external: ['react', 'react-dom', '@apmixbot/dsh-client-ui-primitives'],
})
const module = { exports: {} }
runInNewContext(bundle.outputFiles[0].text, {
  module, exports: module.exports,
  require: name => {
    const platform = {
      react: {
        createElement: (type, props, ...children) => ({ type, props: props ?? {}, children: children.flat(Infinity) }),
        useState: initial => [initial, () => {}],
        useEffect: () => {},
      },
      'react-dom': {},
      '@apmixbot/dsh-client-ui-primitives': {},
    }
    if (!(name in platform)) throw new Error(`no platform module ${name}`)
    return platform[name]
  },
})
const { groupModels, ModelChoiceDock, effortRows } = module.exports

function nodes(tree, match) {
  if (!tree || typeof tree !== 'object') return []
  return [...(match(tree) ? [tree] : []), ...(tree.children ?? []).flatMap(child => nodes(child, match))]
}

// `engine`: the window has the engine's own settings to send the user to, as the plugin does.
function dock(models, { model, ready = true, engine = true } = {}) {
  const picked = []
  const bot = { id: 'chief', name: 'Chief', model }
  const roster = { ready, byId: { chief: bot }, models, defaultModel: models[0]?.ref }
  const tree = ModelChoiceDock({
    sessionId: bot.id, useRoster: select => select(roster),
    actions: {
      updateBot: (id, patch) => { picked.push([id, patch.model]); return Promise.resolve() },
      ...(engine ? { openEngineSettings: () => {} } : {}),
    },
  })
  return { tree, picked }
}

const models = [
  { ref: 'official/flash', provider: 'official', providerName: 'Acme', name: 'Acme Flash' },
  { ref: 'local/flash', provider: 'local', providerName: 'Ollama', name: 'Acme Flash' },
  { ref: 'official/pro', provider: 'official', providerName: 'Acme', name: 'Acme Pro' },
]

test('the first model choice shows provider groups and keeps each model route', () => {
  const { tree, picked } = dock(models)
  const groups = nodes(tree, node => node.props.className === 'bt-model-choice-group')
  assert.deepEqual(groups.map(group => group.props['aria-label']), ['Acme', 'Ollama'])
  assert.deepEqual(groups.map(group => nodes(group, node => node.props.className === 'bt-model-choice-provider')[0].children[0]), ['Acme', 'Ollama'])
  const buttons = groups.map(group => nodes(group, node => node.type === 'button'))
  assert.deepEqual(buttons.map(list => list.map(button => button.children[0])), [['Acme Flash', 'Acme Pro'], ['Acme Flash']])
  assert.match(buttons[0][0].props.title, /official\/flash.*Engine default/)
  buttons[1][0].props.onClick()
  buttons[0][0].props.onClick()
  assert.deepEqual(picked, [['chief', 'local/flash'], ['chief', 'official/flash']])
  assert.equal(nodes(tree, node => node.type === 'button' && node.children.includes('Manage models')).length, 1)
})

test('providers with the same display name stay distinct, and unnamed providers use their id', () => {
  const entries = [
    { ...models[0], providerName: 'Cloud' },
    { ...models[1], providerName: 'Cloud' },
    { ref: 'custom/flash', provider: 'custom', name: 'Flash' },
  ]
  const groups = groupModels(entries)
  assert.deepEqual(Array.from(groups, ([label, list]) => [label, Array.from(list, model => model.ref)]), [
    ['Cloud (official)', ['official/flash']],
    ['Cloud (local)', ['local/flash']],
    ['custom', ['custom/flash']],
  ])
})

test('an unavailable model offers the same provider groups', () => {
  const { tree } = dock(models, { model: 'gone/flash' })
  assert.deepEqual(nodes(tree, node => node.props.className === 'bt-model-choice-group').map(group => group.props['aria-label']), ['Acme', 'Ollama'])
  assert.ok(nodes(tree, node => node.props.className === 'bt-bubble')[0].children[0].includes('not available anymore'))
})

test('an empty catalog offers setup choices, and a ready model needs no choice dock', () => {
  const { tree } = dock([])
  assert.deepEqual(nodes(tree, node => node.type === 'button').map(button => button.children[0]), ['Open settings to set up a custom model'])
  assert.equal(dock(models, { model: models[0].ref }).tree, null)
  assert.equal(dock(models, { ready: false }).tree, null)
})

test('without DSH\'s own settings, the choice offers no way into them', () => {
  const buttons = tree => nodes(tree, node => node.type === 'button').map(button => button.children[0])
  assert.deepEqual(buttons(dock(models, { engine: false }).tree), ['Acme Flash', 'Acme Pro', 'Acme Flash'])
  assert.deepEqual(buttons(dock([], { engine: false }).tree), [])
})

test('the Thinking section always offers Default, so a picked level can be cleared', () => {
  const efforts = [{ id: 'low', name: 'Low' }, { id: 'high', name: 'High' }]
  // Array.from: the rows come from the bundle's realm, whose arrays are not this one's.
  assert.deepEqual(Array.from(effortRows({ efforts, defaultEffort: 'high' }), row => row.effort), [undefined, 'low', 'high'])
  assert.deepEqual(Array.from(effortRows({ efforts }), row => row.effort), [undefined, 'low', 'high'])
  assert.equal(effortRows({ efforts: [] }).length, 0)
})

const keyless = [
  { ref: 'official/flash', provider: 'official', providerName: 'Acme', name: 'Acme Flash', needsKey: true },
  { ref: 'official/pro', provider: 'official', providerName: 'Acme', name: 'Acme Pro', needsKey: true },
]

test('models that need an API key are no choice', () => {
  const buttons = tree => nodes(tree, node => node.type === 'button').map(button => button.children[0])
  assert.deepEqual(buttons(dock([...keyless, models[1]], { engine: false }).tree), ['Acme Flash'])
  // Where the engine's own settings are, they take the key.
  assert.deepEqual(buttons(dock(keyless).tree), ['Open settings to set up a custom model'])
})

// The components the tree names but the fake React does not render, called with their props.
const rendered = (tree, match) => nodes(tree, node => typeof node.type === 'function' && match(node)).map(node => node.type(node.props))

test('with no model ready, the first choice asks for a model API by its endpoint and key', () => {
  const bot = { id: 'chief', name: 'Chief' }
  const opened = []
  const actions = { addProvider: () => Promise.resolve(), providerModels: () => Promise.resolve([]), openModels: () => opened.push('models'), openEngineSettings: () => {} }
  const tree = ModelChoiceDock({ sessionId: bot.id, useRoster: select => select({ ready: true, providerSetup: true, byId: { chief: bot }, models: keyless }), actions })
  const text = nodes(tree, node => node.props.className === 'bt-bubble')[0].children[0]
  assert.match(text, /Connect me to a model first/)
  assert.doesNotMatch(text, /Acme/)
  assert.equal(nodes(tree, node => node.props.className === 'bt-model-chips').length, 0)
  const [card] = rendered(tree, node => node.props.actions === actions)
  const [form] = nodes(card, node => typeof node.type === 'function' && node.props.variant === 'card')
  assert.equal(form.props.submitLabel, 'Connect')
  // The only other way in: the Models page, with the providers the engine ships. No vendor
  // account is offered first.
  assert.equal(form.props.extra.length, 1)
  const [more] = form.props.extra
  assert.equal(more.children[0], 'More providers')
  more.props.onClick()
  assert.deepEqual(opened, ['models'])
  assert.doesNotMatch(JSON.stringify(card), /Acme/)
  // Where ApmixBot cannot set up a provider, the choice points to the engine's own settings.
  const plain = ModelChoiceDock({ sessionId: bot.id, useRoster: select => select({ ready: true, providerSetup: false, byId: { chief: bot }, models: keyless }), actions })
  assert.deepEqual(nodes(plain, node => node.type === 'button').map(button => button.children[0]), ['Open settings to set up a custom model'])
})
