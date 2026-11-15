import assert from 'node:assert/strict'
import { test } from 'node:test'
import { linkMentions, MENTION_ORIGIN } from '../src/client/text.js'

const bots = [{ id: 'a', name: 'New Bot' }, { id: 'b', name: 'New Bot 2' }, { id: 'c', name: 'Chief' }, { id: 't', name: 'Tester' }]

test('a bare name is ordinary text, even when a Bot has that name', () => {
  assert.equal(linkMentions('76 tests passed, ask Chief', bots, 'a'), '76 tests passed, ask Chief')
})

test('a Bot naming itself is not taken for a Bot whose name is a prefix of its own', () => {
  assert.equal(linkMentions('Hi! I am @New Bot 2, glad to join', bots, 'b'), 'Hi! I am @New Bot 2, glad to join')
})

test('the longest name wins, and other Bots are still linked', () => {
  assert.equal(linkMentions('@New Bot 2 and @chief', bots, 'a'), `[New Bot 2](${MENTION_ORIGIN}b) and [chief](${MENTION_ORIGIN}c)`)
  assert.equal(linkMentions('ask @New Bot.', bots, 'b'), `ask [New Bot](${MENTION_ORIGIN}a).`)
  assert.equal(linkMentions('@Tester please look', bots, 'a'), `[Tester](${MENTION_ORIGIN}t) please look`)
})

test('addresses, longer words and code are left alone', () => {
  assert.equal(linkMentions('mail me@Chief.dev', bots, 'a'), 'mail me@Chief.dev')
  assert.equal(linkMentions('@Chiefs is here', bots, 'a'), '@Chiefs is here')
  assert.equal(linkMentions('run `@Chief` now', bots, 'a'), 'run `@Chief` now')
})
