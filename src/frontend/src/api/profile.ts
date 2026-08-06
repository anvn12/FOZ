import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "#frontend/stores/auth";
import { ApiError } from "#frontend/api/auth";
import type { UpdateProfileRequest, UpdateAvatarRequest } from "#shared/schemas/profile";

export interface Profile {
  id: string;
  userAccountId: string;
  displayName: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatarUrl: string | null;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

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

export function getProfile(userId: string) {
  return call<{ profile: Profile }>(`/api/v1/profiles/${userId}`, {
    method: "GET",
  });
}

export function updateProfile(input: UpdateProfileRequest) {
  return call<{ profile: Profile }>("/api/v1/profiles/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function updateAvatar(input: UpdateAvatarRequest) {
  return call<{ avatarUrl: string }>("/api/v1/profiles/me/avatar", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function useProfile(userId: string) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: () => getProfile(userId).then(res => res.profile),
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore(s => s.user?.id);

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Invalidate the profile queries
      queryClient.setQueryData(["profile", data.profile.userAccountId], data.profile);
      if (currentUserId) {
        queryClient.invalidateQueries({ queryKey: ["profile", currentUserId] });
      }
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore(s => s.user?.id);

  return useMutation({
    mutationFn: updateAvatar,
    onSuccess: (data) => {
      if (currentUserId) {
        queryClient.invalidateQueries({ queryKey: ["profile", currentUserId] });
      }
    },
  });
}
