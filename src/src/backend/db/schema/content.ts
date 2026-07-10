import type { ContentLifecycleState, ContentVisibilityState } from "../../../shared/schema-enums";
import type { BaseTimestamps, RecordId, SoftDeleteFields } from "./_shared";

export interface PostRecord extends BaseTimestamps, SoftDeleteFields {
  id: RecordId;
  authorId: RecordId;
  body: string;
  visibilityState: ContentVisibilityState;
  lifecycleState: ContentLifecycleState;
}

export interface CommentRecord extends BaseTimestamps, SoftDeleteFields {
  id: RecordId;
  postId: RecordId;
  authorId: RecordId;
  parentCommentId: RecordId | null;
  body: string;
  lifecycleState: ContentLifecycleState;
}
