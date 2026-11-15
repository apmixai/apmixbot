// Approvals for the tools of connected apps (docs/apps.md). A Bot asks before it uses a
// tool of an app, an MCP capability or the GitHub connector: the call waits on a card
// with Decline, Allow once and Always allow, in the Bot's own chat or in the group it
// works in. "Always allow" is kept for that tool, for every Bot. A link such a tool
// hands out for the user to open (Vercel's team approval) gets a card with a button,
// since the user must not have to fish it out of the Bot's reply.
import { randomUUID } from 'node:crypto'
import { serverOf } from './app-tools.js'

const ARGS_MAX = 600
const LINK_KEPT_MS = 15 * 60_000
const LINKS_MAX = 20
// Tools that exist to give the user a link: authorize_team_access, start_login, connect_account.
const GIVES_LINK = /(^|[_-])(authori[sz]e|authori[sz]ation|auth|sso|consent|login|signin|sign[_-]in|oauth|connect|grant)([_-]|$)/i
const LINK = /https:\/\/[^\s<>"'`)\]]+/

// The server and the tool's own name in `mcp__<server>__<tool>`; `servers` are the names
// ApmixBot mounted, which may hold `__` themselves.
export function toolParts(name, servers = []) {
  if (typeof name !== 'string' || !name.startsWith('mcp__')) return undefined
  const server = serverOf(name, servers) ?? /^mcp__(.+?)__./.exec(name)?.[1]
  return server === undefined ? undefined : { server, tool: name.slice(`mcp__${server}__`.length) }
}

// The link a tool that gives one answered with, without the punctuation after it.
export function linkIn(tool, text) {
  if (!GIVES_LINK.test(tool)) return undefined
  const found = LINK.exec(String(text ?? ''))?.[0].replace(/[.,;:!?]+$/, '')
  try { return found === undefined ? undefined : new URL(found).href } catch { return undefined }
}

const textOf = content => (Array.isArray(content) ? content : []).map(block => (block?.type === 'text' ? block.text : '')).join('\n')

export function install(rt) {
  const { ctx, state } = rt
  // Links waiting for the user, newest last.
  let links = []

  const labelOf = server => rt.appServers?.().get(server) ?? (server === 'github' ? 'GitHub' : server)
  const partsOf = name => toolParts(name, [...(rt.appServers?.().keys() ?? [])])
  const allowed = () => (Array.isArray(state.allowedTools) ? state.allowedTools : [])
  const argsLine = (args) => {
    let line
    try { line = JSON.stringify(args ?? {}) } catch { line = '' }
    if (line === '{}' || line === undefined) return ''
    line = rt.redactSecrets?.(line) ?? line
    return line.length > ARGS_MAX ? `${line.slice(0, ARGS_MAX)}…` : line
  }

  async function allowAlways(name) {
    if (!allowed().includes(name)) state.allowedTools = [...allowed(), name]
    // The same call asked for more than once, by this Bot or another, needs no second answer.
    for (const entry of rt.openApprovals(open => open.call === name)) entry.answer('allowed-once')
    // A host that only reads the team keeps the answer for this run.
    if (rt.readOnly() === undefined) await rt.save().catch(error => rt.warn('apmixbot: the allowed tool %s was not saved: %s', name, error))
  }

  ctx.on('tools/pre-execute', async (exec, next) => {
    const name = exec?.name
    const sessionId = exec?.agent?.id
    if (typeof name !== 'string' || !name.startsWith('mcp__') || sessionId === undefined) return next()
    await rt.load()
    const parts = partsOf(name)
    if (parts === undefined || !rt.isBotSession(sessionId) || allowed().includes(name)) return next()
    const app = labelOf(parts.server)
    const code = argsLine(exec.arguments)
    const outcome = await rt.askApproval({
      sessionId, tool: parts.tool, kind: 'app', app, call: name, always: true, signal: exec.signal,
      reason: `Use ${parts.tool} of ${app}`,
      detail: code ? { code } : {},
    })
    if (outcome === 'allowed-always') {
      await allowAlways(name)
      return next()
    }
    if (outcome === 'allowed-once') return next()
    if (outcome === 'cancelled') return { kind: 'cancel' }
    return { kind: 'deny', reason: outcome === 'rejected' ? `The user declined ${parts.tool} of ${app}. Do not call it again unless the user asks for it.` : `Nobody can approve ${parts.tool} of ${app} here.` }
  })

  // A link to open: kept until the user is done with it, the app works again, or it is old.
  const place = sessionId => rt.groupOwners.get(sessionId)
  ctx.on('tools/result', (exec, result) => {
    try {
      const sessionId = exec?.agent?.id
      const parts = partsOf(exec?.name)
      if (parts === undefined || sessionId === undefined || !rt.isBotSession(sessionId)) return
      const url = linkIn(parts.tool, textOf(result?.content))
      if (url === undefined) {
        // The app answered a call of its own: what the link was for is done.
        if (result?.isError !== true && !GIVES_LINK.test(parts.tool)) links = links.filter(link => !(link.sessionId === sessionId && link.server === parts.server))
        return
      }
      const owner = place(sessionId)
      const botId = owner?.botId ?? rt.chatOwners.get(sessionId)
      if (botId === undefined) return
      links = [...links.filter(link => !(link.sessionId === sessionId && link.server === parts.server)), {
        id: randomUUID(), sessionId, botId, ...(owner ? { roomId: owner.roomId } : {}), server: parts.server, app: labelOf(parts.server), tool: parts.tool, url, at: Date.now(),
      }].slice(-LINKS_MAX)
    } catch (error) {
      rt.warn('apmixbot: a link an app gave was not shown: %s', error)
    }
  })

  const appLinksView = () => {
    links = links.filter(link => Date.now() - link.at < LINK_KEPT_MS && rt.botOf(link.botId) !== undefined)
    return links.map(({ server, ...link }) => link)
  }
  function dismissAppLink(id) {
    links = links.filter(link => link.id !== String(id ?? ''))
  }

  // The tools Bots use without asking, as the page shows them: the app and the tool's own name.
  const allowedToolsView = () => allowed().flatMap((name) => {
    const parts = partsOf(name)
    return parts === undefined ? [] : [{ name, app: labelOf(parts.server), tool: parts.tool }]
  })
  async function forgetAllowedTools(names) {
    await rt.load()
    const readOnly = rt.readOnly()
    if (readOnly !== undefined) throw new Error(readOnly)
    const drop = Array.isArray(names) ? new Set(names.map(String)) : undefined
    state.allowedTools = drop === undefined ? [] : allowed().filter(name => !drop.has(name))
    await rt.save()
  }

  Object.assign(rt, { appLinksView, dismissAppLink, allowedToolsView, forgetAllowedTools })
}
