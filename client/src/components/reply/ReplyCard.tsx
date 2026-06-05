import { UserAvatar } from "../user/UserAvatar";
import { LikeButton } from "../common/LikeButton";
import { DeleteButton } from "../common/DeleteButton";
import type { Reply } from "../../types";
import { formatTime } from "../../utils/formatTime";
import { replyMessageBodyClassName } from "../../lib/messageBody";

interface Props {
  reply: Reply;
  isOwner: boolean;
  onLike: () => void;
  onDelete: () => Promise<void>;
  likePending?: boolean;
}

export function ReplyCard({
  reply,
  isOwner,
  onLike,
  onDelete,
  likePending,
}: Props) {
  return (
    <div className="border-l-2 border-neutral-700 pl-3 ml-4 py-2">
      <div className="flex items-center gap-2">
        <UserAvatar user={reply.author} size="sm" />
        <span className="text-sm font-medium">{reply.author.name}</span>
        <span className="text-xs text-neutral-500">
          {formatTime(reply.createdAt)}
        </span>
      </div>
      <p className={replyMessageBodyClassName}>{reply.content}</p>
      <div className="mt-1 flex items-center gap-2">
        <LikeButton
          likeCount={reply.likeCount}
          likedByMe={reply.likedByMe}
          onToggle={onLike}
          disabled={likePending}
        />
        <DeleteButton isOwner={isOwner} onDelete={onDelete} />
      </div>
    </div>
  );
}
