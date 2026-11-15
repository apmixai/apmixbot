// Scripted Anthropic-Messages-compatible mock that drives the Bot team flows
// (Main Bot setup, create_bot, message_bot round trips, group chat relay, questions)
// without a real model. Usage: node dev/mock-llm.mjs, then connect it as a custom provider: its address, Anthropic Messages, any key.
//
// Group turns read only the "This round so far" section of the prompt, so counting goes
// wrong if the round and older messages are not kept apart. Usage is estimated from the
// request size (about 3 characters per token, 90% cached), so context tables and the
// switch lines see real growth. The log records hashes of the system prompt and tools, to
// confirm that group Sessions share the private chat's prefix, and the Session each
// request names (`session`, from the adapter's session header), since some routes
// require one.
//
// Environment: MOCK_PORT, MOCK_LOG, MOCK_DELAY_MS, MOCK_JITTER_MS (random extra latency),
// MOCK_LOG_CHARS (prompt length kept per log entry), MOCK_SUMMARY_DELAY_MS (handoff notes
// and backend compaction only), MOCK_NATIVE_SEARCH=off (ignore web_search_* tools and
// answer like an endpoint without search), MOCK_REJECT_IMAGES=1 (reject requests with images).
//
// Commands to a Bot:
//   make group NAME: A, B · post[ report] NAME: MESSAGE · edit group NAME notice|admin|mode|add|kick: VALUE · delete group NAME
//   read group NAME (read_group_chat) · relay NAME: MESSAGE, also over several lines (message_bot) · search: QUERY1 | QUERY2 (web_search)
//   cd PATH (working_directory with cd)
//   interrupt NAME: MESSAGE (message_bot when "now") · queue NAME: MESSAGE (message_bot when "queue") · halt NAME: REASON (stop_bot)
//   In a message from a Bot: relay NAME: MESSAGE (hands it on with message_bot) · slowly N (answers after N seconds)
//   long N (N×1000 characters) · long task N [K] (N steps of K×1000, default 4)
//   search chat WORD [WORD…] · anchor part N #INDEX · read part N (read_own_chat)
//   context has WORD (searches the context except the last message) · overflow (fake overflow, 400)
//   bad key (fake rejected key, 401; also as the text of relay, so the receiving Bot fails)
//   card K (K×1000 characters, then a question card) · note mode cut-once|gap-once|cut-always|gap-always|fail|normal
//   remember[@TOPIC] FACT · team remember FACT (remember) · forget FACT (forget) · recall [WORD] (recall)
//   view options (options card, waits) · view form (form card, waits) · view display (display-only
//   stack) · big view (display-only, just under the byte limit)
//   capabilities [WORD] (names the mcp__ tools and catalog skills that contain WORD; also in a group)
//   find tools APP: QUERY (app_tools) · call tool mcp__SERVER__TOOL: TEXT (calls it with that text, listed or not)
//   A message with a file (a long Bot message as a file, a file the user sent): the Bot
//   reads the saved path, then says how many lines it read and how the file ends.
// Memory panel: a summary restating the entries; asks remember X, team remember X,
//   remove N, edit N: X change entries, anything else gets the entry count.
// Commands in a group:
//   add X to the group · kick X from the group · rename the group to X · discuss (admin @all) · what was the briefing (repeats the briefing)
//   remember[@TOPIC] FACT (the admin saves to the group memory) · own remember / team remember FACT (own / team)
//   forget FACT (the admin) · recall [WORD] (every member)
//   find own chat WORD (read_own_chat) · long N · context has WORD · overflow · bad key [NAME] (that member's call, or every member's, fails with 401)
//   escalate (members other than the admin run a shell command that asks for full access)
//   write as text (members write their tool call as text instead of making it; also in a Bot's own chat)
//   hand out N (the admin hands the first other member N seconds of work; the admin answers its result)
//   steps N (like hand out, but the member says a line at each of its three steps, N seconds apart)
// A handoff turn answers "Part N, carried on and done". Handoff notes and backend compaction each
// return a full eight-section note marked "handoff prompt" or "backend prompt" (a Bot's
// Session should only see the former; retries add "retried", merges add "merged the earlier note").
// A Bot's checkpoint is a short summary marked "checkpoint prompt". The context steward
// answers "compact" while the latest user message contains "unfinished stage", else "switch".
// Secret cards: need secret [NAME] calls request_secret (default DEMO_TOKEN); once a key is
// saved or allowed the Bot echoes it in its shell and quotes what the output showed it.
// MOCK_WATCH=<value> adds "watchHit" to each log entry: whether that value is anywhere
// in the model input. MOCK_LOG_TOOLS=1 records each request's tool names as toolNames.
// Non-streaming requests with web_search_* tools are treated as native search, and
// POST /api/web_search is an Ollama-shaped search API for the searchApis config.
import { createServer } from 'node:http'
import { createHash } from 'node:crypto'
import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const PORT = Number(process.env.MOCK_PORT ?? 8765)
const LOG = process.env.MOCK_LOG ?? fileURLToPath(new URL('../../.dsh-test/mock.jsonl', import.meta.url))
mkdirSync(dirname(LOG), { recursive: true })
const DELAY = Number(process.env.MOCK_DELAY_MS ?? 600)
// Random extra latency per call, to shake out ordering assumptions.
const JITTER = Number(process.env.MOCK_JITTER_MS ?? 0)
// Latency of summary (handoff or compaction) calls, to leave time to send input meanwhile.
const SUMMARY_DELAY = Number(process.env.MOCK_SUMMARY_DELAY_MS ?? DELAY)
// How much of each call's last message the log keeps; raise it to read whole prompts.
const LOG_CHARS = Number(process.env.MOCK_LOG_CHARS ?? 160)
const WATCH = process.env.MOCK_WATCH ?? ''
const REJECT_IMAGES = process.env.MOCK_REJECT_IMAGES === '1'
// MOCK_LOG_TOOLS=1 records the request's tool names, to compare two Sessions' tool views.
const LOG_TOOLS = process.env.MOCK_LOG_TOOLS === '1'
let seq = 0

const textOf = content => typeof content === 'string' ? content
  : Array.isArray(content) ? content.map(block => (block.type === 'text' ? block.text : '')).join('\n') : ''
const systemText = system => typeof system === 'string' ? system
  : Array.isArray(system) ? system.map(block => block.text ?? '').join('\n') : ''

const text = value => ({ type: 'text', text: value })
// ask_user takes options as { label } objects; the scenarios below list plain labels.
const tool = (name, input) => ({
  type: 'tool_use',
  name,
  input: name === 'ask_user' && Array.isArray(input.options)
    ? { ...input, options: input.options.map(option => (typeof option === 'string' ? { label: option } : option)) }
    : input,
})
const think = value => ({ type: 'thinking', thinking: value })
const ESCALATION = 'Escalation test: the user asked for it in the group'
const FINDER = 'app_tools'
const HANDED_WORK = 'group-handed-work'
const STEPPED_WORK = 'group-stepped-work'
const STEP_LINES = ['Read the folder: 12 files, starting to sort them.', 'Half sorted; the index is left.']
const WRITTEN_CALL = 'Let me look at the folder first.\n<tool_call>\n<function=pwsh>\n<parameter=command>\nGet-ChildItem\n</parameter>\n</function>\n</tool_call>'
// Deterministic filler that grows a conversation by about `chars` characters.
const filler = (chars, tag) => Array.from({ length: Math.ceil(chars / 20) }, (_, index) => `${tag} part ${index + 1}: test text that fills the context. `).join('').slice(0, chars)
const isResults = message => Array.isArray(message?.content) && message.content.some(block => block.type === 'tool_result')
// 'handoff' or 'backend' for a summary request, by its final prompt. The adapter merges
// that prompt into the user message before it, so it is the last text block, not the
// whole message.
const SUMMARY_PROMPTS = [['handoff', 'You are now writing a handoff note'], ['checkpoint', 'You are now writing a checkpoint'], ['backend', 'You are now acting as a compaction engine']]
const summaryKind = value => SUMMARY_PROMPTS.find(([, prompt]) => value.trimStart().startsWith(prompt))?.[0]
const textBlocks = content => (typeof content === 'string' ? [content]
  : Array.isArray(content) ? content.filter(block => block.type === 'text').map(block => block.text) : [])
function isSummary(body) {
  const last = textBlocks(body.messages?.at(-1)?.content).at(-1)
  return last === undefined ? undefined : summaryKind(last)
}

function decide(body) {
  const system = systemText(body.system) + '\n' + (body.messages ?? []).filter(m => m.role === 'system').map(m => textOf(m.content)).join('\n')
  const tools = new Set((body.tools ?? []).map(entry => entry.name))
  // Clock snapshots and the engine's reminders (which some routes send as user blocks of their own)
  // are context, not a new scripted user command.
  const messages = (body.messages ?? []).filter(m => m.role !== 'system').map(message => {
    if (message.role !== 'user') return message
    const isClock = value => value.startsWith('Current time: ') || value.startsWith('Time sampled while preparing turn ')
      || value.startsWith('Current runtime context.') || /^\s*<system-reminder>[\s\S]*<\/system-reminder>\s*$/u.test(value)
    const content = typeof message.content === 'string' ? (isClock(message.content) ? '' : message.content)
      : message.content.filter(block => block.type !== 'text' || !isClock(block.text))
    return { ...message, content }
  }).filter(message => message.role !== 'user' || message.content.length > 0)
  const last = messages.at(-1)
  const blocks = Array.isArray(last?.content) ? last.content : []
  const me = /You are (.+?), a Bot on the user's team/.exec(system)?.[1] ?? 'Bot'
  const isMain = system.includes('You are the Main Bot')
  const isRelay = system.includes('# Group chat relay')

  // Summary requests: the Bot's handoff prompt, or the backend's own one when the
  // plugin did not rewrite it. The note names which, and quotes the latest user lines.
  // "note mode <mode>" in the conversation makes later handoff notes misbehave:
  // cut-once / gap-once fail the first attempt only, cut-always / gap-always every attempt,
  // fail makes the call an error, normal goes back to good notes.
  // The context steward: "compact" while the latest user message says "unfinished stage",
  // otherwise "switch".
  if (system.includes('You are the context steward')) {
    const latestUser = textOf(last?.content).split('\n').filter(line => line.startsWith('User: ')).at(-1) ?? ''
    const action = latestUser.includes('unfinished stage') ? 'compact' : 'switch'
    return [text(JSON.stringify({ action, reason: `mock: ${action}` }))]
  }

  // The memory panel: a prose summary of the entries it lists, and "ask or update".
  if (system.includes('You write the memory summary')) return [text(memorySummary(textOf(last?.content)))]
  if (/You keep the memory of one (Bot|group chat)/.test(system)) return [text(JSON.stringify(memoryAsk(textOf(last?.content))))]
  if (/You keep the long-term memory of one (Bot|group chat)/.test(system)) return [text(JSON.stringify(memoryReview(textOf(last?.content))))]

  const kind = isSummary(body)
  if (kind === 'checkpoint') {
    const said = messages.filter(m => m.role === 'user').flatMap(m => textBlocks(m.content))
      .filter(value => !summaryKind(value)).map(value => value.split('\n')[0].slice(0, 60))
      .filter(line => line && !line.startsWith('<') && !/^(This is an automatically generated checkpoint|Current runtime context|Time sampled)/.test(line))
    const merged = messages.some(m => m.role === 'user' && textBlocks(m.content).some(value => value.includes('[Checkpoint '))) ? ' (merged the earlier checkpoint)' : ''
    return [text([`- ${me} (checkpoint prompt)${merged}`, ...said.slice(-3).map(line => `- User: ${line}`)].join('\n'))]
  }
  if (kind) {
    const userTexts = messages.filter(m => m.role === 'user').flatMap(m => textBlocks(m.content))
    const said = userTexts
      .filter(value => !summaryKind(value)).map(value => value.split('\n')[0].slice(0, 60))
      .filter(line => line && !line.startsWith('<') && !/^(This is an automatically generated checkpoint|Current runtime context|Time sampled)/.test(line))
    const prompt = textBlocks(last?.content).at(-1) ?? ''
    const mode = kind === 'handoff' ? userTexts.map(value => /^note mode\s*(\S+)/.exec(value)?.[1]).filter(Boolean).at(-1) : undefined
    const retried = /was cut off at the output limit|lacked these headings/.test(prompt)
    const carried = userTexts.some(value => value.startsWith('[Handoff · part')) ? ' (merged the earlier note)' : ''
    const sections = [
      ['Goals', `- ${me} (${kind} prompt${retried ? ', retried' : ''})${carried}`],
      ['Constraints and preferences', '- (none)'],
      ['Progress', '- Done: (none)\n- In progress: (none)\n- Blocked: (none)'],
      ['Decisions', '- (none)'],
      ['Facts to keep', said.slice(-3).map(line => `- User: ${line}`).join('\n') || '- (none)'],
      ['Open threads', '- (none)'],
      ['Next step', '- (none)'],
      ['Where to look', '- (none)'],
    ]
    const note = list => list.map(([name, body]) => `## ${name}\n${body}`).join('\n\n')
    if (mode === 'fail') return 'fail'
    if (mode === 'cut-always' || (mode === 'cut-once' && !retried)) return Object.assign([text(note(sections.slice(0, 3)))], { stop: 'max_tokens' })
    if (mode === 'gap-always' || (mode === 'gap-once' && !retried)) return [text(note(sections.filter(([name]) => name !== 'Next step' && name !== 'Decisions')))]
    return [text(note(sections))]
  }

  // A stopped call's result can share a message with the next group turn, which wins.
  const fresh = textBlocks(last?.content).some(value => value.trimStart().startsWith('[Group chat'))
  const result = fresh ? undefined : blocks.find(block => block.type === 'tool_result')
  if (result) {
    const resultText = typeof result.content === 'string' ? result.content : textOf(result.content)
    const call = [...messages].reverse().find(m => m.role === 'assistant' && Array.isArray(m.content) && m.content.some(b => b.type === 'tool_use'))
    const used = call?.content.find(b => b.type === 'tool_use' && b.id === result.tool_use_id) ?? call?.content.find(b => b.type === 'tool_use')
    // "long task N [K]": N steps in one turn, each adding about K thousand characters (default 4).
    const openerAt = messages.findLastIndex(m => m.role === 'user' && !isResults(m) && /^long task\s*\d+/.test(textOf(m.content).trimStart()))
    if (openerAt !== -1 && used?.name === 'list_bots') {
      const task = /^long task\s*(\d+)(?:\s+(\d+))?/.exec(textOf(messages[openerAt].content).trimStart())
      const steps = Number(task[1])
      const size = Number(task[2] ?? 4)
      const done = messages.slice(openerAt + 1).filter(isResults).length
      if (done < steps) return [text(filler(size * 1000, `Step ${done + 1}`)), tool('list_bots', {})]
      return [text(`The long task is done: ${done} steps in all.`)]
    }
    // "page structure [N]": answer with the first N lines (default 40) of what read_browser
    // returned, fenced so the chat shows the Markdown as text.
    const asked = messages.map(m => (m.role === 'user' ? textOf(m.content).trim() : '')).filter(Boolean).at(-1) ?? ''
    const structure = /^page structure(?:\s+(\d+))?/.exec(asked)
    if (structure && used?.name === 'read_browser') {
      return [text(`What it read (first ${Number(structure[1] ?? 40)} lines):\n\n~~~~text\n${resultText.split('\n').slice(0, Number(structure[1] ?? 40)).join('\n')}\n~~~~`)]
    }
    // Secret cards: a key already there is echoed at once; a card ends the turn.
    // The note after the card can ride in the same message as the card's tool result.
    if (used?.name === 'request_secret') {
      if (/already saved/.test(resultText)) return [echoSecret(used.input.name, tools)]
      const note = textBlocks(last.content).find(value => value.trim().startsWith('[Secret card]'))
      return note ? secretNote(note.trim(), tools) : [text('')]
    }
    if ((used?.name === 'bash' || used?.name === 'pwsh') && /DSH_SECRET_/.test(used.input?.command ?? '')) {
      return [text(`In the terminal output I see: ${resultText.replace(/\s+/g, ' ').trim().slice(0, 200)}`)]
    }
    if (used?.input?.justification === ESCALATION) return [text(result.is_error ? `It did not run: ${resultText.slice(0, 80)}` : 'The command ran; the file is written.')]
    const job = new RegExp(`^${HANDED_WORK}-(\\d+)-`).exec(used?.input?.pattern ?? '')
    if (job) return Object.assign([text(`Done, it took ${job[1]} s.`)], { delay: Number(job[1]) * 1000 })
    const stepped = new RegExp(`^${STEPPED_WORK}-(\\d+)-(\\d+)-`).exec(used?.input?.pattern ?? '')
    if (stepped) {
      const [at, wait] = [Number(stepped[1]), Number(stepped[2]) * 1000]
      if (at > STEP_LINES.length) return Object.assign([text('All steps done: the folder, the text and the index are sorted.')], { delay: wait })
      return Object.assign([text(STEP_LINES[at - 1]), tool(used.name, { pattern: `${STEPPED_WORK}-${at + 1}-${stepped[2]}-*` })], { delay: wait })
    }
    if (used?.name === FINDER) return [text(`Looked up: ${resultText.split('\n')[0]}`)]
    if (used?.name?.startsWith('mcp__')) return [text(`It ${result.is_error ? 'failed' : 'answered'}: ${resultText.slice(0, 200)}`)]
    switch (used?.name) {
      case 'group_relay': return [text('')]
      case 'create_bot': {
        const name = used.input.name
        return [text(`${name} is ready.`), tool('message_bot', { to: name, message: 'The user just had me create you. Reply in three points: what you will do first, what you need from the user, and your rhythm for the first week. Write "not discussed yet" where you have nothing.' })]
      }
      case 'message_bot': return [text(used.input.reply_to === 'user' ? `See what ${used.input.to} says in its own chat.` : 'I passed the request on; I will tell you as soon as there is a result.')]
      // The user's answer can ride in the same message as the card's tool result.
      case 'ask_user': if (textOf(last.content).trim() === '') return [text('')]
        break
      case 'ask_user_question': {
        let picked = ''
        try { picked = JSON.parse(resultText).answers?.[0]?.selected?.[0] ?? '' } catch {}
        return [text(picked ? `Good, we start with "${picked}".` : 'OK.'), text('Let me sort out the main points first; a plan follows shortly.')]
      }
      case 'list_bots': return [text(`The team now:\n${resultText}`)]
      case 'create_group':
      case 'update_group':
      case 'delete_group':
      case 'post_to_group':
        return [text(/^(Created|Updated|Deleted|Posted|Nothing changed)/.test(resultText) ? `Done: ${resultText}` : `Not done: ${resultText}`)]
      case 'read_own_chat': {
        const parts = /has (\d+) parts/.exec(resultText)?.[1]
        const across = parts ? ` (${parts} parts in all)` : ''
        if (used.input.part !== undefined) return [text(`Part ${used.input.part}: ${resultText.split('\n').slice(0, 3).join(' / ').slice(0, 160)}${across}`)]
        if (!resultText.includes('(oldest first)')) return [text(`Not in my chat: ${resultText.split('\n')[0]}${across}`)]
        const hits = resultText.split('\n').filter(line => line.startsWith('['))
        if (used.input.around !== undefined) return [text(`${resultText.split('\n')[0]} with ${hits.length} around it: ${hits.map(line => line.slice(0, 40)).join(' | ')}`)]
        const loose = resultText.includes('no message has all of') ? ' (no message has every word; ranked by words matched)' : ''
        return [text(`In my chat I talked about it in ${hits.length} messages${loose}: ${hits.at(-1)?.slice(0, 120) ?? ''}${across}`)]
      }
      case 'read_group_chat': return [text(`Lately in the group:\n${resultText}`)]
      case 'read': {
        const content = resultText.replace(/<[^>]+>/g, '').replace(/^\s*\d+[\t→|:]/gm, '').trim()
        return [text(result.is_error ? `The attachment did not read: ${resultText.slice(0, 200)}` : `Read the attachment (${content.length} characters); it ends with "${content.slice(-24)}".`)]
      }
      case 'remember':
      case 'forget':
        return [text(/^(Saved to|Updated in|Removed from) /.test(resultText) ? (used.name === 'remember' ? 'Noted.' : 'Forgotten.') : `Not saved: ${resultText}`)]
      case 'recall': return [text(`In memory:\n${resultText}`)]
      case 'web_search': return [text(result.is_error ? `The search failed: ${resultText}` : `Found:\n${resultText}`)]
      case 'working_directory': return [text(result.is_error ? `Could not go there: ${resultText}` : `Now in ${resultText}`)]
      case 'read_browser': {
        const title = /^Title: (.+)$/m.exec(resultText)?.[1]
        const body = (resultText.split(/^Text[^\n]*:\n/m)[1] ?? '').split('\n\nLinks and controls')[0].replace(/\s+/g, ' ').trim()
        return [text(title ? `I read the page you opened, "${title}". It begins: ${body.slice(0, 120)}` : `Could not read the page: ${resultText.slice(0, 160)}`)]
      }
      default: return [text('Done.')]
    }
  }

  const userText = textOf(last?.content).trim()
  // "overflow": the provider rejects the request as past its window.
  if (userText.startsWith('overflow')) return 'overflow'
  // A file in the message (a long Bot message, a file the user sent): the engine gives its saved
  // path, and the Bot reads it first.
  const saved = /verbatim read-only copy saved at ("(?:[^"\\]|\\.)*")/.exec(userText)
  if (saved) return [tool('read', { file_path: JSON.parse(saved[1]) })]
  // "long task" keeps stepping when a Bot message splices into its turn (a relayed
  // note); only a fresh opener or "[Stopped by" ends it. A spliced "[Message
  // from X]" is taken into account there; it is answered in a turn of its own.
  const longOpener = messages.findLastIndex(m => m.role === 'user' && !isResults(m) && /^long task\s*\d+/.test(textOf(m.content).trimStart()))
  if (longOpener !== -1 && /^\[(?:Message|Reply) from /.test(userText)) {
    const task = /^long task\s*(\d+)(?:\s+(\d+))?/.exec(textOf(messages[longOpener].content).trimStart())
    const steps = Number(task[1])
    const size = Number(task[2] ?? 4)
    const done = messages.slice(longOpener + 1).filter(isResults).length
    if (done < steps) {
      const joined = /^\[Message from ([^\]·]+?)(?: · [^\]]*)?\]/.exec(userText)?.[1]
      return [text(`${joined ? `(Adjusted to what ${joined} said)\n` : ''}${filler(size * 1000, `Step ${done}`)}`), tool('list_bots', {})]
    }
  }
  // "bad key": the provider rejects the key, in the user's chat or in a message from a Bot.
  if (/^bad key$/.test(userText) || /^(?:\[Message from [^\]]*\]\nbad key\n?)+$/.test(userText)) return 'auth'
  const lastCall = [...messages].reverse().find(m => m.role === 'assistant' && Array.isArray(m.content) && m.content.some(b => b.type === 'tool_use'))
  const lastAsk = lastCall?.content.find(b => b.type === 'tool_use' && b.name === 'ask_user')
  const answeredAsk = lastAsk && (lastAsk.input?.options ?? []).map(option => option?.label ?? option).find(label => userText.includes(label))
  if (isRelay && tools.has('group_relay')) return [tool('group_relay', {})]
  if (answeredAsk && !userText.trim().startsWith('[')) {
    return [text(`Good, we start with "${answeredAsk}".`), text('Let me sort out the main points first; a plan follows shortly.')]
  }
  // A turn the plugin stopped at a context line goes on in the next part. The package
  // is merged with the workspace instructions, so match it before any free-text rule.
  if (userText.startsWith('[Handoff · part')) {
    const number = /^\[Handoff · part (\d+)\]/.exec(userText)[1]
    return [text(/in the group chat "/.test(userText) ? `${me}: part ${number}, carried on from the group and done.` : `Part ${number}, carried on and done.`)]
  }
  if (userText.startsWith('[Bot team setup]')) {
    if (isMain) {
      return [
        text(`Hi, I am ${me}. From today I run your Bot team; come to me for anything that needs a decision.`),
        text('For now it is just me. I will learn the tools you use every day, then decide whom to bring in first. What should the team help you with first?'),
      ]
    }
    return [text(`Hi, I'm ${me}. Where should I start?`)]
  }
  if (/^\[Group chat "[^"]*" · replies to your post\]/.test(userText)) {
    const replies = userText.split('\n').filter(line => /^[^:\n]{1,40}: /.test(line)).length
    return [text(`The group has answered: ${replies} replies in all.`)]
  }
  if (userText.startsWith('[Group chat') && userText.includes('The user just created this group')) return [text('The group is ready. What should we work on together?')]
  if (/^\[Group chat "[^"]*" · your tool call did not run\]/.test(userText) || userText.startsWith('[Your last reply wrote a tool call as text')) {
    return [text('This time it really ran; I read the folder.')]
  }
  if (userText.startsWith('[Group chat')) {
    // Reads only this round's transcript block. The opener is the user's last line, or
    // a Bot's post that started the round. Count-off says the next number after the
    // highest one said so far.
    const block = /(?:^|\n)This round so far[^\n]*:\n([\s\S]*?)(?:\n\n|$)/.exec(userText)?.[1] ?? ''
    const lines = block.split('\n').filter(Boolean)
    const userAt = lines.map(line => line.startsWith('User:')).lastIndexOf(true)
    const openAt = userAt === -1 && /starting with the new message/.test(userText) ? 0 : userAt
    const userLine = openAt === -1 ? '' : lines[openAt]
    const said = lines.slice(openAt + 1)
      .map(line => /^[^:\n]{1,40}: \D*?(\d+)/.exec(line)?.[1])
      .filter(Boolean).map(Number)
    const mentioner = /^\[Group chat [^\]]*· (\S+) mentioned you\]/.exec(userText)?.[1]
    const peer = /^Members: the user, ([^,\n]+?)(?:,| and you)/m.exec(userText)?.[1]?.replace(/ \(admin\)$/, '')
    const room = /^\[Group chat "([^"]+)"/.exec(userText)?.[1] ?? ''
    const leads = /^Members: .* and you \(admin\)\./m.test(userText)
    let ask
    if ((ask = /add\s+(\S+?)\s+to the group/.exec(userLine))) return [tool('update_group', { group: room, add_members: [ask[1]] })]
    if ((ask = /kick\s+(\S+?)\s+from the group/.exec(userLine))) return [tool('update_group', { group: room, remove_members: [ask[1]] })]
    if ((ask = /rename the group to\s+(\S+)/.exec(userLine))) return [tool('update_group', { group: room, name: ask[1] })]
    if (/count off/i.test(userLine)) return [text(String((said.length ? Math.max(...said) : 0) + 1))]
    if (userLine.startsWith('User: overflow')) return 'overflow'
    if ((ask = /^User: bad key(?:\s+(\S+))?/.exec(userLine)) && (!ask[1] || ask[1] === me)) return 'auth'
    // Context-line tests in a group Session: grow it, or check what is still in it.
    if ((ask = /\blong\s+(\d+)/.exec(userLine))) return [text(filler(Number(ask[1]) * 1000, `${me} group text`))]
    if ((ask = /context has\s+(\S+)/.exec(userLine))) {
      const earlier = messages.slice(0, -1).map(m => textOf(m.content)).join('\n')
      return [text(earlier.includes(ask[1]) ? `The context has "${ask[1]}".` : `The context does not have "${ask[1]}".`)]
    }
    // Group memory: the admin saves, so a round of members does not save it twice.
    if ((ask = /^User: (team |own )?remember(?:@(\S+))?\s*:?\s*(.+)$/.exec(userLine)) && tools.has('remember')) {
      if (!leads) return [text('[PASS]')]
      return [tool('remember', { text: ask[3].trim(), ...(ask[2] ? { topic: ask[2] } : {}), ...(ask[1] ? { scope: ask[1].trim() === 'team' ? 'team' : 'own' } : {}) })]
    }
    if ((ask = /^User: forget\s*:?\s*(.+)$/.exec(userLine)) && tools.has('forget')) return leads ? [tool('forget', { entry: ask[1].trim() })] : [text('[PASS]')]
    if ((ask = /^User: recall(?:\s+(.+))?$/.exec(userLine)) && tools.has('recall')) return [tool('recall', ask[1] ? { query: ask[1].trim() } : {})]
    // Group Sessions: the frozen brief is in the Session's first message, the lookup a tool.
    if ((ask = /capabilities\s*(\S*)/.exec(userLine))) return [text(capabilityReport(me, tools, messages, ask[1]))]
    if ((ask = /find own chat\s*(\S*)/.exec(userLine))) return [tool('read_own_chat', ask[1] ? { query: ask[1] } : {})]
    if (/what was the briefing/.test(userLine)) {
      const all = messages.map(m => textOf(m.content)).join('\n')
      const brief = /Your own chat with the user so far[^\n]*\n([\s\S]*?)\nThis brief does not change/.exec(all)?.[1] ?? ''
      return [text(brief ? `The briefing ends: ${brief.split('\n').at(-1)}` : 'No briefing.')]
    }
    if (/write as text/.test(userLine) && !leads) return [text(WRITTEN_CALL)]
    const shell = ['pwsh', 'bash'].find(name => tools.has(name))
    if (/escalate/.test(userLine) && !leads && shell) {
      return [text('This step writes a file outside the workspace, so I ask for an escalation once.'), tool(shell, { command: 'echo ok', description: 'Write a test file outside the workspace', justification: ESCALATION, sandbox_permissions: 'danger-full-access' })]
    }
    // "hand out N": the admin hands a member N seconds of work: a file lookup, then a model
    // step that takes N seconds. The member posts the result when done, and the admin
    // answers the result.
    const handed = /^\S+: @(\S+) work (\d+)/m.exec(block)
    const lookup = ['glob', 'grep', 'read'].find(name => tools.has(name))
    if ((ask = /hand out\s*(\d+)/.exec(userLine)) && leads && peer) return [text(`@${peer} work ${ask[1]}`)]
    if (handed?.[1] === me && mentioner && lookup) return [tool(lookup, { pattern: `${HANDED_WORK}-${handed[2]}-*` })]
    const steps = /^\S+: @(\S+) step work (\d+)/m.exec(block)
    if ((ask = /\bsteps\s*(\d+)/.exec(userLine)) && leads && peer) return [text(`@${peer} step work ${ask[1]}`)]
    if (steps?.[1] === me && mentioner && lookup) return [text('Got it, let me look at the folder first.'), tool(lookup, { pattern: `${STEPPED_WORK}-1-${steps[2]}-*` })]
    if (/All steps done/.test(block) && leads) return [text('Got it, thanks.')]
    if (/^\S+: Done/.test(userLine) && leads) return [text('Got it, thanks.')]
    // Ping-pong: whoever is mentioned mentions back, to exercise the per-member cap.
    if (/back and forth/.test(userLine)) return [text(mentioner ? `@${mentioner} back to you` : leads && peer ? `@${peer} back and forth` : '[PASS]')]
    if (mentioner) return [text('On track; it is done today.')]
    if (/arrange/.test(userLine)) return [text(leads && peer ? `@${peer} tell us where you are first.` : '[PASS]')]
    if (/discuss/.test(userLine)) return [text(leads ? '@all one line each, please.' : 'Fine by me.')]
    return [text(`${me}: ${leads ? 'I am the group admin; come to me when something needs a decision.' : 'I look after my own part; call me when you need me.'}`)]
  }
  // Secret cards: ask for a key, and use it once the card says it is saved or allowed.
  if (userText.startsWith('[Secret card]')) return secretNote(userText, tools)
  // Multiline: a runtime-context or policy notice can share the user's message.
  const secretAsk = /^need secret(?:[ \t]+([A-Za-z][\w]*))?/m.exec(userText)
  if (secretAsk && tools.has('request_secret')) {
    return [text('This needs a key; let me see whether there is one.'), tool('request_secret', { name: secretAsk[1] ?? 'DEMO_TOKEN', purpose: 'test' })]
  }
  // Group management in a Bot's own chat, in a fixed command form the tests use.
  let order
  if ((order = /^make group\s+(\S+?)\s*:\s*(.+)$/.exec(userText))) {
    return [text('I will create this group.'), tool('create_group', { name: order[1], members: order[2].split(/[,\s]+/).filter(Boolean) })]
  }
  if ((order = /^post( report)?\s+(\S+?)\s*:\s*([\s\S]+)$/.exec(userText))) {
    return [tool('post_to_group', { group: order[2], message: order[3], ...(order[1] ? { report_back: true } : {}) })]
  }
  if ((order = /^edit group\s+(\S+?)\s+(notice|admin|mode|add|kick)\s*:\s*(.+)$/.exec(userText))) {
    const field = { notice: { notice: order[3] }, admin: { admin: order[3] }, mode: { mode: order[3] }, add: { add_members: [order[3]] }, kick: { remove_members: [order[3]] } }[order[2]]
    return [tool('update_group', { group: order[1], ...field })]
  }
  if ((order = /^delete group\s+(\S+)$/.exec(userText))) return [tool('delete_group', { group: order[1] })]
  if ((order = /^relay\s+(\S+?)\s*:\s*([\s\S]+)$/.exec(userText))) return [tool('message_bot', { to: order[1], message: order[2] })]
  if ((order = /^interrupt\s+(\S+?)\s*:\s*(.+)$/.exec(userText))) return [tool('message_bot', { to: order[1], message: order[2], when: 'now' })]
  if ((order = /^queue\s+(\S+?)\s*:\s*(.+)$/.exec(userText))) return [tool('message_bot', { to: order[1], message: order[2], when: 'queue' })]
  if ((order = /^halt\s+(\S+?)\s*:\s*(.+)$/.exec(userText))) return [tool('stop_bot', { bot: order[1], reason: order[2] })]
  if ((order = /^read group\s+(.+)$/.exec(userText))) return [tool('read_group_chat', { group: order[1].trim() })]
  // Memory: remember[@TOPIC] FACT · team remember FACT · forget FACT · recall [WORD]
  if ((order = /^(team )?remember(?:@(\S+))?\s*:?\s*(.+)$/.exec(userText)) && tools.has('remember')) {
    return [tool('remember', { text: order[3].trim(), ...(order[2] ? { topic: order[2] } : {}), ...(order[1] ? { scope: 'team' } : {}) })]
  }
  if ((order = /^forget\s*:?\s*(.+)$/.exec(userText)) && tools.has('forget')) return [tool('forget', { entry: order[1].trim() })]
  if ((order = /^recall(?:\s+(.+))?$/.exec(userText)) && tools.has('recall')) return [tool('recall', order[1] ? { query: order[1].trim() } : {})]
  if ((order = /^search\s*:\s*([^\n]+)/.exec(userText)) && tools.has('web_search')) return [tool('web_search', { queries: order[1].trim().split(/\s*\|\s*/) })]
  if ((order = /^cd\s+(.+)$/.exec(userText)) && tools.has('working_directory')) return [tool('working_directory', { cd: order[1].trim() })]
  if (userText.startsWith('read page') && tools.has('read_browser')) return [tool('read_browser', {})]
  if (userText.startsWith('write as text')) return [text(WRITTEN_CALL)]
  // Context-line tests: grow the context, run a long multi-step turn, search history.
  if ((order = /^long\s+(\d+)/.exec(userText))) return [text(filler(Number(order[1]) * 1000, 'Long text'))]
  if ((order = /^long task\s*(\d+)(?:\s+(\d+))?/.exec(userText))) return [text(filler(Number(order[2] ?? 4) * 1000, 'Step 0')), tool('list_bots', {})]
  if ((order = /^search chat\s+([^\n]+)/.exec(userText))) return [tool('read_own_chat', { query: order[1].trim() })]
  if ((order = /^anchor\s+([^\n]+)/.exec(userText))) return [tool('read_own_chat', { around: order[1].trim() })]
  if ((order = /^read part\s*(\d+)/.exec(userText))) return [tool('read_own_chat', { part: Number(order[1]) })]
  if ((order = /^capabilities\s*(\S*)/.exec(userText))) return [text(capabilityReport(me, tools, messages, order[1]))]
  if ((order = /^find tools\s+(\S+?)\s*:\s*(.*)$/.exec(userText))) {
    return tools.has(FINDER) ? [tool(FINDER, { app: order[1], query: order[2].trim() })] : [text(`${me} has no ${FINDER} tool.`)]
  }
  // The tool is called by its name whether or not this request lists it.
  if ((order = /^call tool\s+(mcp__\S+?)\s*:\s*(.*)$/.exec(userText))) return [tool(order[1], { text: order[2].trim() })]
  if ((order = /^context has\s+(\S+)/.exec(userText))) {
    const all = messages.slice(0, -1).map(m => textOf(m.content)).join('\n')
    return [text(all.includes(order[1]) ? `The context has "${order[1]}".` : `The context does not have "${order[1]}".`)]
  }
  let match
  if ((match = /^\[Message from ([^\]·]+?) · the user sees your reply here\]/.exec(userText))) {
    const asked = userText.split('\n').slice(1).join(' ').trim().replace(/[.!?]+$/u, '')
    return [text(`${match[1]} passed on a message: "${asked}". My plan first: go through the material at hand, list what is missing, then agree the order with you; I will not start before you confirm.`)]
  }
  if ((match = /^\[Message from ([^\]·]+?)(?: · [^\]]*)?\]\n(?:relay\s+(\S+?)\s*:\s*([\s\S]+)|slowly\s+(\d+))/.exec(userText))) {
    if (match[2] && tools.has('message_bot')) return [tool('message_bot', { to: match[2], message: match[3].trim() })]
    if (match[4]) return Object.assign([text(`Reply to ${match[1]}: done, it took ${match[4]} s.`)], { delay: Number(match[4]) * 1000 })
  }
  if ((match = /^\[Message from ([^\]·]+?)(?: · [^\]]*)?\]/.exec(userText))) {
    return [text(`Reply to ${match[1]}:\n- First: go through the material at hand\n- Needed from the user: the goal and the deadline (not discussed yet)\n- Rhythm: a daily update once agreed`)]
  }
  if ((match = /^\[Reply from ([^\]]+)\]\n.* could not answer your message: its model call failed \(([^)]+)\)/.exec(userText))) {
    return [text(`${match[1]} could not answer this time: its model call failed (${match[2]}). The API key may be invalid; check the model settings it uses.`)]
  }
  if ((match = /^\[Reply from ([^\]·]+?) · for the work ([^\]]+?) asked you for/.exec(userText))) {
    return [text(`${match[1]} handed it back; I am passing the result to ${match[2]}.`)]
  }
  if ((match = /^\[Reply from ([^\]]+)\]/.exec(userText))) {
    return [text(`${match[1]} answered: the goal and the deadline are not discussed with you yet, so it cannot start from nothing.`), tool('ask_user', { question: 'What next?', detail: 'Without a goal it can only idle.', options: ['Tell me the goal now', 'Talk to it first', 'Leave it for now'] })]
  }
  if ((match = /\bcreate (?:a )?bot (?:named|called) ["“]?([^”"\s,.]+)/i.exec(userText)) && isMain && tools.has('create_bot')) {
    const name = match[1]
    return [text(`Creating ${name} first; once it is there it tells you its plan.`), tool('create_bot', { name, role: name, instructions: `Handles everything about ${name}: planning, doing and reviewing.`, brief: userText })]
  }
  if ((match = /\blet\s+([^\s,.]+?)\s+tell you in its own chat/i.exec(userText)) && tools.has('message_bot')) {
    return [text(`Good, I will have ${match[1]} tell you in its own chat.`), tool('message_bot', { to: match[1], message: 'The user wants to hear your plan from you directly.', reply_to: 'user' })]
  }
  if (/^\s*multi choice/.test(userText)) {
    return [tool('ask_user', {
      question: 'What should we watch this week?', detail: 'You can pick several.', multiSelect: true,
      options: [{ label: 'Gather material', description: 'List what is there first' }, { label: 'Write a first draft' }, { label: 'Weekly review', description: 'One page every Friday' }],
    })]
  }
  if (/^\s*blocking question/.test(userText) && tools.has('ask_user_question')) {
    return [tool('ask_user_question', { questions: [{ id: 'start', header: 'Choose', question: 'Where do we start?', options: [{ label: 'Set the goal (Recommended)', description: 'Say clearly what it should become' }, { label: 'Sort the daily chores' }] }] })]
  }
  // View cards: view options and view form wait for an answer; view display and big view are
  // display-only — the latter sits just under the view byte limit.
  if (/^\s*view options/.test(userText) && tools.has('show_view')) {
    return [tool('show_view', { title: 'Pick a lane', view: { type: 'options', id: 'lane', options: [{ label: 'Ship now' }, { label: 'One more pass' }] } })]
  }
  if (/^\s*view form/.test(userText) && tools.has('show_view')) {
    return [tool('show_view', { title: 'A few details', view: { type: 'form', id: 'ask', submitLabel: 'Send', fields: [{ id: 'name', label: 'Name', placeholder: 'Ada' }, { id: 'note', label: 'Note' }] } })]
  }
  if (/^\s*view display/.test(userText) && tools.has('show_view')) {
    return [tool('show_view', {
      title: 'Status board', await_reply: false,
      view: {
        type: 'stack',
        children: [
          { type: 'text', text: '**Release readiness** — all checks are in.' },
          { type: 'metric', label: 'Open issues', value: 3, tone: 'warn' },
          { type: 'table', columns: [{ key: 'item', label: 'Item' }, { key: 'state', label: 'State' }], rows: [['Tests', 'green'], ['Docs', 'draft'], ['Changelog', 'done']] },
          { type: 'progress', label: 'Reviewed', percent: 72 },
        ],
      },
    })]
  }
  if (/^\s*big view/.test(userText) && tools.has('show_view')) {
    return [tool('show_view', { title: 'A long note', view: { type: 'text', text: 'x'.repeat(7800) }, await_reply: false })]
  }
  // Streams slowly, then checks the team: exercises the activity row stepping aside
  // for a streaming reply and coming back for the tool.
  if (/^\s*talk slowly/.test(userText) && tools.has('list_bots')) {
    return [{ ...text('Fine, step by step: first the goal, then the limits, then the next step, and last I ask the team what each of them is busy with.'), slow: true }, tool('list_bots', {})]
  }
  // "card K": a reply of about K thousand characters (default 4) that ends with a question card.
  const card = /^card(?:\s+(\d+))?/.exec(userText)
  if (card && tools.has('ask_user')) {
    return [text(filler(Number(card[1] ?? 4) * 1000, 'Before the card')), tool('ask_user', { question: 'What comes next?', options: ['Write the text', 'Change the title', 'Stop for now'] })]
  }
  if (/team/i.test(userText) && tools.has('list_bots')) return [tool('list_bots', {})]
  if (/think/i.test(userText)) {
    return [think('The user wants me to think it through. Three parts: the goal, the limits, the next step.'), text('Having thought about it, I suggest three steps: set the goal, check the limits, then decide the next step.')]
  }
  return [text(`Got it: ${userText.slice(0, 60)}`), text('Anything else you want me to keep an eye on?')]
}

// The memory panel's summary: headed paragraphs that restate the listed entries.
function memorySummary(request) {
  const asked = /Here is everything (?:the group chat "(.+?)"|(.+?)) remembers/.exec(request)
  const name = asked?.[1] ?? asked?.[2] ?? 'Bot'
  const [own = [], team = []] = request.split(/^## .*$/m).slice(1, 3).map(part => part.split('\n')
    .filter(line => line.startsWith('- ')).map(line => line.slice(2).replace(/^\[\[[^\]]+\]\]\s*/, '').replace(/\.$/u, '')))
  const prose = list => list.map(entry => `${entry}.`).join(' ')
  const sections = [
    ['Overview', `${name} keeps ${own.length + team.length} things about you and your work.`], own.length > 0 && [`What ${name} knows`, prose(own)], team.length > 0 && ['Shared with the whole team', `Every Bot knows these: ${prose(team)}`],
    ]
  return sections.filter(Boolean).map(([head, body]) => `## ${head}\n${body}`).join('\n\n')
}

// "Ask or update": remember X, team remember X, remove N, edit N: X;
// anything else is a question, answered with the entry count.
function memoryAsk(request) {
  const entries = request.split('\n').map(line => /^\[(\d+)\] \([^)]*\) (.+)$/.exec(line)).filter(Boolean)
  const said = request.split(/The user says:\n/).at(-1).trim()
  let ask
  if ((ask = /^(team\s+)?remember\s*:?\s*(.+)$/i.exec(said))) {
    return { reply: `Saved: ${ask[2]}`, changes: [{ op: 'add', text: ask[2], team: Boolean(ask[1]) }] }
  }
  if ((ask = /^(?:remove|forget)\s*(\d+)$/i.exec(said))) {
    return { reply: `Removed entry ${ask[1]}.`, changes: [{ op: 'remove', entry: Number(ask[1]) }] }
  }
  if ((ask = /^edit\s*(\d+)\s*:\s*(.+)$/i.exec(said))) {
    return { reply: `Entry ${ask[1]} is updated.`, changes: [{ op: 'edit', entry: Number(ask[1]), text: ask[2] }] }
  }
  const first = entries[0]?.[2]
  return { reply: `I keep ${entries.length} entries${first ? `; the first is: ${first}` : ''}.`, changes: [] }
}

// The memory review keeps what a new user line asks for "from now on",
// unless an entry already says it.
function memoryReview(request) {
  const entries = request.split('\n').map(line => /^\[\d+\] \([^)]*\) (.+)$/.exec(line)?.[1]).filter(Boolean)
  const fresh = request.split(/^New in .*$/m).at(-1)
  const changes = []
  for (const line of fresh.split('\n')) {
    const asked = /^User: (from now on,?\s*)(.+?)\.?$/i.exec(line.trim())
    if (!asked || entries.some(entry => entry.includes(asked[2]))) continue
    changes.push({ op: 'add', text: `From now on, the user wants: ${asked[2]}` })
  }
  return { changes }
}

// The MCP tools in this request and the entries of the latest skill catalog, both limited
// to names that contain `filter`.
function capabilityReport(me, tools, messages, filter) {
  const catalogs = messages.flatMap(m => textBlocks(m.content)).flatMap(value => [...value.matchAll(/<available_skills>([\s\S]*?)<\/available_skills>/g)])
  const skills = (catalogs.at(-1)?.[1] ?? '').split('\n').map(line => /^- `([^`]+)`: (.*)$/.exec(line))
    .filter(entry => entry && entry[1].includes(filter)).map(entry => `${entry[1]} (${entry[2]})`)
  const mcp = [...tools].filter(name => name.startsWith('mcp__') && name.includes(filter)).sort()
  return `${me} capabilities: tools ${mcp.join(', ') || 'none'}; skills ${skills.join(', ') || 'none'}`
}

function secretNote(note, tools) {
  const ready = /The user (?:saved|let you use) ([A-Z][A-Z0-9_]*)/.exec(note)
  return ready ? [text(`Got ${ready[1]}, I will try it.`), echoSecret(ready[1], tools)] : [text('Fine, no key then.')]
}
// Prints a secret's variable in whichever shell the profile offers.
function echoSecret(name, tools) {
  const key = `DSH_SECRET_${String(name).toUpperCase()}`
  return tools.has('pwsh') && !tools.has('bash')
    ? tool('pwsh', { description: 'Print the secret variable', command: `Write-Output "value=$env:${key}"` })
    : tool('bash', { description: 'Print the secret variable', command: `echo "value=$${key}"` })
}

// Anthropic's server-side `web_search` tool, which a search provider sends without streaming.
// MOCK_NATIVE_SEARCH=off answers like an endpoint that ignores the tool.
const NATIVE_SEARCH = process.env.MOCK_NATIVE_SEARCH !== 'off'
const asksNativeSearch = body => body.stream !== true && (body.tools ?? []).some(entry => /^web_search_\d+$/.test(entry.type ?? ''))
function nativeSearch(body) {
  const query = /query: (.+)$/s.exec(textOf(body.messages?.at(-1)?.content))?.[1]?.trim() ?? ''
  if (!NATIVE_SEARCH) return [text(`From memory: ${query}`)]
  const url = n => `https://example.com/mock-search/${encodeURIComponent(query)}/${n}`
  return [
    { type: 'server_tool_use', id: 'srvtoolu_mock', name: 'web_search', input: { query } },
    { type: 'web_search_tool_result', tool_use_id: 'srvtoolu_mock', content: [1, 2].map(n => ({ type: 'web_search_result', url: url(n), title: `Mock result ${n}: ${query}`, page_age: `${n} days ago` })) },
    { type: 'text', text: 'Found it.', citations: [{ type: 'web_search_result_location', url: url(1), title: `Mock result 1: ${query}`, cited_text: `Mock excerpt about ${query}.` }] },
  ]
}

function sse(res, payload) {
  res.write(`event: ${payload.type}\ndata: ${JSON.stringify(payload)}\n\n`)
}

// An Ollama-shaped search API, for checking a `searchApis` entry declared in config.
function searchApi(req, res) {
  let raw = ''
  req.setEncoding('utf8')
  req.on('data', chunk => { raw += chunk })
  req.on('end', () => {
    const body = JSON.parse(raw || '{}')
    appendFileSync(LOG, JSON.stringify({ t: new Date().toISOString(), id: ++seq, images: 0, searchApi: { path: req.url, body, auth: req.headers.authorization ? 'bearer' : '' } }) + '\n')
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ results: [{ title: `Search API result: ${body.query}`, url: `https://example.com/search-api/${encodeURIComponent(body.query ?? '')}`, content: `Page text about ${body.query}.` }] }))
  })
}

const server = createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/web_search') return searchApi(req, res)
  // Anthropic's own client, which a provider set up by hand uses, adds a query string.
  const path = req.url.split('?')[0]
  if (req.method === 'GET' && path.endsWith('/v1/models')) {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ data: [{ type: 'model', id: 'mock-model', display_name: 'Mock Model' }, { type: 'model', id: 'mock-model-mini', display_name: 'Mock Model Mini' }], has_more: false }))
    return
  }
  if (req.method !== 'POST' || !path.endsWith('/v1/messages')) {
    res.writeHead(404, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ error: { message: `no route ${req.method} ${req.url}` } }))
    return
  }
  let raw = ''
  req.setEncoding('utf8')
  req.on('data', chunk => { raw += chunk })
  req.on('end', () => {
    const body = JSON.parse(raw)
    const images = (body.messages ?? []).reduce((count, message) => count
      + (Array.isArray(message.content) ? message.content.filter(block => block?.type === 'image').length : 0), 0)
    const id = ++seq
    if (REJECT_IMAGES && images > 0) {
      appendFileSync(LOG, JSON.stringify({ t: new Date().toISOString(), id, images, rejectedImages: true, messages: body.messages?.length ?? 0, last: textOf(body.messages?.at(-1)?.content).slice(0, LOG_CHARS) }) + '\n')
      res.writeHead(400, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ type: 'error', error: { type: 'invalid_request_error', message: 'mock: request with images rejected' } }))
      return
    }
    const search = asksNativeSearch(body)
    const out = search ? nativeSearch(body) : decide(body)
    if (out === 'overflow') {
      appendFileSync(LOG, JSON.stringify({ t: new Date().toISOString(), id, images, overflow: true, messages: body.messages?.length ?? 0, last: textOf(body.messages?.at(-1)?.content).slice(0, LOG_CHARS) }) + '\n')
      res.writeHead(400, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ type: 'error', error: { type: 'invalid_request_error', message: 'prompt is too long: maximum context length exceeded' } }))
      return
    }
    if (out === 'auth') {
      appendFileSync(LOG, JSON.stringify({ t: new Date().toISOString(), id, images, auth: true, messages: body.messages?.length ?? 0 }) + '\n')
      res.writeHead(401, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ type: 'error', error: { type: 'authentication_error', message: 'mock: invalid x-api-key sk-mock1234567890' } }))
      return
    }
    if (out === 'fail') {
      appendFileSync(LOG, JSON.stringify({ t: new Date().toISOString(), id, images, fail: true, messages: body.messages?.length ?? 0 }) + '\n')
      res.writeHead(400, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ type: 'error', error: { type: 'invalid_request_error', message: 'mock: this note request fails on purpose' } }))
      return
    }
    // Usage follows the model input's size (about three characters per token, all but
    // the newest tenth cached), so context meters and lines see real growth. Sibling
    // fields such as dsh_session_log are not model input.
    const tokens = Math.ceil(JSON.stringify([body.system, body.tools, body.messages]).length / 3)
    const cached = Math.floor(tokens * 0.9)
    // Hashes of the system prompt and tools show whether two Sessions share a cacheable prefix.
    const digest = value => createHash('sha256').update(JSON.stringify(value ?? null)).digest('hex').slice(0, 12)
    const watch = WATCH ? { watchHit: JSON.stringify([body.system, body.tools, body.messages]).includes(WATCH) } : {}
    appendFileSync(LOG, JSON.stringify({ t: new Date().toISOString(), id, tokens, images, session: req.headers['x-apmixbot-session-id'] ?? null, ...watch, ...LOG_TOOLS ? { toolNames: (body.tools ?? []).map(entry => entry.name ?? entry.type) } : {}, ...search ? { nativeSearch: { model: body.model, tools: body.tools, auth: [req.headers['x-api-key'] ? 'x-api-key' : '', req.headers.authorization ? 'bearer' : ''].filter(Boolean) } } : {}, system: digest(body.system), tools: digest(body.tools), messages: body.messages?.length ?? 0, first: textOf(body.messages?.[0]?.content).slice(0, 60), last: textOf(body.messages?.at(-1)?.content).slice(0, LOG_CHARS), out: out.map(block => (block.type === 'text' && block.text.length > 200 ? { ...block, text: `${block.text.slice(0, 200)}…(${block.text.length})` } : block)) }) + '\n')
    if (search) {
      setTimeout(() => {
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ id: `mock-${id}`, type: 'message', role: 'assistant', model: body.model ?? 'mock', content: out, stop_reason: 'end_turn', usage: { input_tokens: 300, output_tokens: 40 } }))
      }, DELAY)
      return
    }
    setTimeout(async () => {
      res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache' })
      sse(res, { type: 'message_start', message: { id: `mock-${id}`, type: 'message', role: 'assistant', model: body.model ?? 'mock', content: [], usage: { input_tokens: tokens - cached, output_tokens: 0, cache_read_input_tokens: cached } } })
      let index = 0
      let usedTool = false
      for (const block of out) {
        if (block.type === 'text') {
          if (block.text === '') continue
          sse(res, { type: 'content_block_start', index, content_block: { type: 'text', text: '' } })
          if (block.slow) {
            for (const piece of block.text.match(/.{1,4}/gsu)) {
              sse(res, { type: 'content_block_delta', index, delta: { type: 'text_delta', text: piece } })
              await new Promise(resolve => setTimeout(resolve, 120))
            }
          } else {
            sse(res, { type: 'content_block_delta', index, delta: { type: 'text_delta', text: block.text } })
          }
        } else if (block.type === 'thinking') {
          sse(res, { type: 'content_block_start', index, content_block: { type: 'thinking', thinking: '' } })
          sse(res, { type: 'content_block_delta', index, delta: { type: 'thinking_delta', thinking: block.thinking } })
          sse(res, { type: 'content_block_delta', index, delta: { type: 'signature_delta', signature: 'mock' } })
        } else {
          usedTool = true
          sse(res, { type: 'content_block_start', index, content_block: { type: 'tool_use', id: `call-${id}-${index}`, name: block.name, input: {} } })
          sse(res, { type: 'content_block_delta', index, delta: { type: 'input_json_delta', partial_json: JSON.stringify(block.input) } })
        }
        sse(res, { type: 'content_block_stop', index })
        index += 1
      }
      if (index === 0) {
        sse(res, { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } })
        sse(res, { type: 'content_block_stop', index: 0 })
      }
      sse(res, { type: 'message_delta', delta: { stop_reason: out.stop ?? (usedTool ? 'tool_use' : 'end_turn'), stop_sequence: null }, usage: { output_tokens: Math.ceil(JSON.stringify(out).length / 3) } })
      sse(res, { type: 'message_stop' })
      res.end()
    }, (out.delay ?? (isSummary(body) ? SUMMARY_DELAY : DELAY)) + Math.random() * JITTER)
  })
})

server.listen(PORT, '127.0.0.1', () => console.log(`apmixbot mock on http://127.0.0.1:${server.address().port}/v1`))
