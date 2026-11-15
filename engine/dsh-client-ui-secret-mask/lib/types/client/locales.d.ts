/** `secretMask` dictionaries for the per-credential reveal control. */
/** Dictionary namespace owned by this plugin. */
export declare const NS = "secretMask";
/** The dictionary key set. */
declare const keys: {
    'secret.reveal': string;
    'secret.hide': string;
};
/** The secretMask namespace key union. */
export type SecretMaskKey = keyof typeof keys;
declare module '@apmixbot/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Accessible names of the control that reveals one masked credential. */
        secretMask: SecretMaskKey;
    }
}
/** English dictionary, checked complete against the key set. */
export declare const en: {
    'secret.reveal': string;
    'secret.hide': string;
};
//# sourceMappingURL=locales.d.ts.map