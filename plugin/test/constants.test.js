import assert from 'node:assert/strict'
import { test } from 'node:test'
import * as plugin from '../index.js'
import { COLORS, EXTRA_COLORS, ROOM_MODES } from '../src/host/constants.js'
import { INKS } from '../src/client/inks.js'

test('the plugin entry re-exports the shared colors', () => {
  assert.equal(plugin.name, 'apmixbot')
  assert.equal(plugin.COLORS, COLORS)
  assert.equal('LABS' in plugin, false)
  assert.equal(typeof plugin.apply, 'function')
})

test('every color is listed once and paints in the browser', () => {
  const current = [...COLORS, ...EXTRA_COLORS]
  assert.equal(new Set(current).size, current.length)
  // Every color the host accepts paints in the browser.
  for (const color of current) assert.ok(Object.hasOwn(INKS, color), color)
})

test('the reply modes are the ones the client offers', () => {
  assert.deepEqual(ROOM_MODES, ['everyone', 'admin'])
})
