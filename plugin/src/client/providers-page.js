// The Models page: the model providers the engine serves, with their API keys and models, custom
// APIs added by their endpoint and key, and the providers the engine can add. The engine keeps all of
// it; a key only ever travels from these inputs to the host.
import { createElement as h, useEffect, useState } from 'react'
import { CheckIcon, TrashIcon } from './icons.js'
import { KeyIcon, MaskedInput } from './secret-card.js'
import { Segmented, SPRING_SHAPE } from './motion.js'
import { EndpointForm, ModelPicker, PROTOCOL_NAMES, typedIds } from './endpoint-form.js'
import { hostText, t } from './i18n.js'

const SHOWN_MODELS = 8

// A failure in the interface language; the dialog's error line shows it.
const translated = promise => Promise.resolve(promise).catch((failure) => { throw new Error(hostText(failure?.message ?? String(failure))) })
// A provider a Bot can run on: its key is set, or it takes none.
const ready = provider => provider.key === null || provider.key.configured

export function ProvidersPage({ actions, run, Section }) {
  const [view, setView] = useState(null)
  const [open, setOpen] = useState(null)
  const [adding, setAdding] = useState(false)
  // Resolves true when the host took it; the page then shows the host's new view.
  const apply = promise => run(translated(promise).then((next) => { if (next?.providers) setView(next) }))
  useEffect(() => {
    void apply(Promise.resolve(actions.providers()).then((next) => {
      // With no provider ready yet, the page opens on the form that adds one.
      if (next?.available && !next.providers.some(ready)) setAdding(true)
      return next
    }))
  }, [])
  if (view === null) return null
  if (!view.available) return h('p', { className: 'bt-set-hint' }, t('This engine cannot set up model providers.'))
  const added = (next) => {
    if (next?.providers) setView(next)
    setAdding(false)
  }
  return [
    h(Section, { key: 'list', title: t('Model providers · {count}', { count: view.providers.length }) },
      view.providers.map(provider => h(ProviderRow, {
        key: provider.id, provider, apply, actions,
        open: open === provider.id, onToggle: () => setOpen(open === provider.id ? null : provider.id),
      })),
      adding ? h(AddProvider, { key: 'add', view, apply, actions, onAdded: added, onDone: () => setAdding(false) }) : null),
    adding ? null : h('div', { key: 'add', className: 'bt-actions' }, h('button', { type: 'button', className: 'bt-soft bt-soft-sm', onClick: () => setAdding(true) }, t('Add a provider'))),
  ]
}

function keyState(provider) {
  const { key } = provider
  if (key === null) return null
  // One that comes with the setup and has no key is simply not in use.
  if (!key.configured) return provider.removable ? ['missing', t('Needs an API key')] : ['off', t('Not set up')]
  return key.writable ? ['set', t('Key set')] : ['outside', t('Key set outside ApmixBot')]
}

function ProviderRow({ provider, apply, actions, open, onToggle }) {
  const [confirm, setConfirm] = useState(false)
  useEffect(() => { if (!open) setConfirm(false) }, [open])
  const state = keyState(provider)
  const count = provider.models.length === 0 ? t('No models')
    : provider.models.length === 1 ? t('1 model') : t('{count} models', { count: provider.models.length })
  const hint = provider.error ?? (provider.endpoint ? `${provider.endpoint} · ${count}` : count)
  return h('div', { className: 'bt-secret-item bt-provider', 'data-open': open ? '' : undefined },
    h('button', { type: 'button', className: 'bt-set-row bt-secret-summary', 'aria-expanded': open, onClick: onToggle },
      h('span', { className: 'bt-set-copy' },
        h('span', { className: 'bt-secret-title' }, provider.name, provider.name !== provider.id ? h('span', { className: 'bt-provider-id' }, provider.id) : null),
        h('span', { className: 'bt-set-hint', 'data-error': provider.error ? '' : undefined }, hint)),
      state ? h('span', { className: 'bt-set-control' }, h('span', { className: 'bt-provider-state', 'data-state': state[0] }, state[1])) : null),
    open ? h('div', { className: 'bt-secret-edit' },
      provider.api ? h('div', { className: 'bt-set-hint' }, t('Protocol: {protocol}', { protocol: PROTOCOL_NAMES[provider.api] ?? provider.api })) : null,
      provider.key?.writable ? h(KeyEditor, { provider, apply, actions }) : null,
      provider.key && !provider.key.writable ? h('div', { className: 'bt-set-hint' }, t('This key comes from outside ApmixBot, such as an environment variable, and cannot be changed here.')) : null,
      provider.custom && provider.removable
        ? h(ModelsEditor, { provider, apply, actions })
        : provider.models.length > 0 ? h('div', { className: 'bt-secret-edit-block' }, h('div', { className: 'bt-secret-edit-label' }, t('Models')), h(ModelTags, { provider })) : null,
      provider.removable ? h('div', { className: 'bt-secret-row-actions' },
        confirm
          ? [
              h('span', { key: 'q', className: 'bt-set-hint' }, t('Remove {name}? Bots on its models need another model.', { name: provider.name })),
              h('button', { key: 'no', type: 'button', className: 'bt-soft bt-soft-sm', onClick: () => setConfirm(false) }, t('Keep')),
              h('button', { key: 'yes', type: 'button', className: 'bt-soft bt-soft-sm bt-secret-danger', onClick: () => apply(actions.removeProvider(provider.id)) }, t('Remove')),
            ]
          : h('button', { type: 'button', className: 'bt-soft bt-soft-sm bt-secret-danger', onClick: () => setConfirm(true) }, h(TrashIcon), t('Remove provider'))) : null) : null)
}

function ModelTags({ provider }) {
  const shown = provider.models.slice(0, SHOWN_MODELS)
  return h('div', { className: 'bt-provider-models' },
    shown.map(model => h('span', { key: model.ref, className: 'bt-tag', title: model.ref }, model.name)),
    provider.models.length > shown.length ? h('span', { className: 'bt-set-hint' }, t('and {count} more', { count: provider.models.length - shown.length })) : null)
}

// A custom API's models: its endpoint is asked again with the key the engine keeps for it, and
// the models to keep are picked anew. One it no longer lists stays until it is cleared.
function ModelsEditor({ provider, apply, actions }) {
  const current = provider.models.map(model => ({ id: model.ref.slice(provider.id.length + 1), name: model.name }))
  const [editing, setEditing] = useState(false)
  const [found, setFound] = useState(null)
  const [picked, setPicked] = useState([])
  const [typed, setTyped] = useState('')
  const [asking, setAsking] = useState(false)
  const head = button => h('div', { className: 'bt-provider-models-head' }, h('span', { className: 'bt-secret-edit-label' }, t('Models')), button)
  if (!editing) {
    const edit = () => { setFound(null); setPicked(current.map(model => model.id)); setTyped(''); setEditing(true) }
    return h('div', { className: 'bt-secret-edit-block' },
      head(h('button', { type: 'button', className: 'bt-soft bt-soft-sm', onClick: edit }, t('Change models'))),
      provider.models.length > 0 ? h(ModelTags, { provider }) : null)
  }
  const base = found ?? current
  const listed = [...base, ...picked.filter(id => !base.some(model => model.id === id)).map(id => ({ id }))]
  const models = [
    ...listed.filter(model => picked.includes(model.id)),
    ...typedIds(typed).filter(id => !picked.includes(id)).map(id => ({ id })),
  ]
  const fetchModels = () => {
    setAsking(true)
    void apply(Promise.resolve(actions.providerModels({ provider: provider.id })).then((list) => { setFound(Array.isArray(list) ? list : []) }))
      .finally(() => setAsking(false))
  }
  const save = () => apply(actions.setProviderModels({ provider: provider.id, models })).then((ok) => { if (ok) setEditing(false) })
  return h('div', { className: 'bt-secret-edit-block' },
    head(h('button', { type: 'button', className: 'bt-soft bt-soft-sm', disabled: asking, onClick: fetchModels }, asking ? t('Asking…') : t('Fetch models'))),
    h(ModelPicker, { models: listed, picked, onPick: setPicked, typed, onType: setTyped }),
    h('div', { className: 'bt-secret-row-actions' },
      h('button', { type: 'button', className: 'bt-soft bt-soft-sm', onClick: () => setEditing(false) }, t('Cancel')),
      h('button', { type: 'button', className: 'bt-soft bt-soft-sm', disabled: models.length === 0, onClick: save }, t('Save models'))))
}

function KeyEditor({ provider, apply, actions }) {
  const [value, setValue] = useState('')
  const [saved, setSaved] = useState(false)
  const filled = value.trim() !== ''
  const save = () => {
    if (!filled) return
    void apply(actions.setProviderKey(provider.id, value)).then((ok) => { if (ok) { setValue(''); setSaved(true) } })
  }
  const edit = (next) => { setValue(next); setSaved(false) }
  const label = t('{provider} API key', { provider: provider.name })
  return h('div', { className: 'bt-secret-edit-block' },
    h('div', { className: 'bt-secret-edit-label' }, provider.key.configured ? t('Replace the API key') : t('API key')),
    h('div', { className: 'bt-secret-inline' },
      h('label', { className: 'bt-q-field bt-secret-field' }, h(KeyIcon), h(MaskedInput, { value, onChange: edit, onEnter: save, label })),
      h('button', { type: 'button', className: 'bt-soft bt-soft-sm', disabled: !filled, onClick: save }, t('Save')),
      provider.key.configured ? h('button', { type: 'button', className: 'bt-soft bt-soft-sm bt-secret-danger', onClick: () => apply(actions.setProviderKey(provider.id, null)) }, t('Remove key')) : null),
    saved ? h('div', { className: 'bt-set-hint bt-secret-ok', role: 'status' }, h(CheckIcon), t('Saved.')) : null)
}

// A custom API by its endpoint and key comes first: it is how most providers are added.
function AddProvider({ view, apply, actions, onAdded, onDone }) {
  const [mode, setMode] = useState('custom')
  return h('div', { className: 'bt-set-row bt-set-paste bt-provider-add' },
    h(Segmented, { label: t('Kind of provider'), value: mode },
      [['custom', t('Endpoint and key')], ['known', t('Known provider')]].map(([id, label]) => h('button', {
        key: id, type: 'button', 'aria-pressed': mode === id, disabled: id === 'known' && view.addable.length === 0, onClick: () => setMode(id),
      }, label))),
    // Both forms stay mounted, so switching keeps what is typed in the other.
    h('div', { hidden: mode !== 'custom' }, h(EndpointForm, { actions, onAdded, onCancel: onDone })),
    h('div', { hidden: mode !== 'known' }, h(KnownForm, { view, apply, actions, onDone })))
}

function KnownForm({ view, apply, actions, onDone }) {
  const [provider, setProvider] = useState('')
  const [key, setKey] = useState('')
  const options = [...view.addable].sort((a, b) => a.name.localeCompare(b.name))
  const add = () => {
    if (provider === '') return
    void apply(actions.addProvider({ provider, key })).then((ok) => { if (ok) onDone() })
  }
  return h('div', { className: 'bt-provider-form' },
    h('select', { className: 'bt-select', 'aria-label': t('Provider'), value: provider, onChange: event => setProvider(event.target.value) },
      h('option', { value: '', disabled: true }, t('Choose a provider')),
      options.map(option => h('option', { key: option.id, value: option.id }, option.name))),
    h('label', { className: 'bt-q-field bt-secret-field' }, h(KeyIcon), h(MaskedInput, { value: key, onChange: setKey, onEnter: add, label: t('API key') })),
    h('div', { className: 'bt-secret-row-actions' },
      h('button', { type: 'button', className: 'bt-soft bt-soft-sm', onClick: onDone }, t('Cancel')),
      h('button', { type: 'button', className: 'bt-soft bt-soft-sm', disabled: provider === '', onClick: add }, t('Add'))))
}

export const PROVIDERS_CSS = `
.bt-provider-id{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;color:var(--bt-ink-3)}
.bt-provider .bt-set-hint{overflow-wrap:anywhere}
.bt-provider .bt-set-hint[data-error]{color:var(--bt-danger)}
.bt-provider-state{display:inline-flex;align-items:center;gap:6px;font-size:12px;line-height:16px;color:var(--bt-ink-2);white-space:nowrap}
.bt-provider-state::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--bt-ink-3)}
.bt-provider-state[data-state=set]::before{background:var(--bt-green)}
.bt-provider-state[data-state=off]{color:var(--bt-ink-3)}
.bt-provider-state[data-state=missing]{color:var(--bt-danger)}
.bt-provider-state[data-state=missing]::before{background:var(--bt-danger)}
.bt-provider .bt-secret-field{align-items:center;gap:8px}
.bt-provider .bt-secret-field>svg,.bt-provider-form .bt-secret-field>svg{flex:none;color:var(--bt-ink-3)}
.bt-provider-models{display:flex;flex-wrap:wrap;align-items:center;gap:6px}
.bt-provider-models .bt-tag{max-width:220px}
.bt-provider-models-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.bt-provider-add{gap:12px;animation:bt-q-in ${SPRING_SHAPE.duration}ms ${SPRING_SHAPE.easing} backwards,bt-veil-in .2s ease-out backwards}
.bt-provider-add .bt-seg{align-self:flex-start}
.bt-provider-add .bt-seg button{flex:none;padding:0 14px;white-space:nowrap}
.bt-provider-add .bt-seg button:disabled{opacity:.45;cursor:default}
.bt-provider-form{display:flex;flex-direction:column;gap:10px}
.bt-provider-form .bt-secret-field{min-height:36px;align-items:center;gap:8px}
@media (prefers-reduced-motion:reduce){.bt-provider-add{animation:none}}
`
