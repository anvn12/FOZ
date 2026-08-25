import { useQuery } from "@tanstack/react-query";
import type { HashtagItem, TrendingHashtagsResponse } from "#shared/schemas/hashtags";
import type { PostResponse } from "#shared/schemas/interactions";
import { useAuthStore } from "#frontend/stores/auth";
import { fetchWithNetworkGuard } from "#frontend/api/network";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string>) || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetchWithNetworkGuard(path, { ...init, credentials: "include", headers });
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
