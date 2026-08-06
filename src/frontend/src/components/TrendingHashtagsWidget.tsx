import React from "react";
import { Link } from "react-router-dom";
import { useTrendingHashtags } from "#frontend/api/hashtags";

export function TrendingHashtagsWidget() {
  const { data, isLoading } = useTrendingHashtags();
  const hashtags = data?.items || [];

  if (isLoading) {
    return (
      <div className="bg-surface-container rounded-3xl p-4 border border-outline-variant/60 shadow-sm animate-pulse space-y-4">
        <div className="h-5 bg-surface-container-highest rounded-md w-36" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 bg-surface-container-highest rounded w-20" />
              <div className="h-4 bg-surface-container-highest rounded w-32" />
              <div className="h-3 bg-surface-container-highest rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (hashtags.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface-container rounded-3xl border border-outline-variant/60 shadow-sm overflow-hidden">
      {/* Widget Header */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="font-bold text-lg text-primary tracking-tight">
          What’s happening
        </h2>
      </div>

      {/* Trending Items List */}
      <div className="divide-y divide-outline-variant/20">
        {hashtags.slice(0, 5).map((tag, index) => (
          <Link
            key={tag.id}
            to={`/hashtags/${tag.name}`}
            className="block px-4 py-3 hover:bg-surface-container-highest/60 transition-colors group relative"
          >
            {/* Top Rank / Category Line */}
            <div className="text-xs text-outline font-medium mb-0.5">
              {index + 1} · Trending in Forum
            </div>

            {/* Main Hashtag Name */}
            <div className="font-bold text-base text-primary group-hover:text-[#00C2FF] transition-colors leading-snug">
              #{tag.displayName}
            </div>

            {/* Post Count */}
            <div className="text-xs text-secondary mt-0.5 font-medium">
              {tag.postCount.toLocaleString()} {tag.postCount === 1 ? "post" : "posts"}
            </div>
          </Link>
        ))}
      </div>

      {/* Footer badge */}
      {hashtags.length > 5 && (
        <div className="px-4 py-3 border-t border-outline-variant/20 bg-surface-container-low/40">
          <span className="text-xs text-secondary font-medium">
            Showing top 5 trending tags
          </span>
        </div>
      )}
    </div>
  );
}
