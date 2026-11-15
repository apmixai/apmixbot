import { createInterface } from 'node:readline'

const send = message => process.stdout.write(`${JSON.stringify(message)}\n`)
const inputSchema = {
  type: 'object',
  properties: { text: { type: 'string' } },
  required: ['text'],
}
// ECHO_TOOLS=N: a server with many tools (echo_1 … echo_N), one that fails until another is
// called (needs_access, which names grant_access_link), and that other one.
const MANY = Number(process.env.ECHO_TOOLS ?? 0)
const tools = MANY > 0
  ? [
      ...Array.from({ length: MANY }, (_, index) => ({ name: `echo_${index + 1}`, description: `Return the supplied text, as echo ${index + 1}.`, inputSchema })),
      { name: 'needs_access', description: 'Return the supplied text once access is granted.', inputSchema },
      { name: 'grant_access_link', description: 'Make the link that grants access.', inputSchema },
    ]
  : [{ name: 'echo', description: 'Return the supplied text.', inputSchema }]

for await (const line of createInterface({ input: process.stdin })) {
  let request
  try { request = JSON.parse(line) } catch { continue }
  if (!request || request.id === undefined) continue
  let result
  switch (request.method) {
    case 'initialize':
      result = {
        protocolVersion: request.params?.protocolVersion,
        capabilities: { tools: {} },
        serverInfo: { name: 'apmixbot-echo', version: '1.0.0' },
      }
      break
    case 'ping':
      result = {}
      break
    case 'tools/list':
      result = { tools }
      break
    case 'tools/call':
      result = request.params?.name === 'needs_access'
        ? { isError: true, content: [{ type: 'text', text: 'Not authorized. Call grant_access_link and show the user the link, then try again.' }] }
        : { content: [{ type: 'text', text: String(request.params?.arguments?.text ?? '') }] }
      break
    default:
      send({ jsonrpc: '2.0', id: request.id, error: { code: -32601, message: 'Method not found' } })
      continue
  }
  send({ jsonrpc: '2.0', id: request.id, result })
}
