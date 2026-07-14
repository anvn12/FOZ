import type { AccountRole } from "../../../shared/schema-enums";
import type { BaseTimestamps, RecordId } from "./_shared";

export interface RoleHistoryRecord extends BaseTimestamps {
  id: RecordId;
  userAccountId: RecordId;
  previousRole: AccountRole;
  newRole: AccountRole;
  changedBy: RecordId;
  reason: string | null;
}
