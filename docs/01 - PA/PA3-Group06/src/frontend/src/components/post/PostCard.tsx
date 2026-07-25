export function PostCard({
  body,
  likeCount,
  isOwner,
  liked,
  onToggleLike,
  onDelete,
  children,
}: {
  body: string;
  likeCount: number;
  isOwner: boolean;
  liked: boolean;
  onToggleLike: () => void;
  onDelete?: () => void;
  children?: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-outline-variant bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-body-md text-body-md text-on-surface">{body}</p>
          <p className="mt-1 text-label-sm text-outline">Likes: {likeCount}</p>
        </div>
        {isOwner && onDelete && (
          <button type="button" className="text-label-sm text-error" onClick={onDelete}>
            Delete
          </button>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onToggleLike} className="rounded-full border border-outline-variant px-3 py-1 text-sm">
          {liked ? "Unlike" : "Like"}
        </button>
      </div>
      <div className="mt-5 space-y-3">{children}</div>
    </article>
  );
}