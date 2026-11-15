// Lint with the oxlint the workspace installs.
// Usage: npm run lint [-- <oxlint options>]
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'

const plugin = resolve(import.meta.dirname, '..')
// Node runs oxlint's own script: on Windows it cannot spawn the .cmd shim in node_modules/.bin
// without a shell.
const bin = join(dirname(createRequire(import.meta.url).resolve('oxlint/package.json')), 'bin', 'oxlint')
const result = spawnSync(process.execPath, [bin, '-c', '.oxlintrc.json', ...process.argv.slice(2), 'index.js', 'web-search.js', 'src', 'dev', 'scripts', 'test'], { cwd: plugin, stdio: 'inherit' })
if (result.error) console.error(`lint: ${result.error.message}`)
process.exit(result.status ?? 1)
