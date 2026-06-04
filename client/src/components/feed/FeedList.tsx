import { useQueryClient } from "@tanstack/react-query";
import { ThreadCard } from "../thread/ThreadCard";
import { InfiniteScrollTrigger } from "./InfiniteScrollTrigger";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { EmptyState } from "../common/EmptyState";
import { api } from "../../services/api";
import { useLike } from "../../hooks/useLike";
import { useFollow } from "../../hooks/useFollow";
import type { FeedPage, Reply, Thread } from "../../types";

interface Props {
  threads: Thread[];
  activeUserId?: string;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetching: boolean;
}

function FeedSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-lg bg-neutral-900"
        />
      ))}
    </div>
  );
}

export function FeedList({
  threads,
  activeUserId,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isFetching,
}: Props) {
  const queryClient = useQueryClient();
  const { toggleLike, isPending: likePending } = useLike();
  const { toggleFollow } = useFollow();

  if (isFetching && threads.length === 0) {
    return <FeedSkeleton />;
  }

  if (!isFetching && threads.length === 0) {
    return <EmptyState message="No threads yet" />;
  }

  const appendReply = (threadId: string, reply: Reply) => {
    queryClient.setQueriesData<{ pages: FeedPage[] }>(
      { queryKey: ["feed"] },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            threads: page.threads.map((t) =>
              t.id === threadId
                ? {
                    ...t,
                    replies: [...t.replies, { ...reply, likedByMe: false }],
                    replyCount: t.replyCount + 1,
                  }
                : t,
            ),
          })),
        };
      },
    );
  };

  const removeThread = (threadId: string) => {
    queryClient.setQueriesData<{ pages: FeedPage[] }>(
      { queryKey: ["feed"] },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            threads: page.threads.filter((t) => t.id !== threadId),
          })),
        };
      },
    );
  };

  const removeReply = (threadId: string, replyId: string) => {
    queryClient.setQueriesData<{ pages: FeedPage[] }>(
      { queryKey: ["feed"] },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            threads: page.threads.map((t) =>
              t.id === threadId
                ? {
                    ...t,
                    replies: t.replies.filter((r) => r.id !== replyId),
                    replyCount: Math.max(0, t.replyCount - 1),
                  }
                : t,
            ),
          })),
        };
      },
    );
  };

  return (
    <div>
      {threads.map((thread) => (
        <ThreadCard
          key={thread.id}
          thread={thread}
          activeUserId={activeUserId}
          likePending={likePending}
          onLike={() =>
            toggleLike({
              targetType: "thread",
              targetId: thread.id,
              likedByMe: thread.likedByMe,
            })
          }
          onReplyLike={(reply) =>
            toggleLike({
              targetType: "reply",
              targetId: reply.id,
              likedByMe: reply.likedByMe,
            })
          }
          onFollow={() =>
            toggleFollow({
              userId: thread.author.id,
              isFollowing: thread.followingAuthor,
            })
          }
          onDelete={async () => {
            await api.del(`/api/threads/${thread.id}`);
            removeThread(thread.id);
          }}
          onReplyDelete={async (replyId) => {
            await api.del(`/api/replies/${replyId}`);
            removeReply(thread.id, replyId);
          }}
          onReply={async (content) => {
            const reply = await api.post<Reply>(
              `/api/threads/${thread.id}/replies`,
              { content },
            );
            appendReply(thread.id, reply);
          }}
        />
      ))}
      {hasNextPage && (
        <InfiniteScrollTrigger
          onIntersect={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        />
      )}
      {isFetchingNextPage && <LoadingSpinner />}
    </div>
  );
}
