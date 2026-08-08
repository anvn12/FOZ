export const accountRoles = ["guest", "standard", "moderator", "administrator"] as const;
export type AccountRole = (typeof accountRoles)[number];

export const accountStatuses = ["active", "suspended", "banned", "pending"] as const;
export type AccountStatus = (typeof accountStatuses)[number];

export const contentLifecycleStates = ["active", "hidden", "removed_by_moderation", "removed_by_administration"] as const;
export type ContentLifecycleState = (typeof contentLifecycleStates)[number];

export const contentVisibilityStates = ["public", "hidden"] as const;
export type ContentVisibilityState = (typeof contentVisibilityStates)[number];

export const reactionKinds = ["like"] as const;
export type ReactionKind = (typeof reactionKinds)[number];

export const reportStatuses = ["open", "under_review", "escalated", "dismissed", "closed"] as const;
export type ReportStatus = (typeof reportStatuses)[number];

export const moderationOutcomes = ["dismissed", "flagged", "escalated"] as const;
export type ModerationOutcome = (typeof moderationOutcomes)[number];

export const escalationStates = ["none", "pending", "forwarded"] as const;
export type EscalationState = (typeof escalationStates)[number];

export const summaryStates = ["pending", "available", "hidden", "failed", "refreshed"] as const;
export type SummaryState = (typeof summaryStates)[number];

export const reportSubjectTypes = ["post", "comment", "user"] as const;
export type ReportSubjectType = (typeof reportSubjectTypes)[number];

export const reportReasonTypes = ["harassment", "spam", "inappropriate", "other"] as const;
export type ReportReasonType = (typeof reportReasonTypes)[number];

