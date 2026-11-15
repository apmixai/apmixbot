import assert from 'node:assert/strict'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import { build } from 'esbuild'

const bundle = await build({
  entryPoints: [fileURLToPath(new URL('../src/client/about.js', import.meta.url))],
  bundle: true, format: 'cjs', platform: 'node', write: false,
  external: ['react', 'react-dom', '@apmixbot/dsh-client-ui-primitives'],
})

// Settings → About ApmixBot for one update state: its rows as [label, hint, links].
function rows(update) {
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
    module, exports: module.exports, URL, Intl, setTimeout, clearTimeout,
    require: (name) => {
      if (name === 'react') return react
      if (name === 'react-dom' || name === '@apmixbot/dsh-client-ui-primitives') return {}
      throw new Error(`no platform module ${name}`)
    },
  })
  const tree = module.exports.AboutPage({ useUpdate: () => update, actions: {}, run: () => {}, Section: 'section', Row: 'row' })
  const walk = node => (Array.isArray(node) ? node.flatMap(walk) : node && typeof node === 'object' ? [node, ...walk(node.children)] : [])
  const found = walk(tree).filter(node => node.type === 'row').map(row => [
    row.props.label, row.props.hint ?? null,
    walk(row.children).filter(node => node.type === 'a').map(({ props }) => [props.href, props.target ?? null]),
  ])
  // The page's arrays belong to the other context, which deepEqual tells apart.
  return JSON.parse(JSON.stringify(found))
}

test('About links to the website, the support address and the social accounts', () => {
  const links = rows({}).slice(1)
  assert.deepEqual(links, [
    ['Website', 'bot.apmix.ai', [['https://bot.apmix.ai/', '_blank']]],
    ['Support', 'support@apmix.ai', [['mailto:support@apmix.ai', null]]],
    ['X', 'x.com/ApmixAi', [['https://x.com/ApmixAi', '_blank']]],
    ['Telegram', 't.me/apmix_ai', [['https://t.me/apmix_ai', '_blank']]],
  ])
})

test('About keeps the repository links between the website and the contacts, and has no problem report', () => {
  const labels = rows({ repoUrl: 'https://github.com/example/apmixbot', notesUrl: 'https://github.com/example/apmixbot/releases' }).map(([label]) => label)
  assert.deepEqual(labels, ['ApmixBot', 'Website', 'Source code', 'Release notes', 'Support', 'X', 'Telegram'])
})
