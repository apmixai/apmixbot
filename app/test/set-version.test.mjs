import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { VERSION_FILES, withVersion } from '../scripts/set-version.mjs'

const files = () => Object.fromEntries(VERSION_FILES.map(file => [file, JSON.parse(readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8'))]))
// One step above whatever the checkout is at, so the test holds after every release.
const current = files()['app/package.json'].version
const [major, minor, patch] = current.split('-')[0].split('.').map(Number)
const next = `${String(major)}.${String(minor)}.${String(patch + 1)}`

test('a new version goes into every file that names the old one, and nowhere else', () => {
  const before = files()
  const after = withVersion(before, next)
  assert.deepEqual(
    [after['package.json'].version, after['app/package.json'].version, after['plugin/package.json'].version, after['package-lock.json'].version],
    [next, next, next, next],
  )
  // npm links the plugin of this checkout only while the app asks for its exact version.
  assert.equal(after['app/package.json'].dependencies.apmixbot, next)
  const lock = after['package-lock.json'].packages
  assert.deepEqual([lock[''].version, lock.app.version, lock.app.dependencies.apmixbot, lock.plugin.version], [next, next, next, next])
  // The files it was given are not changed, and nothing else in them moved.
  assert.equal(before['app/package.json'].version, current)
  const rest = (all) => {
    const copy = structuredClone(all)
    const lockFile = copy['package-lock.json']
    for (const manifest of [copy['package.json'], copy['plugin/package.json'], lockFile, lockFile.packages[''], lockFile.packages.plugin]) delete manifest.version
    for (const manifest of [copy['app/package.json'], lockFile.packages.app]) {
      delete manifest.version
      delete manifest.dependencies.apmixbot
    }
    return copy
  }
  assert.deepEqual(rest(after), rest(before))
})

test('a version that is not above the current one, or is no version, is refused', () => {
  assert.throws(() => withVersion(files(), current), new RegExp(`^Error: ${current.replaceAll('.', '\\.')} is not above the current version`))
  assert.throws(() => withVersion(files(), '0.0.1'), /is not above the current version/)
  for (const bad of ['1.2', 'v9.9.9', 'next', '', undefined]) assert.throws(() => withVersion(files(), bad), /is not a version like 0\.2\.1/)
  // A prerelease of a higher version counts as above.
  assert.equal(withVersion(files(), `${next}-rc.1`)['app/package.json'].version, `${next}-rc.1`)
})
