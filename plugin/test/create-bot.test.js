import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createPayload, freshBotName, randomLook, startModel } from '../src/client/bot-draft.js'
import { DEFAULT_COLORS, DEFAULT_SHAPES } from '../src/client/characters.js'

const models = [
  { ref: 'ollama/ds-flash', name: 'DS Flash', providerName: 'Ollama' },
  { ref: 'cloud/nova-max', name: 'Nova Max', providerName: 'Cloud' },
]

test('the form starts on the DSH default model, else the first served one', () => {
  assert.equal(startModel({ models, defaultModel: 'cloud/nova-max' }), 'cloud/nova-max')
  assert.equal(startModel({ models, defaultModel: 'gone/model' }), 'ollama/ds-flash')
  assert.equal(startModel({ models, defaultModel: null }), 'ollama/ds-flash')
  assert.equal(startModel({ models: [], defaultModel: 'cloud/nova-max' }), '')
})

test('the form never starts on a model whose provider has no API key', () => {
  const keyless = [{ ...models[1], needsKey: true }, models[0]]
  assert.equal(startModel({ models: keyless, defaultModel: 'cloud/nova-max' }), 'ollama/ds-flash')
  assert.equal(startModel({ models: [keyless[0]], defaultModel: 'cloud/nova-max' }), '')
})

test('the payload carries the look, the chosen model, and the brief', () => {
  const look = { shape: 'star', color: 'blue' }
  assert.deepEqual(createPayload({ name: 'A', look, model: 'cloud/nova-max' }), { name: 'A', color: 'blue', avatar: { shape: 'star' }, model: 'cloud/nova-max' })
  assert.deepEqual(createPayload({ name: 'A', look, model: '', brief: 'hi', image: 'data:image/png;base64,AA' }),
    { name: 'A', color: 'blue', avatar: { shape: 'star', image: 'data:image/png;base64,AA' }, brief: 'hi' })
})

test('the form opens on a look the team does not wear yet, and Shuffle never repeats the one shown', () => {
  const wearing = (colors, shapes) => Array.from({ length: Math.max(colors.length, shapes.length) }, (_, index) => ({ id: `b${index}`, color: colors[index % colors.length], avatar: { shape: shapes[index % shapes.length] } }))
  // All but one color and one shape are worn: only those are left to pick.
  const team = wearing(DEFAULT_COLORS.slice(1), DEFAULT_SHAPES.slice(1))
  for (let tries = 0; tries < 50; tries++) assert.deepEqual(randomLook(team), { shape: DEFAULT_SHAPES[0], color: DEFAULT_COLORS[0] })
  // With every look worn, any of them may come again, but not the one on screen.
  const full = wearing(DEFAULT_COLORS, DEFAULT_SHAPES)
  const shown = { shape: DEFAULT_SHAPES[0], color: DEFAULT_COLORS[0] }
  for (let tries = 0; tries < 200; tries++) {
    const next = randomLook(full, shown)
    assert.ok(DEFAULT_SHAPES.includes(next.shape) && DEFAULT_COLORS.includes(next.color))
    assert.ok(next.shape !== shown.shape && next.color !== shown.color)
  }
  // A new team has every look to choose from.
  assert.ok(DEFAULT_COLORS.includes(randomLook([]).color))
})

test('the suggested name skips taken names', () => {
  const roster = { bots: [{ name: 'New Bot' }, { name: 'Kai' }] }
  assert.equal(freshBotName(roster), 'New Bot 2')
  assert.equal(freshBotName(roster, 'Kai'), 'Kai 2')
  assert.equal(freshBotName(roster, 'Writer'), 'Writer')
})
