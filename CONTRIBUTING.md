# Contributing to ApmixBot

Thank you for helping. This file explains how the team works, how to set up the project, how to test a change and which rules a change must follow. For what ApmixBot does and how users install it, see [README.md](README.md).

## Who can open pull requests

Collaborators of this repository push branches here and open pull requests into `dev` (see [How we work](#how-we-work)). For now, only collaborators can open pull requests. If you are not a collaborator, please open an issue for a bug (see [Report a problem](#report-a-problem)) or use the repository's Discussions for a question or an idea.

## The rules that matter most

1. **Bot features stay in the plugin.** The Bot team is an engine plugin in `plugin/`: build it on the engine's plugin APIs (Cordis services, the plugin client entry, profile patches). The engine in `engine/` is part of ApmixBot; change it only for the engine itself, in small tested steps, since its packages are compiled JavaScript.
2. **Bots run in engine Sessions.** A Bot keeps its identity while its work runs in Sessions: one for its own chat, one for each group, a fresh one when the context fills up. Every turn goes through the engine's agent loop, tools and model routes. Do not add a second agent runtime.
3. **No real secrets anywhere.** Do not commit API keys, tokens, cookies, data folders, logs or screenshots with personal data. The tests and the test bench use a scripted mock model and need no key.
4. **Only original material.** Do not copy code, text, icons, logos or other graphics from other products or websites. There are two exceptions. Code under a license compatible with Apache 2.0: say where it comes from and add its notice to `NOTICE`, or to `engine/LICENSE` for the engine. The logos of the apps a user connects (`plugin/src/client/app-logos.js`): they are their owners' trademarks, shown only to name the app, and `NOTICE` says so.
5. **English, and nothing sent home.** All text is English. ApmixBot has no account and sends no telemetry; it talks only to the model providers the user connects.
6. **Every change is tested.** Run the unit tests and the client check for every change (see [Test a change](#test-a-change)).

## How we work

Anyone on the team can do any kind of work: triage, bug fixes, features, the interface, docs. Only some decisions belong to the maintainer: the direction of the product, these rules, releases and the architecture. Issues and pull requests that need such a decision carry the `maintainer` label; wait for the maintainer's answer before you start on them. What ApmixBot is meant to be is in [docs/vision.md](docs/vision.md).

### Branches

| Branch | What it is | Who merges |
|---|---|---|
| `dev` | Integration branch. All fixes and features go here first | Every collaborator, when CI passes |
| `main` | Released code only. It changes when the maintainer merges `dev` for a release, or merges a hotfix | The maintainer |
| `fix/<issue>-<name>`, `feat/<issue>-<name>`, `docs/<name>`, `chore/<name>` | Your work. Start it from the latest `dev` | — |

- Do not start a branch name with `dev/`. Git cannot create `dev/<name>` while the branch `dev` exists.
- To bring your branch up to date, run `git merge dev` (on a hotfix branch, `git merge main`). Do not rebase a pushed branch and do not force-push.

### Issues and pull requests

1. Give each new issue a type (`bug`, `enhancement`, `documentation`) and a priority (`P0` crash or data loss … `P3` suggestion). Ask for what is missing with `needs-info`; close a duplicate with `duplicate` and a link.
2. Assign an issue to yourself before you start, so that two people do not work on the same thing.
3. Open the pull request into `dev` and fill in the template. Link the issue with `Fixes #<number>`. Write one sentence about what users will notice in the **Changelog** field, or "none"; do not edit `CHANGELOG.md`.
4. When CI passes, merge it with **Create a merge commit**, then delete the branch.
5. Close an issue only with evidence: the pull request or commit that fixed it, the issue it duplicates, or the reason it will not be fixed.

### Merge conflicts

- **`plugin/client.js`**: never resolve it by hand. Resolve the conflicts in `plugin/src/client/`, run `npm run build` in `plugin/` and commit the new `client.js`.
- **`package-lock.json`**: take either side, then run `npm install` at the root and commit the result.

### Releases (maintainer)

1. Set the version with `npm run set-version -- X.Y.Z` in `app/` (the app, the plugin and the lockfile carry the same one) and write the `CHANGELOG.md` section from the Changelog sentences of the merged pull requests.
2. Open a pull request from `dev` into `main` titled `release: vX.Y.Z`, and run the [release checklist](docs/release-checklist.md) on a real Windows machine (and on macOS when the change touches it).
3. Publish a GitHub release `vX.Y.Z` on `main`. The Release workflow checks the version, runs the checks and attaches the installers and `latest.yml`; the installed apps then update themselves. If publishing starts no run, start it by hand: `gh workflow run Release --ref main -f tag=vX.Y.Z`. The release is complete when it lists the Windows setup, `latest.yml` and the two macOS zips.

## Set up

You need Node.js `24`, npm and Git. For the test bench only: Linux or macOS, and pnpm `11`.

```sh
git clone <this repository's address> apmixbot
cd apmixbot
npm ci          # the whole workspace: the engine, the plugin, the app and their tools
```

## Layout

| Path | What it is |
|---|---|
| `engine/` | The agent engine, one folder per `@apmixbot/*` package. The bundles `dsh-base` and `dsh-web-app` list its parts in their `cordis.patch.yml` |
| `plugin/index.js`, `plugin/src/host/` | The server side: Bot roster and store, tools, turns and delivery, group chats, conversation parts and the search index, images, the Bot browser bridge, the `api/bot` channel |
| `plugin/src/client/` | The browser side: sidebar, chat, panels and dialogs, themes, characters, the Bot browser panel |
| `plugin/client.js` | Generated from `src/client/` by `scripts/build-client.mjs`, and committed |
| `plugin/web-search.js` | The `auto` web-search provider. It does not depend on the Bot team code |
| `plugin/cordis.patch.yml` | The profile patch that the plugin brings |
| `plugin/test/`, `plugin/dev/` | Unit tests and fixtures; the mock model, the test bench, the smoke test, the robot gallery and the logo, and a logging pass-through for real models |
| `app/` | The desktop app |
| `docker/` | The Docker image |

## Test a change

Run these in `plugin/`:

```sh
npm run build                          # src/client → client.js
npm test                               # unit tests; they also fail if client.js is stale
node scripts/build-client.mjs --check  # client.js matches src/client
npm run lint                           # oxlint
```

And in `app/`: `npm test`. CI runs the same checks on every pull request, on Linux and Windows.

For a change to the server side (`plugin/index.js`, `plugin/src/host/`) or to `engine/`, also run the smoke test. It starts the mock model and the engine's web server with the plugin, and walks through the main flows (Bots, group chats, conversation parts, condensing, settings). `CONTEXT_WINDOW` and `CHECK_RATIO` give the mock models a small window, so a few long replies reach the check line:

```sh
CONTEXT_WINDOW=100000 CHECK_RATIO=0.45 dev/bench.sh smoke 3096 8796 reset && node dev/smoke.mjs smoke 3096
dev/bench.sh smoke 3096 8796 stop
```

To try ApmixBot by hand, start a bench and open the address that it prints:

```sh
dev/bench.sh dev 3081 8771 reset    # mock model + web server; data in ../.dsh-test-dev
```

The mock model answers a fixed set of English commands, so a bench costs no tokens. The commands are listed at the top of `dev/mock-llm.mjs`. Bench data stays in `.dsh-test-<name>/` next to the plugin folder.

## Write a change

- Keep a change to one subject.
- Do not edit `client.js` by hand. Change `src/client/`, run `npm run build` and commit both.
- In `src/client/`, take colors from the `--bt-*` variables, corner radii from the steps 4, 6, 8, 10, 12, 16, 18, 20, 22, 999px and 50%, and springs from `motion.js`. A unit test checks this. The places written before the test are listed in `test/style-debt.json`; that list only gets shorter. When you remove one, run `node scripts/style-debt.mjs --write` to update it.
- Follow the style of the code around your change. Write a comment only when the reason for the code is not clear from the code itself.
- Write commit messages in English. Use a short subject in the imperative mood ("Keep group replies visible") and explain the reason in the body.
- The author of a commit is the person who made the change. When an AI tool helped, do not add it as an author or with a `Co-authored-by` line.

## Report a problem

When you open an issue, include your operating system, how you run ApmixBot (desktop app or Docker) and its version (Settings → About ApmixBot), what you did, what you expected and what happened (with the exact error text), and the steps that make it happen again. The recent errors are in `logs/diagnostics.jsonl` in ApmixBot's data folder.

ApmixBot removes API keys, tokens, saved secrets and your home folder from that log. Read the text before you post it, and remove personal data from screenshots. For a security problem, do not open a public issue: use **Report a vulnerability** on the repository's **Security** tab.

## License

ApmixBot is licensed under the [Apache License 2.0](LICENSE). When you submit a contribution, you agree that it is licensed under the same license, as section 5 of the license says.
