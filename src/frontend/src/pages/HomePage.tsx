import React, { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "#frontend/stores/auth";
import { NavBar } from "#frontend/components/NavBar.js";
import { GuestLoginModal, GUEST_LOGIN_PROMPT_KEY } from "#frontend/components/GuestLoginModal";

import { useInfiniteQuery } from "@tanstack/react-query";
import { listFeed } from "#frontend/api/interactions";
import { FeedPostItem } from "#frontend/components/FeedPostItem";
import { TrendingHashtagsWidget } from "#frontend/components/TrendingHashtagsWidget";





export function HomePage({ feedType }: { feedType: "for-you" | "latest" }) {
  const user = useAuthStore((state) => state.user);
  const [showGuestLoginModal, setShowGuestLoginModal] = useState(false);
  const [guestModalConfig, setGuestModalConfig] = useState<{
    title?: string;
    description?: string;
    persistDismissal?: boolean;
  }>({});

  useEffect(() => {
    if (user) return;
    let promptSeen = false;
    try {
      promptSeen = localStorage.getItem(GUEST_LOGIN_PROMPT_KEY) === "1";
    } catch {
      // Ignore storage failures — fall through to showing the prompt.
    }
    if (!promptSeen) {
      setGuestModalConfig({
        title: "Join FOZ",
        description: "Log in to follow people, personalize your feed, and join the conversation.",
        persistDismissal: true,
      });
      setShowGuestLoginModal(true);
    }
  }, [user]);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["posts", feedType],
    queryFn: ({ pageParam }) => listFeed(feedType, pageParam as string | undefined),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
  const posts = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const feedRef = React.useRef<HTMLDivElement>(null);

  const handleLoadMore = () => {
    if (!user) {
      setGuestModalConfig({
        title: "Log in to view more posts",
        description: "Log in to explore more discussions and personalize your feed.",
        persistDismissal: false,
      });
      setShowGuestLoginModal(true);
      return;
    }
    fetchNextPage();
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (feedRef.current && !feedRef.current.contains(e.target as Node)) {
      feedRef.current.scrollTop += e.deltaY;
    }
  };

  return (
    <NavBar>
    <div onWheel={handleWheel} className="w-full min-h-screen md:h-screen bg-background flex justify-center text-on-background antialiased md:overflow-hidden">
      {/* Container for layouts */}
      <div className="w-full max-w-7xl flex relative justify-center h-full gap-6">

        {/* ======================================= */}
        {/* MAIN CONTENT AREA: Centered Feed        */}
        {/* ======================================= */}
        <div className="flex-1 w-full flex justify-center h-full">
          <main className="max-w-2xl w-full min-h-screen md:min-h-0 md:h-full flex flex-col pb-20 md:pb-4">
            {/* Top Sticky Header */}
            <header className="sticky top-0 md:relative bg-surface/90 backdrop-blur-md z-40 flex-shrink-0">
              {/* Feed Tabs — full navigation so each mode loads fresh state */}
              <nav className="flex h-14" role="tablist" aria-label="Feed type">
                <button
                  type="button"
                  role="tab"
                  aria-selected={feedType === "for-you"}
                  onClick={() => { window.location.href = "/foryou"; }}
                  className={`relative flex-1 flex items-center justify-center text-[15px] font-semibold transition-colors ${feedType === "for-you"
                      ? "text-primary"
                      : "text-secondary hover:bg-surface-container-highest"
                    }`}
                >
                  For You
                  {feedType === "for-you" && (
                    <span aria-hidden="true" className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-full bg-primary" />
                  )}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={feedType === "latest"}
                  onClick={() => { window.location.href = "/latest"; }}
                  className={`relative flex-1 flex items-center justify-center text-[15px] font-semibold transition-colors ${feedType === "latest"
                      ? "text-primary"
                      : "text-secondary hover:bg-surface-container-highest"
                    }`}
                >
                  Latest
                  {feedType === "latest" && (
                    <span aria-hidden="true" className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-12 rounded-full bg-primary" />
                  )}
                </button>
              </nav>
            </header>

            {/* Feed Container */}
            <div className="flex-1 min-h-0 flex flex-col md:my-2 md:border-2 md:border-outline-variant md:rounded-3xl bg-surface overflow-hidden">
              <div ref={feedRef} className="flex-1 overflow-y-auto divide-y divide-outline-variant [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {isLoading && <div className="p-4 text-center text-outline">Loading posts...</div>}
                {!isLoading && posts.length === 0 && <div className="p-4 text-center text-outline">No posts yet. Be the first to share something!</div>}
                {posts.map((post) => (
                  <FeedPostItem key={(post as { repostId?: string }).repostId ?? post.id} post={post} />
                ))}
                {hasNextPage && (
                  <div className="p-4 text-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={isFetchingNextPage}
                      className="rounded-full border border-outline-variant px-6 py-2 text-sm font-semibold text-secondary hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                    >
                      {isFetchingNextPage ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

      {/* Right Sidebar: Trending Hashtags */}
      <aside className="hidden lg:block w-80 pt-4 pr-16 shrink-0">
        <TrendingHashtagsWidget />
      </aside>

      {/* First-visit or action prompt for guests */}
      <GuestLoginModal
        open={showGuestLoginModal}
        onClose={() => setShowGuestLoginModal(false)}
        {...guestModalConfig}
      />

      </div>
    </div>
    </NavBar>
  );
}
