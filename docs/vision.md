# The vision of ApmixBot

This file says what ApmixBot is meant to be and why. For how to use it, see the [README](../README.md); for how to take part, see [CONTRIBUTING](../CONTRIBUTING.md).

## What ApmixBot is

ApmixBot is a persistent team of Bots. It is open source under the Apache 2.0 license. The user can chat with one Bot, or work with a team with clear roles: one or more Main Bots organize the work, every Bot does its own part and talks to the others, and the user can see at any time who is doing what. Bots keep working over time and have a long-term memory.

## How it is built

| Part | What it is |
|---|---|
| The engine (`engine/`) | Sessions, the agent loop, tools, model routes, settings and the web interface. It is part of ApmixBot and changes with it |
| The `apmixbot` plugin (`plugin/`) | All the Bot features, written as a plugin of the engine |
| The desktop app (`app/`) and the Docker image (`docker/`) | Run the engine with the plugin in their own profile and data folder |

ApmixBot controls its whole stack: the engine, the profile and the interface. Nothing in it depends on another product's account, servers or release schedule.

## Ten core requirements

1. **Independent Bots.** Every Bot runs in its own engine Sessions, and the Bots are independent of each other.
2. **Reliable.** Bots work reliably: they stay aligned with the goal, act on evidence, stay inside their task, and their results can be checked. Bots will also be able to improve themselves (planned).
3. **Memory and persistence.** Bots keep working over time, that is, they have a long-term memory. A Bot can read the other Bots' memories but not change them (only a Main Bot can change another Bot's memory). A Bot manages its own memory, and the user can manage each Bot's memory too. A group chat shares one memory.
4. **Levels of rights.** A Main Bot has the highest rights: it creates and changes other Bots. Other Bots do not have these rights, and only the user deletes a Bot. There can be more than one Main Bot. Every Bot can call on every other Bot.
5. **Group chats.** Group chats are the core form of Bots working together in ApmixBot. Bots in a group call on each other, and a group can have an admin Bot. The admin manages the group, adds and removes members, and by default answers the user's messages.
6. **Working folders.** Each Bot can have its own working folder, and a group chat can set one folder for all its members. A Bot can set its own working folder, so one sentence from the user is enough.
7. **Browser.** Each Bot has its own browser, and the browsers do not affect each other. Importing cookies is planned.
8. **Interface and motion.** ApmixBot has a polished interface with smooth motion.
9. **Any model.** ApmixBot works with any OpenAI- or Anthropic-compatible model API the user connects, and each Bot picks its own model.
10. **Local agents.** ApmixBot can bring local agent CLIs in as Bots that call on each other (planned).

## Principles for trade-offs

- **Correct Bot behavior comes first.** Where an engine mode or limit does not fit Bots, ApmixBot changes it instead of piling up complexity around it.
- **Data stays on the user's computer.** Teams, chats and memory live in ApmixBot's data folder on the user's computer. ApmixBot has no account and sends no telemetry.
- **Done means checked.** Behavior is covered by tests; interface changes are looked at for real.

## Who sets the direction

The maintainer decides the direction of the product, the rules for working together, releases and the architecture. Anyone can do the rest of the work; see [CONTRIBUTING](../CONTRIBUTING.md#how-we-work).
