import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { apply } from '../index.js'
import { APP_TOOL_LIMIT, FINDER, REQUEST_TOOL_LIMIT, findTools, planTools, serverOf, toolsNamedIn } from '../src/host/app-tools.js'
import { fakeContext } from './fake-ctx.js'

const tool = (name, description = '') => ({ name, description, parameters: { type: 'object', properties: {} } })
const many = (server, count) => Array.from({ length: count }, (_, index) => tool(`mcp__${server}__tool_${index}`))
const builtIn = count => Array.from({ length: count }, (_, index) => tool(`built_in_${index}`))
const namesOf = tools => tools.map(entry => entry.name)

test('serverOf names the server of an app tool, and the longest of two that fit', () => {
  assert.equal(serverOf('mcp__vercel__list_deployments', new Set(['vercel'])), 'vercel')
  assert.equal(serverOf('mcp__github__get_me', new Set(['vercel'])), undefined)
  assert.equal(serverOf('list_bots', new Set(['vercel'])), undefined)
  assert.equal(serverOf('mcp__a__b__c', new Set(['a', 'a__b'])), 'a__b')
})

test('an app with a few tools is listed whole, and the finder is left out', () => {
  const tools = [...builtIn(10), tool(FINDER), ...many('notion', APP_TOOL_LIMIT)]
  const plan = planTools(tools, new Set(['notion']))
  assert.equal(plan.lookedUp.size, 0)
  assert.equal(plan.tools.length, 10 + APP_TOOL_LIMIT)
  assert.equal(namesOf(plan.tools).includes(FINDER), false)
})

test('an app with many tools is looked up: the request keeps the finder and what the Agent found', () => {
  const tools = [...builtIn(55), tool(FINDER), ...many('vercel', 250), ...many('notion', 12), ...many('github', 60)]
  const servers = new Set(['vercel', 'notion'])
  const plan = planTools(tools, servers)
  assert.deepEqual([...plan.lookedUp], [['vercel', 250]])
  // GitHub is the connector's, not an app: its tools are never taken out.
  assert.equal(plan.tools.length, 55 + 1 + 12 + 60)
  const found = planTools(tools, servers, ['mcp__vercel__tool_7', 'mcp__notion__tool_1', 'mcp__vercel__gone'])
  assert.deepEqual(namesOf(found.tools).filter(name => name.startsWith('mcp__vercel__')), ['mcp__vercel__tool_7'])
})

test('small apps are looked up, largest first, while the request holds more tools than a model API takes', () => {
  const tools = [...builtIn(100), tool(FINDER), ...many('a', 20), ...many('b', 30), ...many('c', 5)]
  const plan = planTools(tools, new Set(['a', 'b', 'c']))
  assert.deepEqual([...plan.lookedUp.keys()], ['b'])
  assert.ok(plan.tools.length <= REQUEST_TOOL_LIMIT)
  // What was found last stays, as far as the request has room: 128 - (100 + 1 + 20 + 5) = 2, but never fewer than 8.
  const kept = Array.from({ length: 12 }, (_, index) => `mcp__b__tool_${index}`)
  const listed = namesOf(planTools(tools, new Set(['a', 'b', 'c']), kept).tools).filter(name => name.startsWith('mcp__b__'))
  assert.deepEqual(listed, kept.slice(-8))
})

const VERCEL = [
  ['list_deployments', 'List the deployments of a project or team'],
  ['get_deployment', 'Get one deployment by its id or URL'],
  ['get_deployment_build_logs', 'Read the build logs of a deployment'],
  ['list_projects', 'List the projects of a team'],
  ['update_project', 'Change the settings of a project'],
  ['authorize_team_access', 'Create a link the user opens to give this connection access to a team'],
  ['list_domains', 'List the domains of a team'],
].map(([name, description]) => ({ name: `mcp__vercel__${name}`, tool: name, description }))

test('findTools ranks a word of the name above one of the description, and a name asked for first', () => {
  const deployments = findTools(VERCEL, 'list my deployments').map(found => found.tool)
  assert.equal(deployments[0], 'list_deployments')
  assert.ok(deployments.includes('get_deployment'))
  assert.equal(deployments.includes('update_project'), false)
  assert.equal(findTools(VERCEL, 'authorize_team_access')[0].tool, 'authorize_team_access')
  assert.equal(findTools(VERCEL, 'mcp__vercel__update_project')[0].tool, 'update_project')
  assert.equal(findTools(VERCEL, 'build logs')[0].tool, 'get_deployment_build_logs')
  assert.deepEqual(findTools(VERCEL, 'the of for'), [])
  assert.deepEqual(findTools(VERCEL, 'weather'), [])
  assert.equal(findTools(VERCEL, 'list', 2).length, 2)
})

test('toolsNamedIn finds the tools an answer names, and takes no short name for one', () => {
  const answer = 'Error: 403 forbidden. Call authorize_team_access (or authorize_team_sso) with this teamId, then retry list_deployments.'
  assert.deepEqual(toolsNamedIn(answer, VERCEL).map(found => found.tool), ['list_deployments', 'authorize_team_access'])
  assert.deepEqual(toolsNamedIn('list the domains', [{ name: 'mcp__x__list', tool: 'list', description: '' }]), [])
})

const TEAM = {
  version: 1,
  mainBotIds: ['m1'],
  revision: 1,
  bots: { m1: { id: 'm1', sessionId: 'm1', name: 'Chief', role: 'Chief of Staff', instructions: '', createdAt: 1 } },
  rooms: {},
  exchanges: [],
  exchangeTurns: {},
  questions: {},
  apps: { vercel: { id: 'vercel', name: 'Vercel', url: 'https://mcp.vercel.com', catalog: 'vercel', auth: 'oauth', enabled: true, addedAt: 1 } },
}

// The plugin over a tool registry that already holds the tools of the Vercel app's server.
function start(t, registry) {
  const home = mkdtempSync(join(tmpdir(), 'apmixbot-app-tools-'))
  writeFileSync(join(home, 'state.json'), JSON.stringify(TEAM))
  const ctx = fakeContext()
  ctx.tools.schemas = () => [...registry, { name: FINDER, description: ctx.registeredTools.get(FINDER).description, parameters: {} }]
  apply(ctx, { home, github: false, apps: false })
  t.after(async () => { await ctx.dispose(); rmSync(home, { recursive: true, force: true, maxRetries: 5 }) })
  const agent = { id: 'm1' }
  const [assembleListener] = ctx.listeners.get('system-prompt/assemble').slice(-1)
  const assemble = async () => (await assembleListener({}, { agent }, async () => ({ sections: [], contexts: [], variables: {}, tools: ctx.tools.schemas() }))).tools
  const find = args => ctx.registeredTools.get(FINDER).execute(args, { agent })
  const result = (name, outcome) => { for (const listener of ctx.listeners.get('tools/result')) listener({ agent, name }, outcome) }
  return { ctx, assemble, find, result }
}

const VERCEL_TOOLS = [
  ...VERCEL.map(entry => tool(entry.name, entry.description)),
  ...many('vercel', 243),
]

test('a request leaves out a large app\'s tools, and lists the ones the Bot finds from its next step', async (t) => {
  const { assemble, find } = start(t, [tool('list_bots'), ...VERCEL_TOOLS])
  const first = await assemble()
  assert.deepEqual(namesOf(first), ['list_bots', FINDER])
  assert.match(first[1].description, /Apps to look up: Vercel \(250 tools\)\.$/)

  const answer = await find({ app: 'Vercel', query: 'list deployments' })
  assert.match(answer, /of Vercel's 250 tools fit\. They are in your tool list from your next step/)
  assert.match(answer, /- mcp__vercel__list_deployments: List the deployments of a project or team/)
  const next = namesOf(await assemble())
  assert.ok(next.includes('mcp__vercel__list_deployments'))
  assert.ok(next.includes('mcp__vercel__get_deployment'))
  assert.equal(next.includes('mcp__vercel__update_project'), false)
  assert.ok(next.length <= 2 + 8)
})

test('app_tools names the apps for an unknown one, every tool without a request, and takes the only app without its name', async (t) => {
  const { find } = start(t, [tool('list_bots'), ...VERCEL_TOOLS, ...many('notion', 3)])
  assert.match(await find({ app: 'vercel' }), /^Vercel has 250 tools: list_deployments, get_deployment, /)
  assert.match(await find({ app: 'whatever', query: 'domains' }), /mcp__vercel__list_domains/)
  assert.match(await find({ app: 'Vercel', query: 'weather' }), /^No tool of Vercel fits "weather"\. Its tools: list_deployments, /)
})

test('app_tools says so when no app is looked up', async (t) => {
  const { assemble, find } = start(t, [tool('list_bots'), ...many('vercel', 5)])
  assert.deepEqual(namesOf(await assemble()), ['list_bots', ...namesOf(many('vercel', 5))])
  assert.equal(await find({ app: 'Vercel', query: 'x' }), 'The tools of every connected app are in your tool list. Call them directly.')
})

test('a looked-up tool called by its name stays listed, with the tool its failed answer names', async (t) => {
  const { assemble, result } = start(t, [tool('list_bots'), ...VERCEL_TOOLS])
  await assemble()
  result('mcp__vercel__list_deployments', {
    isError: true,
    content: [{ type: 'text', text: 'Error: 403 forbidden. Call authorize_team_access with this teamId and show the user the returned link.' }],
  })
  assert.deepEqual(namesOf(await assemble()), ['list_bots', 'mcp__vercel__list_deployments', 'mcp__vercel__authorize_team_access', FINDER])
  // A tool of the plugin, or of a server that is listed whole, changes nothing.
  result('list_bots', { isError: false, content: [] })
  assert.equal((await assemble()).length, 4)
})
