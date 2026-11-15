// Above the composer: the app tool calls that wait for the user's answer, and the links
// an app asked the user to open (host: app-approvals.js). A group shows its members'
// cards, since their Sessions there are hidden.
import { createElement as h, useState } from 'react'
import { t } from './i18n.js'

const NONE = []

// The cards of the conversation `sessionId` shows: a Bot's own chat, or a group.
export function cardsFor(sessionId, roster, work) {
  const room = roster.roomsById?.[sessionId]
  const bot = room ? undefined : roster.byId?.[sessionId]
  const here = entry => (room ? entry.roomId === room.id : bot !== undefined && entry.roomId === undefined && entry.botId === bot.id)
  return {
    approvals: (work?.approvals ?? NONE).filter(entry => entry.kind === 'app' && entry.answerable && here(entry) && roster.byId?.[entry.botId]),
    links: (work?.links ?? NONE).filter(entry => here(entry) && roster.byId?.[entry.botId]),
  }
}

// An address as the card shows it: the site set apart from the rest, so a look-alike
// address is seen for what it is.
export function addressParts(address) {
  try {
    const url = new URL(address)
    return { site: url.host, rest: `${url.pathname === '/' ? '' : url.pathname}${url.search}${url.hash}` }
  } catch {
    return { site: '', rest: String(address ?? '') }
  }
}

function useAnswer(actions) {
  const [busy, setBusy] = useState(false)
  const run = (task) => {
    setBusy(true)
    void Promise.resolve().then(task).catch(error => actions.reportError(error, 'approval')).finally(() => setBusy(false))
  }
  return [busy, run]
}

export function AppApprovalCard({ approval, bot, actions }) {
  const [busy, run] = useAnswer(actions)
  const answer = choice => run(() => actions.answerApproval(approval.id, choice))
  const title = t('{name} wants to use {app}', { name: bot.name, app: approval.app })
  return h('div', { className: 'bt-q bt-ap', role: 'group', 'aria-label': title },
    h('div', { className: 'bt-q-head' }, h('h4', { className: 'bt-q-title' }, title)),
    h('div', { className: 'bt-ap-tool' }, approval.tool),
    approval.detail?.code ? h('code', { className: 'bt-ap-code' }, approval.detail.code) : null,
    h('div', { className: 'bt-q-foot' },
      h('button', { type: 'button', className: 'bt-q-btn', disabled: busy, onClick: () => answer('reject') }, t('Decline')),
      approval.always ? h('button', { type: 'button', className: 'bt-q-btn', disabled: busy, title: t('Bots use {tool} of {app} from now on without asking', { tool: approval.tool, app: approval.app }), onClick: () => answer('always') }, t('Always allow')) : null,
      h('button', { type: 'button', className: 'bt-q-submit', disabled: busy, onClick: () => answer('allow') }, t('Allow once'))))
}

export function AppLinkCard({ link, actions }) {
  const [busy, run] = useAnswer(actions)
  const { site, rest } = addressParts(link.url)
  const title = t('{app} has a link for you to open', { app: link.app })
  return h('div', { className: 'bt-q bt-ap', role: 'group', 'aria-label': title },
    h('div', { className: 'bt-q-head' }, h('h4', { className: 'bt-q-title' }, title)),
    h('div', { className: 'bt-ap-url' }, h('b', null, site), rest),
    h('div', { className: 'bt-q-foot' },
      h('button', { type: 'button', className: 'bt-q-btn', disabled: busy, onClick: () => run(() => actions.dismissAppLink(link.id)) }, t('Done')),
      h('a', { className: 'bt-q-submit bt-ap-open', href: link.url, target: '_blank', rel: 'noopener noreferrer' }, t('Open link'))))
}

export function ApprovalDock({ sessionId, useRoster, useWork, actions }) {
  const roster = useRoster(value => value)
  const work = useWork(value => value)
  const { approvals, links } = cardsFor(sessionId, roster, work)
  if (approvals.length === 0 && links.length === 0) return null
  return h('div', { className: 'bt-q-dock bt-ap-dock' },
    approvals.map(approval => h(AppApprovalCard, { key: approval.id, approval, bot: roster.byId[approval.botId], actions })),
    links.map(link => h(AppLinkCard, { key: link.id, link, actions })))
}

export const APPROVAL_CSS = `
.bt-ap-dock{flex-direction:column;align-items:center}
.bt-q.bt-ap{gap:8px;animation:bt-rise .2s ease-out backwards}
.bt-ap-tool{font:13px/18px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--bt-ink);overflow-wrap:anywhere}
.bt-ap-code{display:block;max-height:88px;overflow:auto;padding:6px 10px;border-radius:8px;background:var(--bt-hover);font:12px/17px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:var(--bt-ink-2);white-space:pre-wrap;overflow-wrap:anywhere}
.bt-ap-url{font-size:13px;line-height:18px;color:var(--bt-ink-2);overflow-wrap:anywhere}
.bt-ap-url b{font-weight:600;color:var(--bt-ink)}
.bt-ap-open{display:inline-flex;align-items:center;text-decoration:none}
.bt-ap .bt-q-foot>button:disabled{opacity:.5;cursor:default}
@media (prefers-reduced-motion:reduce){.bt-q.bt-ap{animation:none}}
`
