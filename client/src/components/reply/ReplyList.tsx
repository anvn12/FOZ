import { ReplyCard } from "./ReplyCard";
import type { Reply } from "../../types";

interface Props {
  replies: Reply[];
  activeUserId?: string;
  onLike: (reply: Reply) => void;
  onDelete: (replyId: string) => Promise<void>;
  likePending?: boolean;
}

export function ReplyList({
  replies,
  activeUserId,
  onLike,
  onDelete,
  likePending,
}: Props) {
  if (replies.length === 0) return null;

  return (
    <div className="mt-2 space-y-1">
      {replies.map((reply) => (
        <ReplyCard
          key={reply.id}
          reply={reply}
          isOwner={reply.author.id === activeUserId}
          onLike={() => onLike(reply)}
          onDelete={() => onDelete(reply.id)}
          likePending={likePending}
        />
      ))}
    </div>
  );
}
