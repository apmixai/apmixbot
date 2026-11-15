// The Host: the shell runs this file in Electron's Node mode. It boots the app's own `apmixbot` profile
// on a loopback port and reports the launch URL over IPC.
// Follows the engine's own desktop host (MIT); see engine/LICENSE.
import { inspect } from 'node:util'
import { loadLayeredEnv, reportSkippedBundles } from '@apmixbot/dsh-app-boot'
import { runProfile } from '@apmixbot/dsh/profile-boot'
import { INSTALL_ANCHOR, loadAppProfile, PROFILE } from './profile.mjs'

const MAX_FATAL_DIAGNOSTIC_CHARS = 64 * 1024

const send = (message) => new Promise((resolve, reject) => {
  if (!process.connected || process.send === undefined) { resolve(); return }
  process.send(message, (error) => { if (error === null) resolve(); else reject(error) })
})

async function main() {
  const pnpm = process.argv[2]
  const profile = loadAppProfile()
  reportSkippedBundles('dsh', profile)
  const application = runProfile({
    environment: loadLayeredEnv('dsh'),
    profile: PROFILE,
    resolvedProfile: { profile, installAnchor: INSTALL_ANCHOR },
    // Checks on throwaway folders layer their own settings, such as a mock model provider.
    patchFiles: process.env.APMIXBOT_PATCH ? [process.env.APMIXBOT_PATCH] : [],
    args: ['--no-open', '--port', process.env.APMIXBOT_PORT || '0'],
    ...(pnpm === undefined ? {} : {
      packageManager: { command: process.execPath, args: ['--expose-internals', pnpm], env: { ELECTRON_RUN_AS_NODE: '1' } },
    }),
  })
  let stopping
  const stop = () => stopping ??= (async () => {
    // A Host that failed to boot has nothing to shut down; the shell already has the failure.
    const running = await application.catch(() => undefined)
    await running?.shutdown.shutdown(0)
    await send({ type: 'shutdown-complete' })
    if (process.connected) process.disconnect()
  })()
  process.on('message', (message) => { if (message?.type === 'shutdown') void stop() })
  process.once('disconnect', () => { void stop() })
  const { ctx } = await application
  const [webServer, connection] = [ctx.get('webServer'), ctx.get('connection')]
  // A profile patch can turn these rows off; then the window has nothing to talk to.
  if (webServer === undefined || connection === undefined) throw new Error(`The profile in ${profile.dir} does not start the engine's web server and connection.`)
  const url = connection.authenticatedUrl(`http://127.0.0.1:${String(webServer.port)}`)
  await send({ type: 'ready', url, injections: webServer.collectIndexInjections() })
}

main().catch(async (error) => {
  console.error(error)
  process.exitCode = 1
  const message = error instanceof Error ? error.message : String(error)
  const diagnostic = inspect(error, { depth: 4, maxArrayLength: 50 }).slice(0, MAX_FATAL_DIAGNOSTIC_CHARS)
  await send({ type: 'fatal', message, diagnostic }).catch(() => undefined)
  if (process.connected) process.disconnect()
})
