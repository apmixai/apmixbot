# AGENTS.md

Instructions for AI coding agents that work on this repository. Human contributors: see [CONTRIBUTING.md](CONTRIBUTING.md), which has the same rules with more detail.

## What this project is

ApmixBot is a team of long-lived Bots. The repository is one npm workspace with three parts:

- `engine/`: the agent engine: sessions, the agent loop, tools, model routes, settings and the web interface, as `@apmixbot/*` packages (most named `dsh-*`, the engine's internal name, as are its `dsh` command and `DSH_HOME`). It is part of ApmixBot and changes here like any other code.
- `plugin/`: the Bot features, written as an engine plugin (package `apmixbot`).
- `app/`: the desktop app for Windows and macOS. It runs the engine with the plugin in its own profile and its own data folder (`DSH_HOME`).

The Bot team:

- Every Bot is a long-lived identity whose work runs in engine Sessions: one for its own chat, one for each group it is in, and a fresh one when the context fills up (earlier ones stay readable). Every turn runs through the engine's agent loop, tools and model routes.
- The team works together: Bots message each other, share group chats and can see what the other Bots are doing. Each Bot still runs on its own and does not disturb the others.
- Bots have clear, different roles. A Main Bot has the highest rights: it creates, changes and removes other Bots. Other Bots do not get these rights. There can be more than one Main Bot.
- Users customize each Bot (name, role label, instructions, model, character).
- Behavior must be reliable: a Bot acts on evidence, stays inside its goal, and its results can be checked.

## Hard rules

1. **Bot features stay in the plugin.** Build them on the engine's plugin APIs. Change `engine/` only for the engine itself, and keep each change small and tested: its packages are compiled JavaScript, so edit the file the change needs and nothing around it. The engine sends nothing to any vendor: no account sign-in, no built-in model route, no telemetry or analytics. Do not add any back.
2. **No secrets.** Never write, print or commit API keys, tokens, cookies or the contents of a data folder. Use the mock model (`plugin/dev/mock-llm.mjs`) for tests; it needs no key.
3. **Only original material.** Do not copy code, text, icons, logos or graphics from other products or websites. There are two exceptions. Code under a license compatible with Apache 2.0: say where it comes from and add its notice to `NOTICE` (or to `engine/LICENSE` for the engine). The logos of the apps a user connects (`plugin/src/client/app-logos.js`): they are their owners' trademarks, shown only to name the app, and `NOTICE` says so. Keep `NOTICE` and `engine/LICENSE`: the licenses ApmixBot is built under require them.
4. **`client.js` is generated.** Change `plugin/src/client/`, then run `npm run build` and commit both files. Never edit `client.js` by hand.
5. **Do not touch the user's data.** The desktop app keeps its data in its own folder (`~/.apmixbot` by default). Tests and the test bench keep theirs in temporary folders or `.dsh-test-<name>/`. Never point a test at the app's data folder or at an ApmixBot the user runs.
6. **ApmixBot is English and names itself.** All text, in the interface, the docs, the tests and the code, is English. Bots introduce themselves as ApmixBot. Do not name other AI vendors in the product.

## Commands

Install once from the repository root with `npm ci`. Then, in `plugin/`:

```sh
npm run build                          # src/client → client.js
npm test                               # unit tests; also fail if client.js is stale
node scripts/build-client.mjs --check  # client.js matches src/client
npm run lint                           # oxlint
CONTEXT_WINDOW=100000 CHECK_RATIO=0.45 dev/bench.sh smoke 3096 8796 reset && node dev/smoke.mjs smoke 3096   # smoke test
dev/bench.sh smoke 3096 8796 stop
```

In `app/`: `npm test` for the app's unit tests, `npm run pack` for an unpacked app, `npm run check-packed` to start it with the mock model.

A change is done when the plugin's `npm test`, the `--check`, `npm run lint` and the app's `npm test` pass; CI runs them on every pull request. Run the smoke test as well for changes to `plugin/index.js`, `plugin/src/host/` or `engine/`. The test bench (`dev/bench.sh`) needs Linux or macOS. Use a free port for each bench, and stop every bench and process that you started.

## Branches, pull requests and issues

The full workflow is in [CONTRIBUTING.md](CONTRIBUTING.md#how-we-work). The parts that an agent must follow:

- Start work from the latest `dev` on a branch named `fix/<issue>-<name>`, `feat/<issue>-<name>`, `docs/<name>` or `chore/<name>`. Never start a branch name with `dev/`. Open the pull request into `dev`, not `main`; only releases and hotfixes go into `main`.
- Bring a branch up to date with `git merge dev`. Never rebase a pushed branch and never force-push.
- Fill in the pull request template. Link the issue with `Fixes #<number>`; a bug fix names the bug it fixes. Write the user-visible change in the Changelog field, and do not edit `CHANGELOG.md`.
- Before you change behavior, read `docs/vision.md`. A large new feature adds a short design note under `docs/` in the same pull request.
- Do not close an issue without evidence: the pull request or commit that fixed it, the issue it duplicates, or the reason it will not be fixed.

## Layout

- `engine/`: one folder per engine package. The bundles `dsh-base` and `dsh-web-app` list the engine's parts in their `cordis.patch.yml`.
- `plugin/index.js` and `plugin/src/host/`: the server side (roster and store, tools, turns and delivery, groups, conversation parts and the search index, images, the browser bridge, the `api/bot` channel).
- `plugin/src/client/`: the browser side (sidebar, chat, panels, themes, characters, the Bot browser panel).
- `plugin/web-search.js`: the `auto` web-search provider, independent of the Bot team code.
- `plugin/test/`: unit tests and fixtures. `plugin/dev/`: mock model, test bench, smoke test, robot gallery and logo.
- `app/`: the desktop app (Electron main process and window, first-run setup, installer and updates).
- `docker/`: the Docker image.

## Style

- Follow the code around your change. Keep functions small and names plain.
- Write a comment only when the reason is not clear from the code: a hidden constraint, an invariant, a workaround. Do not describe what the code does.
- Commit messages in English, imperative subject, the reason in the body. Keep commits small.
- The person who asked for the change is the commit author. Do not set an AI agent or bot as author or committer, and do not add `Co-authored-by` lines for one.
