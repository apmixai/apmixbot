import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { apply } from '../index.js'
import { linkIn, toolParts } from '../src/host/app-approvals.js'
import { fakeContext } from './fake-ctx.js'

test('toolParts splits an MCP tool into its server and its own name', () => {
  assert.deepEqual(toolParts('mcp__vercel__list_deployments', ['vercel']), { server: 'vercel', tool: 'list_deployments' })
  assert.deepEqual(toolParts('mcp__github__get_me'), { server: 'github', tool: 'get_me' })
  // A mounted server's name may hold "__" itself.
  assert.deepEqual(toolParts('mcp__my__server__run', ['my__server']), { server: 'my__server', tool: 'run' })
  assert.equal(toolParts('list_bots'), undefined)
})

test('linkIn takes the link of a tool that gives one, and no link of any other tool', () => {
  const answer = 'Open this link to approve access: https://vercel.com/sso/session-requests/abc123. It expires in 10 minutes.'
  assert.equal(linkIn('authorize_team_access', answer), 'https://vercel.com/sso/session-requests/abc123')
  assert.equal(linkIn('start_login', 'Go to (https://example.com/login?x=1) now'), 'https://example.com/login?x=1')
  // A deployment's address in an ordinary answer is not something to open.
  assert.equal(linkIn('list_deployments', 'https://my-app.vercel.app is ready'), undefined)
  assert.equal(linkIn('authorize_team_access', 'No link here, and http://plain.example is not https'), undefined)
})

// Chief in its own chat 'a'; Writer speaks in the group 'r1' from 'gb'.
const TEAM = {
  version: 1,
  mainBotIds: ['a'],
  revision: 1,
  bots: {
    a: { id: 'a', name: 'Chief', role: 'Boss', sessionId: 'a', createdAt: 1 },
    b: { id: 'b', name: 'Writer', role: 'Write', sessionId: 'b', createdAt: 2 },
  },
  rooms: { r1: { id: 'r1', name: 'Ops', members: ['a', 'b'], mode: 'admin', admin: 'b', named: true, sessions: { b: 'gb' }, log: [], seq: 0, seen: {} } },
  agents: {},
  exchanges: [],
  exchangeTurns: {},
  questions: {},
  apps: { vercel: { id: 'vercel', name: 'Vercel', url: 'https://mcp.vercel.com', catalog: 'vercel', auth: 'oauth', enabled: true, addedAt: 1 } },
}

function start(t, team = TEAM) {
  const home = mkdtempSync(join(tmpdir(), 'apmixbot-approve-'))
  writeFileSync(join(home, 'state.json'), JSON.stringify(team))
  const ctx = fakeContext()
  let route
  const register = ctx.connection.fetch.register
  ctx.connection.fetch.register = (options) => { route = options; return register(options) }
  apply(ctx, { home, github: false, apps: false })
  t.after(async () => { await ctx.dispose(); rmSync(home, { recursive: true, force: true, maxRetries: 5 }) })
  const call = async (endpoint, payload) => (await route.fetch(new Request('http://localhost/api/bot', { method: 'POST', body: JSON.stringify({ endpoint, payload }) }))).json()
  const work = async () => (await call('state', {})).value.work
  const gate = ctx.listeners.get('tools/pre-execute').at(-1)
  // One tool call at the gate: resolves to 'ran' when it was let through, else to the decision.
  const use = (name, sessionId = 'a', more = {}) => gate({ name, agent: { id: sessionId }, callId: 'c1', arguments: { limit: 10 }, ...more }, async () => 'ran')
  const result = (name, outcome, sessionId = 'a') => { for (const listener of ctx.listeners.get('tools/result')) listener({ agent: { id: sessionId }, name }, outcome) }
  const until = async (check) => {
    for (let tries = 0; tries < 500; tries += 1) {
      if (await check()) return
      await new Promise(resolve => setImmediate(resolve))
    }
    assert.fail('the wait did not end')
  }
  const waiting = async () => { let found; await until(async () => (found = (await work()).approvals).length > 0); return found }
  return { call, work, use, result, waiting, home }
}

test('a Bot\'s call of an app tool waits for the user: allow once runs it, decline refuses it', async (t) => {
  const { call, work, use, waiting } = start(t)
  const first = use('mcp__vercel__list_deployments')
  const [card] = await waiting()
  assert.deepEqual(
    [card.kind, card.app, card.tool, card.botId, card.sessionId, card.answerable, card.always, card.detail.code],
    ['app', 'Vercel', 'list_deployments', 'a', 'a', true, true, '{"limit":10}'],
  )
  assert.equal((await call('approval-answer', { id: card.id, choice: 'allow' })).ok, true)
  assert.equal(await first, 'ran')
  assert.deepEqual((await work()).approvals, [])

  // Allowed once is not allowed again.
  const second = use('mcp__vercel__list_deployments')
  const [again] = await waiting()
  await call('approval-answer', { id: again.id, choice: 'reject' })
  assert.deepEqual(await second, { kind: 'deny', reason: 'The user declined list_deployments of Vercel. Do not call it again unless the user asks for it.' })
})

test('always allow is kept for the tool, lets every waiting call of it run, and can be taken back', async (t) => {
  const { call, use, waiting, home } = start(t)
  const first = use('mcp__vercel__list_deployments')
  // Writer asks for the same tool from the group, on a card of the group.
  const second = use('mcp__vercel__list_deployments', 'gb')
  let cards
  for (cards = await waiting(); cards.length < 2; cards = await waiting()) await new Promise(resolve => setImmediate(resolve))
  assert.deepEqual(cards.map(card => [card.botId, card.roomId ?? null]), [['a', null], ['b', 'r1']])
  await call('approval-answer', { id: cards[0].id, choice: 'always' })
  assert.deepEqual([await first, await second], ['ran', 'ran'])
  assert.deepEqual(JSON.parse(readFileSync(join(home, 'state.json'), 'utf8')).allowedTools, ['mcp__vercel__list_deployments'])
  assert.deepEqual((await call('state', {})).value.allowedTools, [{ name: 'mcp__vercel__list_deployments', app: 'Vercel', tool: 'list_deployments' }])
  // No card from now on; another tool of the app still asks.
  assert.equal(await use('mcp__vercel__list_deployments', 'gb'), 'ran')
  const other = use('mcp__vercel__update_project')
  const [card] = await waiting()
  assert.equal(card.tool, 'update_project')
  await call('approval-answer', { id: card.id, choice: 'allow' })
  await other

  assert.equal((await call('allowed-tools-reset', {})).ok, true)
  assert.deepEqual(JSON.parse(readFileSync(join(home, 'state.json'), 'utf8')).allowedTools, [])
  const asked = use('mcp__vercel__list_deployments')
  const [back] = await waiting()
  await call('approval-answer', { id: back.id, choice: 'allow' })
  assert.equal(await asked, 'ran')
})

test('a stopped turn withdraws its card; tools that are no app\'s, and Sessions that are no Bot\'s, are not asked about', async (t) => {
  const { work, use, waiting } = start(t)
  const stop = new AbortController()
  const stopped = use('mcp__vercel__list_deployments', 'a', { signal: stop.signal })
  await waiting()
  stop.abort()
  assert.deepEqual(await stopped, { kind: 'cancel' })
  assert.deepEqual((await work()).approvals, [])
  assert.equal(await use('list_bots'), 'ran')
  assert.equal(await use('mcp__vercel__list_deployments', 'someone-else'), 'ran')
  // "Always allow" is only for a card that offers it.
  assert.deepEqual((await work()).approvals, [])
})

test('a link an app gives for the user to open waits on a card until it is done with, or the app works again', async (t) => {
  const { call, work, result } = start(t)
  assert.deepEqual((await work()).links, [])
  const answer = text => ({ isError: false, content: [{ type: 'text', text }] })
  result('mcp__vercel__authorize_team_access', answer('Approve here: https://vercel.com/sso/session-requests/abc123 (single use).'))
  const [link] = (await work()).links
  assert.deepEqual([link.app, link.tool, link.url, link.botId, link.sessionId], ['Vercel', 'authorize_team_access', 'https://vercel.com/sso/session-requests/abc123', 'a', 'a'])
  // A newer link of the same app takes its place.
  result('mcp__vercel__authorize_team_access', answer('New one: https://vercel.com/sso/session-requests/def456'))
  assert.deepEqual((await work()).links.map(entry => entry.url), ['https://vercel.com/sso/session-requests/def456'])
  // The app answers an ordinary call: the approval went through.
  result('mcp__vercel__list_deployments', answer('3 deployments, https://my-app.vercel.app is the latest'))
  assert.deepEqual((await work()).links, [])

  result('mcp__vercel__authorize_team_access', answer('https://vercel.com/sso/session-requests/ghi789'), 'gb')
  const [inGroup] = (await work()).links
  assert.deepEqual([inGroup.botId, inGroup.roomId], ['b', 'r1'])
  assert.equal((await call('app-link-done', { id: inGroup.id })).ok, true)
  assert.deepEqual((await work()).links, [])
})
