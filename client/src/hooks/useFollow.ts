import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { feedQueryKey } from "../lib/feedQuery";
import { useSessionStore } from "../store/sessionStore";
import type { FeedPage } from "../types";

export function useFollow() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.activeUser?.id);

  const updateFollowing = (authorId: string, following: boolean) => {
    if (!userId) return;
    queryClient.setQueryData<{ pages: FeedPage[] }>(
      feedQueryKey(userId),
      (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            threads: page.threads.map((t) =>
              t.author.id === authorId
                ? { ...t, followingAuthor: following }
                : t,
            ),
          })),
        };
      },
    );
  };

  const toggleFollow = async (params: {
    userId: string;
    isFollowing: boolean;
  }) => {
    const path = `/api/users/${params.userId}/follow`;
    if (params.isFollowing) {
      await api.del<{ ok: boolean }>(path);
      updateFollowing(params.userId, false);
    } else {
      await api.post<{ ok: boolean }>(path);
      updateFollowing(params.userId, true);
    }
  };

  const mutation = useMutation({ mutationFn: toggleFollow });

  return { toggleFollow: mutation.mutateAsync, isPending: mutation.isPending };
}
