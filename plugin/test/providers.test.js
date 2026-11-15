import assert from 'node:assert/strict'
import { test } from 'node:test'
import { install as installModels } from '../src/host/models.js'
import { checkKey, install, keyRefFor, routeIdFor } from '../src/host/providers.js'

// A the engine with the official Acme route, an account route, and the pi-ai adapter: its
// directory offers catalog providers, and its settings take path writes the way the engine's
// do, under a revision. Routes come and go with the pi-ai section. `defaultModel` is
// the profile default the engine would start a new Session on.
function dsh({ keys = {}, readOnly = [], user = {}, base = {}, catalog = { anthropic: ['claude-a', 'claude-b'], groq: ['llama-k3'] }, defaultModel } = {}) {
  const store = { ...keys }
  const writes = []
  const listeners = new Map()
  let revision = 0
  let pi = { user: structuredClone(user), base: structuredClone(base) }
  const piValue = () => ({ providers: { ...pi.base.providers, ...pi.user.providers } })
  const routes = () => Object.keys(piValue().providers)
  const services = {
    settings: {
      describe: () => [
        { ns: 'llm-acme', revision: 0, value: { apiKeyEnv: 'ACME_API_KEY' }, user: {}, base: { apiKeyEnv: 'ACME_API_KEY' } },
        { ns: 'llm-acme-account', revision: 0, value: {}, user: {}, base: {} },
        { ns: 'llm-pi-ai', revision, value: piValue(), user: structuredClone(pi.user), base: structuredClone(pi.base) },
      ],
      mutate: async (ns, ops, expected) => {
        if (expected !== revision) throw new Error(`settings namespace "${ns}" changed since it was read`)
        const next = structuredClone(pi.user)
        for (const op of ops) {
          const parent = op.path.slice(0, -1).reduce((value, key) => (value[key] ??= {}), next)
          if (op.op === 'set') parent[op.path.at(-1)] = op.value
          else delete parent[op.path.at(-1)]
        }
        for (const [id, profile] of Object.entries(next.providers ?? {})) {
          if (!(id in catalog) && !(profile.models?.length > 0)) throw new Error(`llm-pi-ai: provider "${id}" resolves no models`)
        }
        writes.push([ns, ops])
        pi = { ...pi, user: next }
        revision += 1
      },
    },
    credentials: {
      describe: async ref => ({ configured: ref in store, writable: !readOnly.includes(ref) }),
      set: async (ref, value) => { writes.push(['set', ref]); store[ref] = value },
      unset: async (ref) => { writes.push(['unset', ref]); delete store[ref] },
    },
    ...(defaultModel ? { agentDefaultModel: { currentSelection: () => defaultModel } } : {}),
  }
  const discovered = []
  const ctx = {
    on(name, listener) { listeners.set(name, listener); return () => listeners.delete(name) },
    get: name => services[name],
    llm: {
      listProviders: () => [{ id: 'acme-official', name: 'Acme' }, { id: 'acme-account', name: 'Acme Account' }, ...routes().map(id => ({ id, name: piValue().providers[id].displayName ?? id }))],
      listModels: async (id) => {
        if (id === 'acme-official') return [{ id: 'acme-flash', name: 'Acme Flash' }]
        if (id === 'acme-account') return []
        const profile = piValue().providers[id]
        return profile.models ?? (catalog[id] ?? []).map(model => ({ id: model }))
      },
      listConfigurableProviders: () => [
        { provider: 'acme-official', displayName: 'Acme', settingsNs: 'llm-acme', settingsPath: [] },
        { provider: 'acme-account', displayName: 'Acme Account', settingsNs: 'llm-acme-account', settingsPath: [] },
        ...Object.keys(catalog).map(id => ({ provider: id, displayName: id, settingsNs: 'llm-pi-ai', settingsPath: ['providers', id], declared: false })),
        ...routes().filter(id => !(id in catalog)).map(id => ({ provider: id, displayName: piValue().providers[id].displayName ?? id, settingsNs: 'llm-pi-ai', settingsPath: ['providers', id], declared: true })),
      ],
      discoverModels: async (ns, request) => { discovered.push([ns, request]); return [{ id: 'relay-1', name: 'Relay One', contextWindow: 128000, inputModalities: ['text'] }, { id: 'relay-2' }] },
    },
  }
  const rt = { ctx, state: { bots: {} } }
  installModels(rt)
  install(rt)
  return { rt, store, writes, listeners, discovered }
}

const needing = async rt => (await rt.catalog({ fresh: true })).filter(entry => entry.needsKey).map(entry => entry.provider)
const row = (view, id) => view.providers.find(provider => provider.id === id)

test('models of a provider whose API key is set nowhere need the key', async () => {
  const user = { providers: { groq: { apiKeyEnv: 'GROQ_API_KEY' }, bedrock: {} } }
  const catalog = { groq: ['llama-k3'], bedrock: ['nova'] }
  assert.deepEqual(await needing(dsh({ user, catalog }).rt), ['acme-official', 'groq'])
  assert.deepEqual(await needing(dsh({ user, catalog, keys: { ACME_API_KEY: 'k' } }).rt), ['groq'])
  // A route without a key reference authenticates some other way.
  assert.ok((await dsh({ user, catalog }).rt.catalog()).some(entry => entry.provider === 'bedrock' && !entry.needsKey))
})

test('without DSH settings or credentials no model needs a key, and there is no Models page', async () => {
  const { rt } = dsh()
  assert.equal(rt.canSetUpProviders(), true)
  rt.ctx.get = () => undefined
  assert.deepEqual(await needing(rt), [])
  assert.deepEqual(await rt.providersView(), { available: false })
  assert.equal(rt.canSetUpProviders(), false)
})

test('the page lists the providers the user added first, then the ones set up, and the ones DSH can add', async () => {
  const { rt } = dsh({ keys: { ACME_API_KEY: 'k' }, user: { providers: { groq: { apiKeyEnv: 'GROQ_API_KEY' } } } })
  const view = await rt.providersView()
  assert.deepEqual(view.providers.map(provider => [provider.id, provider.key, provider.removable, provider.models.length]), [
    ['groq', { configured: false, writable: true }, true, 1],
    ['acme-official', { configured: true, writable: true }, false, 1],
  ])
  // The account route has no key and no models before a sign-in.
  assert.equal(row(view, 'acme-account'), undefined)
  assert.deepEqual(view.addable, [{ id: 'anthropic', name: 'anthropic' }])
  assert.deepEqual(view.protocols, ['openai-completions', 'openai-responses', 'anthropic-messages'])
})

test('a catalog route outside the offered list is not offered by name; its API still connects by endpoint', async () => {
  const { rt } = dsh({ catalog: { anthropic: ['claude-a'], 'other-cloud': ['other-chat'] } })
  assert.deepEqual((await rt.providersView()).addable.map(entry => entry.id), ['anthropic'])
})

test('a saved API key goes to the provider\'s reference and frees its models', async () => {
  const { rt, store, writes } = dsh()
  await rt.setProviderKey('acme-official', '  sk-test  ')
  assert.deepEqual(writes, [['set', 'ACME_API_KEY']])
  assert.equal(store.ACME_API_KEY, 'sk-test')
  assert.deepEqual(await needing(rt), [])
  await rt.clearProviderKey('acme-official')
  assert.equal('ACME_API_KEY' in store, false)
  await assert.rejects(rt.setProviderKey('acme-account', 'sk-test'), /acme-account takes no API key here/)
})

test('a key set outside ApmixBot is not overwritten or removed', async () => {
  const { rt, writes } = dsh({ keys: { ACME_API_KEY: 'k' }, readOnly: ['ACME_API_KEY'] })
  await assert.rejects(rt.setProviderKey('acme-official', 'sk-test'), /set outside ApmixBot/)
  await assert.rejects(rt.clearProviderKey('acme-official'), /set outside ApmixBot/)
  assert.deepEqual(writes, [])
  assert.deepEqual(row(await rt.providersView(), 'acme-official').key, { configured: true, writable: false })
})

test('a provider from DSH\'s list goes in with the key DSH\'s own page would name', async () => {
  const { rt, store, writes } = dsh()
  const view = await rt.addProvider({ provider: 'groq', key: 'sk-llama' })
  assert.deepEqual(writes, [['llm-pi-ai', [{ op: 'set', path: ['providers', 'groq'], value: { apiKeyEnv: 'GROQ_API_KEY' } }]], ['set', 'GROQ_API_KEY']])
  assert.equal(store.GROQ_API_KEY, 'sk-llama')
  assert.deepEqual(row(view, 'groq').models.map(model => model.ref), ['groq/llama-k3'])
  assert.equal(view.addable.some(entry => entry.id === 'groq'), false)
  await assert.rejects(rt.addProvider({ provider: 'groq', key: 'sk-llama' }), /groq is already set up/)
  await assert.rejects(rt.addProvider({ provider: 'acme-official' }), /already set up/)
  await assert.rejects(rt.addProvider({ provider: 'nowhere' }), /The engine offers no provider nowhere/)
})

test('a blank key keeps a key that is already there, else leaves the route without one', async () => {
  const { rt, writes } = dsh({ keys: { ANTHROPIC_API_KEY: 'k' } })
  await rt.addProvider({ provider: 'anthropic', key: '' })
  await rt.addProvider({ provider: 'groq' })
  assert.deepEqual(writes.map(([, ops]) => ops[0].value), [{ apiKeyEnv: 'ANTHROPIC_API_KEY' }, {}])
})

test('a custom API goes in with its endpoint, protocol and the models picked', async () => {
  const { rt, store, writes } = dsh()
  await rt.addProvider({
    custom: true, provider: 'relay', name: ' My relay ', api: 'openai-completions', baseURL: ' https://relay.example/v1 ', key: 'sk-relay',
    models: [{ id: 'relay-1', name: 'Relay One', contextWindow: 128000, inputModalities: ['text'] }, 'relay-2'],
  })
  assert.deepEqual(writes[0], ['llm-pi-ai', [{ op: 'set', path: ['providers', 'relay'], value: {
    displayName: 'My relay', api: 'openai-completions', baseURL: 'https://relay.example/v1', apiKeyEnv: 'RELAY_API_KEY',
    models: [{ id: 'relay-1', name: 'Relay One', contextWindow: 128000, input: ['text'] }, { id: 'relay-2' }],
  } }]])
  assert.equal(store.RELAY_API_KEY, 'sk-relay')
  const view = await rt.providersView()
  assert.deepEqual([row(view, 'relay').name, row(view, 'relay').custom, row(view, 'relay').removable], ['My relay', true, true])
})

test('a custom API is refused before anything is written when it cannot serve', async () => {
  const { rt, writes } = dsh()
  const custom = { custom: true, provider: 'relay', api: 'openai-completions', baseURL: 'https://relay.example/v1', models: ['m'] }
  await assert.rejects(rt.addProvider({ ...custom, provider: 'My Relay' }), /lowercase letters, digits and dashes/)
  await assert.rejects(rt.addProvider({ ...custom, provider: 'anthropic' }), /The engine already offers anthropic/)
  await assert.rejects(rt.addProvider({ ...custom, api: 'grpc' }), /protocol must be one of/)
  await assert.rejects(rt.addProvider({ ...custom, baseURL: 'relay.example' }), /http or https/)
  await assert.rejects(rt.addProvider({ ...custom, baseURL: 'ftp://relay.example' }), /http or https/)
  await assert.rejects(rt.addProvider({ ...custom, models: [] }), /at least one model/)
  await assert.rejects(rt.addProvider({ ...custom, models: ['m', ' m '] }), /same id/)
  await assert.rejects(rt.addProvider({ ...custom, key: 'KEY=sk' }), /NAME=value/)
  assert.deepEqual(writes, [])
})

test('a custom API named only by its endpoint takes its id and name from the address', async () => {
  const taken = { providers: { other: { apiKeyEnv: 'RELAY_EXAMPLE_API_KEY', api: 'openai-completions', baseURL: 'https://other.example/v1', models: [{ id: 'o' }] } } }
  const { rt, store, writes } = dsh({ user: taken })
  await rt.addProvider({ custom: true, api: 'openai-completions', baseURL: ' https://api.example.com/v1 ', key: 'sk-one', models: ['m1'] })
  assert.deepEqual(writes.slice(0, 2), [['llm-pi-ai', [{ op: 'set', path: ['providers', 'example-com'], value: {
    displayName: 'api.example.com', api: 'openai-completions', baseURL: 'https://api.example.com/v1', apiKeyEnv: 'EXAMPLE_COM_API_KEY', models: [{ id: 'm1' }],
  } }]], ['set', 'EXAMPLE_COM_API_KEY']])
  assert.equal(store.EXAMPLE_COM_API_KEY, 'sk-one')
  // The same endpoint again is a route of its own, under the next free id.
  await rt.addProvider({ custom: true, api: 'openai-completions', baseURL: 'https://api.example.com/v1', models: ['m2'] })
  assert.deepEqual(writes.at(-1)[1][0].path, ['providers', 'example-com-2'])
  // An id the engine ships a route for, or whose key reference another route names, is skipped.
  await rt.addProvider({ custom: true, api: 'openai-completions', baseURL: 'http://groq/v1', models: ['m3'] })
  assert.deepEqual(writes.at(-1)[1][0].path, ['providers', 'groq-2'])
  await rt.addProvider({ custom: true, api: 'openai-completions', baseURL: 'https://relay.example/v1', models: ['m4'] })
  assert.deepEqual(writes.at(-1)[1][0].path, ['providers', 'relay-example-2'])
  // A typed name wins over the address; a bad address is refused before anything is written.
  await rt.addProvider({ custom: true, name: 'Local', api: 'openai-completions', baseURL: 'http://localhost:11434/v1', models: ['m5'] })
  assert.equal(writes.at(-1)[1][0].value.displayName, 'Local')
  const count = writes.length
  await assert.rejects(rt.addProvider({ custom: true, api: 'openai-completions', baseURL: 'relay', models: ['m'] }), /http or https/)
  assert.equal(writes.length, count)
})

test('a route id comes from the endpoint host and port, numbered on past the ids in use', () => {
  assert.equal(routeIdFor('https://api.openai.com/v1'), 'openai-com')
  assert.equal(routeIdFor('https://www.Example.com'), 'example-com')
  assert.equal(routeIdFor('http://localhost:11434/v1'), 'localhost-11434')
  assert.equal(routeIdFor('http://192.168.1.10:8000/v1'), 'api-192-168-1-10-8000')
  assert.equal(routeIdFor('http://[::1]:8080/v1'), 'api-1-8080')
  assert.equal(routeIdFor('https://api.openai.com/v1', id => id === 'openai-com' || id === 'openai-com-2'), 'openai-com-3')
  assert.match(routeIdFor(`https://${'a'.repeat(60)}.example/v1`), /^a{40}$/)
})

test('the page shows where a custom API answers, without what can carry a credential', async () => {
  const user = { providers: { relay: { apiKeyEnv: 'RELAY_API_KEY', api: 'anthropic-messages', baseURL: 'https://user:pass@relay.example/v1?token=abc#part', models: [{ id: 'r' }] } } }
  const view = await dsh({ user, keys: { RELAY_API_KEY: 'k' } }).rt.providersView()
  assert.deepEqual([row(view, 'relay').endpoint, row(view, 'relay').api], ['https://relay.example/v1', 'anthropic-messages'])
  assert.deepEqual([row(view, 'acme-official').endpoint, row(view, 'acme-official').api], [undefined, undefined])
})

test('a custom API added here gets new models, and a model it keeps keeps its stored entry', async () => {
  const user = { providers: { relay: { apiKeyEnv: 'RELAY_API_KEY', api: 'openai-completions', baseURL: 'https://relay.example/v1', models: [{ id: 'old', contextWindow: 64000, maxTokens: 4000 }, { id: 'gone' }] } } }
  const { rt, writes } = dsh({ user, keys: { RELAY_API_KEY: 'k' }, base: { providers: { fixed: { api: 'openai-completions', baseURL: 'https://fixed.example/v1', models: [{ id: 'f' }] } } } })
  // Like the engine, the effective value shows the adapter's defaults; they must not be written.
  const settings = rt.ctx.get('settings')
  const describe = settings.describe
  const withDefaults = providers => Object.fromEntries(Object.entries(providers).map(([id, profile]) => [id, { ...profile, models: profile.models?.map(model => ({ input: [], ...model })) }]))
  settings.describe = options => describe(options).map(section => (section.ns === 'llm-pi-ai' ? { ...section, value: { providers: withDefaults(section.value.providers) } } : section))
  const view = await rt.setProviderModels({ provider: 'relay', models: [{ id: 'old', contextWindow: 1 }, { id: 'new', name: 'New', contextWindow: 128000 }] })
  assert.deepEqual(writes, [['llm-pi-ai', [{ op: 'set', path: ['providers', 'relay', 'models'], value: [
    { id: 'old', contextWindow: 64000, maxTokens: 4000 }, { id: 'new', name: 'New', contextWindow: 128000 },
  ] }]]])
  assert.deepEqual(row(view, 'relay').models.map(model => model.ref), ['relay/old', 'relay/new'])
  await assert.rejects(rt.setProviderModels({ provider: 'relay', models: [] }), /at least one model/)
  await assert.rejects(rt.setProviderModels({ provider: 'relay', models: ['a', 'a'] }), /same id/)
  // Only a custom API the user added: not a catalog route, nor one the setup brings.
  await assert.rejects(rt.setProviderModels({ provider: 'groq', models: ['m'] }), /groq is not a custom API added here/)
  await assert.rejects(rt.setProviderModels({ provider: 'fixed', models: ['m'] }), /fixed is not a custom API added here/)
  assert.equal(writes.length, 1)
})

test('asking a custom API set up already for its models goes to its stored endpoint, with the key DSH keeps', async () => {
  const user = { providers: { relay: { apiKeyEnv: 'RELAY_API_KEY', api: 'anthropic-messages', baseURL: 'https://relay.example', models: [{ id: 'r' }] } } }
  const { rt, discovered } = dsh({ user, keys: { RELAY_API_KEY: 'k' } })
  await rt.discoverModels({ provider: 'relay' })
  assert.deepEqual(discovered, [['llm-pi-ai', { provider: 'relay', baseURL: 'https://relay.example', api: 'anthropic-messages' }]])
})

test('the default model is never one whose provider has no key', async () => {
  const relay = { relay: { apiKeyEnv: 'RELAY_API_KEY', api: 'openai-completions', baseURL: 'https://relay.example/v1', models: [{ id: 'r' }] } }
  const defaultModel = { provider: 'acme-official', model: 'acme-flash' }
  const { rt, store } = dsh({ user: { providers: relay }, keys: { RELAY_API_KEY: 'k' }, defaultModel })
  assert.equal(await rt.defaultModel(), 'relay/r')
  store.ACME_API_KEY = 'k'
  rt.dropCatalog()
  assert.equal(await rt.defaultModel(), 'acme-official/acme-flash')
  // With no provider ready there is no default to start a Bot on.
  assert.equal(await dsh({ defaultModel }).rt.defaultModel(), undefined)
})

test('fetching models asks DSH about the endpoint, with the typed key for that question only', async () => {
  const { rt, discovered, store } = dsh()
  const models = await rt.discoverModels({ baseURL: 'https://relay.example/v1', api: 'openai-completions', key: 'sk-relay' })
  assert.deepEqual(discovered, [['llm-pi-ai', { baseURL: 'https://relay.example/v1', api: 'openai-completions', apiKey: 'sk-relay' }]])
  assert.deepEqual(models, [{ id: 'relay-1', name: 'Relay One', contextWindow: 128000, inputModalities: ['text'] }, { id: 'relay-2' }])
  assert.deepEqual(store, {})
  // A provider the engine ships is answered from its own catalog.
  await rt.discoverModels({ provider: 'anthropic' })
  assert.deepEqual(discovered.at(-1), ['llm-pi-ai', { provider: 'anthropic' }])
})

test('removing a provider takes its key along unless another provider names it', async () => {
  const user = { providers: { groq: { apiKeyEnv: 'GROQ_API_KEY' }, llama: { apiKeyEnv: 'GROQ_API_KEY', api: 'openai-completions', baseURL: 'https://k.example/v1', models: [{ id: 'k' }] }, relay: { apiKeyEnv: 'RELAY_API_KEY', api: 'openai-completions', baseURL: 'https://r.example/v1', models: [{ id: 'r' }] } } }
  const { rt, store } = dsh({ user, keys: { GROQ_API_KEY: 'a', RELAY_API_KEY: 'b' } })
  await rt.removeProvider('groq')
  assert.equal(store.GROQ_API_KEY, 'a')
  const view = await rt.removeProvider('relay')
  assert.equal('RELAY_API_KEY' in store, false)
  assert.deepEqual(view.providers.map(provider => provider.id), ['llama', 'acme-official'])
  await assert.rejects(rt.removeProvider('relay'), /relay is not set up/)
  await assert.rejects(rt.removeProvider('acme-official'), /not set up/)
})

test('a route that comes with the setup stays', async () => {
  const { rt } = dsh({ base: { providers: { groq: { apiKeyEnv: 'GROQ_API_KEY' } } } })
  assert.equal(row(await rt.providersView(), 'groq').removable, false)
  await assert.rejects(rt.removeProvider('groq'), /comes with this setup/)
})

test('a changed credential drops the cached catalog', async () => {
  const { rt, store, listeners } = dsh()
  assert.deepEqual(await needing(rt), ['acme-official'])
  store.ACME_API_KEY = 'k'
  assert.deepEqual((await rt.catalog()).filter(entry => entry.needsKey).map(entry => entry.provider), ['acme-official'])
  listeners.get('credentials/reference-updated')()
  assert.deepEqual((await rt.catalog()).filter(entry => entry.needsKey).map(entry => entry.provider), [])
})

test('an API key is what an HTTP header carries, without a NAME= or quotes', () => {
  assert.equal(checkKey(' sk-abc '), 'sk-abc')
  assert.equal(checkKey('YWJj=='), 'YWJj==')
  assert.throws(() => checkKey('   '), /Enter the API key/)
  assert.throws(() => checkKey(undefined), /Enter the API key/)
  assert.throws(() => checkKey('ACME_API_KEY=sk-abc'), /not a NAME=value line/)
  assert.throws(() => checkKey('"sk-abc"'), /without quotes/)
  assert.throws(() => checkKey('sk abc'), /no spaces/)
  assert.throws(() => checkKey('sk-clé'), /no spaces/)
})

test('a route\'s key reference follows DSH\'s own Models page', () => {
  assert.equal(keyRefFor('groq'), 'GROQ_API_KEY')
  assert.equal(keyRefFor('my-gateway2'), 'MY_GATEWAY2_API_KEY')
})
