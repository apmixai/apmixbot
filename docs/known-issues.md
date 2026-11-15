# Known issues

## "@Name" shows as a file in a message that is not sent yet

**Where:** your own message while it waits: just after you press Send, or while it waits in the queue for a Bot that is busy.

**What you see:** the engine draws the "@" part of that message as a file reference, with a file icon. In these cases it also cuts the name:

| You type | Shown while waiting |
| --- | --- |
| `@New Bot please check` (a name with a space) | a file "New", then "Bot please check" |
| `@Anvil, check this` (punctuation after the name) | a file "Anvil," |

**What is not affected:** who answers. ApmixBot reads "@Name" by its own rule, so the Bot you named is called. When the message is sent, it shows the Bot's mark and name as usual.

**Tip:** put a space after the name (`@Anvil check this`). Then a name without a space shows as the Bot while it waits, too.

**Why:** the engine draws these waiting rows itself and reads "@" up to the next space.

## Web search fails everywhere after turning off "web-search-auto"

**Where:** every session, Bot chats and normal Agent chats alike, after you turn off the `web-search-auto` row in the sidebar's Plugins page or with `disabled: true` in the profile's `cordis.patch.yml`. Each `web_search` call returns:

```text
Error: configured web provider "auto" is not registered
```

The error code is `WEB_PROVIDER_CONFIGURED_MISSING`.

**Why:** ApmixBot's `cordis.patch.yml` sets the `web` row's `searchProvider` to `auto` whether or not the `web-search-auto` row is on, and the engine does not fall back to another provider when the one it names is missing.

**What to do:** the profile folder is `profiles/apmixbot/` in ApmixBot's data folder (`~/.apmixbot` by default), or `profiles/web/` in the Docker image's `/data`.

1. Quit ApmixBot.
2. Open `cordis.patch.yml` in the profile folder. Next to the row that turns off `web-search-auto`, add a `web` row that names another search provider. This row replaces the whole config of the `web` row, so keep `fetchProvider` in it:

   ```yaml
   - id: web-search-auto
     name: apmixbot/web-search
     disabled: true
   - id: web
     name: '@apmixbot/dsh-web'
     config:
       searchProvider: exa
       fetchProvider: http
   ```

3. Start ApmixBot again.

To check the result in a checkout, run `node_modules/.bin/dsh --profile web --dump-config` with `DSH_HOME` set to the data folder, and look at the `web` row. Another plugin can also set the search provider while the engine runs, after the profile patch. If you turn such a plugin off later, check this setting again.

See also [Web search](../plugin/README.md#web-search) in the plugin README.
