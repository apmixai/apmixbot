// Model providers and their API keys, for ApmixBot's Models page and the first model card
// of a Bot with none. The engine keeps all of it: a provider route in the settings of the
// adapter that serves it, the route's key in the engine's credential store under the reference
// the route names. The providers to add are the ones the engine's directory of configurable
// providers offers, and custom APIs the user names by their endpoint.

const PI_AI = 'llm-pi-ai'
const ROUTE_ID = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/
// The wire protocols the engine's pi-ai adapter serves on a route it ships nothing about.
export const PROTOCOLS = ['openai-completions', 'openai-responses', 'anthropic-messages']
const MAX_MODELS = 500
const ROUTE_ID_MAX = 40
// The catalog routes ApmixBot offers by name; any other API connects by its endpoint.
const OFFERED = new Set(['anthropic', 'baseten', 'cerebras', 'fireworks', 'google', 'groq', 'huggingface', 'meta', 'nvidia', 'openai', 'opencode', 'opencode-go', 'openrouter', 'together', 'vercel-ai-gateway', 'xai'])

// The reference the engine's own Models page derives for a route's key, so a provider added
// here and one added there read the same key.
export const keyRefFor = provider => `${provider.toUpperCase().replace(/[^A-Z0-9]+/g, '_')}_API_KEY`

// The route id of a custom API the user names only by its endpoint: the host without a
// leading api. or www., and the port, numbered on until `taken` lets it go.
export function routeIdFor(baseURL, taken = () => false) {
  let url
  try { url = new URL(String(baseURL ?? '').trim()) } catch { url = undefined }
  const host = (url?.hostname ?? '').toLowerCase().replace(/^\[|\]$/g, '').replace(/^(?:api|www)\./, '')
  const words = `${host}${url?.port ? `-${url.port}` : ''}`.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const stem = (/^[a-z]/.test(words) ? words : `api-${words}`).slice(0, ROUTE_ID_MAX).replace(/-+$/, '')
  let id = stem
  for (let index = 2; taken(id) && index < 1000; index += 1) id = `${stem}-${index}`
  return id
}

// An endpoint as the page shows it, without the user, password, query or fragment that
// can carry a credential.
function shownEndpoint(value) {
  try {
    const url = new URL(value)
    return `${url.origin}${url.pathname === '/' ? '' : url.pathname}`
  } catch {
    return undefined
  }
}

const invalid = message => Object.assign(new Error(message), { code: 'bot/invalid' })

// What an HTTP header can carry, like the engine's own key check: a pasted `NAME=value` line
// or a quoted value would be stored as the key and refused by the provider.
export function checkKey(value) {
  const key = typeof value === 'string' ? value.trim() : ''
  if (key === '') throw invalid('Enter the API key')
  if (/^[A-Za-z_][A-Za-z0-9_]*=[^=]/.test(key)) throw invalid('Paste only the key, not a NAME=value line')
  if (/^(["']).*\1$/.test(key)) throw invalid('Paste the key without quotes')
  if (!/^[\x21-\x7E]+$/.test(key)) throw invalid('An API key has no spaces or special characters')
  return key
}

function checkEndpoint(value) {
  const text = typeof value === 'string' ? value.trim() : ''
  let url
  try { url = new URL(text) } catch { throw invalid('Enter the endpoint as an http or https address') }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw invalid('Enter the endpoint as an http or https address')
  return text
}

// A model as the route stores it: what discovery told about it, under pi-ai's names.
function modelEntry(model) {
  const id = typeof model === 'string' ? model.trim() : typeof model?.id === 'string' ? model.id.trim() : ''
  if (id === '') throw invalid('Every model needs an id')
  const whole = value => (Number.isInteger(value) && value > 0 ? value : undefined)
  return {
    id,
    ...(typeof model?.name === 'string' && model.name.trim() !== '' ? { name: model.name.trim() } : {}),
    ...(whole(model?.contextWindow) ? { contextWindow: model.contextWindow } : {}),
    ...(whole(model?.maxTokens) ? { maxTokens: model.maxTokens } : {}),
    ...(Array.isArray(model?.inputModalities) && model.inputModalities.length > 0 ? { input: model.inputModalities.filter(kind => typeof kind === 'string') } : {}),
  }
}

function checkedModels(list) {
  const models = Array.isArray(list) ? list.slice(0, MAX_MODELS).map(modelEntry) : []
  if (models.length === 0) throw invalid('Add at least one model')
  if (new Set(models.map(model => model.id)).size !== models.length) throw invalid('Two models have the same id')
  return models
}

export function install(rt) {
  const { ctx } = rt

  const seams = () => {
    const settings = ctx.get?.('settings')
    const credentials = ctx.get?.('credentials')
    return settings && credentials && ctx.llm.listConfigurableProviders ? { settings, credentials } : undefined
  }
  const usable = () => {
    const found = seams()
    if (found === undefined) throw invalid('This engine cannot set up model providers')
    return found
  }
  const sections = settings => new Map(settings.describe({ redactSecrets: true }).map(section => [section.ns, section]))
  const profileOf = (entry, map, layer = 'value') => entry.settingsPath.reduce((value, key) => value?.[key], map.get(entry.settingsNs)?.[layer])
  const refOf = profile => (typeof profile?.apiKeyEnv === 'string' && profile.apiKeyEnv !== '' ? profile.apiKeyEnv : undefined)
  const entryOf = provider => ctx.llm.listConfigurableProviders().find(entry => entry.provider === provider)
  // A route the user added, which only the user layer carries; removing it restores the setup.
  const addedHere = (entry, map) => entry.settingsNs === PI_AI && profileOf(entry, map, 'user') !== undefined && profileOf(entry, map, 'base') === undefined

  // Per provider route, the credential its engine settings name as its API key. A
  // provider with none authenticates some other way.
  function keyRefs() {
    const found = seams()
    if (found === undefined) return new Map()
    const map = sections(found.settings)
    const refs = new Map()
    for (const entry of ctx.llm.listConfigurableProviders()) {
      const ref = refOf(profileOf(entry, map))
      if (ref !== undefined) refs.set(entry.provider, ref)
    }
    return refs
  }

  async function missingKeys(providers) {
    let refs
    try { refs = keyRefs() } catch { return new Set() }
    const missing = new Set()
    await Promise.all(providers.filter(id => refs.has(id)).map(async (id) => {
      const info = await seams().credentials.describe(refs.get(id)).catch(() => undefined)
      if (info?.configured === false) missing.add(id)
    }))
    return missing
  }

  // The providers set up in the engine, with their models and key state, and the ones the engine
  // can add. A provider with no key and no models (a vendor's account route before a
  // sign-in) is left out. A custom API also shows its endpoint and protocol.
  async function providersView() {
    const found = seams()
    if (found === undefined) return { available: false }
    const map = sections(found.settings)
    const catalog = await rt.catalog({ fresh: true })
    const providers = []
    const addable = []
    for (const entry of ctx.llm.listConfigurableProviders()) {
      const profile = profileOf(entry, map)
      if (entry.settingsNs === PI_AI && profile === undefined) {
        if (entry.declared !== true && OFFERED.has(entry.provider)) addable.push({ id: entry.provider, name: entry.displayName })
        continue
      }
      const ref = refOf(profile)
      const models = catalog.filter(model => model.provider === entry.provider).map(model => ({ ref: model.ref, name: model.name }))
      if (ref === undefined && models.length === 0 && entry.error === undefined) continue
      const info = ref === undefined ? undefined : await found.credentials.describe(ref).catch(() => undefined)
      const custom = entry.declared === true
      const endpoint = custom && typeof profile?.baseURL === 'string' ? shownEndpoint(profile.baseURL) : undefined
      providers.push({
        id: entry.provider,
        name: entry.displayName,
        models,
        key: ref === undefined ? null : { configured: info?.configured === true, writable: info?.writable !== false },
        removable: addedHere(entry, map),
        custom,
        ...(endpoint ? { endpoint } : {}),
        ...(custom && PROTOCOLS.includes(profile?.api) ? { api: profile.api } : {}),
        ...(entry.error ? { error: entry.error } : {}),
      })
    }
    // The ones the user added first, as the engine lists them, then the ones that come with the setup.
    providers.sort((a, b) => Number(b.removable) - Number(a.removable))
    return { available: true, providers, addable, protocols: PROTOCOLS }
  }

  // A route id no route and no other route's key reference uses yet.
  function freeRouteId(baseURL) {
    const routes = new Set([...ctx.llm.listConfigurableProviders().map(entry => entry.provider), ...ctx.llm.listProviders().map(route => route.id)])
    const refs = new Set(keyRefs().values())
    return routeIdFor(baseURL, id => routes.has(id) || refs.has(keyRefFor(id)))
  }

  async function writableRef(provider) {
    const ref = keyRefs().get(provider)
    if (ref === undefined) throw invalid(`${provider} takes no API key here`)
    if ((await usable().credentials.describe(ref)).writable === false) throw invalid(`The API key for ${provider} is set outside ApmixBot and cannot be changed here`)
    return ref
  }

  // A key is only ever written; nothing here reads one back.
  async function setProviderKey(provider, value) {
    const key = checkKey(value)
    await usable().credentials.set(await writableRef(provider), key)
    rt.dropCatalog()
  }

  async function clearProviderKey(provider) {
    await usable().credentials.unset(await writableRef(provider))
    rt.dropCatalog()
  }

  // `provider` from the engine's directory, or a route the user declares (`custom`) for an
  // endpoint the engine ships nothing about; a custom one named only by its endpoint gets its
  // id and name from the address. The route goes in first, then its key, as the engine's
  // own Models page does it: a failed key write leaves a provider that asks for one.
  async function addProvider(body) {
    const { settings, credentials } = usable()
    const named = String(body.provider ?? '').trim()
    const derived = body.custom === true && named === ''
    const provider = derived ? freeRouteId(checkEndpoint(body.baseURL)) : named
    const map = sections(settings)
    const entry = entryOf(provider)
    if (entry !== undefined && (entry.settingsNs !== PI_AI || profileOf(entry, map) !== undefined)) throw invalid(`${provider} is already set up`)
    const custom = body.custom === true
    if (!custom && (entry === undefined || entry.declared === true)) throw invalid(`The engine offers no provider ${provider}`)
    if (custom && !ROUTE_ID.test(provider)) throw invalid('A provider id is lowercase letters, digits and dashes, starting with a letter')
    if (custom && entry !== undefined) throw invalid(`The engine already offers ${provider}; add it from its list`)
    const key = typeof body.key === 'string' && body.key.trim() !== '' ? checkKey(body.key) : undefined
    const ref = keyRefFor(provider)
    const info = await credentials.describe(ref)
    if (key !== undefined && info.writable === false) throw invalid(`The API key for ${provider} is set outside ApmixBot and cannot be changed here`)
    // A blank key keeps a key that is already there, else the provider's own sign-in.
    const keyed = key !== undefined || info.configured === true
    const profile = custom ? customProfile(body, { derived }) : {}
    if (keyed) profile.apiKeyEnv = ref
    await settings.mutate(PI_AI, [{ op: 'set', path: entry?.settingsPath ?? ['providers', provider], value: profile }], map.get(PI_AI)?.revision)
    if (key !== undefined) await credentials.set(ref, key)
    rt.dropCatalog()
    return providersView()
  }

  function customProfile(body, { derived = false } = {}) {
    if (!PROTOCOLS.includes(body.api)) throw invalid(`The protocol must be one of ${PROTOCOLS.join(', ')}`)
    const models = checkedModels(body.models)
    const baseURL = checkEndpoint(body.baseURL)
    const typed = typeof body.name === 'string' ? body.name.trim().slice(0, 80) : ''
    const name = typed || (derived ? new URL(baseURL).host : '')
    return { ...(name ? { displayName: name } : {}), api: body.api, baseURL, models }
  }

  // The models of a custom API added here. A model it keeps keeps its stored entry,
  // with any capacity tuned in cordis.patch.yml; a new one takes what discovery told.
  // The entries come from the user layer: the effective value carries the adapter's
  // defaults, which would be pinned into the profile if written back.
  async function setProviderModels(body) {
    const { settings } = usable()
    const provider = String(body.provider ?? '').trim()
    const map = sections(settings)
    const entry = entryOf(provider)
    if (entry === undefined || entry.declared !== true || !addedHere(entry, map)) throw invalid(`${provider} is not a custom API added here`)
    const stored = profileOf(entry, map, 'user')?.models
    const kept = new Map((Array.isArray(stored) ? stored : []).filter(model => typeof model?.id === 'string').map(model => [model.id, model]))
    const models = checkedModels(body.models).map(model => kept.get(model.id) ?? model)
    await settings.mutate(PI_AI, [{ op: 'set', path: [...entry.settingsPath, 'models'], value: models }], map.get(PI_AI)?.revision)
    rt.dropCatalog()
    return providersView()
  }

  // The models an endpoint (or a provider the engine ships) says it serves. The key typed for
  // the question goes with it and is not stored. A custom API set up already is asked
  // at its stored endpoint with the key the engine keeps for it, which never comes back here.
  async function discoverModels(body) {
    const { settings } = usable()
    const provider = typeof body.provider === 'string' && body.provider !== '' ? body.provider : undefined
    const entry = provider === undefined ? undefined : entryOf(provider)
    const stored = entry?.declared === true && entry.settingsNs === PI_AI && body.baseURL === undefined ? profileOf(entry, sections(settings)) : undefined
    const request = entry?.declared === false
      ? { provider }
      : stored !== undefined
        ? { provider, ...(typeof stored.baseURL === 'string' ? { baseURL: stored.baseURL } : {}), ...(PROTOCOLS.includes(stored.api) ? { api: stored.api } : {}) }
        : {
            baseURL: checkEndpoint(body.baseURL),
            ...(PROTOCOLS.includes(body.api) ? { api: body.api } : {}),
            ...(typeof body.key === 'string' && body.key.trim() !== '' ? { apiKey: checkKey(body.key) } : {}),
          }
    const models = await ctx.llm.discoverModels(PI_AI, request)
    return models.slice(0, MAX_MODELS).map(model => ({
      id: model.id,
      ...(model.name ? { name: model.name } : {}),
      ...(model.contextWindow ? { contextWindow: model.contextWindow } : {}),
      ...(model.maxTokens ? { maxTokens: model.maxTokens } : {}),
      ...(model.inputModalities ? { inputModalities: [...model.inputModalities] } : {}),
    }))
  }

  // Only a route the user added goes; its key goes with it when it is the one this page
  // derives and no other provider names it.
  async function removeProvider(provider) {
    const { settings, credentials } = usable()
    const map = sections(settings)
    const entry = entryOf(provider)
    if (entry === undefined || entry.settingsNs !== PI_AI || profileOf(entry, map) === undefined) throw invalid(`${provider} is not set up`)
    if (!addedHere(entry, map)) throw invalid(`${provider} comes with this setup and cannot be removed`)
    const ref = refOf(profileOf(entry, map))
    const shared = [...keyRefs()].some(([other, otherRef]) => other !== provider && otherRef === ref)
    await settings.mutate(PI_AI, [{ op: 'unset', path: entry.settingsPath }], map.get(PI_AI)?.revision)
    if (ref === keyRefFor(provider) && !shared) {
      const info = await credentials.describe(ref)
      if (info.configured && info.writable) await credentials.unset(ref)
    }
    rt.dropCatalog()
    return providersView()
  }

  Object.assign(rt, {
    keyRefs, missingKeys, providersView, setProviderKey, clearProviderKey, addProvider, setProviderModels, discoverModels, removeProvider,
    canSetUpProviders: () => seams() !== undefined,
  })
}
