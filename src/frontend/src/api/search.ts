import { useQuery } from "@tanstack/react-query";
import { ApiError } from "#frontend/api/auth";
import { authFetch } from "#frontend/api/authFetch";
import type {
  SearchDiscoveryResponse,
  SearchItem,
  SearchResponse,
} from "#shared/schemas/search.js";

interface ErrorEnvelope {
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

async function call<T>(path: string, init: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };

  const res = await authFetch(path, { ...init, headers });
  if (!res.ok) {
    const env = (await res.json().catch(() => null)) as ErrorEnvelope | null;
    throw new ApiError(
      res.status,
      env?.error?.code ?? "UNKNOWN",
      env?.error?.message ?? "Request failed",
      env?.error?.fields,
    );
  }
  return res.json() as Promise<T>;
}

export type SearchType = "posts" | "users" | "hashtags" | "all";

export function search(query: string, type: SearchType = "all") {
  return call<SearchResponse>(`/api/v1/search?q=${encodeURIComponent(query)}&type=${type}`, {
    method: "GET",
  }).then((res) => res.items);
}

export function useSearch(query: string, type: SearchType = "all", enabledOverride?: boolean) {
  const isEnabled = enabledOverride !== undefined ? enabledOverride : query.trim().length > 0;
  return useQuery({
    queryKey: ["search", type, query],
    queryFn: () => search(query, type),
    enabled: isEnabled,
  });
}

export type { SearchItem };

export function getSearchDiscovery() {
  return call<SearchDiscoveryResponse>("/api/v1/search/discovery", {
    method: "GET",
  });
}

export function useSearchDiscovery() {
  return useQuery({
    queryKey: ["searchDiscovery"],
    queryFn: () => getSearchDiscovery(),
  });
}
