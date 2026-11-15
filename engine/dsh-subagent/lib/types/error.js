/**
 * Typed failures shared by subagent service and provider operations.
 *
 * @module @apmixbot/dsh-subagent
 */
import { HarnessError } from '@apmixbot/dsh-llm';
/** Typed failure for the subagent seam. */
export class SubagentError extends HarnessError {
    constructor(message, code, options) {
        super(message, code, options);
        this.name = 'SubagentError';
    }
}
//# sourceMappingURL=error.js.map