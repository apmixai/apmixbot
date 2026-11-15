# Loadable ApmixBot plugin packages

This file is GENERATED from workspace manifests (`scripts/gen-plugin-packages.ts`) and verified fresh by `pnpm run verify-plugin-packages` (part of `doc-sync`); do not edit it by hand.

Every package below exports a Cordis plugin that a bundle patch can name in a Loader row. `Config` marks packages whose row accepts a `config` mapping; query `Config.listConfigs` through `cordis_inspect_query` (filter by `name`, then query the `entry` id) for the mounted schema. Packages under `experimental` are pre-stable.

## acp

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-acp` | yes | Automation-only Agent Client Protocol server for driving ApmixBot agents over JSON-RPC stdio |

## api

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-api-gateway` | yes | Typert Remote Host dispatcher and Client API endpoint |
| `@apmixbot/dsh-api-job-controller` | yes | Job Remote observation stream and the reference-counted client job-output service |
| `@apmixbot/dsh-api-remote-access` | no | Method-level Remote access control for non-owner Peers and the per-Peer access snapshot |
| `@apmixbot/dsh-api-remotes` | no | Remote BFF assembly for application-selected Host capabilities |
| `@apmixbot/dsh-api-session-controller` | yes | Session Remote commands, cold reads, and live control transport |
| `@apmixbot/dsh-api-settings-controller` | yes | Remote owner for the configuration surfaces over the settings-domain seams |
| `@apmixbot/dsh-api-terminal-controller` | yes | Session-owned interactive terminals with shell discovery, screen recovery and typed Remote control |
| `@apmixbot/dsh-api-workspace-controller` | yes | Workspace Remote commands and reconnect-safe state transport |
| `@apmixbot/dsh-api-workspace-files` | yes | Workspace file service and Client resource provider: bounded reads, directory listing, and live metadata over the workspaceFiles Remote namespace |

## attachment

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-attachment-local` | yes | Private content-addressed DSH_HOME attachment storage |

## boot

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-config-editor` | no | Persist plugin configuration through profile patches and Loader reconciliation |
| `@apmixbot/dsh-hmr` | yes | Coordinated module and profile configuration hot reload |
| `@apmixbot/dsh-plugin-manager` | yes | Current-profile plugin and bundle management shared by dsh CLI, Web and agent tools |
| `@apmixbot/dsh-plugin-market` | yes | Configured plugin market indexes for the Web Discover page and the plugin_market agent tool |

## browser-use

| Package | Config | Description |
|---|---|---|

## bundle

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-acp-app` | no | The dsh ACP profile bundle: automation-only JSON-RPC stdio and process lifecycle over dsh-base |
| `@apmixbot/dsh-headless` | yes | The dsh one-shot bundle: a direct core Agent/Session runner over dsh-base with no Host, HTTP, or browser layer |
| `@apmixbot/dsh-sdk-app` | yes | The dsh SDK profile bundle: stdio JSON-RPC serving and process lifecycle over dsh-base |
| `@apmixbot/dsh-web-app` | yes | The dsh browser-surface bundle: the web patch layer over dsh-base plus the runtime glue plugin (frontend dist serving, bash runtime variables, URL line) |

## client

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-client-connection` | yes | Authenticated RPC transport and generation lifecycle |
| `@apmixbot/dsh-client-file-upload` | no | Agent-scoped browser file upload, streaming intake, and staged receipt service |
| `@apmixbot/dsh-client-hmr` | yes | Web client graph synchronization and rebuilt-bundle reload transport |
| `@apmixbot/dsh-client-locale` | no | Locale plugin: Host-backed preference, extensible language catalog, browser fallback, and typed built-in dictionaries |
| `@apmixbot/dsh-client-modules` | no | Client module system, dual-face: node half composes the __DSH_BOOT__ entry graph (incremental dsh.client scan, bundle route, index tap, webPlugins service); browser half is the lazy-CJS module table the vendored cordis Loader consumes as its internal seam |
| `@apmixbot/dsh-client-resources` | no | Unified client resource model: protocol-registered providers turn URL addresses into live values, consumed through the useResource global standard hook |
| `@apmixbot/dsh-client-shortcuts` | yes | Application keyboard command registry and physical-key routing |
| `@apmixbot/dsh-client-ui-agent-preset` | no | Agent-preset surfaces: the default for later sessions, this session's seat, and the composition editor |
| `@apmixbot/dsh-client-ui-approval` | no | Approval composer takeover over the scoped Remote Event waterfall |
| `@apmixbot/dsh-client-ui-attachment` | no | Dynamic attachment presentation plugin for conversation input, message-image, and trajectory image slots |
| `@apmixbot/dsh-client-ui-chat` | no | Chat Conversation target, node definitions, renderers, and details surface |
| `@apmixbot/dsh-client-ui-commands` | no | Client command surface: global directory cache, '/' source, three command UI kinds, popupSelect registry |
| `@apmixbot/dsh-client-ui-conversation` | no | Target-neutral Conversation assembly, shell, composer, queue, and view navigation |
| `@apmixbot/dsh-client-ui-deliverables` | no | Changed-files card with per-file comparison tabs, delivery cards, and clickable final-response file references for Web |
| `@apmixbot/dsh-client-ui-directory-picker-browse` | no | In-app directory browsing surface: the workspace directory-flow owner rendering the host's listing and creation primitives |
| `@apmixbot/dsh-client-ui-directory-picker-native` | no | Native directory-picker surface: the renderless workspace directory-flow occupant driving the local Desktop or Host OS chooser |
| `@apmixbot/dsh-client-ui-goal` | no | Session goal surface: GoalBar docked above the composer, read from the goal session projection |
| `@apmixbot/dsh-client-ui-input-trigger` | no | Input trigger pipeline: '/' and '@' detection, candidate menu, pick routing to registered sources |
| `@apmixbot/dsh-client-ui-jobs` | no | Session-header background-job list with on-demand streaming record panels |
| `@apmixbot/dsh-client-ui-layout` | no | Shell plugin: three-column AppFrame with drag handles, ctx.layout viewing-state service (navigation + panels) |
| `@apmixbot/dsh-client-ui-message-feedback` | no | The Web feedback surface: per-message Like/Dislike in the assistant-message action strip and the feedback dialog behind both ratings and /feedback, backed by the messageFeedback and sessionFeedback Host Remotes |
| `@apmixbot/dsh-client-ui-model-selection` | no | Model selection over the shared model catalog, Session projection, and session.selectModel |
| `@apmixbot/dsh-client-ui-open-in-app` | no | Web "Open In..." controls: the Session-header split button opening the workspace directory in an installed application, and the document preview's default-application controls for one file |
| `@apmixbot/dsh-client-ui-permission-presets` | no | Permission surfaces: a new-session default in General settings and a current-session /permission popup over the permissions projection |
| `@apmixbot/dsh-client-ui-plan` | no | Plan mode controls, persistent transcript plan cards, and sidebar Markdown previews |
| `@apmixbot/dsh-client-ui-plugin-manager` | yes | Plugin management for the dsh web client: the sidebar Plugins panel installs, enables, disables, retries, and composes installed plugin packages |
| `@apmixbot/dsh-client-ui-plugin-market` | no | Discover tab of the dsh web Plugins page: browse configured plugin market indexes and install their bundles |
| `@apmixbot/dsh-client-ui-reference` | no | Unified Web @file and @session reference source |
| `@apmixbot/dsh-client-ui-renderer` | no | Browser UI renderer: React slot bindings, ctx.uiRenderer, and the assembled application root |
| `@apmixbot/dsh-client-ui-schedule` | no | Host task management page and Session reminder catalog |
| `@apmixbot/dsh-client-ui-secret-mask` | no | Web display masking for recognized credentials in sent user text |
| `@apmixbot/dsh-client-ui-session` | no | Session Controller adapter for React and session-scoped slots |
| `@apmixbot/dsh-client-ui-settings` | no | Settings domain base plugin: shared configuration forms and the canonical settings slot-type contract |
| `@apmixbot/dsh-client-ui-settings-agent-loop` | no | Settings page of the agent loop on the dsh web client's Plugins page: the parallel tool-call cap of the agent-loop namespace |
| `@apmixbot/dsh-client-ui-settings-general` | no | Settings ownerless-copy and product onboarding plugin: the General section, shell trigger/header chrome content, settings dictionaries, and the versioned welcome notice |
| `@apmixbot/dsh-client-ui-settings-models` | yes | Models settings and shared product-onboarding dialogs over existing settings and credential joins |
| `@apmixbot/dsh-client-ui-settings-plugin-inventory` | no | Read-only Cordis Loader inventory tab in Web Plugins settings |
| `@apmixbot/dsh-client-ui-settings-plugins` | no | Built-in plugins settings section for the dsh web client: the Settings navigation entry and the tab chrome feature-owned tabs register into |
| `@apmixbot/dsh-client-ui-settings-shell` | no | Settings page of the shell executor on the dsh web client's Plugins page: the command timeout and the per-stream output cap of the shell namespace |
| `@apmixbot/dsh-client-ui-settings-subagent` | no | Settings page of Subagent delegation on the dsh web client's Plugins page: recursion depth, parallel capacity, and the models agents may choose for subagents |
| `@apmixbot/dsh-client-ui-shortcuts` | no | Keyboard shortcut reference, recording, and local preference editing |
| `@apmixbot/dsh-client-ui-sidebar` | no | Sidebar plugin: session multi-level tree, search, grouping, state dots |
| `@apmixbot/dsh-client-ui-sidebar-browser` | no | Sandboxed Web browser tabs for the right Sidebar |
| `@apmixbot/dsh-client-ui-sidebar-documentpreview` | yes | Extensible Sidebar previews for Office documents, spreadsheets, Markdown, code, images, PDF, HTML, and plain text |
| `@apmixbot/dsh-client-ui-sidebar-files` | no | Workspace file tree tab type for the right Sidebar: lazy directory listing over the workspaceFiles Remote namespace, opening files into the Sidebar |
| `@apmixbot/dsh-client-ui-sidebar-right` | no | Right Sidebar: the docking surface's session-bound state, its panel and header expand control, and the navigation service over it |
| `@apmixbot/dsh-client-ui-sidebar-terminal` | no | Interactive shell tabs for the right Sidebar |
| `@apmixbot/dsh-client-ui-skill` | no | Web skill references and the dedicated skill tool row |
| `@apmixbot/dsh-client-ui-subagent` | no | Subagent conversation catalog, continuation routing UI, and '@' reference source |
| `@apmixbot/dsh-client-ui-theme` | yes | Theme plugin: Host bootstrap for the pre-plugin palette; DOM-free ThemeRuntime for light/dark/system state; --dsw-* token styles and Appearance settings row |
| `@apmixbot/dsh-client-ui-tool` | no | Client Tool call-tree renderer and keyed per-tool presentation slot |
| `@apmixbot/dsh-client-ui-trajectory` | no | Trajectory event ledger with an interactive timing overview: pure-consumer plugin registering into the conversation ViewMap (no service) |
| `@apmixbot/dsh-client-ui-user-questions` | no | Web ask_user_question composer takeover and plan-review presentation UI |
| `@apmixbot/dsh-client-ui-workflow-run` | no | Durable workflow-run Conversation Node and nested member disclosure for dsh web |
| `@apmixbot/dsh-client-ui-workspace` | no | Workspace picker plugin: one WorkspacePicker registered into the sidebar and empty-state workspace slots |

## compaction

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-command-compact` | no | Human-facing slash command for explicit session compaction |
| `@apmixbot/dsh-compaction-basic` | yes | Token-meter-driven compaction policy and LLM summarization backend for the ApmixBot |
| `@apmixbot/dsh-compaction-image-offload` | no | Durable image offload for image-capable routes: replace over-budget request images with placeholders and retry |
| `@apmixbot/dsh-compaction-tool-result-pruner` | yes | Replay-safe model-free head/middle/tail pruning for tool-result surface nodes |

## computer-use

| Package | Config | Description |
|---|---|---|

## context

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-agent-instructions` | yes | Workspace context loader for AGENTS.md/CLAUDE.md instruction files |
| `@apmixbot/dsh-file-reference-local` | yes | Local-filesystem ctx.fileReferences provider with bounded fuzzy indexes |
| `@apmixbot/dsh-harness-dev-context` | no | Model context naming the ApmixBot checkout and Web GUI URL without letting either change the system prompt |
| `@apmixbot/dsh-session-reference` | yes | Cross-session snapshot references and durable untrusted model context (ctx.sessionReferenceResolver) |
| `@apmixbot/dsh-time-context` | yes | Durable per-step context with the current time and elapsed time |
| `@apmixbot/dsh-tmux-context` | yes | Opt-in durable per-step context with this agent's tmux pane and window location |

## core

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-agent` | no | Agent interface, registry, initiator scope, and event vocabulary for the ApmixBot |
| `@apmixbot/dsh-agent-default-model` | yes | Default model selection shared by Agent entry points |
| `@apmixbot/dsh-agent-loop` | yes | The concrete agent loop plugin for the ApmixBot |
| `@apmixbot/dsh-agent-tool-presentation` | yes | Agent-plane presentation selector: composes one agent's tools as PTC mode or native tool calls |
| `@apmixbot/dsh-session` | no | Event-sourced session store for the ApmixBot |
| `@apmixbot/dsh-system-prompt` | yes | System prompt assembly registry for the ApmixBot |
| `@apmixbot/dsh-tools` | yes | Tool registry and execution pipeline for the ApmixBot |

## credentials

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-authorization` | no | Authorization seam (ctx.authorization): plugin-owned flows that obtain a credential through a conversation with the human |
| `@apmixbot/dsh-credentials-local` | yes | File-backed credentials provider ($DSH_HOME/.env under the live process environment) for the ApmixBot |

## deliverables

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-tool-present` | yes | Explicit workspace file delivery declarations for the ApmixBot |
| `@apmixbot/dsh-workspace-changes` | yes | Per-turn workspace file changes recorded from git working-tree snapshots and whole-file captures, with per-file comparisons, for the ApmixBot |

## document

| Package | Config | Description |
|---|---|---|

## experimental

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-experimental-agent-team` | yes | Implicit-root Agent Teams roster, direct peer messaging, and shared task DAG |
| `@apmixbot/dsh-experimental-auto-review` | no | Per-tool LLM authorization review for the ApmixBot Auto permission preset |
| `@apmixbot/dsh-experimental-client-ui-agent-team` | no | Web Agent Teams roster, task board, and teammate navigation |
| `@apmixbot/dsh-experimental-tool-agent-team` | yes | Scoped model-facing Agent Teams tools over ctx.agentTeams |
| `@apmixbot/dsh-experimental-tool-worktree` | no | Model tool that creates and enters a new Git worktree |
| `@apmixbot/dsh-experimental-worktree` | yes | Creates a named Git worktree and changes the calling Session working directory |
| `@apmixbot/dsh-session-title-all-prompts-llm` | yes | All-user-messages LLM provider plugin for ApmixBot session titles |
| `@apmixbot/dsh-tool-ralph` | yes | Model-facing fresh-agent Ralph loop over the workflow and subagent seams |
| `@apmixbot/dsh-tool-session-query` | yes | Workspace-authorized model-facing session history search, trace, and event read tools |
| `@apmixbot/dsh-tool-terminal` | yes | Six model-facing persistent PTY tools with owner isolation and generic background-job integration |

## extensions

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-client-ui-cordis` | no | Cordis dynamic-plugin definition card: the keyed cordis_define tool row with its run/stop switch |
| `@apmixbot/dsh-cordis-client-runner` | no | Browser half of dynamic dual-half plugin packages: event subscription, closure evaluation, guard facade, and loader entries |
| `@apmixbot/dsh-cordis-host-runner` | yes | Dynamic package definition registry, host-half sandbox lifecycle, and invoke handler table for model-mounted dual-half packages |
| `@apmixbot/dsh-tool-cordis` | no | Read-only runtime API inspection for ApmixBot plugin development |

## feedback

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-command-feedback` | no | Log-only session feedback: the record event, the sessionFeedback Host Remote, and the human-facing slash command |
| `@apmixbot/dsh-message-feedback` | yes | Canonical Session-log ratings and notes for finalized assistant messages |

## fs

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-fs-local` | yes | Local-filesystem implementation of the ApmixBot filesystem seam (ctx.fs) |
| `@apmixbot/dsh-fs-observation-policy` | no | File-context policy plugin for the ApmixBot — observed-state, read-before-edit, and version-guarded write/edit added over the ctx.fs provider seam through the fs/* event gate (no service API) |
| `@apmixbot/dsh-fs-sandbox` | yes | Sandbox-enforcing implementation of the ApmixBot filesystem seam: fences write/edit by the per-call sandbox mode (read-only denies mutation, workspace-write contains it to the workspace + temp roots) while reads pass through |
| `@apmixbot/dsh-tool-fs` | yes | Model-facing filesystem tools (read, write, edit) over the ApmixBot filesystem seam (ctx.fs) |
| `@apmixbot/dsh-tool-fs-search` | yes | Model-facing filesystem discovery tools (glob, grep) backed by the packaged ripgrep binary (@vscode/ripgrep) |
| `@apmixbot/dsh-tool-str-replace-editor` | yes | Model-facing view, create, literal replace, and line insert tool over the ApmixBot filesystem service |

## goal

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-command-goal` | no | Human-facing slash command for persisted same-session goals |
| `@apmixbot/dsh-goal` | yes | Event-sourced same-session goal state and lifecycle service for the ApmixBot |
| `@apmixbot/dsh-goal-round-driver` | no | Race-fenced same-session goal-round driver |
| `@apmixbot/dsh-tool-goal` | yes | Model-facing same-session goal tools with execution-time authority checks |

## guard

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-repeat-tool-reminder` | yes | Repeat-tool-call guard plugin: advisory reminders when an agent loops on identical tool calls |
| `@apmixbot/dsh-tool-call-timeout-policy` | no | Tool-call timeout policy: a tools/execute wrapper that arms a per-tool deadline on exec.signal and returns TOOL_TIMEOUT when it wins |

## host

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-host-directory-picker-auto` | no | Adaptive chooser of the directory-picker seam: resolves the host situation at boot and mounts the native or browse backend for the ApmixBot web GUI host |
| `@apmixbot/dsh-host-directory-picker-browse` | yes | In-app browsing backend of the directory-picker seam (listing/creation primitives over the host filesystem) |
| `@apmixbot/dsh-host-directory-picker-native` | no | Native-OS-chooser backend of the directory-picker seam for the ApmixBot web GUI host |
| `@apmixbot/dsh-host-frontend-static` | yes | SPA dist server for the Web shell: owns the webserver fallback seat, serving explicit index entries and static assets with traversal rejection and 404 misses |
| `@apmixbot/dsh-host-open-in-app` | yes | Host half of open-in-app: resolved application catalog, icons, and the launch endpoint as three webServer routes |
| `@apmixbot/dsh-host-plugin-inventory` | no | Read-only Remote projection of current Cordis Loader plugin state |
| `@apmixbot/dsh-host-webserver` | yes | Web route-registration plugin: HTTP and upgrade routes, index transform taps, and static dist fallback; knows no harness concepts |

## interaction

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-commands` | no | Plugin-owned human command registry for ApmixBot UIs |
| `@apmixbot/dsh-permission-presets` | yes | User-facing permission presets (ctx.permissionPresets) for the ApmixBot: one product-level Permissions select bundling the sandbox-mode and approval-policy knobs, written through to their own session events |
| `@apmixbot/dsh-tool-ask-user` | yes | Model-facing ask_user_question tool over the ctx.userQuestions seam |
| `@apmixbot/dsh-user-approval` | yes | User-approval seam (ctx.approval) for the ApmixBot: one-shot permission decisions dispatched to composed answerers over the approval/request waterfall, fail-closed by default |
| `@apmixbot/dsh-user-questions` | no | Abstract user-questions seam (ctx.userQuestions) for asking the human during agent runs |

## jobs

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-jobs-local` | yes | Process-local implementation of the ApmixBot background job registry seam |
| `@apmixbot/dsh-tool-jobs` | yes | Model-facing background job control tools (job_output, job_list, job_kill) over the ctx.jobs registry |

## llm

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-llm` | no | Provider-neutral LLM service interface for the ApmixBot |
| `@apmixbot/dsh-llm-pi-ai` | yes | pi-ai-backed Vendor adapter for the ApmixBot LLM seam (design-verification twin of dsh-llm-vendor) |
| `@apmixbot/dsh-llm-retry` | yes | Provider-routed LLM request retry policy for the ApmixBot |
| `@apmixbot/dsh-token-meter` | yes | Replay-aware token measurement service (ctx.tokenMeter) for the ApmixBot |

## lsp

| Package | Config | Description |
|---|---|---|

## mcp

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-mcp-client` | yes | MCP client bridge: connects to MCP servers and registers their tools on ctx.tools |
| `@apmixbot/dsh-mcp-resources` | no | Scoped MCP resource discovery and reading through shared model tools |

## plan

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-plan-mode` | yes | Logged per-agent plan mode with deployment guidance, a direct slash command, and a user-reviewed exit |

## preset

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-agent-preset` | yes | Declare an Agent capability composition in Cordis YAML |
| `@apmixbot/dsh-agent-preset-registry` | yes | Declarative Agent preset registry and profile-backed editing |
| `@apmixbot/dsh-persona` | yes | Composition-authored deployment persona section for the ApmixBot |

## ptc-runtime

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-ptc-runtime-node` | yes | Node PTC execution with per-call sandboxed processes or in-memory REPL state |

## sandbox

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-sandbox-local` | yes | Local process-sandbox backends for the ApmixBot sandbox seam: bwrap, the npm-distributed landlock-run launcher, macOS Seatbelt, or the Windows ACL restricted-token runner — functionally probed, fail-closed |
| `@apmixbot/dsh-sandbox-policy` | yes | Per-call sandbox policy resolver and current model context: deployment fallbacks plus each session's mode and workspace root, shared by every enforcing capability family |

## schedule

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-schedule` | yes | Host-wide durable reminders with shared management and original-Session delivery |
| `@apmixbot/dsh-tool-schedule` | no | Model-facing reminder management tools (schedule_create, schedule_list, schedule_update, schedule_delete) over the Host ctx.schedule service |

## sdk

| Package | Config | Description |
|---|---|---|

## session

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-session-checkpoint-policy` | no | Semantic session durability checkpoints before model requests and tool side effects |
| `@apmixbot/dsh-session-persistence-jsonl` | yes | JSONL durable session persistence backend for the ApmixBot |
| `@apmixbot/dsh-session-projection` | no | Session-projection seam: the merge-extensible projection type table, the provider contract, and the ctx.sessionProjections registry serving whole current values of log-derived per-session state |
| `@apmixbot/dsh-session-projection-cache` | yes | Persisted projection cache (ctx.sessionProjectionCache): durable per-session checkpoint records on the session_projcache storage domain (per-record layout), throttled write-behind, and the cached listing read |
| `@apmixbot/dsh-session-stats` | no | Whole-log conversation counts and wall times projection (sessionStats) for the ApmixBot |
| `@apmixbot/dsh-session-title` | yes | Log-backed session title service and provider registry for the ApmixBot |
| `@apmixbot/dsh-session-title-first-prompt-llm` | yes | First-message LLM provider plugin for ApmixBot session titles |
| `@apmixbot/dsh-session-turn-outline` | no | Whole-log turn outline projection (turnOutline) for the ApmixBot |
| `@apmixbot/dsh-tool-working-directory` | no | Read and change the active Session working directory |
| `@apmixbot/dsh-working-directory` | yes | Session working directories with durable changes and model context |

## session-query

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-session-log-export` | yes | Web Session-log export command and shared download dialog |
| `@apmixbot/dsh-session-query-sqlite` | yes | Concrete ctx.sessionQuery backend with SQLite FTS5 search |

## settings

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-settings` | no | Abstract user-settings seam (ctx.settings) for the ApmixBot |

## shell

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-bash-local` | yes | Local-subprocess implementation of the ApmixBot bash executor seam |
| `@apmixbot/dsh-bash-sandbox` | yes | Sandbox-consuming implementation of the ApmixBot bash executor seam (confines every command via ctx.sandbox, reports denial/enforcement result facts) |
| `@apmixbot/dsh-pwsh-local` | yes | Local PowerShell implementation of the ApmixBot bash executor seam |
| `@apmixbot/dsh-pwsh-sandbox` | yes | Sandbox-consuming implementation of the ApmixBot PowerShell executor seam (confines every command via ctx.sandbox, reports denial/enforcement result facts) |
| `@apmixbot/dsh-shell-env` | yes | Tool-independent managed DSH_* shell environment registry |
| `@apmixbot/dsh-tool-bash` | yes | Model-facing bash tool with optional generic background-job and sandbox-escalation support |
| `@apmixbot/dsh-tool-bash-persistent` | yes | Model-facing owner-scoped persistent Bash tool backed by the ApmixBot PTY service |
| `@apmixbot/dsh-tool-pwsh` | yes | Model-facing pwsh tool over the bash executor seam |
| `@apmixbot/dsh-tool-pwsh-persistent` | yes | Model-facing owner-scoped persistent PowerShell tool backed by the ApmixBot PTY service |

## skill

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-skill` | yes | Agent skill provider registry for the ApmixBot |
| `@apmixbot/dsh-skill-filesystem` | yes | Local filesystem skill provider for the ApmixBot |
| `@apmixbot/dsh-tool-skill` | yes | Model-facing skill loading tool for the ApmixBot |
| `@apmixbot/dsh-tool-workspace-dependencies` | yes | The load_workspace_dependencies tool: absolute paths into a bundled Python, Node.js, and pnpm payload |

## spill

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-spill-local` | yes | Local-filesystem implementation of the ApmixBot spill storage seam (private session-scoped files) |
| `@apmixbot/dsh-spill-policy` | yes | Token-budgeted tool-result retention with recoverable text and image paths |

## ssh

| Package | Config | Description |
|---|---|---|

## storage

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-storage` | no | Storage hub (ctx.storage): named backend registry plus mounted data-form facilities for the ApmixBot |
| `@apmixbot/dsh-storage-domain` | yes | Domain data form (ctx.storage.domain): schema-validated, event-emitting KV domains over storage backends for the ApmixBot |
| `@apmixbot/dsh-storage-json` | yes | JSON file KV storage backend for the ApmixBot storage hub |

## subagent

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-subagent` | yes | Abstract subagent seam (ctx.subagents): named-provider registry for delegating to child agents |
| `@apmixbot/dsh-subagent-fork-in-process` | yes | In-process fork subagent backend: runs a child agent seeded with a prefix of the parent's log |
| `@apmixbot/dsh-subagent-spawn-in-process` | yes | In-process spawn subagent backend: runs a fresh child agent on ctx.agents |
| `@apmixbot/dsh-tool-subagent` | yes | Model-facing subagent delegation tool over the ctx.subagents seam |
| `@apmixbot/dsh-tool-subagent-control` | no | Globally named send_message, interrupt_agent, and list_agents tools over ctx.subagents continuations |

## subprocess

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-subprocess-local` | no | Local-subprocess implementation of the ApmixBot subprocess seam |

## telemetry

| Package | Config | Description |
|---|---|---|

## terminal

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-terminal` | no | Persistent PTY session seam for the ApmixBot — owner-scoped ids, backend registry, interactive sends, reads, signals, and awaited cleanup |
| `@apmixbot/dsh-terminal-bash` | yes | Persistent shell PTY backend over the ApmixBot subprocess terminal primitive |

## test-support

| Package | Config | Description |
|---|---|---|

## todo

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-tool-todo` | yes | Model-facing todo_write tool over the ApmixBot event-sourced session log |

## typert

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-typert-loader` | yes | Loader integration for generated Typert package contributions |

## web

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-tool-web` | yes | Model-facing web tools (web_search, web_fetch) over the ApmixBot web capability seam (ctx.web) |
| `@apmixbot/dsh-web` | yes | Abstract web access capability seam (ctx.web) for the ApmixBot — search/fetch provider registry, registration-order-independent selection, request/result vocabulary, and the WebError taxonomy |
| `@apmixbot/dsh-web-fetch-http` | yes | Anonymous public HTTP(S) fetch provider for the ApmixBot web capability seam (ctx.web) |

## workflow

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-tool-workflow` | yes | Model-facing workflow tool: run a JavaScript orchestration script over ctx.workflowEngine |
| `@apmixbot/dsh-workflow-ptc` | yes | Workflow orchestration in the shared sandboxed Node PTC runtime |

## workspace

| Package | Config | Description |
|---|---|---|
| `@apmixbot/dsh-workspace` | no | Workspace entity registry (ctx.workspaceRegistry): durable workspace records with validated session attachment over the domain data form for the ApmixBot |
