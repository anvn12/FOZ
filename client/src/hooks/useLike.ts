import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "../services/api";
import type { FeedPage, Thread } from "../types";

type TargetType = "thread" | "reply";

function pendingKey(targetType: TargetType, targetId: string) {
  return `${targetType}:${targetId}`;
}

export function useLike() {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<Set<string>>(() => new Set());

  const updateCaches = useCallback(
    (
      targetType: TargetType,
      targetId: string,
      likeCount: number,
      likedByMe: boolean,
    ) => {
      queryClient.setQueriesData<{ pages: FeedPage[] }>(
        { queryKey: ["feed"] },
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
    [queryClient],
  );

  const isTargetPending = useCallback(
    (targetType: TargetType, targetId: string) =>
      pending.has(pendingKey(targetType, targetId)),
    [pending],
  );

  const toggleLike = useCallback(
    async (params: {
      targetType: TargetType;
      targetId: string;
      likedByMe: boolean;
      likeCount: number;
    }) => {
      const { targetType, targetId, likedByMe, likeCount } = params;
      const pk = pendingKey(targetType, targetId);
      const path =
        targetType === "thread"
          ? `/api/threads/${targetId}/likes`
          : `/api/replies/${targetId}/likes`;

      const nextLiked = !likedByMe;
      const optimisticCount = nextLiked ? likeCount + 1 : Math.max(0, likeCount - 1);

      setPending((s) => new Set(s).add(pk));
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
          updateCaches(targetType, targetId, serverCount, true);
        }
      } catch (e) {
        updateCaches(targetType, targetId, likeCount, likedByMe);
        if (e instanceof ApiError && e.code === "ALREADY_LIKED") {
          updateCaches(targetType, targetId, likeCount + 1, true);
          return;
        }
        if (e instanceof ApiError && e.code === "NOT_LIKED") {
          updateCaches(targetType, targetId, likeCount, false);
          return;
        }
        console.error("Like toggle failed:", e);
      } finally {
        setPending((s) => {
          const next = new Set(s);
          next.delete(pk);
          return next;
        });
      }
    },
    [updateCaches],
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
