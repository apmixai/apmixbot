#!/usr/bin/env node
// The README logo: Apex, the Main Bot, in the middle and six of its crew on a ring around
// it, drawn from the plugin's own robot table. Writes a light and a dark version (the
// dark one uses the dark inks, as the app does in dark mode).
//
//   node dev/logo.mjs [out dir]        default: ../docs/images (logo.svg, logo-dark.svg)
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { MAIN_LOOK, MASK_ID, characterMarkup } from '../src/client/characters.js'
import { INKS, eyeOn } from '../src/client/inks.js'

const BOX = 600
const CENTER = BOX / 2
const MAIN = { ...MAIN_LOOK, size: 300 }
// Clockwise from the top.
const RING = [
  { shape: 'pixel', color: 'charcoal' },
  { shape: 'orbit', color: 'crimson' },
  { shape: 'visor', color: 'graphite' },
  { shape: 'dome', color: 'rose' },
  { shape: 'retro', color: 'steel' },
  { shape: 'buddy', color: 'wine' },
]
const RING_SIZE = 116
const RING_RADIUS = 228

const out = resolve(process.argv[2] ?? join(import.meta.dirname, '../../docs/images'))
mkdirSync(out, { recursive: true })
for (const mode of ['light', 'dark']) {
  const file = join(out, mode === 'light' ? 'logo.svg' : 'logo-dark.svg')
  writeFileSync(file, logo(mode))
  console.log(`wrote ${file}`)
}

function logo(mode) {
  const step = (Math.PI * 2) / RING.length
  const seats = RING.map((look, index) => {
    const angle = -Math.PI / 2 + index * step
    return { ...look, size: RING_SIZE, x: CENTER + RING_RADIUS * Math.cos(angle), y: CENTER + RING_RADIUS * Math.sin(angle) }
  })
  const orbit = `<circle cx="${CENTER}" cy="${CENTER}" r="${RING_RADIUS}" fill="none" stroke="${ink(MAIN_LOOK.color, mode)}" stroke-opacity=".28" stroke-width="2" stroke-dasharray="2 10" stroke-linecap="round"/>`
  const marks = [...seats, { ...MAIN, x: CENTER, y: CENTER }].map((seat, index) => robot(seat, mode, `m${index}`))
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${BOX} ${BOX}" width="${BOX}" height="${BOX}" role="img" aria-label="ApmixBot">${orbit}${marks.join('')}</svg>\n`
}

function ink(color, mode) {
  return INKS[color][mode === 'light' ? 0 : 1]
}

// One robot in a `size` box centered on (x, y), in the colors its ink and eye
// variables take in this mode, since a picture has no page to set them.
function robot({ shape, color, size, x, y }, mode, id) {
  const body = ink(color, mode)
  const markup = characterMarkup(shape, color)
    .replaceAll(MASK_ID, id)
    .replaceAll(`var(--bt-ink-${color})`, body)
    .replaceAll(`var(--bt-eye-${color})`, eyeOn(body))
  const place = `translate(${(x - size / 2).toFixed(1)} ${(y - size / 2).toFixed(1)}) scale(${size / 100})`
  return `<g transform="${place}">${markup}</g>`
}
