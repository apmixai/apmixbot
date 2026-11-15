// Windows downloads and installs updates; macOS asks before opening the release page.

export const UPDATE_TEXT = {
  ready: version => `ApmixBot ${version} is ready to install.`,
  readyDetail: 'Restart now to update, or it is installed the next time you quit.',
  restart: 'Restart now', later: 'Later',
  onFailure: version => `ApmixBot ${version} is installed when its download is done, and then ApmixBot opens again.`,
  available: version => `ApmixBot ${version} is available.`,
  availableDetail: 'This version cannot update itself. Download the new version from its release page, then replace ApmixBot in Applications.',
  download: 'Download',
  onFailurePage: version => `ApmixBot ${version} is available. After this box, its download page opens.`,
}

const CHECK_EVERY_MS = 4 * 60 * 60_000
// This copy's GitHub releases for macOS: the repository that `publish` in electron-builder.yml
// names for Windows. null: no release feed, and the app never checks.
export const RELEASES_URL = 'https://api.github.com/repos/apmixai/apmixbot/releases?per_page=20'

// What the app checks for updates, or null when it has nowhere to look. APMIXBOT_UPDATE_URL
// (`override`) wins. Else macOS asks RELEASES_URL, and Windows the app-update.yml that
// electron-builder's `publish` setting puts in the package (its `feed` stays undefined then).
// A copy that names neither never checks, so it never fetches another project's releases.
export function updateFeed({ platform, override, releases = RELEASES_URL, hasUpdaterConfig = false }) {
  if (platform === 'darwin') return override || releases ? { feed: override || releases } : null
  if (platform === 'win32') return override || hasUpdaterConfig ? { feed: override || undefined } : null
  return null
}

function parseVersion(version) {
  if (typeof version !== 'string') return null
  const value = version.replace(/^v/u, '')
  const separator = value.indexOf('-')
  const core = separator < 0 ? value : value.slice(0, separator)
  const pre = separator < 0 ? null : value.slice(separator + 1).split('.')
  const parts = core.split('.')
  if (parts.length > 3 || parts.some(part => !/^\d+$/u.test(part)) || pre?.some(part => part === '')) return null
  return {
    core: [0, 1, 2].map(index => (index < parts.length ? BigInt(parts[index]) : 0n)),
    pre,
  }
}

export function isNewer(candidate, current) {
  const newer = parseVersion(candidate)
  const older = parseVersion(current)
  if (newer === null || older === null) return false
  for (let index = 0; index < 3; index += 1) {
    if (newer.core[index] !== older.core[index]) return newer.core[index] > older.core[index]
  }
  if (newer.pre === null) return older.pre !== null
  if (older.pre === null) return false
  for (let index = 0; index < Math.max(newer.pre.length, older.pre.length); index += 1) {
    const left = newer.pre[index]
    const right = older.pre[index]
    if (left === undefined) return false
    if (right === undefined) return true
    if (left === right) continue
    const leftNumeric = /^\d+$/u.test(left)
    const rightNumeric = /^\d+$/u.test(right)
    if (leftNumeric && rightNumeric) return BigInt(left) > BigInt(right)
    if (leftNumeric !== rightNumeric) return !leftNumeric
    return left > right
  }
  return false
}

function isHttpsPage(page) {
  if (typeof page !== 'string') return false
  try {
    return new URL(page).protocol === 'https:'
  } catch {
    return false
  }
}

export function watchReleases({ current, arch, fetch = globalThis.fetch, ask, open, feed = RELEASES_URL, log = console }) {
  let asked
  let latest = Promise.resolve(null)
  const check = () => {
    latest = (async () => {
      try {
        const response = await fetch(feed, {
          headers: { accept: 'application/vnd.github+json', 'user-agent': `ApmixBot/${current}` },
        })
        if (!response.ok) {
          log.error(`ApmixBot: update check failed: HTTP ${String(response.status)}`)
          return null
        }
        const releases = await response.json()
        if (!Array.isArray(releases)) {
          log.error('ApmixBot: update check failed: releases response is not an array')
          return null
        }
        const currentVersion = parseVersion(current)
        const allowPrerelease = currentVersion !== null && currentVersion.pre !== null
        let found
        for (const release of releases) {
          if (release === null || typeof release !== 'object' || release.draft === true
            || (release.prerelease === true && !allowPrerelease)) continue
          const version = typeof release.tag_name === 'string' ? release.tag_name.replace(/^v/u, '') : ''
          if (!isNewer(version, current)) continue
          if (!Array.isArray(release.assets) || !release.assets.some(asset => asset?.name === `ApmixBot-${version}-mac-${arch}.zip`)) continue
          if (!isHttpsPage(release.html_url)) {
            log.error('ApmixBot: update check failed: release page URL is not HTTPS')
            continue
          }
          if (found === undefined || isNewer(version, found.version)) found = { version, page: release.html_url }
        }
        if (found === undefined) return null
        log.info(`ApmixBot: update ${found.version} available`)
        if (ask !== undefined && asked !== found.version) {
          asked = found.version
          void Promise.resolve().then(() => ask(found.version))
            .then(yes => (yes ? open(found.page) : undefined))
            .catch((error) => { log.error(`ApmixBot: update ${found.version} not opened: ${error instanceof Error ? error.message : String(error)}`) })
        }
        return found
      } catch (error) {
        log.error(`ApmixBot: update check failed: ${error instanceof Error ? error.message : String(error)}`)
        return null
      }
    })()
  }
  check()
  const timer = setInterval(check, CHECK_EVERY_MS)
  return { stop: () => { clearInterval(timer) }, latest: () => latest }
}

/**
 * @param {{
 *   updater: import('electron-updater').AppUpdater,
 *   beforeInstall: () => Promise<void>,
 *   ask?: (version: string) => Promise<boolean>,
 *   feed?: string,
 *   log?: Pick<Console, 'info' | 'error'>,
 * }} options `ask` answers whether to restart now; without it the update waits for the next
 *   quit. `beforeInstall` stops the Host, which runs from the files the installer replaces.
 *   `feed` is a folder URL with a latest.yml, in place of the GitHub releases.
 * @returns {{
 *   stop: () => void,
 *   latest: () => Promise<{ version: string, downloaded: Promise<boolean> } | null>,
 *   install: () => Promise<void>,
 * }} `latest` is what the newest check found: the version and whether its download finished.
 *   `install` stops the Host and runs the installer, which opens the app again.
 */
export function watchUpdates({ updater, beforeInstall, ask, feed, log = console }) {
  updater.autoDownload = true
  updater.autoInstallOnAppQuit = true
  if (feed) updater.setFeedURL({ provider: 'generic', url: feed })
  const install = async () => {
    await beforeInstall()
    updater.quitAndInstall(true, true)
  }
  let asked
  updater.on('update-downloaded', ({ version }) => {
    log.info(`ApmixBot: update ${version} downloaded`)
    if (ask === undefined || asked === version) return
    asked = version
    void ask(version).then(now => (now ? install() : undefined))
      .catch((error) => { log.error(`ApmixBot: update ${version} not installed: ${error instanceof Error ? error.message : String(error)}`) })
  })
  updater.on('error', (error) => { log.error(`ApmixBot: update failed: ${error instanceof Error ? error.message : String(error)}`) })
  let latest = Promise.resolve(null)
  // A failed check or download also comes as an 'error' event.
  const check = () => {
    latest = updater.checkForUpdates().then(result => (result?.isUpdateAvailable && result.downloadPromise
      ? { version: result.updateInfo.version, downloaded: result.downloadPromise.then(() => true, () => false) }
      : null), () => null)
  }
  check()
  const timer = setInterval(check, CHECK_EVERY_MS)
  return { stop: () => { clearInterval(timer) }, latest: () => latest, install }
}
