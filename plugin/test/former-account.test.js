import assert from 'node:assert/strict'
import { test } from 'node:test'
import { install } from '../src/host/former-account.js'

// The parts of the runtime former-account.js uses: the credential store, the provider setup and the team.
function fakeRuntime({ state, providers = [], store = {}, available = true, readOnly } = {}) {
  const steps = []
  const rt = {
    ctx: {
      get: name => (name === 'credentials' ? {
        describe: async ref => ({ configured: ref in store, writable: true }),
        unset: async (ref) => { steps.push(['unset', ref]); delete store[ref] },
      } : undefined),
    },
    state,
    load: async () => {},
    save: async () => { steps.push(['save']) },
    readOnly: () => readOnly,
    warn: (...args) => steps.push(['warn', ...args]),
    providersView: async () => (available ? { available: true, providers } : { available: false }),
    removeProvider: async (id) => { steps.push(['remove', id]); providers.splice(providers.findIndex(provider => provider.id === id), 1) },
    catalog: async () => providers.flatMap(provider => provider.models.map(ref => ({ ref, provider: provider.id }))),
    updateBot: async (id, patch) => {
      steps.push(['bot', id, patch])
      if (patch.model === null) delete state.bots[id].model
      else state.bots[id].model = patch.model
    },
  }
  install(rt)
  return { rt, steps, store, providers }
}

const signedIn = () => ({
  account: { id: 'u1', email: 'ada@example.com' },
  accountModels: [{ id: 'fast', name: 'Fast' }],
  bots: { m1: { id: 'm1', name: 'Chief', model: 'apmixbot/fast' }, b2: { id: 'b2', name: 'Writer', model: 'groq/llama' } },
})
const siteRoute = () => ({ id: 'apmixbot', models: ['apmixbot/fast'] })

test('a team that was signed in loses the token, the site\'s models and the account', async () => {
  const state = signedIn()
  const { rt, steps, store, providers } = fakeRuntime({ state, providers: [siteRoute(), { id: 'groq', models: ['groq/llama'] }], store: { APMIXBOT_ACCOUNT_TOKEN: 'tok-1' } })
  await rt.dropFormerAccount()
  assert.deepEqual(providers.map(provider => provider.id), ['groq'])
  assert.deepEqual(store, {})
  // Chief moves to the first model of the user's own providers; Writer keeps its own.
  assert.deepEqual([state.bots.m1.model, state.bots.b2.model], ['groq/llama', 'groq/llama'])
  assert.deepEqual(Object.keys(state), ['bots'])
  assert.deepEqual(steps.at(-1), ['save'])

  // It runs once: a second team read does nothing more.
  const before = steps.length
  await rt.dropFormerAccount()
  assert.equal(steps.length, before)
})

test('with no provider of the user\'s own, a Bot on a model of the site is left without one', async () => {
  const state = signedIn()
  const { rt } = fakeRuntime({ state, providers: [siteRoute()] })
  await rt.dropFormerAccount()
  assert.equal('model' in state.bots.m1, false)
})

test('a team that never signed in is left as it is', async () => {
  const state = { bots: { m1: { id: 'm1', name: 'Chief', model: 'apmixbot/fast' } } }
  // A custom API the user named `apmixbot` is theirs.
  const { rt, steps, providers } = fakeRuntime({ state, providers: [siteRoute()] })
  await rt.dropFormerAccount()
  assert.deepEqual([steps, providers.length, state.bots.m1.model], [[], 1, 'apmixbot/fast'])
})

test('a reading host, or an engine without its provider setup, keeps the account for a later start', async () => {
  for (const options of [{ readOnly: 'Another ApmixBot holds the team' }, { available: false }]) {
    const state = signedIn()
    const { rt, steps } = fakeRuntime({ state, providers: [siteRoute()], ...options })
    await rt.dropFormerAccount()
    assert.deepEqual([steps, state.account.email], [[], 'ada@example.com'])
  }
})

test('a step that fails is noted and keeps the account, so the next start tries again', async () => {
  const state = signedIn()
  const { rt, steps } = fakeRuntime({ state, providers: [siteRoute()] })
  rt.removeProvider = async () => { throw new Error('settings changed since they were read') }
  await rt.dropFormerAccount()
  assert.match(String(steps.at(-1)[2]), /settings changed/)
  assert.equal(state.account.email, 'ada@example.com')
})
