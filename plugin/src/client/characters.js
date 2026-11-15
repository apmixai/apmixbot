import { INKS, GRADIENTS, isHex, inkEye, inkFill } from './inks.js'

// -------------------------------------------------------------------------
// Characters: ApmixBot's own avatars, a crew of small robots drawn in a 100-unit box.
// A robot is its body (head, ears, antennas), decals in fixed colors such as the visor,
// `marks` and `glow` lights in the eye color (the glow pulses), and its LED eyes
// [cx, cy, width, height, tilt, corner radius]. Every part runs clockwise, so parts
// that overlap join; a `hole` runs the other way and cuts one. The shade and the rim
// light are the body itself, shifted away from the light and toward it.
const num = value => Math.round(value * 100) / 100
const at = (x, y) => `${num(x)} ${num(y)}`
function box(x, y, w, h, r = 0) {
  const k = Math.min(r, w / 2, h / 2)
  if (k <= 0) return `M${at(x, y)}H${num(x + w)}V${num(y + h)}H${num(x)}Z`
  const arc = (ex, ey) => `A${num(k)} ${num(k)} 0 0 1 ${at(ex, ey)}`
  return `M${at(x + k, y)}H${num(x + w - k)}${arc(x + w, y + k)}V${num(y + h - k)}${arc(x + w - k, y + h)}H${num(x + k)}${arc(x, y + h - k)}V${num(y + k)}${arc(x + k, y)}Z`
}
const circle = sweep => (cx, cy, r) => `M${at(cx - r, cy)}A${num(r)} ${num(r)} 0 1 ${sweep} ${at(cx + r, cy)}A${num(r)} ${num(r)} 0 1 ${sweep} ${at(cx - r, cy)}Z`
const disc = circle(1)
const hole = circle(0)
// A polygon with its corners rounded by `r`; the points may run either way.
function poly(points, r = 0) {
  const turn = points.reduce((sum, [x, y], index) => {
    const [nx, ny] = points[(index + 1) % points.length]
    return sum + x * ny - nx * y
  }, 0)
  const list = turn < 0 ? [...points].reverse() : points
  if (r <= 0) return `M${list.map(([x, y]) => at(x, y)).join('L')}Z`
  const toward = ([x, y], [tx, ty]) => {
    const length = Math.hypot(tx - x, ty - y)
    const k = Math.min(r, length / 2) / length
    return [x + (tx - x) * k, y + (ty - y) * k]
  }
  const corners = list.map((point, index) => [toward(point, list[(index + list.length - 1) % list.length]), point, toward(point, list[(index + 1) % list.length])])
  return `M${at(...corners[0][2])}${[...corners.slice(1), corners[0]].map(([from, corner, to]) => `L${at(...from)}Q${at(...corner)} ${at(...to)}`).join('')}Z`
}
// A rod with round ends, for antennas.
function rod(x1, y1, x2, y2, w) {
  const length = Math.hypot(x2 - x1, y2 - y1)
  const [nx, ny] = [((y1 - y2) / length) * (w / 2), ((x2 - x1) / length) * (w / 2)]
  return poly([[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]]) + disc(x1, y1, w / 2) + disc(x2, y2, w / 2)
}
// The band between two circles from angle `from` to `to`, in degrees clockwise from
// three o'clock.
function arcBand(cx, cy, inner, outer, from, to) {
  const point = (r, angle) => at(cx + r * Math.cos((angle * Math.PI) / 180), cy + r * Math.sin((angle * Math.PI) / 180))
  const large = to - from > 180 ? 1 : 0
  return `M${point(outer, from)}A${outer} ${outer} 0 ${large} 1 ${point(outer, to)}L${point(inner, to)}A${inner} ${inner} 0 ${large} 0 ${point(inner, from)}Z`
}

const VISOR = '#000'
const BOLT = [[47, 3], [62, 3], [55, 14], [63, 14], [44, 35], [50, 20], [41, 20]]
const BOLT_LIGHT = [[50, 7], [56.5, 7], [53, 13.5], [58.5, 15.5], [48.5, 28], [50.5, 19.5], [45.5, 19.5]]
const PINS = [32, 46.5, 61].flatMap(p => [box(p, 9, 7, 12, 3), box(p, 79, 7, 12, 3), box(9, p, 12, 7, 3), box(79, p, 12, 7, 3)])
export const CHARACTERS = {
  apex: {
    label: 'Apex',
    body: [box(14, 30, 72, 56, 22), box(5, 47, 13, 24, 6.5), box(82, 47, 13, 24, 6.5), box(46.5, 15, 7, 18, 3.5), disc(50, 12, 8.5)],
    paints: [[box(21, 41, 58, 34, 17), VISOR, 0.28]],
    glow: [disc(50, 12, 4)],
    eyes: [[37.5, 58, 13, 16], [62.5, 58, 13, 16]],
  },
  pixel: {
    label: 'Pixel',
    body: [box(13, 26, 74, 64, 13), rod(31, 28, 24, 11, 6), disc(23, 10, 6.5), rod(69, 28, 76, 11, 6), disc(77, 10, 6.5)],
    paints: [[box(21, 38, 58, 36, 9), VISOR, 0.28]],
    marks: [box(43, 66, 14, 3.6, 1.8)],
    glow: [disc(23, 10, 3), disc(77, 10, 3)],
    eyes: [[37, 54, 13, 13, 0, 3], [63, 54, 13, 13, 0, 3]],
  },
  orbit: {
    label: 'Orbit',
    body: [disc(50, 56, 33), disc(15, 58, 8), disc(85, 58, 8), box(47.5, 17, 5, 10, 2.5), disc(50, 11, 8) + hole(50, 11, 3.8)],
    paints: [[box(25, 42, 50, 30, 15), VISOR, 0.28]],
    glow: [disc(50, 11, 2.2)],
    eyes: [[39.5, 57, 11, 15], [60.5, 57, 11, 15]],
  },
  visor: {
    label: 'Visor',
    body: [box(7, 36, 86, 48, 24), poly([[37, 39], [43, 21], [57, 21], [63, 39]], 5)],
    paints: [[box(15, 46, 70, 27, 13.5), VISOR, 0.3]],
    glow: [box(44.5, 25, 11, 4.4, 2.2)],
    eyes: [[34, 59.5, 17, 10], [66, 59.5, 17, 10]],
  },
  bolt: {
    label: 'Bolt',
    body: [poly([[15, 31], [85, 31], [85, 64], [63, 89], [37, 89], [15, 64]], 11), poly(BOLT, 1.2)],
    paints: [[box(23, 42, 54, 27, 13.5), VISOR, 0.28]],
    glow: [poly(BOLT_LIGHT, 0.8)],
    eyes: [[37.5, 55.5, 15, 10, 7], [62.5, 55.5, 15, 10, -7]],
  },
  dome: {
    label: 'Dome',
    body: ['M15 57A35 35 0 0 1 85 57V78A10 10 0 0 1 75 88H25A10 10 0 0 1 15 78Z', box(47, 11, 6, 14, 3), disc(50, 10, 6.5), disc(12.5, 71, 6.5), disc(87.5, 71, 6.5)],
    paints: [['M25 61A25 25 0 0 1 75 61V65A8 8 0 0 1 67 73H33A8 8 0 0 1 25 65Z', VISOR, 0.28]],
    glow: [disc(50, 10, 3)],
    eyes: [[40, 59, 12, 14], [60, 59, 12, 14]],
  },
  cyclo: {
    label: 'Cyclo',
    body: [box(18, 22, 64, 68, 26), box(9, 45, 13, 22, 6), box(78, 45, 13, 22, 6), box(47.5, 10, 5, 14, 2.5), disc(50, 9, 6.5)],
    paints: [[disc(50, 52, 19.5), VISOR, 0.3], [box(38, 77, 24, 3.6, 1.8), VISOR, 0.24]],
    glow: [disc(50, 9, 3)],
    eyes: [[50, 52, 22, 22]],
  },
  hexo: {
    label: 'Hexo',
    body: [poly([[29, 27], [71, 27], [89, 58], [71, 89], [29, 89], [11, 58]], 9), rod(40, 29, 31, 12, 5), disc(30, 10, 6), rod(60, 29, 69, 12, 5), disc(70, 10, 6)],
    paints: [[box(25, 44, 50, 29, 14.5), VISOR, 0.28]],
    glow: [disc(30, 10, 2.6), disc(70, 10, 2.6)],
    eyes: [[39.5, 58.5, 12, 12], [60.5, 58.5, 12, 12]],
  },
  retro: {
    label: 'Retro',
    body: [box(9, 31, 82, 56, 14), rod(43, 33, 29, 11, 4.5), disc(28, 9.5, 5.5), rod(57, 33, 71, 11, 4.5), disc(72, 9.5, 5.5), box(21, 84, 15, 8, 3.5), box(64, 84, 15, 8, 3.5)],
    paints: [[box(17, 40, 52, 39, 10), VISOR, 0.3], [disc(80, 51, 4.6), VISOR, 0.26], [disc(80, 66, 4.6), VISOR, 0.26]],
    glow: [disc(28, 9.5, 2.5), disc(72, 9.5, 2.5)],
    eyes: [[33.5, 59.5, 11, 15], [52.5, 59.5, 11, 15]],
  },
  buddy: {
    label: 'Buddy',
    body: [disc(50, 57, 31), arcBand(50, 57, 34, 40, 192, 348), box(5, 45, 17, 26, 8.5), box(78, 45, 17, 26, 8.5)],
    paints: [[box(27, 44, 46, 27, 13.5), VISOR, 0.28]],
    glow: [disc(13.5, 58, 2.8), disc(86.5, 58, 2.8)],
    eyes: [[40, 57.5, 11, 14], [60, 57.5, 11, 14]],
  },
  rover: {
    label: 'Rover',
    body: [box(9, 40, 82, 47, 18), box(60, 19, 7, 25, 3.5), box(51, 9, 28, 14, 7)],
    paints: [[box(17, 50, 66, 27, 13.5), VISOR, 0.28]],
    glow: [disc(71.5, 16, 3.2)],
    eyes: [[35.5, 63.5, 13, 13], [64.5, 63.5, 13, 13]],
  },
  chip: {
    label: 'Chip',
    body: [box(19, 19, 62, 62, 13), ...PINS],
    paints: [[box(27, 31, 46, 31, 9), VISOR, 0.28]],
    marks: [box(42, 68.5, 16, 3.6, 1.8)],
    glow: [disc(71, 71, 2.6)],
    eyes: [[40.5, 46.5, 11, 11, 0, 2.5], [59.5, 46.5, 11, 11, 0, 2.5]],
  },
}
// The picker shows every robot at once, six to a row. A Bot with no choice gets one of
// the friendliest eight; Apex is left out so it stays the Main Bot's.
export const PICKER_SHAPES = Object.keys(CHARACTERS)
export const PICKER_COLUMNS = 6
export const DEFAULT_SHAPES = ['pixel', 'orbit', 'visor', 'dome', 'retro', 'buddy', 'rover', 'chip']
export const FALLBACK_SHAPE = 'pixel'
// The team's first Main Bot, and the plugin's own mark in the sidebar.
export const MAIN_LOOK = Object.freeze({ shape: 'apex', color: 'red' })
// Robot colors in picker order, nine to a row. A Bot with no choice gets one of the
// bright colors, so the Bots of a team are told apart at a glance; red is left out so it
// stays the Main Bot's, and the rest are only there for the user to pick.
export const CHARACTER_COLORS = ['red', 'crimson', 'ember', 'amber', 'green', 'teal', 'blue', 'violet', 'rose', 'wine', 'black', 'charcoal', 'graphite', 'steel', 'silver', 'snow', 'blaze']
export const DEFAULT_COLORS = ['ember', 'amber', 'green', 'teal', 'blue', 'violet', 'rose']
export const isColor = color => isHex(color) || Object.hasOwn(INKS, color)

// The default look comes from the Bot id (FNV-1a, then mulberry32 for the
// color and murmur3's fmix32 for the shape), so it is the same on every device.
export function fnv1a(text) {
  let value = 2166136261
  for (let index = 0; index < text.length; index += 1) value = Math.imul(value ^ text.charCodeAt(index), 16777619)
  return value >>> 0
}
export function defaultColor(id) {
  const t = (fnv1a(id) + 1831565813) | 0
  let n = Math.imul(t ^ (t >>> 15), 1 | t)
  n = (n + Math.imul(n ^ (n >>> 7), 61 | n)) ^ n
  return DEFAULT_COLORS[Math.floor((((n ^ (n >>> 14)) >>> 0) / 4294967296) * DEFAULT_COLORS.length)]
}
export function defaultShape(id) {
  let value = fnv1a(id) | 0
  value = Math.imul(value ^ (value >>> 16), 73244475)
  value = Math.imul(value ^ (value >>> 13), 3266489909)
  return DEFAULT_SHAPES[((value ^ (value >>> 16)) >>> 0) % DEFAULT_SHAPES.length]
}

// A stored shape or color wins; then the id. With no Bot it is a black pixel.
export const colorOf = bot => (isColor(bot?.color) ? bot.color : bot?.id ? defaultColor(String(bot.id)) : 'black')
export function lookOf(bot) {
  const avatar = bot?.avatar ?? {}
  return {
    shape: hasShape(avatar.shape) ? avatar.shape : bot?.id ? defaultShape(String(bot.id)) : FALLBACK_SHAPE,
    image: avatar.image,
    color: colorOf(bot),
  }
}

// MASK_ID stands for each mark's own id prefix (its rim masks and gradient): a
// duplicate id resolves to its first copy, which stops painting once that copy
// unmounts or sits in a hidden subtree.
export const MASK_ID = '%MASK%'
// A mask covering three boxes, so a bob or squash never clips the body at the edge.
export const maskBox = size => `maskUnits="userSpaceOnUse" x="${-size}" y="${-size}" width="${size * 3}" height="${size * 3}"`
export const holes = (def, eyes) => `<rect x="${-def.size}" y="${-def.size}" width="${def.size * 3}" height="${def.size * 3}" fill="#fff"/>${eyes}`
// The body where a copy of it, shifted by [dx, dy], does not cover it.
const rim = (key, path, [dx, dy], fill, opacity) => `<mask id="${MASK_ID}${key}" ${maskBox(100)}>${holes({ size: 100 }, `<path d="${path}" transform="translate(${dx} ${dy})"/>`)}</mask><path d="${path}" fill="${fill}" fill-opacity="${opacity}" mask="url(#${MASK_ID}${key})"/>`

// Registered shapes join the characters: `body(paint)` returns SVG markup in a
// `size` box and `eyes` lists the two capsules.
export const SHAPES = {}
for (const [id, character] of Object.entries(CHARACTERS)) {
  const path = character.body.join('')
  const layers = [
    ...(character.paints ?? []).map(([d, fill, opacity]) => `<path d="${d}" fill="${fill}" fill-opacity="${opacity}"/>`),
    rim('s', path, [-3.5, -4.5], '#000', 0.16),
    rim('l', path, [2.5, 3.5], '#fff', 0.2),
    ...(character.marks ?? []).map(d => `<path d="${d}" fill="currentColor"/>`),
    ...(character.glow ?? []).map(d => `<path class="bt-glow" d="${d}" fill="currentColor"/>`),
  ].join('')
  SHAPES[id] = { label: character.label ?? id[0].toUpperCase() + id.slice(1), size: 100, path, layers, eyes: character.eyes }
}
export const hasShape = id => typeof id === 'string' && Object.hasOwn(SHAPES, id)
export const shapeId = id => (hasShape(id) ? id : FALLBACK_SHAPE)
export const shapeOf = id => SHAPES[shapeId(id)]
// `flat` draws the silhouette alone, for masks and selection rings.
export function bodyOf(def, paint, flat = false) {
  if (def.path) return `<path d="${def.path}" fill="${paint}"/>${flat ? '' : def.layers}`
  try { return def.body(paint) } catch { return '' }
}
const eyeMarkup = ([cx, cy, w, h, tilt = 0, r = Math.min(w, h) / 2]) => `<g transform="translate(${cx} ${cy}) rotate(${tilt})"><rect class="bt-eye" x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${r}"/></g>`
// A closed, happy eye (an upturned arc) in the same spot, shown while the mark is petted.
const happyEyeMarkup = ([cx, cy, w, h, tilt = 0]) => `<g transform="translate(${cx} ${cy}) rotate(${tilt})"><path class="bt-eye-happy" opacity="0" d="M${num(-w * 0.55)} ${num(w * 0.12)}Q0 ${num(-w * 0.5)} ${num(w * 0.55)} ${num(w * 0.12)}" fill="none" stroke="currentColor" stroke-width="${num(Math.min(w, h) * 0.42)}" stroke-linecap="round"/></g>`

let markSerial = 0
export const nextMarkSerial = () => (markSerial += 1)
export const markupCache = new Map()
export function characterMarkup(shape, color) {
  const key = `${shape}|${color}`
  let markup = markupCache.get(key)
  if (markup === undefined) {
    const def = shapeOf(shape)
    // The eyes sit untransformed by their placement, so CSS blinks and glances never
    // replace where they sit. They and the lights take the eye color as currentColor.
    const eyes = `<g class="bt-gaze"><g class="bt-eyes" fill="currentColor">${def.eyes.map(eyeMarkup).join('')}${def.eyes.map(happyEyeMarkup).join('')}</g></g>`
    const stops = GRADIENTS[color]
    const gradient = stops ? `<defs><linearGradient id="${MASK_ID}g" gradientUnits="userSpaceOnUse" x1="18" y1="10" x2="78" y2="92">${stops.map(([offset, value]) => `<stop offset="${offset}" stop-color="${value}"/>`).join('')}</linearGradient></defs>` : ''
    const inner = `${bodyOf(def, stops ? `url(#${MASK_ID}g)` : inkFill(color))}${eyes}`
    markup = `${gradient}<g class="bt-b" style="color:${inkEye(color)}">${def.wrap ? `<g transform="${def.wrap}">${inner}</g>` : inner}</g>`
    markupCache.set(key, markup)
  }
  return markup
}
const svgUrl = (inner, size) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${inner}</svg>`)}")`
export const maskCache = new Map()
export function maskOf(shape) {
  let mask = maskCache.get(shape)
  if (mask === undefined) {
    const def = shapeOf(shape)
    const body = `<g mask="url(#e)">${bodyOf(def, '#000', true)}</g>`
    mask = svgUrl(`<mask id="e" ${maskBox(def.size)}>${holes(def, def.eyes.map(eyeMarkup).join('').replaceAll('class="bt-eye"', 'fill="#000"'))}</mask>${def.wrap ? `<g transform="${def.wrap}">${body}</g>` : body}`, def.size)
    maskCache.set(shape, mask)
  }
  return mask
}
export const DEFAULT_MASK = maskOf(FALLBACK_SHAPE)
