/** Read-only `cordis_define` card with Host and Client source tabs. */
import type { InjectFace, PropsLocale } from '@apmixbot/dsh-client-ui-slots';
import type { ToolCallViewProps } from '@apmixbot/dsh-client-ui-tool/client';
import type { CordisCardFace } from './slots.ts';
/** Full card props composed by the keyed Tool slot. */
export type CordisDefineRowProps = ToolCallViewProps & InjectFace<CordisCardFace> & PropsLocale<'cordis'>;
/** Render one immutable Package definition. */
export declare function CordisDefineRow(props: CordisDefineRowProps): import("react").JSX.Element;
//# sourceMappingURL=CordisDefineRow.d.ts.map