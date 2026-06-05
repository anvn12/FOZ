import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../services/socket";
import { feedQueryKey } from "../lib/feedQuery";
import type { FeedPage } from "../types";

export function useSocketFeedSync(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const patchFeed = (
      updater: (pages: FeedPage[]) => FeedPage[],
    ) => {
      queryClient.setQueryData<{ pages: FeedPage[] }>(
        feedQueryKey(userId),
        (old) => {
          if (!old) return old;
          return { ...old, pages: updater(old.pages) };
        },
      );
    };

    const onLike = (payload: {
      targetType: "thread" | "reply";
      targetId: string;
      likeCount: number;
    }) => {
      patchFeed((pages) =>
        pages.map((page) => ({
          ...page,
          threads: page.threads.map((t) => {
            if (payload.targetType === "thread" && t.id === payload.targetId) {
              return { ...t, likeCount: payload.likeCount };
            }
            return {
              ...t,
              replies: (t.replies ?? []).map((r) =>
                payload.targetType === "reply" && r.id === payload.targetId
                  ? { ...r, likeCount: payload.likeCount }
                  : r,
              ),
            };
          }),
        })),
      );
    };

    const onReplyCount = (payload: { threadId: string; replyCount: number }) => {
      patchFeed((pages) =>
        pages.map((page) => ({
          ...page,
          threads: page.threads.map((t) =>
            t.id === payload.threadId
              ? { ...t, replyCount: payload.replyCount }
              : t,
          ),
        })),
      );
    };

    const onThreadDeleted = (payload: { threadId: string }) => {
      patchFeed((pages) =>
        pages.map((page) => ({
          ...page,
          threads: page.threads.filter((t) => t.id !== payload.threadId),
        })),
      );
    };

    const onReplyDeleted = (payload: { replyId: string; threadId: string }) => {
      patchFeed((pages) =>
        pages.map((page) => ({
          ...page,
          threads: page.threads.map((t) =>
            t.id === payload.threadId
              ? {
                  ...t,
                  replies: (t.replies ?? []).filter(
                    (r) => r.id !== payload.replyId,
                  ),
                }
              : t,
          ),
        })),
      );
    };

    socket.on("like:updated", onLike);
    socket.on("reply:count-updated", onReplyCount);
    socket.on("thread:deleted", onThreadDeleted);
    socket.on("reply:deleted", onReplyDeleted);

    return () => {
      socket.off("like:updated", onLike);
      socket.off("reply:count-updated", onReplyCount);
      socket.off("thread:deleted", onThreadDeleted);
      socket.off("reply:deleted", onReplyDeleted);
    };
  }, [queryClient, userId]);
}
