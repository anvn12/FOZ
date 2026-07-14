import type { AccountRole, AccountStatus } from "../../../shared/schema-enums";
import type { BaseTimestamps, RecordId } from "./_shared";

export interface UserAccountRecord extends BaseTimestamps {
  id: RecordId;
  email: string;
  passwordHash: string;
  role: AccountRole;
  status: AccountStatus;
}

export interface ProfileRecord extends BaseTimestamps {
  id: RecordId;
  userAccountId: RecordId;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  website: string | null;
}
