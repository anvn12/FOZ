import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "#frontend/stores/auth";
import { ApiError } from "#frontend/api/auth";
import type { Profile } from "#frontend/api/profile";

interface ErrorEnvelope {
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

async function call<T>(path: string, init: RequestInit): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers,
  });
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

export function searchProfiles(query: string) {
  return call<{ items: Profile[]; nextCursor: string | null }>(
    `/api/v1/search?q=${encodeURIComponent(query)}&type=users`,
    {
      method: "GET",
    },
  ).then((res) => res.items);
}

export function useSearchProfiles(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchProfiles(query),
    enabled: query.trim().length > 0,
  });
}
