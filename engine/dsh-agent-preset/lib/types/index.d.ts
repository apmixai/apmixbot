/** A declarative preset row in an ordinary Cordis composition. */
import { Context, Service } from '@apmixbot/cordis';
import { EntryGroup } from '@apmixbot/cordis-plugin-loader';
import z from '@apmixbot/schemastery';
import type { PresetDefinition } from '@apmixbot/dsh-agent-preset-registry';
/** Definition submitted to the preset registry. */
export type Config = PresetDefinition;
/** Registers child plugin configuration without owning Agents using older revisions. */
export default class AgentPreset {
    private readonly ctx;
    private readonly config;
    static inject: string[];
    /** Preserve child expressions until their own plugins activate. */
    static readonly [EntryGroup.key] = true;
    static Config: z<Config>;
    constructor(ctx: Context, config: Config);
    [Service.init](): AsyncGenerator<() => Promise<void>, void, unknown>;
}
//# sourceMappingURL=index.d.ts.map