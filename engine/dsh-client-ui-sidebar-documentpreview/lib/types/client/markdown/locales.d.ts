/** Markdown implementation labels and primitive chrome. */
declare const keys: {
    'viewer.label': string;
    'code.copy': string;
    'code.copied': string;
    footnotes: string;
};
/** Markdown namespace keys. */
export type MarkdownPreviewKey = keyof typeof keys;
/** English labels. */
export declare const en: {
    'viewer.label': string;
    'code.copy': string;
    'code.copied': string;
    footnotes: string;
};
declare module '@apmixbot/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Markdown document renderer and its code/footnote controls. */
        documentMarkdown: MarkdownPreviewKey;
    }
}
//# sourceMappingURL=locales.d.ts.map