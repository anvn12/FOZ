import React, { useMemo } from "react";
import { useAuthStore } from "#frontend/stores/auth";
import { NavBar } from "#frontend/components/NavBar.js";

import { useInfiniteQuery } from "@tanstack/react-query";
import { listFeed } from "#frontend/api/interactions";
import { FeedPostItem } from "#frontend/components/FeedPostItem";





export function HomePage({ feedType }: { feedType: "for-you" | "latest" }) {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["posts", feedType],
    queryFn: ({ pageParam }) => listFeed(feedType, pageParam as string | undefined),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });
  const posts = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const feedRef = React.useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (feedRef.current && !feedRef.current.contains(e.target as Node)) {
      feedRef.current.scrollTop += e.deltaY;
    }
  };

  return (
    <div onWheel={handleWheel} className="w-full min-h-screen md:h-screen bg-background flex justify-center text-on-background antialiased md:overflow-hidden">
      {/* Container for layouts */}
      <div className="w-full max-w-7xl flex relative justify-center h-full">

        {/* Shared Navigation Bar */}
        <NavBar />

        {/* ======================================= */}
        {/* MAIN CONTENT AREA: Centered Feed        */}
        {/* ======================================= */}
        <div className="flex-1 w-full flex justify-center md:pl-24 h-full">
          <main className="max-w-2xl w-full pt-[60px] md:pt-0 min-h-screen md:min-h-0 md:h-full flex flex-col pb-20 md:pb-4">
            {/* Top Sticky Header */}
            <header className="sticky top-0 md:relative bg-surface/90 backdrop-blur-md z-40 flex justify-center items-center h-14 flex-shrink-0">
              <h1 className="text-[17px] font-semibold text-primary">Home</h1>
            </header>

            {/* Feed Tabs — full navigation so each mode loads fresh state */}
            <nav className="flex gap-1 px-4 py-2 flex-shrink-0" role="tablist" aria-label="Feed type">
              <button
                type="button"
                role="tab"
                aria-selected={feedType === "for-you"}
                onClick={() => { window.location.href = "/foryou"; }}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${feedType === "for-you"
                    ? "bg-primary text-on-primary"
                    : "text-secondary hover:bg-surface-container-highest"
                  }`}
              >
                For You
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={feedType === "latest"}
                onClick={() => { window.location.href = "/latest"; }}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${feedType === "latest"
                    ? "bg-primary text-on-primary"
                    : "text-secondary hover:bg-surface-container-highest"
                  }`}
              >
                Latest
              </button>
            </nav>

            {/* Feed Container */}
            <div className="flex-1 min-h-0 flex flex-col md:my-2 md:border md:border-outline-variant md:rounded-3xl bg-surface overflow-hidden">
              <div ref={feedRef} className="flex-1 overflow-y-auto divide-y divide-outline-variant [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {isLoading && <div className="p-4 text-center text-outline">Loading posts...</div>}
                {!isLoading && posts.length === 0 && <div className="p-4 text-center text-outline">No posts yet. Be the first to share something!</div>}
                {posts.map((post) => (
                  <FeedPostItem key={(post as any).repostId ?? post.id} post={post} />
                ))}
                {hasNextPage && (
                  <div className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => fetchNextPage()}
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

      </div>
    </div>
  );
}
