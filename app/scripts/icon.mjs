// Draws the app icon from the Main Bot's Apex robot in ../plugin and writes assets/icon.svg,
// assets/icon.png (1024 px) and assets/icon.ico (Windows, 16 to 256 px).
// Usage: npm run icon. It runs itself again inside Electron, which turns the SVG into PNGs.
import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { characterMarkup, MAIN_LOOK, MASK_ID } from '../../plugin/src/client/characters.js'
import { INKS, eyeOn } from '../../plugin/src/client/inks.js'

const here = fileURLToPath(import.meta.url)
const assets = join(dirname(here), '..', 'assets')
export const ICO_SIZES = [16, 20, 24, 32, 36, 40, 48, 64, 72, 96, 128, 256]

// Apex spans x 5..95 (its ears) and y 3.5..86 (antenna light to chin) of its 100 box.
const APEX = { cx: 50, cy: 44.75, width: 90 }

// A superellipse close to the system's rounded-square app tile.
function tile(size, inset) {
  const radius = (size - 2 * inset) / 2
  const center = size / 2
  const points = []
  for (let i = 0; i < 128; i += 1) {
    const angle = (i / 128) * Math.PI * 2
    const at = value => Math.sign(value) * Math.abs(value) ** 0.4
    points.push(`${(center + radius * at(Math.cos(angle))).toFixed(2)} ${(center + radius * at(Math.sin(angle))).toFixed(2)}`)
  }
  return `M${points.join('L')}Z`
}

// The robot in its own colors: an icon has no page to set the plugin's ink variables.
function apex() {
  const ink = INKS[MAIN_LOOK.color][0]
  return characterMarkup(MAIN_LOOK.shape, MAIN_LOOK.color)
    .replaceAll(MASK_ID, 'apex')
    .replaceAll(`var(--bt-ink-${MAIN_LOOK.color})`, ink)
    .replaceAll(`var(--bt-eye-${MAIN_LOOK.color})`, eyeOn(ink))
}

// `plate`: the tile's share of the canvas. macOS wants a margin around the tile; Windows
// draws its icons nearly edge to edge, so its sizes use a fuller tile.
export function iconSvg(plate, size = 1024) {
  const inset = (size * (1 - plate)) / 2
  const width = (size - 2 * inset) * 0.78
  const scale = width / APEX.width
  const x = size / 2 - APEX.cx * scale
  const y = size / 2 - APEX.cy * scale + width * 0.01
  const path = tile(size, inset)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<defs>
<linearGradient id="plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a2e"/><stop offset="1" stop-color="#0b0b0d"/></linearGradient>
<filter id="shadow" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feDropShadow dx="0" dy="${size * 0.012}" stdDeviation="${size * 0.012}" flood-color="#000" flood-opacity=".3"/></filter>
</defs>
<path d="${path}" filter="url(#shadow)"/>
<path d="${path}" fill="url(#plate)"/>
<path d="${path}" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="${size * 0.004}"/>
<g transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(4)})">${apex()}</g>
</svg>
`
}

// PNG entries in an .ico file, which Windows reads since Vista.
export function icoFile(images) {
  const head = Buffer.alloc(6 + 16 * images.length)
  head.writeUInt16LE(1, 2)
  head.writeUInt16LE(images.length, 4)
  let offset = head.length
  images.forEach(({ size, png }, index) => {
    const at = 6 + 16 * index
    head.writeUInt8(size >= 256 ? 0 : size, at)
    head.writeUInt8(size >= 256 ? 0 : size, at + 1)
    head.writeUInt16LE(1, at + 4)
    head.writeUInt16LE(32, at + 6)
    head.writeUInt32LE(png.length, at + 8)
    head.writeUInt32LE(offset, at + 12)
    offset += png.length
  })
  return Buffer.concat([head, ...images.map(image => image.png)])
}

// Inside Electron: a page draws each SVG on a canvas of its exact size, so every size is
// drawn from the vectors rather than scaled down from a large bitmap.
async function renderInElectron(jobs) {
  const { BrowserWindow } = await import('electron')
  const page = new BrowserWindow({ show: false })
  await page.loadURL('data:text/html,<!doctype html><title>icon</title>')
  const draw = async (list) => Promise.all(list.map(async ({ svg, size }) => {
    const image = new Image()
    image.src = `data:image/svg+xml,${encodeURIComponent(svg)}`
    await image.decode()
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    canvas.getContext('2d').drawImage(image, 0, 0, size, size)
    return canvas.toDataURL('image/png').slice('data:image/png;base64,'.length)
  }))
  const pngs = await page.webContents.executeJavaScript(`(${draw.toString()})(${JSON.stringify(jobs)})`)
  page.destroy()
  return pngs.map(data => Buffer.from(data, 'base64'))
}

// Imported for its helpers, it draws nothing.
const main = resolve(process.argv[1] ?? '') === here
if (main && process.versions.electron) {
  const jobs = [{ svg: iconSvg(0.805), size: 1024 }, ...ICO_SIZES.map(size => ({ svg: iconSvg(0.92, size), size }))]
  // Not awaited at the top: Electron is ready only after the main module has run.
  const { app } = await import('electron')
  app.whenReady().then(() => renderInElectron(jobs)).then(([large, ...small]) => {
    writeFileSync(join(assets, 'icon.png'), large)
    writeFileSync(join(assets, 'icon.ico'), icoFile(ICO_SIZES.map((size, index) => ({ size, png: small[index] }))))
    app.exit(0)
  }).catch((error) => {
    console.error(error)
    app.exit(1)
  })
} else if (main) {
  mkdirSync(assets, { recursive: true })
  writeFileSync(join(assets, 'icon.svg'), iconSvg(0.805))
  // A terminal inside an Electron-based editor may set ELECTRON_RUN_AS_NODE, which would keep Electron plain Node.
  const { ELECTRON_RUN_AS_NODE: _runAsNode, ...env } = process.env
  const electron = createRequire(import.meta.url)('electron')
  const run = spawnSync(electron, [here], { stdio: 'inherit', env })
  if (run.status !== 0) process.exit(run.status ?? 1)
  console.log('icon: wrote assets/icon.svg, assets/icon.png and assets/icon.ico')
}
