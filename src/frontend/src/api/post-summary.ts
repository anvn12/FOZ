import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PostSummaryResponse } from "#shared/schemas/post-summary";
import { authFetch } from "#frontend/api/authFetch";

export async function fetchPostSummary(postId: string): Promise<PostSummaryResponse> {
  const res = await authFetch(`/api/v1/posts/${postId}/summary`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error?.message || "Failed to fetch post summary");
  }
  return res.json();
}

export async function refreshPostSummary(postId: string): Promise<PostSummaryResponse> {
  const res = await authFetch(`/api/v1/posts/${postId}/summary/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error?.message || "Failed to refresh post summary");
  }
  return res.json();
}

export function usePostSummary(postId: string, enabled = false) {
  return useQuery({
    queryKey: ["post-summary", postId],
    queryFn: () => fetchPostSummary(postId),
    enabled,
    staleTime: Infinity,
    retry: 0,
    networkMode: 'always',
  });
}

export function useRefreshPostSummary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => refreshPostSummary(postId),
    onSuccess: (data, postId) => {
      queryClient.setQueryData(["post-summary", postId], data);
    },
  });
}
