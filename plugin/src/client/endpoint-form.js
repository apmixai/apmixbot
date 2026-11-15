// The form that connects a model API by its endpoint and API key: the Models page adds a
// provider with it, and so does the first model card of a Bot that has no model. The key
// goes to the host to list the endpoint's models and to be stored, and never comes back.
import { createElement as h, useState } from 'react'
import { CheckIcon } from './icons.js'
import { KeyIcon, MaskedInput } from './secret-card.js'
import { SPRING_SHAPE } from './motion.js'
import { hostText, t } from './i18n.js'

// The wire protocols the host takes for a custom API, in the order the form offers them.
export const PROTOCOLS = ['openai-completions', 'openai-responses', 'anthropic-messages']
export const PROTOCOL_NAMES = { 'openai-completions': 'OpenAI Chat Completions', 'openai-responses': 'OpenAI Responses', 'anthropic-messages': 'Anthropic Messages' }
// Anthropic's SDK appends /v1/messages itself; the OpenAI ones take the /v1 root.
const ENDPOINT_HINTS = { 'anthropic-messages': 'https://gateway.example' }
const ENDPOINT_HINT = 'https://gateway.example/v1'
// Past this many listed models the picker gets a search field.
const SEARCH_FROM = 12

export const failureText = failure => hostText(failure?.message ?? String(failure))
export const typedIds = text => text.split(/[\s,]+/).map(id => id.trim()).filter(Boolean)

// Listed models to toggle, and model ids typed by hand for an endpoint that lists none.
// `models` is null until the endpoint was asked; `picked` holds model ids.
export function ModelPicker({ models, picked, onPick, typed, onType }) {
  const [query, setQuery] = useState('')
  const listed = models ?? []
  const needle = query.trim().toLowerCase()
  const shown = needle === '' ? listed : listed.filter(model => model.id.toLowerCase().includes(needle) || (model.name ?? '').toLowerCase().includes(needle))
  const toggle = id => onPick(picked.includes(id) ? picked.filter(item => item !== id) : [...picked, id])
  return h('div', { className: 'bt-endpoint-models' },
    models !== null && listed.length === 0 ? h('div', { className: 'bt-set-hint' }, t('The endpoint lists no models. Enter their ids below.')) : null,
    listed.length > SEARCH_FROM ? h('input', {
      className: 'bt-input', type: 'search', 'aria-label': t('Search models'), placeholder: t('Search models'), value: query, spellCheck: false,
      onChange: event => setQuery(event.target.value),
    }) : null,
    listed.length > 0 ? h('div', { className: 'bt-endpoint-picks-head' },
      h('span', { className: 'bt-set-hint' }, t('{count} selected', { count: picked.length })),
      // Select all takes the models the search shows; Clear drops every pick, hidden ones too.
      h('button', { type: 'button', className: 'bt-soft bt-soft-sm', disabled: shown.every(model => picked.includes(model.id)), onClick: () => onPick([...new Set([...picked, ...shown.map(model => model.id)])]) }, t('Select all')),
      h('button', { type: 'button', className: 'bt-soft bt-soft-sm', disabled: picked.length === 0, onClick: () => onPick([]) }, t('Clear'))) : null,
    listed.length > 0 ? h('div', { className: 'bt-secret-bots bt-endpoint-found', role: 'group', 'aria-label': t('Models') },
      shown.length === 0 ? h('span', { className: 'bt-set-hint' }, t('No model matches.')) : shown.map(model => h('button', {
        key: model.id, type: 'button', className: 'bt-secret-bot', 'aria-pressed': picked.includes(model.id),
        title: model.name && model.name !== model.id ? model.name : undefined, onClick: () => toggle(model.id),
      }, h('code', null, model.id), picked.includes(model.id) ? h(CheckIcon) : null))) : null,
    h('input', {
      className: 'bt-input', 'aria-label': t('Model ids'), value: typed, spellCheck: false, autoComplete: 'off',
      placeholder: listed.length > 0 ? t('Other model ids, separated by commas') : t('Model ids, separated by commas'),
      onChange: event => onType(event.target.value),
    }))
}

// `variant` 'card' sits in a chat card, 'page' on the Models page. `onAdded` gets the
// host's new providers view; `extra` leads the button row.
export function EndpointForm({ actions, onAdded, onCancel, submitLabel, busyLabel, variant = 'page', autoFocus = false, extra = null }) {
  const [draft, setDraft] = useState({ baseURL: '', api: PROTOCOLS[0], key: '', name: '', contextWindow: '' })
  const [found, setFound] = useState(null)
  const [picked, setPicked] = useState([])
  const [typed, setTyped] = useState('')
  const [asking, setAsking] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (field, value) => setDraft(current => ({ ...current, [field]: value }))
  const size = Number(draft.contextWindow)
  const sized = model => (Number.isInteger(size) && size > 0 && model.contextWindow === undefined ? { ...model, contextWindow: size } : model)
  const models = [
    ...(found ?? []).filter(model => picked.includes(model.id)),
    ...typedIds(typed).filter(id => !picked.includes(id)).map(id => ({ id })),
  ].map(sized)
  const hasEndpoint = draft.baseURL.trim() !== ''
  const ready = hasEndpoint && models.length > 0 && !busy
  const fetchModels = () => {
    if (asking || !hasEndpoint) return
    setAsking(true)
    setError('')
    void Promise.resolve(actions.providerModels({ baseURL: draft.baseURL, api: draft.api, key: draft.key }))
      .then((list) => {
        const listed = Array.isArray(list) ? list : []
        setFound(listed)
        // An endpoint that serves one model leaves nothing to choose.
        setPicked(current => (listed.length === 1 ? [listed[0].id] : current.filter(id => listed.some(model => model.id === id))))
      }, failure => setError(failureText(failure)))
      .finally(() => setAsking(false))
  }
  const add = () => {
    if (!ready) return
    setBusy(true)
    setError('')
    void Promise.resolve(actions.addProvider({ custom: true, baseURL: draft.baseURL, api: draft.api, key: draft.key, name: draft.name, models }))
      .then((view) => { set('key', ''); onAdded?.(view) }, (failure) => { setError(failureText(failure)); setBusy(false) })
  }
  const card = variant === 'card'
  const quiet = card ? 'bt-q-btn' : 'bt-soft bt-soft-sm'
  const main = card ? 'bt-q-submit' : 'bt-soft bt-soft-sm'
  return h('div', { className: 'bt-endpoint', 'data-variant': variant },
    h('div', { className: 'bt-endpoint-pair' },
      h('input', {
        className: 'bt-input', 'aria-label': t('Endpoint'), placeholder: ENDPOINT_HINTS[draft.api] ?? ENDPOINT_HINT, value: draft.baseURL,
        inputMode: 'url', spellCheck: false, autoComplete: 'off', autoFocus, onChange: event => set('baseURL', event.target.value),
      }),
      h('select', { className: 'bt-select', 'aria-label': t('Protocol'), value: draft.api, onChange: event => set('api', event.target.value) },
        PROTOCOLS.map(api => h('option', { key: api, value: api }, PROTOCOL_NAMES[api])))),
    h('label', { className: 'bt-q-field bt-secret-field' }, h(KeyIcon), h(MaskedInput, { value: draft.key, onChange: value => set('key', value), onEnter: fetchModels, label: t('API key') })),
    h('div', { className: 'bt-endpoint-models-head' },
      h('span', { className: 'bt-secret-edit-label' }, t('Models')),
      h('button', { type: 'button', className: 'bt-soft bt-soft-sm', disabled: asking || !hasEndpoint, onClick: fetchModels }, asking ? t('Asking…') : t('Fetch models'))),
    h(ModelPicker, { models: found, picked, onPick: setPicked, typed, onType: setTyped }),
    h('details', { className: 'bt-endpoint-more' },
      h('summary', null, t('More options')),
      h('div', { className: 'bt-endpoint-pair' },
        h('input', { className: 'bt-input', 'aria-label': t('Name'), placeholder: t('Name (optional)'), value: draft.name, autoComplete: 'off', onChange: event => set('name', event.target.value) }),
        h('input', {
          className: 'bt-input', 'aria-label': t('Context window (tokens)'), placeholder: t('Context window (tokens)'), value: draft.contextWindow,
          inputMode: 'numeric', autoComplete: 'off', onChange: event => set('contextWindow', event.target.value.replace(/\D+/g, '')),
        })),
      h('div', { className: 'bt-set-hint' }, t('The context window goes to the models whose endpoint does not tell it.'))),
    error ? h('div', { className: 'bt-secret-error', role: 'alert' }, error) : null,
    h('div', { className: card ? 'bt-q-foot' : 'bt-secret-row-actions' },
      extra,
      onCancel ? h('button', { type: 'button', className: quiet, onClick: onCancel }, t('Cancel')) : null,
      h('button', { type: 'button', className: main, disabled: !ready, onClick: add }, busy ? (busyLabel ?? t('Saving…')) : (submitLabel ?? t('Add')))))
}

export const ENDPOINT_CSS = `
.bt-endpoint{display:flex;flex-direction:column;gap:10px;min-width:0}
.bt-endpoint-pair{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,190px);gap:8px}
.bt-endpoint .bt-endpoint-more .bt-endpoint-pair{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
.bt-endpoint .bt-input,.bt-endpoint .bt-select{height:34px}
.bt-endpoint .bt-secret-field{min-height:36px;align-items:center;gap:8px}
.bt-endpoint .bt-secret-field>svg{flex:none;color:var(--bt-ink-3)}
.bt-endpoint-models-head,.bt-endpoint-picks-head{display:flex;align-items:center;gap:8px}
.bt-endpoint-models-head .bt-secret-edit-label,.bt-endpoint-picks-head .bt-set-hint{flex:1}
.bt-endpoint-models{display:flex;flex-direction:column;gap:8px}
.bt-endpoint-found{max-height:180px;overflow-y:auto;scrollbar-width:thin}
.bt-endpoint-found code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px}
.bt-endpoint-found .bt-secret-bot{padding:0 10px}
.bt-endpoint-more{display:flex;flex-direction:column;gap:8px}
.bt-endpoint-more>summary{width:max-content;font-size:12px;line-height:16px;color:var(--bt-ink-2);cursor:pointer;border-radius:4px}
.bt-endpoint-more>summary:focus-visible{outline:2px solid var(--bt-accent);outline-offset:2px}
.bt-endpoint-more[open]>summary{margin-bottom:8px}
.bt-endpoint-more[open]>.bt-endpoint-pair{animation:bt-q-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing} backwards}
.bt-endpoint .bt-q-foot{flex-wrap:wrap;align-items:center}
.bt-endpoint .bt-q-submit:disabled,.bt-endpoint .bt-q-btn:disabled{opacity:.45;cursor:default}
@media (max-width:560px){.bt-endpoint-pair,.bt-endpoint .bt-endpoint-more .bt-endpoint-pair{grid-template-columns:minmax(0,1fr)}}
@media (prefers-reduced-motion:reduce){.bt-endpoint-more[open]>.bt-endpoint-pair{animation:none}}
`
