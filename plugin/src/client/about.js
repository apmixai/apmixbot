// Settings → About ApmixBot: the version, its updates, and where to find ApmixBot and
// its repository. The sidebar's cloud button shows the same update state.
import { createElement as h, useEffect, useState } from 'react'
import { GitHubMark } from './connectors.js'
import { dateLocale, hostText, t } from './i18n.js'
import { StarLineIcon } from './icons.js'
import { SPRING_POP } from './motion.js'
import { BotMark } from './mark.js'
import { MAIN_LOOK } from './characters.js'

// The length of the mark's `done` hop (bt-done in styles.js).
const CHEER_MS = 1800

export const WEBSITE = 'https://bot.apmix.ai/'
export const SUPPORT_EMAIL = 'support@apmix.ai'
export const SOCIALS = [['X', 'https://x.com/ApmixAi'], ['Telegram', 'https://t.me/apmix_ai']]

const bare = url => url.replace(/^https:\/\//, '').replace(/\/$/, '')

const starCount = count => new Intl.NumberFormat(dateLocale(), { notation: 'compact', maximumFractionDigits: 1 }).format(count)

function whenText(time) {
  const date = new Date(time)
  const today = new Date().toDateString() === date.toDateString()
  const clock = date.toLocaleTimeString(dateLocale(), { hour: '2-digit', minute: '2-digit' })
  return today ? clock : `${date.toLocaleDateString(dateLocale(), { month: 'short', day: 'numeric' })} ${clock}`
}

function botHint(update) {
  if (update.phase === 'installing') return t('Updating ApmixBot…')
  if (update.phase === 'installed') return t('Restart ApmixBot to start using version {version}.', { version: update.installed ?? update.latest })
  if (update.phase === 'failed') return t('The update did not finish: {reason}', { reason: hostText(update.error ?? '') })
  if (update.available) return t('ApmixBot {version} is available', { version: update.latest })
  if (update.source === 'app') return t('Updates come with the ApmixBot app.')
  if (update.enabled === false) return t('Update checks are off.')
  if (update.source === 'path') return t('Installed from a local folder; update it there.')
  if (!update.checkedAt) return null
  if (!update.latest && update.source !== 'registry') return t('Updates are not offered for this install.')
  const checked = t('Checked {time}', { time: whenText(update.checkedAt) })
  return `${update.latest ? t('Up to date') : t('Could not check for updates.')} · ${checked}`
}

const linkProps = href => ({ className: 'bt-soft bt-soft-sm bt-about-link', href, target: '_blank', rel: 'noopener noreferrer' })

export function AboutPage({ useUpdate, actions, run, Section, Row }) {
  const update = useUpdate(value => value) ?? {}
  const [checking, setChecking] = useState(false)
  const [stars, setStars] = useState(null)
  useEffect(() => {
    let live = true
    actions.repoStars().then((count) => { if (live && Number.isInteger(count)) setStars(count) }, () => {})
    return () => { live = false }
  }, [])
  // Apex hops when the page opens, after a check, and when an update is in.
  const [cheer, setCheer] = useState(true)
  useEffect(() => {
    if (!cheer) return undefined
    const timer = setTimeout(() => setCheer(false), CHEER_MS)
    return () => clearTimeout(timer)
  }, [cheer])
  const check = () => {
    setChecking(true)
    void run(actions.checkUpdate()).then((done) => { setChecking(false); if (done) setCheer(true) })
  }
  const phase = update.phase ?? 'idle'
  useEffect(() => { if (phase === 'installed') setCheer(true) }, [phase])
  const markState = checking ? 'searching' : phase === 'installing' ? 'working' : cheer ? 'done' : 'idle'
  const botControl = phase === 'installed' || update.source === 'app' ? null
    : update.available || phase === 'installing'
      ? h('button', { type: 'button', className: 'bt-about-primary', disabled: phase === 'installing', onClick: () => run(actions.installUpdate()) },
          phase === 'installing' ? t('Updating…') : phase === 'failed' ? t('Try again') : t('Update'))
      : h('button', { type: 'button', className: 'bt-soft bt-soft-sm', disabled: checking || update.enabled === false, onClick: check }, checking ? t('Checking…') : t('Check for updates'))
  const repo = update.repoUrl
  return [
    h('div', { key: 'hero', className: 'bt-about-hero' },
      h('span', { className: 'bt-about-mark' }, h(BotMark, { look: MAIN_LOOK, bot: { id: 'about' }, size: 52, state: markState, live: true, gaze: true, pokeable: true })),
      h('div', { className: 'bt-about-copy' },
        h('span', { className: 'bt-about-name' }, 'Apmix', h('b', null, 'Bot')),
        update.current ? h('span', { className: 'bt-about-version' }, t('Version {version}', { version: update.current })) : null),
      repo ? h('a', {
        className: 'bt-star', href: repo, target: '_blank', rel: 'noopener noreferrer', title: t('Star ApmixBot on GitHub'),
        'aria-label': stars === null ? t('Star ApmixBot on GitHub') : `${t('Star ApmixBot on GitHub')} · ${t('{count} stars', { count: stars })}`,
      },
      h('span', { className: 'bt-star-main' }, h('span', { className: 'bt-star-icon' }, h(StarLineIcon)), 'Star'),
      stars === null ? null : h('span', { className: 'bt-star-count' }, starCount(stars))) : null),
    repo ? h('p', { key: 'ask', className: 'bt-about-ask' }, t('If ApmixBot helps you, a star on GitHub helps more people find it.')) : null,
    h(Section, { key: 'updates', title: t('Updates') },
      h(Row, { label: 'ApmixBot', hint: botHint(update) }, botControl, update.available && update.notesUrl ? h('a', linkProps(update.notesUrl), t("What's new")) : null)),
    h(Section, { key: 'links', title: t('Links') },
      h(Row, { label: t('Website'), hint: bare(WEBSITE) }, h('a', linkProps(WEBSITE), t('Open'))),
      repo ? h(Row, { label: t('Source code'), hint: bare(repo) }, h('a', linkProps(repo), h(GitHubMark), t('Open'))) : null,
      update.notesUrl ? h(Row, { label: t('Release notes') }, h('a', linkProps(update.notesUrl), t('Open'))) : null,
      // No target: a mail address opens the mail app, and a new tab for it would stay empty.
      h(Row, { label: t('Support'), hint: SUPPORT_EMAIL }, h('a', { className: 'bt-soft bt-soft-sm bt-about-link', href: `mailto:${SUPPORT_EMAIL}` }, t('Email'))),
      SOCIALS.map(([name, url]) => h(Row, { key: name, label: name, hint: bare(url) }, h('a', linkProps(url), t('Open'))))),
  ]
}

export const ABOUT_CSS = `
.bt-about-hero{display:flex;align-items:center;gap:14px;padding:16px;border:1px solid var(--bt-line);border-radius:12px;background:var(--bt-card)}
.bt-about-mark{flex:none;display:inline-flex;position:relative}
.bt-about-mark::before{content:'';position:absolute;inset:-20%;border-radius:50%}
body:not([data-bt-motion=quiet]) .bt-about-mark:hover .bt-mark[data-live][data-state=idle]:not(.bt-mark-poke) .bt-b{rotate:8deg;translate:5% -1%;animation:bt-nuzzle .78s ease-in-out .32s infinite}
body:not([data-bt-motion=quiet]) .bt-about-mark:hover .bt-mark[data-live][data-state=idle] .bt-eye{scale:1 0;animation:none}
body:not([data-bt-motion=quiet]) .bt-about-mark:hover .bt-mark[data-live][data-state=idle] .bt-eye-happy{opacity:1;transition-delay:.1s}
.bt-about-copy{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.bt-about-name{font-size:16px;line-height:22px;font-weight:700;letter-spacing:-.02em}
.bt-about-name b{font-weight:inherit;color:var(--bt-accent)}
.bt-about-version{font-size:12px;line-height:16px;color:var(--bt-ink-2);font-variant-numeric:tabular-nums}
.bt-about-ask{margin:-10px 4px 0;font-size:12px;line-height:16px;color:var(--bt-ink-3)}
.bt-star{flex:none;display:inline-flex;align-items:stretch;height:30px;border-radius:999px;border:1px solid var(--bt-line-2,var(--bt-line));overflow:hidden;color:var(--bt-ink);text-decoration:none;font-size:12px;line-height:28px;transition:transform .12s ease,border-color .15s ease}
.bt-star:hover{border-color:color-mix(in srgb,#e3a008 55%,var(--bt-line))}
.bt-star:active{transform:scale(.96)}
.bt-star-main{display:inline-flex;align-items:center;gap:6px;padding:0 12px 0 10px;background:var(--bt-hover);font-weight:500}
.bt-star-icon{display:inline-flex;color:var(--bt-ink-2);transition:color .15s ease}
.bt-star-icon path{transition:fill .15s ease}
.bt-star:hover .bt-star-icon{color:#e3a008;animation:bt-star-pop ${SPRING_POP.duration}ms ${SPRING_POP.easing}}
.bt-star:hover .bt-star-icon path{fill:currentColor}
.bt-star-count{display:inline-flex;align-items:center;padding:0 11px;border-left:1px solid var(--bt-line-2,var(--bt-line));color:var(--bt-ink-2);font-variant-numeric:tabular-nums;animation:bt-star-count-in ${SPRING_POP.duration}ms ${SPRING_POP.easing},bt-veil-in .2s ease-out}
@keyframes bt-star-pop{from{scale:.6;rotate:-30deg}}
@keyframes bt-star-count-in{from{translate:-6px 0}}
.bt-about-link{display:inline-flex;align-items:center;gap:6px;text-decoration:none}
.bt-about-link svg{width:14px;height:14px}
.bt-about-primary{height:28px;border-radius:999px;border:0;background:var(--bt-accent);color:var(--bt-accent-ink);padding:0 14px;font-size:12px;cursor:pointer;transition:filter .12s ease;flex:none;white-space:nowrap}
.bt-about-primary:hover{filter:brightness(1.08)}
.bt-about-primary:active{filter:brightness(.94)}
.bt-about-primary:disabled{opacity:.6;cursor:default;filter:none}
@media (prefers-reduced-motion:reduce){.bt-star:hover .bt-star-icon,.bt-star-count{animation:none}}
`
