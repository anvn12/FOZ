import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { FeedPage, Thread } from "../types";

export function useLike() {
  const queryClient = useQueryClient();

  const updateCaches = (
    targetType: "thread" | "reply",
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
            threads: page.threads.map((t) => updateThread(t, targetType, targetId, likeCount, likedByMe)),
          })),
        };
      },
    );
  };

  const toggleLike = async (params: {
    targetType: "thread" | "reply";
    targetId: string;
    likedByMe: boolean;
  }) => {
    const { targetType, targetId, likedByMe } = params;
    const path =
      targetType === "thread"
        ? `/api/threads/${targetId}/likes`
        : `/api/replies/${targetId}/likes`;

    if (likedByMe) {
      const { likeCount } = await api.del<{ likeCount: number }>(path);
      updateCaches(targetType, targetId, likeCount, false);
    } else {
      const { likeCount } = await api.post<{ likeCount: number }>(path);
      updateCaches(targetType, targetId, likeCount, true);
    }
  };

  const mutation = useMutation({ mutationFn: toggleLike });

  return { toggleLike: mutation.mutateAsync, isPending: mutation.isPending };
}

function updateThread(
  thread: Thread,
  targetType: "thread" | "reply",
  targetId: string,
  likeCount: number,
  likedByMe: boolean,
): Thread {
  if (targetType === "thread" && thread.id === targetId) {
    return { ...thread, likeCount, likedByMe };
  }
  return {
    ...thread,
    replies: thread.replies.map((r) =>
      targetType === "reply" && r.id === targetId
        ? { ...r, likeCount, likedByMe }
        : r,
    ),
  };
}
