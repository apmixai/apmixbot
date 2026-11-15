/**
 * Three shared tools adapt model arguments to scoped resource operations.
 *
 * @module @apmixbot/dsh-mcp-resources
 */
import type { Context } from '@apmixbot/cordis';
import { type ToolExecution } from '@apmixbot/dsh-tools';
import type { JsonValue } from '@apmixbot/dsh-util-values';
import type { McpResourceRequest } from './index.ts';
type RequestResource = (server: string, request: McpResourceRequest, exec: ToolExecution) => Promise<JsonValue>;
/**
 * Register resource operations in the consumer's tool scope.
 * @param ctx - context owning the tool registrations.
 * @param request - caller-aware resource operation.
 * @returns the effect disposer that removes all three tools synchronously.
 */
export declare function registerResourceTools(ctx: Context, request: RequestResource): () => void;
export {};
//# sourceMappingURL=tools.d.ts.map