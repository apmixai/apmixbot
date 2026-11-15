// Apps with many tools (docs/apps.md): the server of one app can list hundreds of tools,
// and their schemas would fill every model request of every Bot. Such an app's tools are
// left out of the request; a Bot finds the ones it needs with `app_tools`, and those are
// listed from its next step. Every tool stays registered, so a call by name still runs.
import { defineTool } from '@apmixbot/dsh-tools'
import { serverNameOf } from './apps.js'
import { APP_FINDER as FINDER } from './constants.js'
import { output } from './tools.js'

export { FINDER }
// An app with more tools than this is looked up.
export const APP_TOOL_LIMIT = 40
// Model APIs take up to 128 tools in one request.
export const REQUEST_TOOL_LIMIT = 128
const FOUND_MAX = 8
const KEPT_MAX = 30
const NAMED_MAX = 4
const ABOUT_MAX = 240
// Words of a request that say nothing about the tool.
const SKIP = new Set(['a', 'all', 'an', 'and', 'for', 'from', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'the', 'to', 'with'])

// The server of the tool `mcp__<server>__<tool>`, when it is one of `servers`.
export function serverOf(name, servers) {
  if (!name.startsWith('mcp__')) return undefined
  let found
  for (const server of servers) {
    if (name.startsWith(`mcp__${server}__`) && (found === undefined || server.length > found.length)) found = server
  }
  return found
}

// The tools one request lists, and the servers whose tools are looked up instead, with
// their sizes: a server with more than APP_TOOL_LIMIT tools, then the largest ones left
// while the request holds more than REQUEST_TOOL_LIMIT. `kept` are the tools the Agent
// found or called, oldest first; the latest stay listed.
export function planTools(tools, servers, kept = []) {
  const sizes = new Map()
  for (const tool of tools) {
    const server = serverOf(tool.name, servers)
    if (server !== undefined) sizes.set(server, (sizes.get(server) ?? 0) + 1)
  }
  const lookedUp = new Map([...sizes].filter(([, size]) => size > APP_TOOL_LIMIT))
  let listed = tools.length
  for (const size of lookedUp.values()) listed -= size
  const rest = [...sizes].filter(([server]) => !lookedUp.has(server)).sort(([a, x], [b, y]) => y - x || (a < b ? -1 : 1))
  for (const [server, size] of rest) {
    if (listed <= REQUEST_TOOL_LIMIT) break
    lookedUp.set(server, size)
    listed -= size
  }
  if (lookedUp.size === 0) return { lookedUp, tools: tools.filter(tool => tool.name !== FINDER) }
  const room = Math.max(FOUND_MAX, REQUEST_TOOL_LIMIT - listed)
  const keep = new Set(kept.filter(name => lookedUp.has(serverOf(name, servers))).slice(-room))
  return {
    lookedUp,
    tools: tools.filter((tool) => {
      const server = serverOf(tool.name, servers)
      return server === undefined || !lookedUp.has(server) || keep.has(tool.name)
    }),
  }
}

const stem = word => (word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word)
const wordsOf = text => (String(text ?? '').toLowerCase().match(/[a-z0-9]+/g) ?? []).map(stem)

// The tools that fit a request best: `candidates` are `{ name, tool, description }`, where
// `tool` is the name without its server. A word of the tool's name counts more than one
// of its description, and a tool asked for by its name comes first.
export function findTools(candidates, query, max = FOUND_MAX) {
  const exact = String(query ?? '').trim().toLowerCase()
  const asked = [...new Set(wordsOf(query).filter(word => !SKIP.has(word)))]
  return candidates
    .map((candidate) => {
      const own = wordsOf(candidate.tool)
      const about = new Set(wordsOf(candidate.description))
      let score = candidate.tool.toLowerCase() === exact || candidate.name.toLowerCase() === exact ? 100 : 0
      for (const word of asked) score += own.includes(word) ? 4 : own.some(part => part.includes(word)) ? 2 : about.has(word) ? 1 : 0
      return { candidate, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.tool.length - b.candidate.tool.length || (a.candidate.tool < b.candidate.tool ? -1 : 1))
    .slice(0, max)
    .map(({ candidate }) => candidate)
}

// The tools of `candidates` that `text` names, as a failed call's answer does when another
// tool puts it right. A short name could be an ordinary word.
export function toolsNamedIn(text, candidates, max = NAMED_MAX) {
  const words = new Set(String(text ?? '').match(/[A-Za-z0-9_-]+/g) ?? [])
  return candidates.filter(candidate => candidate.tool.length >= 8 && words.has(candidate.tool)).slice(0, max)
}

const plain = text => String(text ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '')
const aboutOf = (description) => {
  const line = String(description ?? '').trim().split('\n')[0].trim()
  return line.length > ABOUT_MAX ? `${line.slice(0, ABOUT_MAX)}…` : line
}
const textOf = content => (Array.isArray(content) ? content : []).map(block => (block?.type === 'text' ? block.text : '')).join('\n')

export function install(rt) {
  const { ctx, state } = rt
  // By Session id: the app tools its Agent found or called (oldest first), and the
  // servers its last request looked up.
  const kept = new Map()
  const looked = new Map()

  // Each connected app and MCP capability by its server name, with the name the user gave it.
  const servers = () => {
    const names = new Map()
    for (const app of Object.values(state.apps ?? {})) names.set(serverNameOf(app.id), app.name)
    for (const item of Object.values(state.capabilities?.items ?? {})) {
      if (item.kind === 'mcp') names.set(item.name, item.name)
    }
    return names
  }
  const candidatesOf = (tools, server, names) => {
    const prefix = `mcp__${server}__`
    return tools.filter(tool => serverOf(tool.name, names) === server)
      .map(tool => ({ name: tool.name, tool: tool.name.slice(prefix.length), description: tool.description ?? '' }))
  }
  const keep = (id, names) => {
    if (id === undefined || names.length === 0) return
    const earlier = (kept.get(id) ?? []).filter(name => !names.includes(name))
    kept.set(id, [...earlier, ...names].slice(-KEPT_MAX))
  }

  ctx.tools.register(defineTool({
    name: FINDER,
    description: 'Find the tools of a connected app that has too many tools to list in every request. Say what you want to do; the tools found are in your tool list from your next step, under the names this returns.',
    parameters: {
      app: { type: 'string', required: true, description: 'The app, by its name' },
      query: { type: 'string', description: 'What you want to do, in a few words, or the name of a tool. Leave it out for the names of all the app\'s tools' },
    },
    output,
    async execute(args, exec) {
      await rt.load()
      const names = servers()
      const serverSet = new Set(names.keys())
      const tools = ctx.tools.schemas(exec.agent)
      const { lookedUp } = planTools(tools, serverSet)
      if (lookedUp.size === 0) return 'The tools of every connected app are in your tool list. Call them directly.'
      const wanted = plain(args.app)
      const server = [...lookedUp.keys()].find(name => plain(name) === wanted || plain(names.get(name)) === wanted)
        ?? (lookedUp.size === 1 ? [...lookedUp.keys()][0] : undefined)
      if (server === undefined) {
        return `No app named "${args.app}" is looked up here. Apps: ${[...lookedUp].map(([name, size]) => `${names.get(name)} (${size} tools)`).join(', ')}.`
      }
      const label = names.get(server)
      const candidates = candidatesOf(tools, server, serverSet)
      const every = candidates.map(candidate => candidate.tool).join(', ')
      const query = String(args.query ?? '').trim()
      if (query === '') return `${label} has ${candidates.length} tools: ${every}\nCall ${FINDER} again with what you want to do, or with one of these names, to get the tools you need.`
      const found = findTools(candidates, query)
      if (found.length === 0) return `No tool of ${label} fits "${query}". Its tools: ${every}\nCall ${FINDER} again with one of these names.`
      keep(exec.agent?.id, found.map(candidate => candidate.name))
      return [
        `${found.length} of ${label}'s ${candidates.length} tools fit. They are in your tool list from your next step; call them by these names:`,
        ...found.map(candidate => `- ${candidate.name}: ${aboutOf(candidate.description)}`),
      ].join('\n')
    },
  }))

  // After every other listener, so that the list is the one the request would carry.
  ctx.on('system-prompt/assemble', async (assembly, context, next) => {
    const result = await next()
    if (!Array.isArray(result?.tools)) return result
    try {
      await rt.load()
      const names = servers()
      const id = context?.agent?.id
      const plan = planTools(result.tools, new Set(names.keys()), kept.get(id) ?? [])
      if (id !== undefined) looked.set(id, new Set(plan.lookedUp.keys()))
      const apps = [...plan.lookedUp].map(([server, size]) => `${names.get(server)} (${size} tools)`).join(', ')
      result.tools = plan.tools.map(tool => (tool.name === FINDER ? { ...tool, description: `${tool.description} Apps to look up: ${apps}.` } : tool))
    } catch (error) {
      rt.warn('apmixbot: the tools of the connected apps were not sorted for this request: %s', error)
    }
    return result
  })

  // A looked-up tool called by its name stays listed, as one that was found does. When
  // its call fails and the answer names another tool of the app (Vercel: "Call
  // authorize_team_access …"), that tool is listed too.
  ctx.on('tools/result', (exec, result) => {
    try {
      const id = exec?.agent?.id
      const name = exec?.name
      if (id === undefined || typeof name !== 'string' || !name.startsWith('mcp__')) return
      const serverSet = new Set(servers().keys())
      const server = serverOf(name, serverSet)
      if (server === undefined || !looked.get(id)?.has(server)) return
      const named = result?.isError === true
        ? toolsNamedIn(textOf(result.content), candidatesOf(ctx.tools.schemas(exec.agent), server, serverSet)).map(candidate => candidate.name)
        : []
      keep(id, [...named.filter(other => other !== name), name])
    } catch (error) {
      rt.warn('apmixbot: a called app tool was not kept in the tool list: %s', error)
    }
  })

  // For Settings → Apps: how many tools each app's server lists, and whether they are looked up.
  let counts
  ctx.on('tools/change', () => { counts = undefined })
  const appToolCounts = () => {
    if (counts === undefined) {
      const serverSet = new Set(servers().keys())
      const tools = ctx.tools.schemas()
      const { lookedUp } = planTools(tools, serverSet)
      counts = new Map()
      for (const tool of tools) {
        const server = serverOf(tool.name, serverSet)
        if (server !== undefined) counts.set(server, { count: (counts.get(server)?.count ?? 0) + 1, lookedUp: lookedUp.has(server) })
      }
    }
    return counts
  }

  Object.assign(rt, { appToolCounts, appServers: servers })
}
