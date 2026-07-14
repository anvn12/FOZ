import type { SummaryState } from "../../../shared/schema-enums";
import type { BaseTimestamps, RecordId } from "./_shared";

export interface PostSummaryRecord extends BaseTimestamps {
  id: RecordId;
  postId: RecordId;
  summaryText: string;
  providerName: string;
  summaryState: SummaryState;
}
