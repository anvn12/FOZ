import type { ModerationOutcome, ReportStatus, ReportSubjectType, EscalationState } from "../../../shared/schema-enums";
import type { BaseTimestamps, RecordId } from "./_shared";

export interface ReportRecord extends BaseTimestamps {
  id: RecordId;
  reporterId: RecordId;
  subjectType: ReportSubjectType;
  subjectId: RecordId;
  reason: string;
  status: ReportStatus;
}

export interface ModerationReviewRecord extends BaseTimestamps {
  id: RecordId;
  reportId: RecordId;
  reviewedBy: RecordId;
  outcome: ModerationOutcome;
  escalationState: EscalationState;
  notes: string | null;
}
