/**
 * `slash.menu` namespace dictionaries: group titles keyed by source name
 * (the lookup chain returns the key itself, so an unknown source shows its
 * raw name), the pending row, and the listbox and header aria labels.
 */
/** The dictionary key set. */
declare const keys: {
    command: string;
    skill: string;
    subagent: string;
    loading: string;
    'drill.aria': string;
    'drill.hint': string;
    'drill.key': string;
    'crumbs.aria': string;
    'suggestions.aria': string;
};
/** The slash.menu namespace key union. */
export type MenuKey = keyof typeof keys;
/** English dictionary, checked complete against the key set. */
export declare const en: {
    command: string;
    skill: string;
    subagent: string;
    loading: string;
    'drill.aria': string;
    'drill.hint': string;
    'drill.key': string;
    'crumbs.aria': string;
    'suggestions.aria': string;
};
//# sourceMappingURL=locales.d.ts.map