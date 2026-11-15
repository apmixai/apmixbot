/** Locale-owned HTML implementation name and iframe status text. */
declare const keys: {
    title: string;
    frame: string;
    loading: string;
    failed: string;
};
/** HTML renderer dictionary keys. */
export type HtmlPreviewKey = keyof typeof keys;
/** English dictionary. */
export declare const en: {
    title: string;
    frame: string;
    loading: string;
    failed: string;
};
declare module '@apmixbot/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** HTML preview selection and status text. */
        documentHtml: HtmlPreviewKey;
    }
}
//# sourceMappingURL=locales.d.ts.map