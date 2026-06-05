import { useState } from "react";
import { UserAvatar } from "../user/UserAvatar";
import { FollowButton } from "../user/FollowButton";
import { LikeButton } from "../common/LikeButton";
import { DeleteButton } from "../common/DeleteButton";
import { ReplyList } from "../reply/ReplyList";
import { ReplyCompose } from "../reply/ReplyCompose";
import type { Reply, Thread } from "../../types";
import { formatTime } from "../../utils/formatTime";
import { messageBodyClassName } from "../../lib/messageBody";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

interface Props {
  thread: Thread;
  activeUserId?: string;
  onLike: () => void;
  onReplyLike: (reply: Reply) => void;
  onFollow: () => void;
  onDelete: () => Promise<void>;
  onReplyDelete: (replyId: string) => Promise<void>;
  onReply: (content: string) => Promise<void>;
  likePending?: boolean;
  isReplyLikePending?: (replyId: string) => boolean;
}

export function ThreadCard({
  thread,
  activeUserId,
  onLike,
  onReplyLike,
  onFollow,
  onDelete,
  onReplyDelete,
  onReply,
  likePending,
  isReplyLikePending,
}: Props) {
  const [showReply, setShowReply] = useState(false);
  const imageSrc = thread.imageUrl
    ? thread.imageUrl.startsWith("http")
      ? thread.imageUrl
      : `${API_BASE}${thread.imageUrl}`
    : null;

  return (
    <article className="border-b border-neutral-800 p-4">
      <div className="flex items-start gap-3">
        <UserAvatar user={thread.author} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{thread.author.name}</span>
            <span className="text-xs text-neutral-500">
              {formatTime(thread.createdAt)}
            </span>
            <FollowButton
              userId={thread.author.id}
              activeUserId={activeUserId}
              isFollowing={thread.followingAuthor}
              onToggle={onFollow}
            />
          </div>
          <p className={messageBodyClassName}>{thread.content}</p>
          {imageSrc && (
            <img
              src={imageSrc}
              alt=""
              className="mt-2 max-h-80 w-full rounded-lg object-cover"
            />
          )}
          <div className="mt-3 flex flex-wrap items-center gap-1">
            <LikeButton
              likeCount={thread.likeCount}
              likedByMe={thread.likedByMe}
              onToggle={onLike}
              disabled={likePending}
            />
            <button
              type="button"
              className="min-h-[44px] rounded-lg px-3 text-sm text-neutral-400 hover:text-white"
              onClick={() => setShowReply((v) => !v)}
            >
              Reply · {thread.replyCount}
            </button>
            <DeleteButton
              isOwner={thread.author.id === activeUserId}
              onDelete={onDelete}
            />
          </div>
          {showReply && (
            <ReplyCompose
              onSubmit={async (content) => {
                await onReply(content);
                setShowReply(false);
              }}
              onCancel={() => setShowReply(false)}
            />
          )}
          <ReplyList
            replies={thread.replies}
            activeUserId={activeUserId}
            onLike={onReplyLike}
            onDelete={onReplyDelete}
            isReplyLikePending={isReplyLikePending}
          />
        </div>
      </div>
    </article>
  );
}
