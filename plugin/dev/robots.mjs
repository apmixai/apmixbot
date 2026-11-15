// A gallery of the robots in src/client/characters.js: every shape, every color, the
// small sizes the sidebar uses, and each state's motion, with a light/dark switch.
//   node dev/robots.mjs robots.html
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runInNewContext } from 'node:vm'
import { build } from 'esbuild'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const target = resolve(process.argv[2] ?? 'robots.html')
const bundle = await build({
  stdin: {
    contents: "export * from './src/client/characters.js'\nexport { SHELL_CSS } from './src/client/styles.js'\nexport { themeCss, allThemes, DEFAULT_THEME } from './src/client/themes.js'",
    resolveDir: root,
  },
  bundle: true, format: 'cjs', platform: 'node', write: false, logLevel: 'silent',
  external: ['react', 'react-dom', '@apmixbot/dsh-client-ui-primitives'],
})
const module = { exports: {} }
const react = { createElement: () => null, useState: value => [value, () => {}], useEffect: () => {}, useRef: current => ({ current }), useLayoutEffect: () => {}, useMemo: make => make(), useCallback: fn => fn, Fragment: 'fragment' }
runInNewContext(bundle.outputFiles[0].text, { module, exports: module.exports, require: name => (name === 'react' ? react : {}) })
const m = module.exports

let serial = 0
const mark = (shape, color, size, state = 'idle') => {
  serial += 1
  return `<span class="bt-mark" data-shape="${shape}" data-state="${state}" data-live data-fidget="${['tilt', 'beep', 'bounce', 'scan'][serial % 4]}" style="width:${size}px;height:${size}px;--bt-delay:-${(serial % 5) * 0.7}s;--bt-fidget-delay:-${(serial % 7) * 1.3}s"><svg viewBox="0 0 100 100">${m.characterMarkup(shape, color).replaceAll(m.MASK_ID, `robot-${serial}`)}</svg></span>`
}
const figure = (inner, caption) => `<figure>${inner}<figcaption>${caption}</figcaption></figure>`
const row = items => `<div class="row">${items.join('')}</div>`
const colorAt = index => m.DEFAULT_COLORS[index % m.DEFAULT_COLORS.length]
const sections = [
  ['Robots', row(m.PICKER_SHAPES.map((shape, index) => figure(mark(shape, index === 0 ? m.MAIN_LOOK.color : colorAt(index), 96), m.SHAPES[shape].label)))],
  ['Colors', row(m.CHARACTER_COLORS.map(color => figure(mark(m.MAIN_LOOK.shape, color, 56), color)))],
  ['Sidebar sizes', row(m.PICKER_SHAPES.map((shape, index) => mark(shape, colorAt(index + 2), 22))) + row(m.PICKER_SHAPES.map((shape, index) => mark(shape, colorAt(index + 4), 36)))],
  ['States', row(['idle', 'thinking', 'searching', 'working', 'sending', 'waiting', 'alert', 'done'].map((state, index) => figure(mark(m.PICKER_SHAPES[index], m.MAIN_LOOK.color, 64, state), state)))],
]
const page = `<!doctype html><html><head><meta charset="utf-8"><title>Robots</title><style>${m.SHELL_CSS}
${m.themeCss(m.allThemes()[m.DEFAULT_THEME])}
body{margin:0;padding:24px;background:var(--bt-main);color:var(--bt-ink);font:13px system-ui,sans-serif}
.row{display:flex;flex-wrap:wrap;gap:18px;align-items:flex-end;margin:10px 0 22px}
figure{margin:0;display:flex;flex-direction:column;align-items:center;gap:6px}
figcaption{font-size:11px;color:var(--bt-ink-2)}
h2{font-size:14px;margin:6px 0}
</style></head><body data-bt-motion="lively"><button type="button" onclick="document.body.toggleAttribute('data-ds-dark-theme')">Light / dark</button>
${sections.map(([title, body]) => `<h2>${title}</h2>${body}`).join('\n')}
</body></html>`
writeFileSync(target, page)
console.log(`${m.PICKER_SHAPES.length} robots, ${m.CHARACTER_COLORS.length} colors: ${target}`)
