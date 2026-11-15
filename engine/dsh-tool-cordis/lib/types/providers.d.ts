/** First-party Host inspect providers registered by the Cordis tool package. */
import type { Context } from '@apmixbot/cordis';
import type { HostCordisInspectProviderRegistration } from '@apmixbot/dsh-cordis-host-runner';
/**
 * Construct Host providers over generated Catalogs, evaluator declarations, and live Tool scope.
 * @param ctx - Host context used for live Loader Config and Agent-scoped Tool queries.
 * @returns registrations for static catalogs and live Host capabilities.
 */
export declare function hostInspectProviders(ctx: Context): HostCordisInspectProviderRegistration[];
//# sourceMappingURL=providers.d.ts.map