import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { HarnessError } from '@apmixbot/dsh-llm'
import {
  createAutoSearchProvider, decodeBingUrl, findSources, parseBing, parseDuckDuckGo, planNative,
  readDeclared, readGemini, readMessages, readResponses, resolveConfig, routeOf, SEARCH_APIS,
} from '../web-search.js'

const fixture = name => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
const page = (content, statusCode = 200, url = 'https://www.bing.com/search') => ({ url, statusCode, body: { kind: 'html', content }, truncated: false })
const MINUTE = 60_000
const HOUR = 60 * MINUTE

/** A provider over recorded fakes; `keys` is the whole credential store, `fetch` answers by URL. */
function harness({ route, keys = {}, fetch, webFetch, now, config } = {}) {
  const calls = { fetch: [], webFetch: [], keys: [] }
  const provider = createAutoSearchProvider({
    route: () => route,
    resolveKey: async (ref) => { calls.keys.push(ref); return keys[ref] },
    fetch: async (url, init) => { calls.fetch.push({ url, init }); return fetch ? fetch(url, init) : json({}, 500) },
    webFetch: async (request, signal) => { calls.webFetch.push(request.url); return webFetch ? webFetch(request, signal) : page(fixture('bing.html')) },
    ...now ? { now } : {},
  }, config)
  return { provider, calls }
}
const urls = calls => calls.fetch.map(call => call.url)

const OLLAMA = { provider: 'ollama-cloud', model: 'gpt-oss', api: 'openai-completions', baseURL: 'https://ollama.com/v1', apiKeyEnv: 'OLLAMA_API_KEY' }
// A host this plugin has never heard of, whose protocol the route does not say.
const ACME = { provider: 'acme', model: 'acme-1', baseURL: 'https://llm.acme.example/v1', apiKeyEnv: 'ACME_KEY' }
const MESSAGES_HIT = { content: [
  { type: 'server_tool_use', name: 'web_search' },
  { type: 'web_search_tool_result', content: [{ type: 'web_search_result', url: 'https://m.example/', title: 'M' }] },
] }
const OLLAMA_HIT = { search_results: [{ title: 'A', url: 'https://a.example/', snippet: 'alpha', date: '2026-10-01' }] }

// ---------------------------------------------------------------------------
// Route → what to try

test('planNative tries the standard search tool of the route protocol, on the route base', () => {
  const plan = route => { const p = planNative({ provider: 'r', model: 'm', ...route }); return p.reason ?? p.candidates.map(c => `${c.id} ${c.url}`) }
  assert.deepEqual(plan({ api: 'anthropic-messages', baseURL: 'https://api.example.com/anthropic' }), ['messages https://api.example.com/anthropic/v1/messages'])
  assert.deepEqual(plan({ api: 'anthropic-messages', baseURL: 'https://api.example.org/coding' }), ['messages https://api.example.org/coding/v1/messages'])
  assert.deepEqual(plan({ api: 'anthropic-messages', baseURL: 'https://gateway.example/v1/' }), ['messages https://gateway.example/v1/messages'])
  assert.deepEqual(plan({ api: 'openai-responses', baseURL: 'https://api.openai.com/v1' }), ['responses https://api.openai.com/v1/responses'])
  assert.deepEqual(plan({ api: 'google-generative-ai', baseURL: 'https://generativelanguage.googleapis.com/v1beta', model: 'gemini-2.5-flash' }),
    ['gemini https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'])
  assert.deepEqual(plan({ api: 'openai-completions', baseURL: 'https://api.together.ai/v1' }),
    ['responses https://api.together.ai/v1/responses', 'messages https://api.together.ai/v1/messages'])
  assert.deepEqual(plan({ baseURL: 'http://127.0.0.1:8795' }), ['responses http://127.0.0.1:8795/responses', 'messages http://127.0.0.1:8795/v1/messages'])
})

test('planNative puts search APIs declared for the route host first, on the route origin', () => {
  const plan = route => planNative({ provider: 'r', model: 'm', api: 'openai-completions', ...route }).candidates.map(c => `${c.id} ${c.url}`)
  assert.deepEqual(plan({ baseURL: 'https://ollama.com/v1' }).slice(0, 1), ['ollama https://ollama.com/api/web_search'])
  // A local Ollama is not ollama.com: no declared API, only the protocol.
  assert.deepEqual(plan({ baseURL: 'http://localhost:11434/v1' }), ['responses http://localhost:11434/v1/responses', 'messages http://localhost:11434/v1/messages'])
  // A path that would move the key to another origin is never planned.
  const hostile = ['@evil.example/steal', '.evil.example/steal', ':8443/steal'].map(path => ({ id: 'evil', hosts: ['api.acme.example'], path, body: { q: '$query' } }))
  assert.deepEqual(planNative({ provider: 'r', model: 'm', api: 'openai-responses', baseURL: 'https://api.acme.example/v1' }, hostile).candidates.map(c => c.url), ['https://api.acme.example/v1/responses'])
})

test('planNative explains when there is nothing to try', () => {
  assert.match(planNative({ provider: 'r', model: 'm' }).reason, /no known endpoint/)
  assert.match(planNative({ provider: 'r', api: 'anthropic-messages', baseURL: 'https://api.anthropic.com' }).reason, /no current model/)
  assert.match(planNative({ provider: 'r', model: 'm', api: 'bedrock-converse-stream', baseURL: 'https://bedrock.example' }).reason,
    /speaks bedrock-converse-stream, which has no standard search tool, and bedrock\.example declares no search API/)
  // Search APIs that need no model still run without one.
  assert.deepEqual(planNative({ provider: 'r', baseURL: 'https://ollama.com/v1', api: 'openai-completions' }).candidates.map(c => c.id), ['ollama'])
})

test('routeOf reads the asking Session route: protocol, endpoint, key name, and headers', () => {
  const settings = [
    { ns: 'llm-pi-ai', value: { providers: { 'acme-gw': { api: 'openai-completions', apiKeyEnv: 'ACME_GW_KEY', baseURL: 'https://gw.acme.example/v1', headers: { 'x-team': 'bots', bad: 1 } } } } },
  ]
  const directory = [
    { provider: 'acme-gw', settingsNs: 'llm-pi-ai', settingsPath: ['providers', 'acme-gw'] },
    { provider: 'groq', settingsNs: 'llm-pi-ai', settingsPath: ['providers', 'groq'] },
  ]
  const ctxFor = (provider, env = {}, id) => ({
    get: name => ({
      agents: { currentInitiator: () => ({ session: { id, requestContext: () => ({ provider, model: 'x' }) } }) },
      llm: { listConfigurableProviders: () => directory },
      settings: { describe: () => settings },
      launchEnvironment: { get: key => (env[key] === undefined ? undefined : { value: env[key] }) },
    })[name],
  })
  assert.deepEqual(routeOf(ctxFor('acme-gw')), {
    provider: 'acme-gw', model: 'x', api: 'openai-completions', baseURL: 'https://gw.acme.example/v1', apiKeyEnv: 'ACME_GW_KEY', headers: { 'x-team': 'bots' },
  })
  assert.deepEqual(routeOf(ctxFor('groq')), {
    provider: 'groq', model: 'x', api: 'openai-completions', baseURL: 'https://api.groq.com/openai/v1', apiKeyEnv: 'GROQ_API_KEY', headers: {},
  })
  assert.equal(routeOf(ctxFor('openrouter')).api, undefined)
  assert.equal(routeOf({ get: () => undefined }), undefined)
  // OpenCode's gateways answered HTTP 400 "missing x-opencode-session" to every
  // native search, so web_search always fell back to the keyless results page.
  assert.deepEqual(routeOf(ctxFor('opencode-go', {}, 'sess-184')).headers, { 'x-opencode-session': 'sess-184' })
  assert.deepEqual(routeOf(ctxFor('opencode', {}, 'sess-184')).headers, { 'x-opencode-session': 'sess-184' })
  assert.deepEqual(routeOf(ctxFor('acme-gw', {}, 'sess-184')).headers, { 'x-team': 'bots' })
  settings.push({ ns: 'llm-pi-ai-oc', value: { headers: { 'X-OpenCode-Session': 'mine' } } })
  directory.push({ provider: 'opencode', settingsNs: 'llm-pi-ai-oc', settingsPath: [] })
  assert.deepEqual(routeOf(ctxFor('opencode', {}, 'sess-184')).headers, { 'X-OpenCode-Session': 'mine' })
})

// ---------------------------------------------------------------------------
// Native search: own key, own origin, found by trying

test('a native search on an OpenCode route names the asking Session, as the gateway requires', async () => {
  const ctx = {
    get: name => ({
      agents: { currentInitiator: () => ({ session: { id: 'sess-184', requestContext: () => ({ provider: 'opencode-go', model: 'nova-5' }) } }) },
      llm: { listConfigurableProviders: () => [] },
      settings: { describe: () => [] },
    })[name],
  }
  const route = { ...routeOf(ctx), api: 'openai-responses' }
  const { provider, calls } = harness({
    route,
    keys: { OPENCODE_API_KEY: 'sk-oc' },
    fetch: (_url, init) => (init.headers['x-opencode-session'] === undefined
      ? json({ error: { message: 'Request is missing x-opencode-session' } }, 400)
      : json({ output: [{ type: 'web_search_call' }, { type: 'message', content: [{ type: 'output_text', text: 'ok', annotations: [{ type: 'url_citation', url: 'https://o.example/', title: 'O' }] }] }] })),
  })
  const result = await provider.search({ query: 'opencode news' })
  assert.deepEqual(result.sources, [{ url: 'https://o.example/', title: 'O' }])
  assert.equal(calls.fetch[0].init.headers['x-opencode-session'], 'sess-184')
  assert.equal(calls.webFetch.length, 0)
})

test('a host this plugin has never heard of gets native search through its protocol', async () => {
  const { provider, calls } = harness({
    route: ACME,
    keys: { ACME_KEY: 'sk-acme', OTHER_API_KEY: 'sk-other' },
    fetch: url => (url.endsWith('/v1/messages') ? json(MESSAGES_HIT) : json({ error: { message: 'Not Found' } }, 404)),
  })
  const first = await provider.search({ query: 'acme news' })
  assert.deepEqual(first.sources, [{ url: 'https://m.example/', title: 'M' }])
  assert.match(first.content, /native search of this conversation's model route "acme": Anthropic Messages web_search tool \(llm\.acme\.example\/v1\/messages\), billed to the API key ACME_KEY/)
  assert.deepEqual(urls(calls), ['https://llm.acme.example/v1/responses', 'https://llm.acme.example/v1/messages'])
  const { init } = calls.fetch[1]
  assert.equal(init.redirect, 'error')
  assert.equal(init.headers['x-api-key'], 'sk-acme')
  assert.equal(init.headers.authorization, 'Bearer sk-acme')
  assert.equal(init.headers['anthropic-version'], '2023-06-01')
  const body = JSON.parse(init.body)
  assert.equal(body.model, 'acme-1')
  assert.deepEqual(body.tools, [{ type: 'web_search_20250305', name: 'web_search', max_uses: 1 }])
  assert.deepEqual(calls.keys, ['ACME_KEY'])
  assert.deepEqual(calls.webFetch, [])
  // What worked is tried first; what was absent is not asked again.
  await provider.search({ query: 'acme again' })
  assert.deepEqual(urls(calls).slice(2), ['https://llm.acme.example/v1/messages'])
})

test('a declared search API answers without a model call and is labeled with the route key', async () => {
  const { provider, calls } = harness({ route: OLLAMA, keys: { OLLAMA_API_KEY: 'sk-ollama' }, fetch: () => json(OLLAMA_HIT) })
  const result = await provider.search({ query: 'ollama news', maxResults: 8 })
  assert.deepEqual(result.sources, [{ url: 'https://a.example/', title: 'A', snippet: 'alpha', publishedAt: '2026-10-01' }])
  assert.match(result.content, /route "ollama-cloud": Ollama web search API \(ollama\.com\/api\/web_search\), billed to the API key OLLAMA_API_KEY/)
  assert.deepEqual(urls(calls), ['https://ollama.com/api/web_search'])
  assert.equal(calls.fetch[0].init.headers.authorization, 'Bearer sk-ollama')
  assert.deepEqual(JSON.parse(calls.fetch[0].init.body), { query: 'ollama news', max_results: 8 })
})

test('a search API declared in config works for a new host, before the built-in ones', async () => {
  const config = { searchApis: [{ id: 'acme', name: 'Acme search', hosts: ['*.acme.example'], path: '/search/v2', auth: ['x-api-key'], maxResults: 3, body: { q: '$query', n: '$maxResults', opts: ['$model'] } }] }
  const { provider, calls } = harness({
    route: ACME, keys: { ACME_KEY: 'sk-acme' }, config,
    fetch: () => json({ data: { hits: [{ link: 'https://h.example/', name: 'H', description: 'hit', icon: { url: 'https://h.example/icon.png' } }] } }),
  })
  const result = await provider.search({ query: 'q', maxResults: 9 })
  assert.deepEqual(result.sources, [{ url: 'https://h.example/', title: 'H', snippet: 'hit' }])
  assert.deepEqual(urls(calls), ['https://llm.acme.example/search/v2'])
  assert.equal(calls.fetch[0].init.headers['x-api-key'], 'sk-acme')
  assert.equal(calls.fetch[0].init.headers.authorization, undefined)
  assert.deepEqual(JSON.parse(calls.fetch[0].init.body), { q: 'q', n: 3, opts: ['acme-1'] })
  assert.equal(resolveConfig(config).searchApis.length, SEARCH_APIS.length + 1)
})

test('a route without its own key never borrows another one and falls back', async () => {
  const { provider, calls } = harness({ route: OLLAMA, keys: { OTHER_API_KEY: 'sk-other', OPENAI_API_KEY: 'sk-openai' } })
  const result = await provider.search({ query: 'agent harness', maxResults: 8 })
  assert.deepEqual(calls.keys, ['OLLAMA_API_KEY'])
  assert.equal(calls.fetch.length, 0)
  assert.equal(result.sources[0].url, 'https://github.com/example-org/agent-toolkit/tree/master')
  assert.match(result.content, /keyless fallback, parsed from the public Bing results page at www\.bing\.com/)
  assert.match(result.content, /route "ollama-cloud" could not search natively: no API key is stored for OLLAMA_API_KEY/)
})

test('profile headers go with the request, but cannot replace the credential', async () => {
  const { calls, provider } = harness({
    route: { ...ACME, api: 'anthropic-messages', headers: { 'x-team': 'bots', 'x-api-key': 'spoofed' } },
    keys: { ACME_KEY: 'sk-acme' },
    fetch: () => json(MESSAGES_HIT),
  })
  await provider.search({ query: 'q' })
  assert.equal(calls.fetch[0].init.headers['x-team'], 'bots')
  assert.equal(calls.fetch[0].init.headers['x-api-key'], 'sk-acme')
})

test('credential-bearing native requests do not follow redirects', async (t) => {
  let targetHits = 0
  const target = createServer((_req, res) => { targetHits += 1; res.end('{}') })
  const origin = createServer((_req, res) => { res.writeHead(302, { location: `http://127.0.0.1:${target.address().port}/steal` }); res.end() })
  await new Promise(done => target.listen(0, '127.0.0.1', done))
  await new Promise(done => origin.listen(0, '127.0.0.1', done))
  t.after(() => { target.close(); origin.close() })
  const { provider } = harness({
    route: OLLAMA,
    keys: { OLLAMA_API_KEY: 'sk-secret' },
    // The endpoint URLs are real; only the socket is pointed at the local redirecting server.
    fetch: (url, init) => fetch(url.replace('https://ollama.com', `http://127.0.0.1:${origin.address().port}`), init),
  })
  const result = await provider.search({ query: 'q' })
  assert.equal(targetHits, 0)
  assert.match(result.content, /Ollama web search API \(ollama\.com\/api\/web_search\): request failed: .*redirect/i)
})

// ---------------------------------------------------------------------------
// Outcome memory

test('each outcome keeps its endpoint from being retried for its own time', async () => {
  const cases = [
    ['HTTP 404', () => json({ error: { message: 'Not Found' } }, 404), 24 * HOUR],
    ['HTTP 405', () => json({}, 405), 24 * HOUR],
    ['HTTP 400', () => json({ error: { message: 'web search tool found in the request body, but webSearchEnabled is false' } }, 400), 30 * MINUTE],
    ['HTTP 422', () => json({}, 422), 30 * MINUTE],
    ['HTTP 401', () => json({ error: { message: 'Invalid Authentication' } }, 401), 30 * MINUTE],
    ['HTTP 402', () => json({}, 402), 30 * MINUTE],
    ['answered without running a search', () => json({ content: [{ type: 'text', text: 'From memory, the answer is…' }], stop_reason: 'end_turn' }), 6 * HOUR],
  ]
  for (const [label, answer, ttl] of cases) {
    let clock = 0
    const { provider, calls } = harness({ route: { ...ACME, api: 'anthropic-messages' }, keys: { ACME_KEY: 'k' }, fetch: answer, now: () => clock })
    const first = await provider.search({ query: 'q' })
    assert.ok(first.content.includes(label), `${label}: ${first.content}`)
    clock += ttl - MINUTE
    const second = await provider.search({ query: 'q' })
    assert.match(second.content, /not retried for 1 min/, label)
    assert.equal(calls.fetch.length, 1, label)
    clock += 2 * MINUTE
    await provider.search({ query: 'q' })
    assert.equal(calls.fetch.length, 2, label)
  }
})

test('server errors, rate limits, timeouts, and cut-off answers are not remembered', async () => {
  for (const answer of [() => json({}, 503), () => json({}, 429), () => json({ content: [{ type: 'thinking', thinking: '…' }], stop_reason: 'max_tokens' })]) {
    const { provider, calls } = harness({ route: { ...ACME, api: 'anthropic-messages' }, keys: { ACME_KEY: 'k' }, fetch: answer })
    await provider.search({ query: 'q' })
    await provider.search({ query: 'q' })
    assert.equal(calls.fetch.length, 2)
  }
  const cut = harness({ route: { ...ACME, api: 'anthropic-messages' }, keys: { ACME_KEY: 'k' }, fetch: () => json({ content: [], stop_reason: 'max_tokens' }) })
  assert.match((await cut.provider.search({ query: 'q' })).content, /stopped at the output cap before searching/)

  const slow = harness({
    route: OLLAMA, keys: { OLLAMA_API_KEY: 'k' }, config: { nativeTimeoutMs: 1000 },
    fetch: (_url, init) => new Promise((_resolve, reject) => init.signal.addEventListener('abort', () => reject(init.signal.reason))),
  })
  const result = await slow.provider.search({ query: 'q' })
  assert.match(result.content, /Ollama web search API \(ollama\.com\/api\/web_search\): timed out after 1s; .*skipped, out of time/)
  assert.equal(slow.calls.fetch.length, 1)
})

test('a search that ran but found nothing stops there instead of paying for the next endpoint', async () => {
  const { provider, calls } = harness({ route: OLLAMA, keys: { OLLAMA_API_KEY: 'k' }, fetch: () => json({ search_results: [] }) })
  const result = await provider.search({ query: 'q' })
  assert.equal(calls.fetch.length, 1)
  assert.match(result.content, /Ollama web search API .*: returned no results/)
})

test('remembered endpoints are skipped without reading the key', async () => {
  let clock = 0
  const { provider, calls } = harness({ route: { ...ACME, api: 'anthropic-messages' }, keys: { ACME_KEY: 'k' }, fetch: () => json({}, 404), now: () => clock })
  await provider.search({ query: 'q' })
  clock += MINUTE
  await provider.search({ query: 'q' })
  assert.deepEqual(calls.keys, ['ACME_KEY'])
})

// ---------------------------------------------------------------------------
// Fallback and final failure

test('the fallback follows a Bing regional redirect once, and only to bing.com', async () => {
  const redirect = origin => Object.assign(new Error(`cross-origin redirect to ${origin} is not followed automatically; retry against that URL directly`), { code: 'WEB_REDIRECT_BLOCKED' })
  const regional = harness({
    route: undefined,
    webFetch: ({ url }) => {
      if (url.startsWith('https://www.bing.com/')) throw redirect('https://de.bing.com')
      return page(fixture('bing.html'), 200, url)
    },
  })
  const result = await regional.provider.search({ query: 'agent harness' })
  assert.deepEqual(regional.calls.webFetch, ['https://www.bing.com/search?q=agent%20harness', 'https://de.bing.com/search?q=agent%20harness'])
  assert.equal(result.sources[0].url, 'https://github.com/example-org/agent-toolkit/tree/master')
  assert.match(result.content, /public Bing results page at de\.bing\.com/)

  const elsewhere = harness({
    route: undefined,
    webFetch: ({ url }) => {
      if (url.startsWith('https://www.bing.com/')) throw redirect('https://bing.com.evil.example')
      return page(fixture('duckduckgo.html'), 200, url)
    },
  })
  const other = await elsewhere.provider.search({ query: 'agent harness' })
  assert.deepEqual(elsewhere.calls.webFetch, ['https://www.bing.com/search?q=agent%20harness', 'https://html.duckduckgo.com/html/?q=agent%20harness'])
  assert.match(other.content, /public DuckDuckGo results page at html\.duckduckgo\.com/)
  assert.match(other.content, /no conversation model route is known/)
})

test('the fallback walks engines in order and reports each failure', async () => {
  const { provider, calls } = harness({
    route: undefined,
    webFetch: ({ url }) => (url.startsWith('https://www.bing.com/') ? page('<html><body>Please solve this challenge</body></html>') : page(fixture('duckduckgo.html'), 200, url)),
  })
  const result = await provider.search({ query: 'agent harness' })
  assert.deepEqual(calls.webFetch, ['https://www.bing.com/search?q=agent%20harness', 'https://html.duckduckgo.com/html/?q=agent%20harness'])
  assert.equal(result.sources.length, 2)
})

test('when every path fails the error forbids guessing', async () => {
  const { provider } = harness({
    route: OLLAMA,
    keys: { OLLAMA_API_KEY: 'k' },
    fetch: () => json({ error: { message: 'Invalid Authentication' } }, 401),
    webFetch: ({ url }) => (url.includes('duckduckgo') ? page('<form id="challenge-form">bots use DuckDuckGo too</form>', 202) : page('', 429)),
  })
  await assert.rejects(provider.search({ query: 'q' }), (error) => {
    assert.ok(error instanceof HarnessError)
    assert.equal(error.code, 'WEB_SEARCH_UNAVAILABLE')
    assert.match(error.message, /Native search: route "ollama-cloud": Ollama web search API \(ollama\.com\/api\/web_search\): HTTP 401: Invalid Authentication; OpenAI Responses web_search tool/)
    assert.match(error.message, /Keyless fallback: www\.bing\.com: HTTP 429; html\.duckduckgo\.com: HTTP 202\./)
    assert.match(error.message, /Do not guess URLs/)
    assert.match(error.message, /browser tool/)
    return true
  })
})

test('native off means no key is read and no endpoint is called', async () => {
  const { provider, calls } = harness({ route: OLLAMA, keys: { OLLAMA_API_KEY: 'k' }, config: { native: false } })
  const result = await provider.search({ query: 'q' })
  assert.deepEqual(calls.keys, [])
  assert.equal(calls.fetch.length, 0)
  assert.match(result.content, /native search is turned off/)
})

test('cancellation surfaces as WEB_ABORTED, not as a fallback', async () => {
  const controller = new AbortController()
  const { provider, calls } = harness({
    route: OLLAMA, keys: { OLLAMA_API_KEY: 'k' },
    fetch: (_url, init) => new Promise((_resolve, reject) => {
      init.signal.addEventListener('abort', () => reject(init.signal.reason))
      controller.abort()
    }),
  })
  await assert.rejects(provider.search({ query: 'q' }, controller.signal), error => error.code === 'WEB_ABORTED')
  assert.deepEqual(calls.webFetch, [])
})

test('config rejects unknown engines, tiny timeouts, and search APIs that could leave the route', () => {
  assert.deepEqual(resolveConfig().engines, ['bing', 'duckduckgo'])
  assert.throws(() => resolveConfig({ engines: ['google'] }), /engines must be a list of bing, duckduckgo/)
  assert.throws(() => resolveConfig({ fallbackTimeoutMs: 10 }), /fallbackTimeoutMs must be at least 1000/)
  assert.deepEqual(resolveConfig({ engines: ['duckduckgo'] }).engines, ['duckduckgo'])
  const api = { id: 'x', hosts: ['api.x.example'], path: '/search', body: { q: '$query' } }
  assert.doesNotThrow(() => resolveConfig({ searchApis: [api] }))
  assert.throws(() => resolveConfig({ searchApis: [{ ...api, path: '//evil.example/x' }] }), /path must be a path on the route's host/)
  assert.throws(() => resolveConfig({ searchApis: [{ ...api, path: 'https://evil.example/x' }] }), /path must be a path/)
  assert.throws(() => resolveConfig({ searchApis: [{ ...api, hosts: ['https://api.x.example'] }] }), /hosts must be a list of host names/)
  assert.throws(() => resolveConfig({ searchApis: [{ ...api, auth: ['cookie'] }] }), /auth must be a list of bearer, x-api-key, api-key/)
  assert.throws(() => resolveConfig({ searchApis: [{ ...api, id: '' }] }), /needs an id/)
  assert.throws(() => resolveConfig({ searchApis: {} }), /searchApis must be a list/)
})

// ---------------------------------------------------------------------------
// Parsers and response readers

test('parseBing reads real result pages and decodes Bing redirect links', () => {
  const en = parseBing(fixture('bing.html'))
  assert.equal(en.sources.length, 4)
  assert.deepEqual(en.sources[1], {
    url: 'https://github.com/example-org/agent-toolkit/releases',
    title: 'Releases · example-org/agent-toolkit - GitHub',
    snippet: 'Agent Toolkit: Everything is a Plugin. Contribute to example-org/agent-toolkit development by creating an account on …',
  })
  assert.ok(en.sources.every(source => !new URL(source.url).hostname.endsWith('bing.com')))
  assert.deepEqual(parseBing('<html><body>captcha</body></html>'), { error: 'not a results page (bot check or changed layout)' })
  assert.deepEqual(parseBing('<ol id="b_results"><li class="b_no"><h1>No results</h1></li></ol>'), { sources: [] })
})

test('decodeBingUrl keeps direct links and drops undecodable Bing links', () => {
  const encoded = `a1${Buffer.from('https://example.com/a?b=c').toString('base64url')}`
  assert.equal(decodeBingUrl(`https://www.bing.com/ck/a?!&&p=x&u=${encoded}&ntb=1`), 'https://example.com/a?b=c')
  assert.equal(decodeBingUrl('https://example.org/x'), 'https://example.org/x')
  assert.equal(decodeBingUrl('https://www.bing.com/videos/search?q=x'), undefined)
  assert.equal(decodeBingUrl('/search?q=x'), undefined)
  assert.equal(decodeBingUrl(`https://www.bing.com/ck/a?u=a1${Buffer.from('javascript:alert(1)').toString('base64url')}`), undefined)
})

test('parseDuckDuckGo skips ads and recognizes the bot check', () => {
  const { sources } = parseDuckDuckGo(fixture('duckduckgo.html'))
  assert.deepEqual(sources, [
    { url: 'https://github.com/example-org/agent-toolkit', title: 'Agent Toolkit · GitHub', snippet: 'Everything is a plugin: an agent toolkit & runtime.' },
    { url: 'https://docs.example.com/en/', title: 'Example API docs', snippet: 'Example API uses formats compatible with OpenAI and Anthropic…' },
  ])
  assert.deepEqual(parseDuckDuckGo('<p>Unfortunately, bots use DuckDuckGo too.</p>'), { error: 'bot check page' })
})

test('protocol readers take only structured sources and say whether a search ran', () => {
  assert.deepEqual(readMessages({
    content: [
      { type: 'server_tool_use', name: 'web_search' },
      { type: 'web_search_tool_result', content: [
        { type: 'web_search_result', url: 'https://a.example/', title: 'A', page_age: '2 days ago' },
        { type: 'web_search_result', url: 'https://a.example/', title: 'A again' },
        { type: 'web_search_result', url: 'ftp://bad.example/' },
      ] },
      { type: 'text', text: 'The model says https://made-up.example/ is relevant.', citations: [{ url: 'https://a.example/', cited_text: 'quoted excerpt' }] },
    ],
    stop_reason: 'end_turn',
  }), { ran: true, cut: false, sources: [{ url: 'https://a.example/', title: 'A', snippet: 'quoted excerpt', publishedAt: '2 days ago' }] })
  assert.deepEqual(readMessages({ content: [{ type: 'text', text: 'I think the answer is…' }] }), { ran: false, cut: false, sources: [] })
  assert.match(readMessages({ content: [{ type: 'web_search_tool_result', content: { type: 'web_search_tool_result_error', error_code: 'max_uses_exceeded' } }] }).error, /max_uses_exceeded/)

  assert.deepEqual(readResponses({
    output: [
      { type: 'web_search_call', action: { sources: [{ type: 'url', url: 'https://o.example/' }] } },
      { type: 'message', content: [{ type: 'output_text', text: '…', annotations: [{ type: 'url_citation', url: 'https://o.example/', title: 'O' }, { type: 'url_citation', url: 'https://p.example/', title: 'P' }] }] },
    ],
  }).sources, [{ url: 'https://o.example/', title: 'O' }, { url: 'https://p.example/', title: 'P' }])
  assert.deepEqual(readResponses({ output: [{ type: 'message', content: [] }], citations: ['https://x.example/'] }).sources, [{ url: 'https://x.example/' }])
  assert.equal(readResponses({ output: [{ type: 'message', content: [{ type: 'output_text', text: 'no search' }] }] }).ran, false)
  assert.equal(readResponses({ status: 'incomplete', output: [] }).cut, true)

  assert.deepEqual(readGemini({ candidates: [{ groundingMetadata: { groundingChunks: [{ web: { uri: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/abc', title: 'g.example' } }] } }] }).sources,
    [{ url: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/abc', title: 'g.example' }])
  assert.equal(readGemini({ candidates: [{ content: {} }] }).ran, false)
  assert.equal(readGemini({ candidates: [{ finishReason: 'MAX_TOKENS' }] }).cut, true)
})

test('declared search API responses are read by shape, skipping media links and echoed tools', () => {
  assert.deepEqual(findSources({ results: [{ title: 'O', url: 'https://ollama.example/', content: 'page text' }] }), [{ url: 'https://ollama.example/', title: 'O', snippet: 'page text' }])
  assert.deepEqual(findSources({
    images: [{ url: 'https://img.example/a.png' }],
    tools: [{ type: 'web_search', url: 'https://echo.example/' }],
    items: [{ link: 'https://l.example/', site_name: 'L', thumbnail: { url: 'https://img.example/t.png' } }],
  }), [{ url: 'https://l.example/', title: 'L' }])
  assert.deepEqual(readDeclared({ search_results: [] }), { ran: true, sources: [] })
  assert.deepEqual(readDeclared({ results: [] }), { ran: true, sources: [] })
  assert.deepEqual(readDeclared({ choices: [{ message: { content: 'see https://a.example/' } }] }), { ran: false, sources: [] })
})
