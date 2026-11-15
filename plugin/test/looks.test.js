import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { test } from 'node:test'
import { CHARACTERS, CHARACTER_COLORS, DEFAULT_COLORS, DEFAULT_SHAPES, MAIN_LOOK, characterMarkup, defaultColor, defaultShape, lookOf } from '../src/client/characters.js'
import { INKS, eyeOn } from '../src/client/inks.js'
import { indexRoster } from '../src/client/sources.js'

const ids = Array.from({ length: 3000 }, (_, index) => `session-${index.toString(16).padStart(8, '0')}-look`)

test('a Bot with no look of its own never gets Apex or its red, and takes one of the bright colors', () => {
  assert.deepEqual(MAIN_LOOK, { shape: 'apex', color: 'red' })
  assert.ok(!DEFAULT_SHAPES.includes(MAIN_LOOK.shape))
  // Red stays the Main Bot's; black, white and the gradient are only for the user to pick.
  for (const color of [MAIN_LOOK.color, 'crimson', 'black', 'silver', 'snow', 'blaze', 'gray']) assert.ok(!DEFAULT_COLORS.includes(color), color)
  for (const color of DEFAULT_COLORS) assert.ok(CHARACTER_COLORS.includes(color), color)
  const shapes = new Set(ids.map(defaultShape))
  const colors = new Set(ids.map(defaultColor))
  assert.deepEqual([...shapes].sort(), [...DEFAULT_SHAPES].sort())
  assert.deepEqual([...colors].sort(), [...DEFAULT_COLORS].sort())
})

test('the robots are ApmixBot\'s own and light their eyes in a color that reads on their body', () => {
  for (const [id, robot] of Object.entries(CHARACTERS)) {
    assert.ok(robot.eyes.length >= 1, id)
    // The eyes and lights are drawn in the eye color, not cut out of the body.
    assert.match(characterMarkup(id, 'red'), /^<g class="bt-b" style="color:var\(--bt-eye-red\)">/, id)
    assert.match(characterMarkup(id, 'red'), /class="bt-eyes" fill="currentColor"/, id)
  }
  assert.equal(eyeOn(INKS.red[0]), '#ffffff')
  assert.equal(eyeOn(INKS.snow[0]), '#141414')
  // Black turns white in dark mode, so its eyes turn dark there.
  assert.deepEqual(INKS.black.map(eyeOn), ['#ffffff', '#141414'])
})

const roster = (bots, mainBotIds) => indexRoster({ bots, rooms: [], mainBotIds, mainBotId: mainBotIds[0] ?? null })

test('Apex is only a stored look: the browser gives no Bot a look by its place in the team', () => {
  const chief = { id: 'chief', name: 'Chief', createdAt: 1, color: 'red', avatar: { shape: 'apex' } }
  const writer = { id: 'writer', name: 'Writer', createdAt: 2 }
  assert.deepEqual(lookOf(roster([writer, chief], ['chief']).byId.chief), { ...MAIN_LOOK, image: undefined })
  // The first Main Bot left, with no stored look, keeps the look its id gives it.
  const left = roster([writer], ['writer']).byId.writer
  assert.deepEqual(lookOf(left), { shape: defaultShape('writer'), color: defaultColor('writer'), image: undefined })
  const photo = lookOf({ id: 'chief', avatar: { image: 'data:image/png;base64,AA==' } })
  assert.equal(photo.image, 'data:image/png;base64,AA==')
  assert.equal(photo.shape, defaultShape('chief'))
})

test('Bot settings is the only settings entry; nothing is called Team settings', () => {
  const dir = new URL('../src/client/', import.meta.url)
  const sources = readdirSync(dir).filter(name => name.endsWith('.js')).map(name => [name, readFileSync(new URL(name, dir), 'utf8')])
  for (const [name, text] of [...sources, ['client.js', readFileSync(new URL('../client.js', import.meta.url), 'utf8')]]) {
    assert.ok(!text.includes('Team settings'), `${name} still names Team settings`)
  }
  const text = name => sources.find(([file]) => file === name)[1]
  assert.match(text('sidebar.js'), /\[t\('Bot settings'\), GearIcon, \(\) => actions\.openSettings\('general'\)\]/)
  assert.match(text('palette.js'), /title: t\('Bot settings'\), run: \(\) => actions\.openSettings\('general'\)/)
  // One Bot's own entries open that Bot, so they read Edit Bot instead.
  assert.match(text('context-menu.js'), /\[t\('Edit Bot'\), GearIcon, \(\) => actions\.openSettings\('bots', bot\.id\)\]/)
  assert.match(text('details-drawer.js'), /'aria-label': bot \? t\('Edit Bot'\) : t\('Group settings'\), title: bot \? t\('Edit Bot'\) : t\('Group settings'\)/)
  // A group chat's entries open its own settings the same way.
  assert.match(text('context-menu.js'), /\[t\('Group settings'\), GearIcon, \(\) => actions\.openSettings\('groups', room\.id\)\]/)
  assert.ok(!text('mark.js').includes('WhaleLogo'))
})
