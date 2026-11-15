// Interface copy is English. The keys are the text itself; `t` fills in the {named} values.
export const NAMESPACE = 'apmixbot'

const fill = (text, params) => (params
  ? text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match))
  : text)

// The interface registers no translations with the engine's locale service.
export function installLocale() {
  return () => {}
}

export function t(key, params) {
  return fill(key, params)
}

// A message from the host, as the interface shows it.
export const hostText = message => message

export const language = () => 'en'

export const dateLocale = () => 'en-US'
