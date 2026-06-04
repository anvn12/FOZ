import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { FeedPage } from "../types";

export function useFeed() {
  const query = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: "20" });
      if (pageParam) params.set("cursor", pageParam as string);
      return api.get<FeedPage>(`/api/threads?${params}`);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 30_000,
  });

  const threads = query.data?.pages.flatMap((p) => p.threads) ?? [];

  return {
    threads,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
