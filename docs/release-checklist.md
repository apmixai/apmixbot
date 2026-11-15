# Release checklist

Run this on a real Windows machine before a release, and on macOS when the release changes the app there. Use fake values for every key you type in; the checks need no real model when the mock model is connected.

You need the installer of the release: the one the Release workflow attaches, or `npm run dist` in `app/` from the release branch.

## Install and first start

| # | Do | Expect |
|---|---|---|
| 1.1 | Install the app on a user account that never had it | It installs without administrator rights, and starts |
| 1.2 | At the first start, keep the default places | The data is in `~/.apmixbot`, the team workspace in `~/ApmixBot` |
| 1.3 | Quit during the first-start questions, then start again | The questions come again; nothing was kept |
| 1.4 | Look at the window title and the icons | They say ApmixBot and show the robot; nothing names another product |

## Models

| # | Do | Expect |
|---|---|---|
| 2.1 | In Chief's first chat, connect a provider by its endpoint and a key | The models of that endpoint can be picked; Chief greets you after the pick |
| 2.2 | Open **Settings** → **Models** | The provider is listed; its key is not shown |
| 2.3 | Give a second Bot another model | Each Bot answers with its own model |

## The team

| # | Do | Expect |
|---|---|---|
| 3.1 | Ask Chief to create a Bot | The Bot appears in the sidebar and introduces itself as ApmixBot when asked who it is |
| 3.2 | Create a group with two Bots and @ one of them | Only the called Bot answers; the admin answers the rest |
| 3.3 | Ask a Bot to remember a fact, then open its memory | The fact is there |
| 3.4 | Move the data folder in **Settings** → **General** | The app restarts on the new folder; the old one stays |

## Update and uninstall

| # | Do | Expect |
|---|---|---|
| 4.1 | Install the new version over the previous one | The team, the chats and the models are still there |
| 4.2 | Uninstall | The program is gone; the data folder stays |

Post the table with the results in the release pull request.
