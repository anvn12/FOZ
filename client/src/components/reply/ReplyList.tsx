import { ReplyCard } from "./ReplyCard";
import type { Reply } from "../../types";

interface Props {
  replies: Reply[];
  activeUserId?: string;
  onLike: (reply: Reply) => void;
  onDelete: (replyId: string) => Promise<void>;
  isReplyLikePending?: (replyId: string) => boolean;
}

export function ReplyList({
  replies,
  activeUserId,
  onLike,
  onDelete,
  isReplyLikePending,
}: Props) {
  const list = replies ?? [];
  if (list.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      {list.map((reply) => (
        <ReplyCard
          key={reply.id}
          reply={reply}
          isOwner={reply.author.id === activeUserId}
          onLike={() => onLike(reply)}
          onDelete={() => onDelete(reply.id)}
          likePending={isReplyLikePending?.(reply.id)}
        />
      ))}
    </div>
  );
}
