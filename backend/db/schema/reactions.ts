import type { ReactionKind } from "../../../shared/schema-enums";
import type { BaseTimestamps, RecordId } from "./_shared";

export type ReactionTargetType = "post" | "comment";

export interface ReactionRecord extends BaseTimestamps {
  id: RecordId;
  userAccountId: RecordId;
  targetType: ReactionTargetType;
  targetId: RecordId;
  reactionKind: ReactionKind;
}
