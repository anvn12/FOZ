import { useQuery } from "@tanstack/react-query";
import type { HashtagItem, TrendingHashtagsResponse } from "#shared/schemas/hashtags";
import type { PostResponse } from "#shared/schemas/interactions";
import { authFetch } from "#frontend/api/authFetch";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string>) || {}),
  };
  const res = await authFetch(path, { ...init, headers });
  if (!res.ok) {
    throw new Error(`Hashtag API request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function listPostsByHashtag(tag: string, cursor?: string) {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  const queryStr = params.toString() ? `?${params.toString()}` : "";

  return call<{
    items: Array<PostResponse & { likeCount: number; liked: boolean }>;
    nextCursor: string | null;
    totalCount: number;
  }>(`/api/v1/hashtags/${encodeURIComponent(tag)}/posts${queryStr}`);
}

export function fetchTrendingHashtags() {
  return call<TrendingHashtagsResponse>("/api/v1/hashtags/trending");
}

export function useTrendingHashtags() {
  return useQuery({
    queryKey: ["hashtags", "trending"],
    queryFn: fetchTrendingHashtags,
    staleTime: 60 * 1000,
  });
}
