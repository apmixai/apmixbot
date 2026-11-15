/** Shortcut reference plugin; commands and entry points share one declared store. */
import type { Context } from '@apmixbot/cordis';
import { en } from './locales.ts';
declare module '@apmixbot/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Shortcut reference and settings entry copy. */
        shortcuts: keyof typeof en;
    }
}
/** Required command, locale, and slot services. */
export declare const inject: string[];
/**
 * Register the reference command, settings row, and single shell overlay.
 * @param ctx - plugin-owned client context.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map