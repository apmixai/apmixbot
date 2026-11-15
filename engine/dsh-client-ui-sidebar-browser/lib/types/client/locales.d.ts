/** Locale-owned Browser tab copy. */
declare const keys: {
    'type.label': string;
    'guide.title': string;
    'guide.description': string;
    'shortcut.noSession': string;
    'address.placeholder': string;
    'address.changed': string;
    back: string;
    forward: string;
    reload: string;
    go: string;
    external: string;
    'sandbox.disable': string;
    'sandbox.enable': string;
    'sandbox.warning': string;
    start: string;
    loading: string;
    'restore.previous': string;
    'restore.action': string;
    'error.empty': string;
    'error.invalid': string;
    'error.protocol': string;
    'error.credentials': string;
    'error.application-origin': string;
    'load.failed': string;
    'load.failed.detail': string;
    'address.unknown': string;
};
/** Browser dictionary key union. */
export type SidebarBrowserKey = keyof typeof keys;
/** English dictionary with the same keys. */
export declare const en: {
    'type.label': string;
    'guide.title': string;
    'guide.description': string;
    'shortcut.noSession': string;
    'address.placeholder': string;
    'address.changed': string;
    back: string;
    forward: string;
    reload: string;
    go: string;
    external: string;
    'sandbox.disable': string;
    'sandbox.enable': string;
    'sandbox.warning': string;
    start: string;
    loading: string;
    'restore.previous': string;
    'restore.action': string;
    'error.empty': string;
    'error.invalid': string;
    'error.protocol': string;
    'error.credentials': string;
    'error.application-origin': string;
    'load.failed': string;
    'load.failed.detail': string;
    'address.unknown': string;
};
declare module '@apmixbot/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Sidebar Browser labels, navigation controls, and failures. */
        sidebarBrowser: SidebarBrowserKey;
    }
}
//# sourceMappingURL=locales.d.ts.map