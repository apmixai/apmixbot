declare module '@apmixbot/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** File-tree type name, guide entry, row states, and failure lines. */
        sidebarFiles: SidebarFilesKey;
    }
}
/** The dictionary key set. */
declare const keys: {
    'shortcut.noSession': string;
    'type.label': string;
    'guide.title': string;
    'guide.description': string;
    loading: string;
    empty: string;
    truncated: string;
    noWorkspace: string;
    reload: string;
    autoRefresh: string;
    'autoRefresh.enable': string;
    'autoRefresh.disable': string;
    'entry.other': string;
    'error.notFound': string;
    'error.outsideWorkspace': string;
    'error.notDirectory': string;
    'error.unavailable': string;
};
/** Files dictionary key union. */
export type SidebarFilesKey = keyof typeof keys;
/** English dictionary. */
export declare const en: {
    'shortcut.noSession': string;
    'type.label': string;
    'guide.title': string;
    'guide.description': string;
    loading: string;
    empty: string;
    truncated: string;
    noWorkspace: string;
    reload: string;
    autoRefresh: string;
    'autoRefresh.enable': string;
    'autoRefresh.disable': string;
    'entry.other': string;
    'error.notFound': string;
    'error.outsideWorkspace': string;
    'error.notDirectory': string;
    'error.unavailable': string;
};
//# sourceMappingURL=locales.d.ts.map