// The apmixbot mock model as a custom provider, for checks on throwaway folders: a profile
// patch that the Host layers over its profile (APMIXBOT_PATCH), and the key the route names.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

export const MOCK_KEY_ENV = 'APMIXBOT_MOCK_KEY'

/** Writes the patch to `file` for the mock at `url` (its …/v1 address); returns the env to start with. */
export function mockEnv(file, url) {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, [
    '- id: llm-pi-ai',
    '  config:',
    '    providers:',
    '      mock:',
    '        displayName: Mock model',
    '        api: anthropic-messages',
    `        baseURL: ${JSON.stringify(url)}`,
    `        apiKeyEnv: ${MOCK_KEY_ENV}`,
    '        models:',
    '          - { id: mock-model, name: Mock model }',
    '',
  ].join('\n'))
  return { APMIXBOT_PATCH: file, [MOCK_KEY_ENV]: 'mock-key' }
}
