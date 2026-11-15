/** Platform-neutral assembly of generated Host Remote contributions. */
import agentPresetsRemote from '@apmixbot/dsh-agent-preset-registry/remote';
import userQuestionsRemote from '@apmixbot/dsh-user-questions/remote';
import commandsRemote from '@apmixbot/dsh-commands/remote';
import settingsControllerRemote from '@apmixbot/dsh-api-settings-controller/remote';
import goalsRemote from '@apmixbot/dsh-goal/remote';
import scheduleRemote from '@apmixbot/dsh-schedule/remote';
import llmRemote from '@apmixbot/dsh-llm/remote';
import dynamicRemote from '@apmixbot/dsh-cordis-host-runner/remote';
import pluginManagerRemote from '@apmixbot/dsh-plugin-manager/remote';
import pluginRegistryProbeRemote from '@apmixbot/dsh-client-ui-plugin-manager/remote';
import pluginMarketRemote from '@apmixbot/dsh-plugin-market/remote';
import pluginInventoryRemote from '@apmixbot/dsh-host-plugin-inventory/remote';
import messageFeedbackRemote from '@apmixbot/dsh-message-feedback/remote';
import permissionPresetsRemote from '@apmixbot/dsh-permission-presets/remote';
import sessionFeedbackRemote from '@apmixbot/dsh-command-feedback/remote';
import fileUploadsRemote from '@apmixbot/dsh-client-file-upload/remote';
import sessionReferencesRemote from '@apmixbot/dsh-session-reference/remote';
import subagentsRemote from '@apmixbot/dsh-subagent/remote';
import sessionRemote from '@apmixbot/dsh-api-session-controller/remote';
import jobRemote from '@apmixbot/dsh-api-job-controller/remote';
import workspaceRemote from '@apmixbot/dsh-api-workspace-controller/remote';
import terminalRemote from '@apmixbot/dsh-api-terminal-controller/remote';
import workspaceFilesRemote from '@apmixbot/dsh-api-workspace-files/remote';
/** Required service: the typed Client Remote contribution mount. */
export const inject = ['remote'];
/**
 * Mount the Host capabilities explicitly selected for this Client assembly.
 * @param ctx - Client Cordis root carrying the typed API service.
 * @returns disposer after every selected Remote namespace is ready.
 */
export async function apply(ctx) {
    const disposers = [];
    try {
        for (const contribution of [
            agentPresetsRemote, commandsRemote, settingsControllerRemote,
            goalsRemote, llmRemote, dynamicRemote, scheduleRemote,
            pluginInventoryRemote, pluginManagerRemote, pluginMarketRemote, pluginRegistryProbeRemote,
            messageFeedbackRemote, sessionFeedbackRemote,
            fileUploadsRemote, sessionReferencesRemote,
            permissionPresetsRemote, subagentsRemote, sessionRemote, jobRemote, workspaceRemote, workspaceFilesRemote, terminalRemote,
            userQuestionsRemote,
        ]) {
            disposers.push(await ctx.remote.$mount(contribution));
        }
    }
    catch (error) {
        for (const dispose of disposers.reverse())
            await dispose();
        throw error;
    }
    // Unwound in reverse mount order, so a namespace never outlives one mounted
    // after it.
    return async () => {
        for (const dispose of disposers.reverse())
            await dispose();
    };
}
//# sourceMappingURL=index.js.map