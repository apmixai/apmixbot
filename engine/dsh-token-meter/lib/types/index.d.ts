/**
 * Single replay-aware token-meter service for request and surface pressure.
 *
 * @module @apmixbot/dsh-token-meter
 */
import { Context, Service } from '@apmixbot/cordis';
import z from '@apmixbot/schemastery';
import type { Message } from '@apmixbot/dsh-llm';
import type { EpochHeader, Session } from '@apmixbot/dsh-session';
import type { TokenMeasurement, TokenMeterConfig } from './types.ts';
export type * from './types.ts';
export type * from './usage-projection.ts';
export type * from './breakdown-projection.ts';
declare module '@apmixbot/cordis' {
    interface Context {
        tokenMeter: TokenMeter;
    }
}
/** Replay owner for one service-wide estimator and isolated per-session folds. */
export declare class TokenMeter extends Service {
    static Config: z<TokenMeterConfig>;
    static inject: string[];
    private readonly states;
    constructor(ctx: Context, config?: TokenMeterConfig);
    /**
     * Measure current request pressure and surface through the durable tail.
     *
     * The effective envelope's routed provider/model selects the request-image
     * pricing every node is priced under: a route whose adapter declares image
     * pricing charges each retained image its visual tokens plus its
     * model-visible text, while other routes keep the fixed heuristic. Provider
     * usage is reused only when the latest successful call's canonical request
     * envelope matches `requestHeader` and its total is no lower than that
     * call's full route-priced anchor; otherwise the complete envelope and
     * surface are repriced. The anchor includes all surface nodes immediately
     * before the assistant message, including inputs admitted after step/start.
     *
     * `requestHeader` replaces the latest logged envelope for pressure and node
     * pricing; the node set always describes the current session surface. Every
     * call clones those positional nodes, so measurement is O(surface).
     *
     * @param session - session to replay through its current durable tail.
     * @param requestHeader - optional effective request envelope replacing the latest logged header.
     * @returns a detached deeply immutable pressure and surface measurement.
     */
    measure(session: Session, requestHeader?: EpochHeader): TokenMeasurement;
    /** Resolve the routed model's image pricing, when the llm service and route declare one. */
    private _routeImagePricing;
    /** Resolve request-time file projection when an LLM service is mounted. */
    private _fileRequestText;
    /**
     * Heuristically price one model-visible message (instance face of the pure
     * `estimateMessage` export from `estimate.ts`).
     * @param message - message to price without mutation.
     * @returns content and role-framing tokens under the fixed service heuristic.
     */
    estimateMessage(message: Message): number;
    /** Catch one session's fold up to the current durable tail. */
    private _sync;
    /**
     * Run every fallible step — surface plan and anchor validation — before
     * mutating replay state, so a malformed event remains unread on every
     * retry instead of half-applying.
     */
    private _foldEvent;
    /**
     * Reassemble provider output from the message's exact embedded stream.
     */
    private _estimateProviderAssistant;
}
export default TokenMeter;
//# sourceMappingURL=index.d.ts.map