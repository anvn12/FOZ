export type RecordId = string;
export type TimestampIso = string;

export interface BaseTimestamps {
  createdAt: TimestampIso;
  updatedAt: TimestampIso;
}

export interface SoftDeleteFields {
  deletedAt: TimestampIso | null;
}

export interface OwnershipFields {
  createdBy: RecordId;
  updatedBy: RecordId | null;
}

export interface LifecycleFields {
  lifecycleState: string;
}

export interface AuditFields extends BaseTimestamps, SoftDeleteFields {}

export function makeRecordKey(prefix: string, id: string): string {
  return `${prefix}_${id}`;
}
