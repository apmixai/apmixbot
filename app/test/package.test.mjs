import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { parse } from 'yaml'

// npm installs the peers that the engine packages ask for, but electron-builder packs only the
// dependencies it finds through `dependencies` and `optionalDependencies`. A package that npm
// installed only as a peer would be left out of the installer, and the Host would not boot.
test('every package that the app runs on is a dependency, not only a peer', () => {
  const lock = JSON.parse(readFileSync(new URL('../../package-lock.json', import.meta.url), 'utf8'))
  const peerOnly = Object.entries(lock.packages)
    .filter(([path, entry]) => path !== '' && entry.peer && !entry.dev && !entry.devOptional)
    .map(([path, entry]) => `${path.replace(/^.*node_modules\//u, '')}@${entry.version}`)
  assert.deepEqual(peerOnly, [], `add these to "dependencies" in app/package.json: ${peerOnly.join(' ')}`)
})

// The installer makes the shortcuts itself: the user finds ApmixBot on the desktop after setup.
test('the Windows installer puts ApmixBot on the desktop and in the Start menu', () => {
  const { nsis } = parse(readFileSync(new URL('../electron-builder.yml', import.meta.url), 'utf8'))
  assert.deepEqual([nsis.createDesktopShortcut, nsis.createStartMenuShortcut, nsis.shortcutName], [true, true, 'ApmixBot'])
})

// A release is tagged with the version of apmixbot, and the installed apps compare their own
// version with the one in the release's latest.yml.
test('the app has the version of apmixbot', () => {
  const version = file => JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8')).version
  assert.equal(version('../package.json'), version('../../plugin/package.json'))
})
