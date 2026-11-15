// Sets the version of ApmixBot for a new release, in every file that names it. The app and
// the plugin carry the same version: the installed app shows it, and Windows lists it.
// Usage: node scripts/set-version.mjs <version>
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { isNewer } from '../src/updates.mjs'

export const VERSION_FILES = ['package.json', 'app/package.json', 'plugin/package.json', 'package-lock.json']

/**
 * The parsed files with `version` in place of the current one.
 * @param {Record<string, any>} files - the parsed VERSION_FILES, by their path from the repository root
 * @param {string} version - the new version
 * @returns {Record<string, any>} copies of the files with the new version
 * @throws when `version` is no version, or is not above the current one
 */
export function withVersion(files, version) {
  const current = files['app/package.json'].version
  if (typeof version !== 'string' || !/^\d+\.\d+\.\d+(-[0-9A-Za-z]+(\.[0-9A-Za-z]+)*)?$/u.test(version)) {
    throw new Error(`"${String(version)}" is not a version like 0.2.1`)
  }
  // An installer of a lower version would put an older program over a newer one.
  if (!isNewer(version, current)) throw new Error(`${version} is not above the current version ${current}`)
  const next = structuredClone(files)
  next['package.json'].version = version
  next['plugin/package.json'].version = version
  // The app names the plugin by its exact version, which is how npm links the one of this checkout.
  for (const manifest of [next['app/package.json'], next['package-lock.json'].packages.app]) {
    manifest.version = version
    manifest.dependencies.apmixbot = version
  }
  const lock = next['package-lock.json']
  lock.version = version
  lock.packages[''].version = version
  lock.packages.plugin.version = version
  return next
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = new URL('../../', import.meta.url)
  const read = Object.fromEntries(VERSION_FILES.map(file => [file, JSON.parse(readFileSync(new URL(file, root), 'utf8'))]))
  try {
    const next = withVersion(read, process.argv[2])
    for (const file of VERSION_FILES) writeFileSync(new URL(file, root), `${JSON.stringify(next[file], null, 2)}\n`)
    console.log(`set-version: ApmixBot is now ${process.argv[2]} (was ${read['app/package.json'].version}). Build the installer with: npm run dist`)
  } catch (error) {
    console.error(`set-version: ${error instanceof Error ? error.message : String(error)}`)
    console.error('usage: npm run set-version -- <version>, for example 0.2.1')
    process.exit(2)
  }
}
