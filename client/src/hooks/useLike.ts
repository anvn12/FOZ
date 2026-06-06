import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../services/api";
import { feedQueryKey } from "../lib/feedQuery";
import { mergeLikeCount } from "../lib/likeCountMerge";
import {
  addLikePending,
  isLikePending,
  likePendingKey,
  removeLikePending,
} from "../lib/likePending";
import { useSessionStore } from "../store/sessionStore";
import type { FeedPage, Thread } from "../types";

type TargetType = "thread" | "reply";

export function useLike() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.activeUser?.id);
  const [pending, setPending] = useState<Set<string>>(() => new Set());

  const updateCaches = useCallback(
    (
      targetType: TargetType,
      targetId: string,
      likeCount: number,
      likedByMe: boolean,
    ) => {
      if (!userId) return;
      queryClient.setQueryData<{ pages: FeedPage[]; pageParams: unknown[] }>(
        feedQueryKey(userId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              threads: page.threads.map((t) =>
                updateThread(t, targetType, targetId, likeCount, likedByMe),
              ),
            })),
          };
        },
      );
    },
    [queryClient, userId],
  );

  const isTargetPending = useCallback(
    (targetType: TargetType, targetId: string) =>
      pending.has(likePendingKey(targetType, targetId)),
    [pending],
  );

  const toggleLike = useCallback(
    async (params: {
      targetType: TargetType;
      targetId: string;
      likedByMe: boolean;
      likeCount: number;
    }) => {
      if (!userId) return;

      const { targetType, targetId, likedByMe, likeCount } = params;
      const pk = likePendingKey(targetType, targetId);
      const path =
        targetType === "thread"
          ? `/api/threads/${targetId}/likes`
          : `/api/replies/${targetId}/likes`;

      const nextLiked = !likedByMe;
      const optimisticCount = nextLiked
        ? likeCount + 1
        : Math.max(0, likeCount - 1);

      setPending((s) => new Set(s).add(pk));
      addLikePending(pk);
      updateCaches(targetType, targetId, optimisticCount, nextLiked);

      try {
        if (likedByMe) {
          const { likeCount: serverCount } = await api.del<{ likeCount: number }>(
            path,
          );
          updateCaches(targetType, targetId, serverCount, false);
        } else {
          const { likeCount: serverCount } = await api.post<{ likeCount: number }>(
            path,
          );
          const merged = mergeLikeCount(optimisticCount, serverCount, true);
          updateCaches(targetType, targetId, merged, true);
        }
      } catch (e) {
        if (e instanceof ApiError && e.code === "ALREADY_LIKED") {
          const merged = mergeLikeCount(likeCount, likeCount + 1, true);
          updateCaches(targetType, targetId, merged, true);
          return;
        }
        if (e instanceof ApiError && e.code === "NOT_LIKED") {
          updateCaches(targetType, targetId, likeCount, false);
          return;
        }
        updateCaches(targetType, targetId, likeCount, likedByMe);
        console.error("Like toggle failed:", e);
      } finally {
        setPending((s) => {
          const next = new Set(s);
          next.delete(pk);
          return next;
        });
        removeLikePending(pk);
      }
    },
    [updateCaches, userId],
  );

  return { toggleLike, isTargetPending };
}

function updateThread(
  thread: Thread,
  targetType: TargetType,
  targetId: string,
  likeCount: number,
  likedByMe: boolean,
): Thread {
  if (targetType === "thread" && thread.id === targetId) {
    return { ...thread, likeCount, likedByMe };
  }
  return {
    ...thread,
    replies: (thread.replies ?? []).map((r) =>
      targetType === "reply" && r.id === targetId
        ? { ...r, likeCount, likedByMe }
        : r,
    ),
  };
}

export { isLikePending };
