import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import { build } from 'esbuild'

const bundle = await build({
  entryPoints: [fileURLToPath(new URL('../src/client/endpoint-form.js', import.meta.url))],
  bundle: true, format: 'cjs', platform: 'node', write: false,
  external: ['react', 'react-dom', '@apmixbot/dsh-client-ui-primitives'],
})
const module = { exports: {} }
runInNewContext(bundle.outputFiles[0].text, {
  module, exports: module.exports,
  require: (name) => {
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
const { EndpointForm, ModelPicker, PROTOCOLS, typedIds } = module.exports

function nodes(tree, match) {
  if (!tree || typeof tree !== 'object') return []
  return [...(match(tree) ? [tree] : []), ...(tree.children ?? []).flatMap(child => nodes(child, match))]
}
const button = (tree, label) => nodes(tree, node => node.type === 'button' && node.children.includes(label))[0]
const listed = count => Array.from({ length: count }, (_, index) => ({ id: `m${index}` }))

test('typed model ids split at commas and spaces', () => {
  assert.deepEqual(Array.from(typedIds(' gpt-a, gpt-b,gpt-c\ngpt-d ,, ')), ['gpt-a', 'gpt-b', 'gpt-c', 'gpt-d'])
  assert.deepEqual(Array.from(typedIds('')), [])
})

test('the picker toggles listed models; Select all takes the shown ones and Clear drops every pick', () => {
  const picks = []
  const tree = ModelPicker({ models: [{ id: 'a' }, { id: 'b', name: 'Bee' }, { id: 'c' }], picked: ['b'], onPick: list => picks.push(Array.from(list)), typed: '', onType: () => {} })
  const models = nodes(tree, node => node.type === 'button' && node.props['aria-pressed'] !== undefined)
  assert.deepEqual(models.map(model => [model.children[0].children[0], model.props['aria-pressed']]), [['a', false], ['b', true], ['c', false]])
  assert.equal(models[1].props.title, 'Bee')
  models[0].props.onClick()
  models[1].props.onClick()
  button(tree, 'Select all').props.onClick()
  button(tree, 'Clear').props.onClick()
  assert.deepEqual(picks, [['b', 'a'], [], ['b', 'a', 'c'], []])
  assert.equal(nodes(tree, node => node.props.type === 'search').length, 0)
})

test('the picker searches a long list, and asks for ids by hand where the endpoint lists none', () => {
  const long = ModelPicker({ models: listed(13), picked: [], onPick: () => {}, typed: '', onType: () => {} })
  assert.equal(nodes(long, node => node.props.type === 'search').length, 1)
  assert.equal(button(long, 'Clear').props.disabled, true)
  const none = ModelPicker({ models: [], picked: [], onPick: () => {}, typed: '', onType: () => {} })
  assert.ok(nodes(none, node => node.children.includes('The endpoint lists no models. Enter their ids below.')).length === 1)
  const unasked = ModelPicker({ models: null, picked: [], onPick: () => {}, typed: '', onType: () => {} })
  assert.deepEqual(nodes(unasked, node => node.type === 'input').map(input => input.props.placeholder), ['Model ids, separated by commas'])
})

test('the form asks for the endpoint, protocol and key, and adds nothing until it has an endpoint and a model', () => {
  const tree = EndpointForm({ actions: {}, variant: 'card', submitLabel: 'Connect' })
  assert.deepEqual(nodes(tree, node => node.type === 'option').map(option => option.props.value), Array.from(PROTOCOLS))
  assert.equal(nodes(tree, node => node.props['aria-label'] === 'Endpoint').length, 1)
  assert.equal(nodes(tree, node => typeof node.type === 'function' && node.props.label === 'API key').length, 1)
  assert.equal(button(tree, 'Fetch models').props.disabled, true)
  const connect = button(tree, 'Connect')
  assert.equal(connect.props.disabled, true)
  assert.equal(connect.props.className, 'bt-q-submit')
  assert.equal(button(EndpointForm({ actions: {} }), 'Add').props.className, 'bt-soft bt-soft-sm')
})
