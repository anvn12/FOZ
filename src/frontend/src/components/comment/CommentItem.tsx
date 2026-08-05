import React from "react";
import { ExpandableText } from "#frontend/components/ExpandableText";

export function CommentItem({
  body,
  likeCount,
  isOwner,
  liked,
  onToggleLike,
  onEdit,
  onDelete,
  unavailable,
}: {
  body: string;
  likeCount: number;
  isOwner: boolean;
  liked: boolean;
  onToggleLike: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  unavailable?: boolean;
}) {
  return (
    <div className="rounded-xl border border-outline-variant p-3">
      <ExpandableText
        text={body}
        maxLength={240}
        maxLines={4}
        className={unavailable ? "text-outline line-through" : undefined}
      />
      {unavailable && <p className="mt-1 text-label-sm text-outline">This comment is no longer available.</p>}
      <p className="mt-1 text-label-sm text-outline">Likes: {likeCount}</p>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={onToggleLike} disabled={unavailable} className="rounded-full border px-3 py-1 text-xs disabled:opacity-50">
          {liked ? "Unlike" : "Like"}
        </button>
        {isOwner && onEdit && (
          <button type="button" className="rounded-full border px-3 py-1 text-xs" onClick={onEdit} disabled={unavailable}>
            Edit
          </button>
        )}
        {isOwner && onDelete && (
          <button type="button" className="rounded-full border px-3 py-1 text-xs text-error" onClick={onDelete} disabled={unavailable}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}