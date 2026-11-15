// Whether a running engine holds the team in a data folder, as the plugin's own lock tells
// (plugin/src/host/home-lock.js).
import { existsSync, readFileSync, statSync } from 'node:fs'
import { hostname } from 'node:os'
import { join } from 'node:path'

const LOCK_STALE_MS = 60_000

export function teamInUse(from, { host = hostname(), now = Date.now() } = {}) {
  const path = join(from, 'bot', 'state.lock')
  if (!existsSync(path)) return false
  const fresh = now - statSync(path).mtimeMs < LOCK_STALE_MS
  let holder
  try {
    holder = JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return fresh
  }
  if (holder?.host !== host) return fresh
  try {
    process.kill(holder.pid, 0)
    return true
  } catch (error) {
    return error?.code === 'EPERM'
  }
}
