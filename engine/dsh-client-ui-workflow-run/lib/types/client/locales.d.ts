/** `workflowRun` namespace dictionaries. */
/** Dictionary namespace owned by this plugin. */
export declare const NS = "workflowRun";
/** The dictionary key set. */
declare const keys: {
    'run.title': string;
    'run.members.one': string;
    'run.members.other': string;
    'run.empty': string;
    'phase.unassigned': string;
    'phase.empty': string;
    'statusCount.running': string;
    'statusCount.completed': string;
    'statusCount.failed': string;
    'statusCount.cancelled': string;
    'statusCount.interrupted': string;
    'member.empty': string;
    'member.open': string;
    'status.running': string;
    'status.completed': string;
    'status.failed': string;
    'status.cancelled': string;
    'status.interrupted': string;
};
/** English dictionary (same key set). */
export declare const en: Record<WorkflowRunKey, string>;
/** Union of this namespace's dictionary keys. */
export type WorkflowRunKey = keyof typeof keys;
//# sourceMappingURL=locales.d.ts.map