/** Session Controller adapter for Agent-scoped file-reference discovery. */
import type { Context } from '@apmixbot/cordis';
import type { Agent } from '@apmixbot/dsh-agent';
import type { FileReferenceCandidate } from '@apmixbot/dsh-file-reference/types';
import { TypertRemoteService } from '@apmixbot/dsh-typert-protocol';
declare module '@apmixbot/cordis' {
    interface Context {
        /** Host owner of the `fileReferences` Remote namespace. */
        sessionFileReferences: SessionFileReferences;
    }
}
/** Host Remote adapter over the composed file-reference provider. */
export declare class SessionFileReferences extends TypertRemoteService {
    static inject: string[];
    /** @param ctx - Host context carrying the selected file-reference provider. */
    constructor(ctx: Context);
    /**
     * List file and directory candidates for one Agent's working directory.
     * @param agent - target Agent resolved from the Session identity on the wire.
     * @param query - path text following `@` or `@"`.
     * @param signal - caller cancellation.
     * @returns deterministic path-only candidates from the composed provider.
     */
    list(agent: Agent, query: string, signal: AbortSignal): Promise<FileReferenceCandidate[]>;
}
export default SessionFileReferences;
//# sourceMappingURL=file-references.d.ts.map