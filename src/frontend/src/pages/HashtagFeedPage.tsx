import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useInfiniteQuery } from "@tanstack/react-query";
import { listPostsByHashtag } from "#frontend/api/hashtags";
import { FeedPostItem } from "#frontend/components/FeedPostItem";
import { NavBar } from "#frontend/components/NavBar";
import { TrendingHashtagsWidget } from "#frontend/components/TrendingHashtagsWidget";

export function HashtagFeedPage() {
  const { tag } = useParams<{ tag: string }>();
  const cleanTag = (tag || "").toLowerCase();

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["posts", "hashtag", cleanTag],
    queryFn: ({ pageParam }) => listPostsByHashtag(cleanTag, pageParam as string | undefined),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: Boolean(cleanTag),
  });

  const posts = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  return (
    <NavBar>
    <div className="w-full min-h-screen md:h-screen bg-background flex justify-center text-on-background antialiased md:overflow-hidden">
      {/* Container for layouts */}
      <div className="w-full max-w-7xl flex relative justify-center h-full gap-6">
        {/* MAIN CONTENT AREA */}
        <div className="flex-1 w-full flex justify-center h-full">
          <main className="max-w-2xl w-full min-h-screen md:min-h-0 md:h-full flex flex-col pb-20 md:pb-4">
            
            {/* Top Sticky Header */}
            <header className="sticky top-0 md:relative bg-surface/90 backdrop-blur-md z-40 flex items-center gap-4 px-4 h-14 flex-shrink-0 border-b border-outline-variant/50">
              <Link
                to="/"
                className="p-1.5 rounded-full hover:bg-surface-container-highest transition-colors"
                aria-label="Back to home"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-[17px] font-semibold text-primary">#{cleanTag}</h1>
                <p className="text-xs text-secondary">{totalCount.toLocaleString()} {totalCount === 1 ? "post" : "posts"}</p>
              </div>
            </header>

            {/* Feed Container */}
            <div className="flex-1 min-h-0 flex flex-col md:my-2 md:border md:border-outline-variant md:rounded-3xl bg-surface overflow-hidden">
              <div className="flex-1 overflow-y-auto divide-y divide-outline-variant [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-[#00C2FF] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-center py-12 text-red-500">
                    Failed to load hashtag feed. Please try again.
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-16 p-8">
                    <div className="text-4xl mb-3">#️⃣</div>
                    <h2 className="text-lg font-bold text-primary">No posts yet for #{cleanTag}</h2>
                    <p className="text-sm text-secondary mt-1">Be the first to publish a post with this hashtag!</p>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Right Sidebar: Trending Hashtags */}
        <aside className="hidden lg:block w-80 pt-4 pr-16 shrink-0">
          <TrendingHashtagsWidget />
        </aside>

      </div>
    </div>
    </NavBar>
  );
}
