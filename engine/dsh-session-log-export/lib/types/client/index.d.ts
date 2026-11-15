/** Browser plugin owning Session export download state and its shared modal. */
import type { Context as ClientContext } from '@apmixbot/cordis';
import { SessionLogDownloadController } from './controller.ts';
import { type SessionLogDownloadKey } from './locales.ts';
declare module '@apmixbot/cordis' {
    interface Context {
        sessionLogDownload: SessionLogDownloadController;
    }
}
declare module '@apmixbot/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        'session-log-download': SessionLogDownloadKey;
    }
}
export type { SessionLogDownloadEntry, SessionLogDownloadState } from './controller.ts';
export declare const inject: string[];
/**
 * Provide the download controller and mount its modal into the Session Header.
 * @param ctx - browser context carrying slots and locale services.
 */
export declare function apply(ctx: ClientContext): void;
export type { SessionLogDownloadDialogInjected, SessionLogDownloadDialogProps } from './Dialog.tsx';
//# sourceMappingURL=index.d.ts.map