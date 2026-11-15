import assert from 'node:assert/strict'
import { test } from 'node:test'
import { APP_CATALOG, APP_CATEGORIES, catalogApp } from '../src/shared/app-catalog.js'
import { serverNameOf } from '../src/host/apps.js'
import { safeAddress } from '../src/host/mcp-oauth.js'

test('every app has an id of its own, an https address and a known way to sign in', () => {
  const ids = APP_CATALOG.map(entry => entry.id)
  assert.equal(new Set(ids).size, ids.length)
  // The server name is what the tools are named after: no two apps may share one.
  assert.equal(new Set(ids.map(serverNameOf)).size, ids.length)
  for (const entry of APP_CATALOG) {
    assert.match(entry.id, /^[a-z][a-z0-9_]*$/, entry.id)
    assert.match(serverNameOf(entry.id), /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/, entry.id)
    assert.equal(new URL(entry.url).protocol, 'https:', entry.id)
    assert.ok(safeAddress(entry.url), entry.id)
    assert.ok(['oauth', 'bearer', 'header', 'none'].includes(entry.auth), entry.id)
    assert.ok(APP_CATEGORIES.includes(entry.category), entry.id)
    assert.ok(entry.name.length > 0 && entry.about.length > 0, entry.id)
    assert.equal(entry.about.endsWith('.'), false, `${entry.id}: the line is not a sentence`)
  }
})

test('an app that takes a key says what the key is called, and a header key names its header', () => {
  for (const entry of APP_CATALOG) {
    if (entry.auth === 'bearer' || entry.auth === 'header') {
      assert.ok(entry.keyLabel, entry.id)
      assert.equal(new URL(entry.keyUrl).protocol, 'https:', entry.id)
    }
    assert.equal(entry.auth === 'header', entry.header !== undefined, entry.id)
    // Only a sign-in in the browser can need a client the user made.
    if (entry.needsClient) assert.equal(entry.auth, 'oauth', entry.id)
    if (entry.docs) assert.equal(new URL(entry.docs).protocol, 'https:', entry.id)
  }
})

test('GitHub stays the connector, every category has apps, and an app is found by its id', () => {
  assert.equal(catalogApp('github'), undefined)
  assert.equal(APP_CATALOG.some(entry => /github/i.test(entry.id)), false)
  for (const category of APP_CATEGORIES) assert.ok(APP_CATALOG.some(entry => entry.category === category), category)
  assert.equal(catalogApp('notion').name, 'Notion')
  assert.equal(catalogApp('google_maps').header, 'X-Goog-Api-Key')
  assert.equal(catalogApp('nope'), undefined)
  assert.throws(() => { APP_CATALOG[0].url = 'https://elsewhere.test' }, TypeError)
})
