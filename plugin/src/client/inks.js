// Inks (light, dark) for robots, names, and mentions: the ApmixBot reds, the bright
// colors that tell the Bots of a team apart, then black, white, and the grays between them.
export const INKS = {
  red: ['#E5202E', '#FF3B47'], crimson: ['#A8101D', '#E23345'], ember: ['#FF6A1A', '#FF8A3D'],
  amber: ['#D98A00', '#FFB224'], green: ['#1E9E57', '#3DD07F'], teal: ['#0F9B8E', '#25CDB8'],
  blue: ['#2B6FE8', '#5B9BFF'], violet: ['#7B4FE0', '#A385FF'],
  rose: ['#E8175D', '#F2457A'], wine: ['#7A0F24', '#C23A55'],
  black: ['#000000', '#FFFFFF'], charcoal: ['#1C1C1F', '#ECECEF'], graphite: ['#3A3A3F', '#C9C9CE'],
  steel: ['#5E636B', '#9EA3AB'], silver: ['#8E9299', '#BFC2C8'], snow: ['#E6E7EA', '#FFFFFF'],
  gray: ['#959595', '#777777'], blaze: ['#E5202E', '#FF3B47'],
}
// Gradient colors paint a robot from its top left to its bottom right; their ink
// above is the text color.
export const GRADIENTS = { blaze: [[0, '#FF6A3D'], [0.45, '#E5202E'], [1, '#3A0A10']] }
export const ACCENT_INKS = ['red', 'crimson', 'rose', 'wine', 'charcoal', 'graphite']
export const isHex = color => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color)
export const luminance = hex => [1, 3, 5]
  .map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
  .map(channel => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
  .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0)
const inkName = color => (INKS[color] ? color : 'gray')
export const inkFill = color => (isHex(color) ? color : `var(--bt-ink-${inkName(color)})`)
// Text in a Bot's color; black reads as a heading and snow vanishes on white, so both
// fall back to gray.
export const inkText = color => (color === 'black' || color === 'snow' ? 'var(--bt-ink-gray)' : inkFill(color))
// The LED color of a robot's eyes and lights: white on a dark or red body, near-black
// on a light one.
export const eyeOn = hex => (luminance(hex) > 0.3 ? '#141414' : '#ffffff')
export const inkEye = color => (GRADIENTS[color] ? '#ffffff' : isHex(color) ? eyeOn(color) : `var(--bt-eye-${inkName(color)})`)
// A color as a CSS background, for swatches and masked marks.
export const paintCss = color => (GRADIENTS[color] ? `linear-gradient(135deg,${GRADIENTS[color].map(([offset, value]) => `${value} ${offset * 100}%`).join(',')})` : inkFill(color))
