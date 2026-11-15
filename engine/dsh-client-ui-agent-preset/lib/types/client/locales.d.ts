/** Locale bundles for the agent-preset hero chip, header label, and management section. */
import { type PresetGuideKey } from './guide-locales.ts';
/** Locale keys these surfaces render. */
export type AgentPresetSettingsKey = PresetGuideKey | 'builtInGroup' | 'customGroup' | 'seatHint' | 'headerHint' | 'nav' | 'sectionIntro' | 'setDefault' | 'view' | 'presetStandardName' | 'presetStandardDescription' | 'presetPtcName' | 'presetPtcDescription' | 'presetMinimalName' | 'presetMinimalDescription' | 'presetCordisName' | 'presetCordisDescription' | 'inUse' | 'noDescription' | 'brokenBadge' | 'switchRefused' | 'standardUnavailable' | 'close' | 'creatorDraft' | 'createPlugin' | 'createPluginDescription' | 'createPluginChecking' | 'createPluginUnavailable' | 'createPluginMissing';
/** English copy. */
export declare const en: Record<AgentPresetSettingsKey, string>;
/** The dictionary key set. */
declare const keys: Record<AgentPresetSettingsKey, string>;
export { isBuiltInPreset, presetDisplayText } from '@apmixbot/dsh-agent-preset-registry/display';
export type { PresetDisplaySource, PresetDisplayText } from '@apmixbot/dsh-agent-preset-registry/display';
//# sourceMappingURL=locales.d.ts.map