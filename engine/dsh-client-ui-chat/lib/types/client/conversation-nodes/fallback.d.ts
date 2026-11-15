import type { Context } from '@apmixbot/cordis';
import type { ConversationNodeDefinition, UnknownSurfaceNode } from '@apmixbot/dsh-client-ui-conversation/client';
declare module '../contract/chat-nodes.ts' {
    interface ChatNodeDataMap {
        /** Generic presentation of an unclaimed append-surface event. */
        unknown: UnknownSurfaceNode;
    }
}
/** Unclaimed append-surface fallback Definition. */
export declare const unknownFallbackDefinition: ConversationNodeDefinition<UnknownSurfaceNode>;
/**
 * Register the unmatched append-surface fallback contribution.
 * @param ctx - owning UI Conversation context.
 */
export declare function registerUnknownConversationFallback(ctx: Context): void;
//# sourceMappingURL=fallback.d.ts.map