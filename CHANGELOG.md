# Changelog

ApmixBot's changes, newest first.

## 1.0.0

The first ApmixBot release.

### Added

- Apps: in **Settings** → **Apps** you connect the services you use (their own MCP servers), signed in on the service's own page or with a key, and your Bots work in them as you.
- A Bot asks before it uses a tool of a connected app, an MCP capability or GitHub: a card above the message box with **Decline**, **Always allow** and **Allow once**. **Settings** → **Apps** lists the tools that no longer ask and can make them ask again.
- A link an app gives you to finish a sign-in waits on a card with an **Open link** button.
- An app with many tools no longer slows every reply: a Bot looks its tools up when it needs them.
- The Windows setup puts ApmixBot on the desktop and in the Start menu.
- The app follows new releases by itself: on Windows it downloads a new version and installs it when you restart or quit; on macOS it tells you and opens the download page. Your data stays.
- **Settings** → **About ApmixBot** links to the website, the support address and the X and Telegram accounts.
- Any OpenAI- or Anthropic-compatible model API connects by its endpoint and API key: in Chief's first chat, or in **Settings** → **Models**, which also picks the models each provider serves. Each Bot runs on the model you pick for it.
- A crew of 12 robot characters with LED eyes, antenna lights and new animations; Apex, the red one, is the Main Bot.
- The ApmixBot theme: black and white with a red accent and red user bubbles.
- Asked who they are, Bots answer that they are ApmixBot.
- The agent engine is part of the repository (`engine/`), so ApmixBot builds and runs from this source tree alone.

### Changed

- The name is ApmixBot everywhere: the interface, the window title and icon, the desktop app (its installer, the data folder `~/.apmixbot` and the team folder `~/ApmixBot`) and the Docker image.
- The repository is one npm workspace: `engine/`, `plugin/` and `app/`.
- The interface, the docs and the tests are English only.

### Removed

- Accounts on the ApmixBot admin site, and the Feedback page in Settings.
- Every vendor account, built-in model route, telemetry and product analytics in the engine: ApmixBot sends nothing anywhere but to the model providers you connect.
- The engine's Office conversion, spreadsheet preview, voice input and its other experimental vendor parts.
- The import of a team from another installation, and the engine and plugin updaters that followed outside releases.
