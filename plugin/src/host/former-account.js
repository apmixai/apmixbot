// ApmixBot once had accounts on an admin site, which also served models. A team that was
// signed in then drops what the sign-in left behind: the token, the site's model route, and
// its models on Bots, which move to the first model of the user's own providers, or to none.
const PROVIDER = 'apmixbot'
const TOKEN_REF = 'APMIXBOT_ACCOUNT_TOKEN'
const MARKS = ['account', 'accountModels', 'accountModelsOff']

export function install(rt) {
  const { ctx, state } = rt
  let dropping

  async function drop() {
    await rt.load()
    if (rt.readOnly() !== undefined || !MARKS.some(key => key in state)) return
    const view = await rt.providersView()
    // The engine's provider setup is not there yet: the next start tries again.
    if (view.available !== true) return
    if (view.providers.some(provider => provider.id === PROVIDER)) await rt.removeProvider(PROVIDER)
    const store = ctx.get('credentials')
    if ((await store.describe(TOKEN_REF)).configured) await store.unset(TOKEN_REF)
    const own = (await rt.catalog({ fresh: true })).filter(entry => entry.provider !== PROVIDER)
    for (const bot of Object.values(state.bots)) {
      if (bot.model?.startsWith(`${PROVIDER}/`)) await rt.updateBot(bot.id, { model: own[0]?.ref ?? null })
    }
    // Last, so that a step that failed is tried again on the next start.
    for (const key of MARKS) delete state[key]
    await rt.save()
  }

  // Once per run, from the first team read (channel.js): by then the engine lists its providers.
  rt.dropFormerAccount = () => dropping ??= drop().catch(error => rt.warn('apmixbot: the former account was not removed: %s', error))
}
