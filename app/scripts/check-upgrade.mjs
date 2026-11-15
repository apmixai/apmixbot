// Check an update the way a user makes it, on Windows: install the old setup, open the
// installed app, install the new setup over it while it is open, open the updated app,
// then uninstall. The app runs on throwaway folders, so no team or chat is touched; the
// program itself is installed for this user, so the check refuses to run where ApmixBot is
// installed already.
// Usage: node scripts/check-upgrade.mjs <old setup.exe> <new setup.exe>
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'

const [oldSetup, newSetup] = process.argv.slice(2)
if (process.platform !== 'win32' || !oldSetup || !newSetup || !existsSync(oldSetup) || !existsSync(newSetup)) {
  console.error('check-upgrade: usage (Windows): node scripts/check-upgrade.mjs <old setup.exe> <new setup.exe>')
  process.exit(2)
}
const dir = join(process.env.LOCALAPPDATA, 'Programs', 'ApmixBot')
const exe = join(dir, 'ApmixBot.exe')
const uninstaller = join(dir, 'Uninstall ApmixBot.exe')
const shortcut = join(homedir(), 'Desktop', 'ApmixBot.lnk')
if (existsSync(dir) || existsSync(shortcut)) {
  console.error(`check-upgrade: ApmixBot is installed here (${dir}). Uninstall it first, or run the check on another account.`)
  process.exit(2)
}
const work = mkdtempSync(join(tmpdir(), 'apmixbot-upgrade-'))
mkdirSync(join(work, 'home'))

const failures = []
const check = (title, passed, detail = '') => {
  if (!passed) failures.push(title)
  console.log(`check-upgrade: ${passed ? 'ok  ' : 'FAIL'} ${title}${detail ? ` (${detail})` : ''}`)
}
const powershell = script => spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { encoding: 'utf8' }).stdout.trim()
// The processes that run from the install folder: the app, its Host and the programs it brings.
const FROM_DIR = `Get-CimInstance Win32_Process | Where-Object { $_.Path -and $_.Path.StartsWith('${dir}', 'CurrentCultureIgnoreCase') }`
const running = () => Number(powershell(`@(${FROM_DIR}).Count`))
const version = () => powershell(`(Get-Item -LiteralPath '${exe}').VersionInfo.ProductVersion`)
// Silent, as the setup also runs when the app updates itself; the pages of the wizard add no step.
const install = (setup) => {
  const started = Date.now()
  const { status } = spawnSync(resolve(setup), ['/S'], { stdio: 'ignore' })
  return { status, seconds: Math.round((Date.now() - started) / 1000) }
}

function launch() {
  // A terminal inside an Electron-based editor may set ELECTRON_RUN_AS_NODE, which turns the app into plain Node.
  const { ELECTRON_RUN_AS_NODE: _runAsNode, ...env } = process.env
  Object.assign(env, { APMIXBOT_HOME: join(work, 'home'), APMIXBOT_SHELL_DATA: join(work, 'shell') })
  const port = 9300 + Math.floor(Math.random() * 600)
  const app = spawn(exe, [`--remote-debugging-port=${String(port)}`], { env, stdio: 'ignore' })
  return { app, port, exited: new Promise((done) => { app.once('exit', (code) => { done(code) }) }) }
}
// The window's page once the Host serves it.
async function hostPage(port) {
  for (const end = Date.now() + 150_000; Date.now() < end; await sleep(500)) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${String(port)}/json/list`)).json()
      const page = targets.find(target => target.type === 'page' && /^http:\/\/127\.0\.0\.1:\d+\//u.test(target.url))
      if (page) return page
    } catch {
      // The debugging port is not listening yet.
    }
  }
  return undefined
}
async function closeWindow(page) {
  const socket = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((done, reject) => {
    socket.addEventListener('open', done, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })
  socket.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: 'window.close()' } }))
}

try {
  const first = install(oldSetup)
  const before = existsSync(exe) ? version() : ''
  check('the old setup installs', first.status === 0 && before !== '', `version ${before}, ${String(first.seconds)} s`)
  check('it puts ApmixBot on the desktop', existsSync(shortcut))

  const old = launch()
  check('the installed app starts', await hostPage(old.port) !== undefined, `${String(running())} processes from the install folder`)

  const update = install(newSetup)
  await sleep(1500)
  check('the new setup installs over the open app', update.status === 0, `exit code ${String(update.status)}, ${String(update.seconds)} s`)
  const closed = await Promise.race([old.exited.then(() => true), sleep(5000).then(() => false)])
  check('it closed the app and its Host first', closed && running() === 0, `${String(running())} processes left`)
  const after = existsSync(exe) ? version() : ''
  check('the installed program is the new version', after !== '' && after !== before, `version ${after}`)
  check('ApmixBot is still on the desktop', existsSync(shortcut))

  const next = launch()
  const page = await hostPage(next.port)
  check('the updated app starts', page !== undefined)
  if (page) await closeWindow(page)
  const code = await Promise.race([next.exited, sleep(60_000).then(() => 'timeout')])
  check('the updated app closes when its window does', code === 0, `exit code ${String(code)}`)
  if (code === 'timeout') spawnSync('taskkill', ['/pid', String(next.app.pid), '/T', '/F'], { stdio: 'ignore' })

  const again = install(newSetup)
  check('the same setup installs again over itself', again.status === 0 && existsSync(exe), `${String(again.seconds)} s`)
} catch (error) {
  check('the check ran to its end', false, error instanceof Error ? error.message : String(error))
}

// The computer is left as it was found.
if (existsSync(uninstaller)) {
  for (let tries = 0; running() > 0 && tries < 10; tries += 1) {
    powershell(`${FROM_DIR} | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }`)
    await sleep(1000)
  }
  spawnSync(uninstaller, ['/S'], { stdio: 'ignore' })
  // The uninstaller goes on from a copy of itself after this process returns.
  for (const end = Date.now() + 120_000; existsSync(exe) && Date.now() < end; await sleep(1000));
  await sleep(3000)
  check('the uninstaller removes the program and its shortcut', !existsSync(exe) && !existsSync(shortcut))
}
rmSync(work, { recursive: true, force: true, maxRetries: 10, retryDelay: 500 })
console.log(failures.length === 0 ? 'check-upgrade: passed' : `check-upgrade: FAILED: ${failures.join('; ')}`)
process.exit(failures.length === 0 ? 0 : 1)
