/**
 * Resource-result projection keeps binary payloads out of model history.
 *
 * @module @apmixbot/dsh-mcp-resources
 */
import type { ContentBlock } from '@apmixbot/dsh-llm';
import type { JsonValue } from '@apmixbot/dsh-util-values';
/**
 * Render resource JSON while retaining raw binary data only for programmatic callers.
 * @param server - configured server attribution.
 * @param value - canonical resource result.
 * @returns attributed text with binary payload descriptions.
 */
export declare function renderResourceResult(server: string, value: JsonValue): ContentBlock[];
//# sourceMappingURL=render.d.ts.map