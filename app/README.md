# ApmixBot desktop app

The Electron app for Windows and macOS. It runs the engine (`../engine`) with the `apmixbot` plugin (`../plugin`) in its own profile `apmixbot`, through `@apmixbot/dsh/profile-boot`, and keeps its data in its own data folder (the engine's `DSH_HOME`). Its window shows the engine's web interface with the plugin.

## Run

The app is a member of the repository's npm workspace, so install from the repository root:

```sh
npm ci                                  # at the repository root
node node_modules/electron/install.js   # at the root, when npm did not download Electron (no node_modules/electron/dist)
cd app
npm start                               # starts the app
```

Unset `ELECTRON_RUN_AS_NODE` before `npm start` if your terminal has it (terminals inside some Electron-based editors do): with it, Electron runs as plain Node and the app does not start.

npm links the engine packages and `apmixbot` from the workspace, so the app always runs the code of this checkout.

| Variable | What it sets | Default |
|---|---|---|
| `APMIXBOT_HOME` | The data location: the engine's `DSH_HOME` for the app. When it is set, the app asks nothing at its first start | The folder chosen at the first start |
| `APMIXBOT_WORKSPACE` | With `APMIXBOT_HOME`: the team workspace | `bot/workspace` in the data location |
| `APMIXBOT_SHELL_DATA` | The app's own data (window, Chromium storage, `locations.json`) | Electron's `userData` (Windows: `%APPDATA%\ApmixBot`; macOS: `~/Library/Application Support/ApmixBot`) |
| `APMIXBOT_UPDATE_URL` | Windows: a folder URL with `latest.yml` and its installer. macOS: a URL returning a JSON list like GitHub's `releases` API; a release counts only when this Mac's zip is attached. Prereleases count only for prerelease installs (see [Updates](#updates)). With `APMIXBOT_HOME`, the app checks only when this is set | None: there is no release feed yet, so it checks nothing |
| `APMIXBOT_PATCH` | One more profile patch over the app's profile, for checks on throwaway folders (such as the mock model as a provider) | None |

## First start

At its first start the app asks, in system dialogs, for the data location (`~/.apmixbot` by default) and the team workspace (`~/ApmixBot`), and keeps the answer in `locations.json` in its own data. Neither folder may be inside the other or inside the program folder.

Both change later in ApmixBot's Settings > General > Locations. The plugin moves the team workspace and tells the app, which writes it into `locations.json`. The data location moves through the app (`src/move-data.mjs`): the new folder must be empty or new and apart from the old data, the team workspace and the program folder. The app stops the Host, copies the data (without the team's lock) into a staging folder beside the new one, renames it to the new folder once it is whole, writes `locations.json` and starts again. A failed or interrupted copy leaves the old location in use and removes the staging folder; the old folder always stays. A run on throwaway folders (`APMIXBOT_HOME`) keeps its data location.

The Host reads model keys from the environment variables a provider names for its key (`apiKeyEnv`), and from `.env` and `.credentials.yaml` in the data location. Settings > Models (and, with no model ready, the first Main Bot's chat) sets up model providers by their endpoint and API key; the providers go into the profile's `cordis.patch.yml` and the keys into `.credentials.yaml`.

## The profile

The Host's profile `apmixbot` is in `profiles/apmixbot` in the data location. It stacks three bundles, and after them the bundles that the user installs:

| Bundle | What it adds |
|---|---|
| `@apmixbot/dsh-base` | The engine's core: models, Sessions, tools, settings, plugin management |
| `@apmixbot/dsh-web-app` | The engine's web interface, which the window shows, and the host services that it and apmixbot use |
| `apmixbot` | The Bot team |

At every start the Host puts these three bundles at the head of the profile's bundle list. Settings for one machine go into the profile's `cordis.patch.yml`.

## Check a change

`npm test` checks the composition of the profile, the data move, the update checks and that every package the app runs on is a dependency (see [Package](#package)).

`scripts/shot.mjs` starts the app on throwaway folders, saves a screenshot of its window, prints the page text, closes the window the way a user does and waits until the app exits. Use the plugin's mock model (`MOCK_PORT=<port> node ../plugin/dev/mock-llm.mjs`):

```sh
APMIXBOT_HOME=<tmp>/home APMIXBOT_SHELL_DATA=<tmp>/shell \
MOCK_URL=http://127.0.0.1:<port>/v1 \
node scripts/shot.mjs <tmp>/shot.png 20
```

Never point `APMIXBOT_HOME` at the data of an app that you use.

## Package

[electron-builder](https://www.electron.build/) packages the app with the settings in `electron-builder.yml`. It finds the workspace root from the lockfile and packs the engine and the plugin from there. Build on the platform that you package for: the native modules (`node-pty`, `sharp`, `koffi`) are taken from `node_modules` as npm installed them, not rebuilt.

```sh
npm run pack           # the app without an installer: dist-pack/win-unpacked/ (Windows), dist-pack/mac*/ (macOS)
npm run dist           # the installer: dist-pack/ApmixBot-<version>-win-x64.exe (Windows), a .zip (macOS)
npm run check-packed   # starts the packaged app on throwaway folders with the mock model, chats once, closes it
```

macOS produces one zip per architecture. Build arm64 on an Apple chip Mac and x64 on an Intel Mac, or under Rosetta with an x64 Node that also ran `npm ci`. Do not cross-build: it packages native modules from `node_modules`. `scripts/before-pack.mjs` stops a build whose architecture is not the one of the Node that runs it. The app is ad-hoc signed so downloaded copies are sealed. It ships as a zip, not a dmg: macOS 26 calls a downloaded unsigned dmg damaged and does not open it. Safari unzips the download; move ApmixBot to Applications. On first open, use System Settings → Privacy & Security → Open Anyway. Do not disable Gatekeeper.

`check-packed` takes another executable as its first argument, and a file for a screenshot of the window as its second. It runs an app that lies inside this checkout from a copy in its throwaway folder: from inside the checkout, Node would find a module that the package left out in the checkout's own `node_modules`.

electron-builder packs only the packages that it finds through `dependencies` and `optionalDependencies`. The engine packages ask for many packages as peers, which npm installs but electron-builder would leave out, so `package.json` lists them as dependencies. `npm test` fails when one is missing and names it.

The Windows installer installs for the current user only, without administrator rights, by default into `%LOCALAPPDATA%\Programs\ApmixBot` (`build/installer.nsh` skips the page that asks for all users or only for the current one). It puts an ApmixBot shortcut on the desktop and in the Start menu. The uninstaller removes the program and keeps the data location and the app's own data. CI builds the Windows installer on every pull request, checks the packaged app, then installs it, checks the installed app and uninstalls it.

## Updates

### By the setup of the new version

A user can always run the setup of a new version over the old one; an app built before it had a release feed (or with `publish: null`) updates only this way. The setup closes ApmixBot when it is open (the app, its Host and the programs it brought), replaces the program, and keeps the desktop shortcut, the data location and all data. Nothing has to be uninstalled first.

To make an update, in `app/`:

```sh
npm run set-version -- 0.2.1   # the new version, in every file that names it; it must be above the current one
npm run dist                   # the setup: dist-pack/ApmixBot-0.2.1-win-x64.exe (run `npm run build` in plugin/ first when src/client changed)
npm run check-packed           # the packaged app starts and answers
npm run check-upgrade -- <the setup of the version before> dist-pack/ApmixBot-0.2.1-win-x64.exe
```

`check-upgrade` (`scripts/check-upgrade.mjs`) makes the update as a user does: it installs the old setup, opens the installed app, installs the new setup over it while it is open, opens the updated app, and uninstalls. The app runs on throwaway folders, but the program is installed for the current user, so the check refuses to run where ApmixBot is installed. Keep the setup of every version you give out: it is the "version before" of the next check.

### By itself

The installed app follows ApmixBot's own GitHub releases: `publish` in `electron-builder.yml` names the repository for Windows, and `RELEASES_URL` in `src/updates.mjs` names the same one for macOS (`npm test` checks that they agree). The repository's releases must be public: the app signs in nowhere. `APMIXBOT_UPDATE_URL` overrides both. With `publish: null` and `RELEASES_URL` `null`, the package carries no `app-update.yml` and the app checks, downloads and offers nothing (`updateFeed` in `src/updates.mjs`).

A new version reaches the installed apps when its GitHub release is published on `main` and the Release workflow has attached the installer, `latest.yml` and the zips:

- On Windows the app updates itself with electron-updater. At its start and every 4 hours it reads `latest.yml` of the newest release, downloads the installer in the background and checks its sha512. A dialog then asks whether to restart now; otherwise the installer runs when the app quits. The checks start before the Host, so that a version whose Host does not start can still update.
- On macOS the app checks the releases at start and every 4 hours and asks once per version, after that release's zip for this Mac is attached. Download opens the release page; the app does not install the update itself.

`scripts/check-update.mjs` checks the update of a packaged app with a local feed:

```sh
npx electron-builder --publish never -c.extraMetadata.version=<next version> -c.directories.output=dist-next -c.publish.provider=generic -c.publish.url=http://127.0.0.1/   # the feed
node scripts/check-update.mjs "dist-pack/win-unpacked/ApmixBot.exe" dist-next --kill
```

On your own machine use `--kill`: without it, the app installs the update as it quits, into `%LOCALAPPDATA%\Programs\ApmixBot`. On macOS, pass the app executable and a version to mock a newer release: `node scripts/check-update.mjs "<app executable>" 99.0.0`.

## Layout

| File | What it does |
|---|---|
| `src/main.mjs` | Main process: one instance, the window, which loads the Host's loopback address, and the data move |
| `src/host-port.mjs` | The Host's port, kept between starts, since the page keeps its storage per address |
| `src/preload.cjs` | Hands ApmixBot's settings the data location and its move. On Windows it marks the page for the frameless window and sends the caption buttons the colors of the surface under them |
| `src/window-frame.mjs`, `src/mica.css` | The frameless Windows window: the caption band, when Mica is available (Windows 11 22H2 and later), and the stylesheet that lets Mica through the sidebar |
| `src/host-process.mjs` | Starts the Host in Electron's Node mode and owns its exit |
| `src/host.mjs` | The Host: boots the profile with `runProfile()` and reports the launch URL and the page injections |
| `src/profile.mjs` | The app's profile: its bundles, and its creation and update |
| `src/first-run.mjs` | The first start's dialogs (the two folders) and the texts of the data move |
| `src/move-data.mjs`, `src/copy-tree.mjs`, `src/team-lock.mjs` | The move of the data location: which folders can take it, the copy through a staging folder, and whether a running engine holds the team |
| `src/updates.mjs` | The Windows installer updates and macOS release-page checks |
| `test/` | `npm test` |
| `assets/` | The app icon: `icon.svg`, `icon.png` (1024 px) and `icon.ico` (Windows, 16 to 256 px). `npm run icon` (`scripts/icon.mjs`) draws them again from the Main Bot's Apex robot in `../plugin` |
| `electron-builder.yml`, `build/` | The package and the installer: app identity, files, icons, the Windows installer |
| `scripts/check-packed.mjs`, `scripts/mock-patch.mjs` | `npm run check-packed`: the check of a packaged app, with the mock model as a provider |
| `scripts/check-update.mjs` | The check of a packaged app's update from a Windows feed folder or a macOS release |
| `scripts/check-upgrade.mjs` | `npm run check-upgrade`: the check of an update by setup, the new one installed over the old one while the app is open |
| `scripts/set-version.mjs` | `npm run set-version`: the version of a new release, in the app, the plugin and the lockfile |

The Host installs plugins with the app's own pnpm (`node_modules/pnpm`). `src/host.mjs` follows the desktop host of the engine's original project (MIT); see [NOTICE](../NOTICE).
