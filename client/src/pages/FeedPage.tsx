import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "../hooks/useSession";
import { useFeed } from "../hooks/useFeed";
import { useSocketFeedSync } from "../hooks/useSocketFeedSync";
import { useSessionStore } from "../store/sessionStore";
import { UserAvatar } from "../components/user/UserAvatar";
import { FeedList } from "../components/feed/FeedList";
import { ThreadCompose } from "../components/thread/ThreadCompose";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import type { FeedPage, Thread } from "../types";
import { normalizeThreadForFeed } from "../utils/normalizeThread";
import { feedQueryKey } from "../lib/feedQuery";
import { Navigate } from "react-router-dom";

export function FeedPage() {
  const activeUser = useSessionStore((s) => s.activeUser);
  const { clearSession } = useSession();
  const { threads, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, refetch } =
    useFeed(activeUser?.id);
  const queryClient = useQueryClient();
  useSocketFeedSync(activeUser?.id);

  if (!activeUser) {
    return <Navigate to="/" replace />;
  }

  const onThreadCreated = (thread: Thread) => {
    const normalized = normalizeThreadForFeed(thread);
    queryClient.setQueryData<{ pages: FeedPage[]; pageParams: unknown[] }>(
      feedQueryKey(activeUser.id),
      (old) => {
        if (!old?.pages?.length) {
          return {
            pages: [{ threads: [normalized], nextCursor: null }],
            pageParams: [undefined],
          };
        }
        const first = old.pages[0];
        return {
          ...old,
          pages: [
            { ...first, threads: [normalized, ...first.threads] },
            ...old.pages.slice(1),
          ],
        };
      },
    );
  };

  return (
    <div className="mx-auto min-h-screen max-w-xl border-x border-neutral-800">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-800 bg-neutral-950/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <UserAvatar user={activeUser} />
          <span className="font-medium">{activeUser.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            className="min-h-[44px] rounded-lg px-3 text-sm text-neutral-400 hover:text-white"
            aria-label="Refresh feed"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => clearSession()}
            className="min-h-[44px] rounded-lg px-3 text-sm text-neutral-400 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </header>
      <ThreadCompose onSuccess={onThreadCreated} />
      {isFetching && threads.length === 0 ? (
        <LoadingSpinner fullPage />
      ) : (
        <FeedList
          threads={threads}
          activeUserId={activeUser.id}
          fetchNextPage={fetchNextPage}
          hasNextPage={!!hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isFetching={isFetching}
        />
      )}
    </div>
  );
}
