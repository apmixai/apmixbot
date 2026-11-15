// Plain helpers for the Create Bot form, kept free of React so tests can load them.
import { DEFAULT_COLORS, DEFAULT_SHAPES, lookOf } from './characters.js'

// The look the form opens on, and its Shuffle: a shape and a color no Bot of the team
// wears yet, while there are some left, and never the one just shown (`avoid`).
export function randomLook(bots, avoid = {}, random = Math.random) {
  const worn = bots.map(lookOf)
  const fresh = (list, key) => {
    const rest = list.filter(value => value !== avoid[key])
    const unworn = rest.filter(value => !worn.some(look => look[key] === value))
    return unworn.length > 0 ? unworn : rest
  }
  const pick = list => list[Math.floor(random() * list.length)]
  return { shape: pick(fresh(DEFAULT_SHAPES, 'shape')), color: pick(fresh(DEFAULT_COLORS, 'color')) }
}

export function freshBotName(roster, base = 'New Bot') {
  const taken = new Set(roster.bots.map(bot => bot.name.toLowerCase()))
  if (!taken.has(base.toLowerCase())) return base
  let index = 2
  while (taken.has(`${base.toLowerCase()} ${index}`)) index += 1
  return `${base} ${index}`
}

// The form starts on the engine default model when it is served, else the first one. A model
// whose provider has no API key fails every turn, so the form never starts on one.
export function startModel(roster) {
  const models = (roster.models ?? []).filter(model => !model.needsKey)
  return (models.find(model => model.ref === roster.defaultModel) ?? models[0])?.ref ?? ''
}

// The model is always sent: the host fixes it on the Bot at creation.
export function createPayload({ name, look, image, model, effort, brief }) {
  const payload = { name, color: look.color, avatar: image ? { shape: look.shape, image } : { shape: look.shape } }
  if (model) payload.model = model
  if (effort) payload.effort = effort
  if (brief) payload.brief = brief
  return payload
}
