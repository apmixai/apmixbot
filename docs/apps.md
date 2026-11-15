# Apps

Apps are the services a user connects so that Bots work in them as the user: email, calendar, files, issues, payments. Each app is a remote MCP server that the service itself runs. ApmixBot for Android has the same feature; this note says how the desktop app does it.

## What the user sees

Settings → Apps (the page that holds the GitHub connector) opens from the sidebar's "Connect apps" button and from the account menu. An app of the catalog shows its own logo (`plugin/src/client/app-logos.js`; `NOTICE` says whose they are); an app added by its address shows the first letter of its name. The page lists:

- **Connected**: the apps that are set up, each with its state and a switch.
- **Add an app**: the catalog (`plugin/src/shared/app-catalog.js`), by category, with a search box.
- **Another app**: an app added by its https address.

Connecting depends on how the app signs in:

| Sign-in | What the user does |
|---|---|
| `oauth` | Clicks "Sign in with <Name>". The system browser opens the service's own sign-in page; ApmixBot finishes when the browser comes back. |
| `bearer`, `header` | Pastes a key. |
| `none` | Clicks "Connect". |

An app that takes only an OAuth client the user made (`needsClient`, or a server that does not register clients itself) also asks for a client ID and secret, and shows the redirect address to register.

## How it works

- **Mount.** A connected app is mounted with the engine's MCP client (`@apmixbot/dsh-mcp-client`) on the plugin's context, as the GitHub connector is. Every Bot gets its tools, named `mcp__<server>__<tool>`; `<server>` is the app's id with `_` written as `-`.
- **Apps with many tools** (`plugin/src/host/app-tools.js`). One app's server can list hundreds of tools (Vercel lists about 250, some 480 KB of schemas), and they would go with every model request of every Bot. An app, or an MCP capability, with more than 40 tools is therefore looked up: its tools stay registered but are left out of the request, and the Bot gets `app_tools({ app, query })` instead, whose description names the looked-up apps. It answers with the tools that fit the request (at most 8), and those are in the Bot's tool list from its next step. A tool called by its name runs whether it is listed or not and stays listed; when its call fails and the answer names another tool of the app (Vercel's "Call authorize_team_access …"), that tool is listed too. An Agent keeps the last 30 it found or called, until the host restarts. Smaller apps are looked up as well, largest first, while a request holds more than 128 tools, the most a model API takes. Settings → Apps shows each app's tool count, and says when they are looked up.
- **Approvals** (`plugin/src/host/app-approvals.js`). A Bot asks before it uses a tool of an app, an MCP capability or the GitHub connector. The call waits on a card above the composer, in the Bot's own chat or in the group it works in, that names the Bot, the app, the tool and its arguments, with **Decline**, **Always allow** and **Allow once**. "Always allow" is kept for that tool, for every Bot, in `state.allowedTools`; Settings → Apps lists those tools and can make them ask again. A declined call is not run, and the Bot is told so. Stopping the turn withdraws the card. The Engine Agent's Sessions are not asked here.
- **Links to open.** Some apps finish a sign-in out of band: a tool (Vercel's `authorize_team_access`) answers with a link the user has to open. When a tool named for that (authorize, login, sso, consent, connect, grant …) answers with an https link, the link waits on a card of its own with the whole address, its site set apart, and an **Open link** button that opens it in the system browser. It is never opened by itself. The card goes when the user is done with it, when the app answers an ordinary call again, or after 15 minutes.
- **State.** `state.apps[id]` in `state.json` keeps what is not secret: `{ id, name, url, catalog, auth, header, enabled, issuer, addedAt }`.
- **Secrets.** Keys, OAuth clients and tokens are one JSON value per app in the engine's credential store, under `APMIXBOT_APP_<ID>`. They never go to a Bot's shell, to a model, or to the browser.
- **OAuth** (`plugin/src/host/mcp-oauth.js`) follows the MCP authorization rules: the server's 401 names its protected-resource document (RFC 9728), that names the authorization server (RFC 8414), ApmixBot registers itself there (RFC 7591) unless the user gave a client, and signs in with PKCE. The browser comes back to `http://localhost:47321/oauth/callback`, which the host listens on only while a sign-in is under way. `state` and, where the server supports it, `iss` are checked.
- **Tokens.** An access token is refreshed shortly before it runs out and the app is mounted again with the new one. A refresh the sign-in server turns down sets the app to "sign in again", with the reason on its row; a server that is only unreachable does not. A token that cannot be refreshed asks for a new sign-in when it runs out.
- **Trying again.** An app that did not connect (the computer was offline at the start, the server was away) is tried again by itself: after half a minute, then twice as long each time, up to half an hour. A new app whose sign-in cannot start is not kept, so its form keeps the reason and connecting it again adds no second app.

## The `api/bot` channel

The live part of the `state` answer carries `apps`, from `rt.appsView()`:

```js
{
  available: true,                                   // false: this engine has no credential store or MCP client
  redirect: 'http://localhost:47321/oauth/callback', // for the user's own OAuth client
  apps: [{
    id, name, catalog,        // `catalog`: the catalog entry's id, or null for an app added by its address
    url,                      // origin and path only
    auth,                     // 'oauth' | 'bearer' | 'header' | 'none'
    enabled,
    state,                    // 'off' | 'connecting' | 'ready' | 'sign-in' | 'error'
    error,                    // text, when state is 'error'
    tools, lookedUp,          // when state is 'ready': how many tools its server lists, and whether Bots look them up
    signingIn,                // a browser sign-in is under way
  }],
}
```

| Endpoint | Body | Answer |
|---|---|---|
| `app-connect` | `{ id, key?, clientId?, clientSecret? }` for a catalog entry | the view, plus `signIn: <url>` when the browser must open |
| `app-add` | `{ name?, url, auth: 'auto' \| 'bearer' \| 'header' \| 'none', header?, key?, clientId?, clientSecret? }` | the same |
| `app-sign-in` | `{ id }` | the same (sign in again) |
| `app-enable` | `{ id, enabled }` | the view |
| `app-retry` | `{ id }` | the view |
| `app-remove` | `{ id }` | the view |

| `approval-answer` | `{ id, choice: 'allow' \| 'always' \| 'reject' }`; `always` only for a card that offers it | `true` |
| `app-link-done` | `{ id }` | `true` |
| `allowed-tools-reset` | `{ names? }`: these tools, or every tool, ask again | the team view |

A failure answers as every endpoint does, with the message for the user.

The live `work` part of the `state` answer carries the cards: `approvals` (an app tool's card has `kind: 'app'`, `app`, `tool`, `call`, `detail.code` with the arguments, `always: true`) and `links` (`{ id, app, tool, url, botId, sessionId, roomId?, at }`). The team view carries `allowedTools`, each as `{ name, app, tool }`.

## Limits of this first step

- Tools are for the whole team: there is no switch per Bot or per tool. "Always allow" is per tool, not per app, and holds for every Bot.
- A Bot that works while nobody watches (a scheduled task, work another Bot asked for) waits at its first tool that is not always allowed.
- Many small apps still mean many tools in every request, up to 128.
- The GitHub connector's tools are always listed: it names its own toolsets.
- The `/command` handover and `use_app` of the Android app are not here.
- The catalog leaves out the entries that are other AI products.
