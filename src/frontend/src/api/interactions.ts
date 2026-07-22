import { useMutation } from "@tanstack/react-query";
import type {
  CreateCommentRequest,
  CreatePostRequest,
  UpdateCommentRequest,
  PostResponse,
  CommentResponse,
  ReactionResponse,
} from "#shared/schemas/interactions";
import type { ErrorEnvelope } from "#shared/schemas/auth";
import { useAuthStore } from "#frontend/stores/auth";

export class InteractionApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

async function call<T>(path: string, init: RequestInit): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, { ...init, credentials: "include", headers });
  if (!res.ok) {
    const env = (await res.json().catch(() => null)) as ErrorEnvelope | null;
    throw new InteractionApiError(
      res.status,
      env?.error.code ?? "UNKNOWN",
      env?.error.message ?? "Request failed",
      env?.error.fields,
    );
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type ReactionToggleInput = {
  targetType: "post" | "comment";
  targetId: string;
  active: boolean;
};

export function toggleReaction(input: ReactionToggleInput) {
  const path =
    input.targetType === "post"
      ? `/api/v1/posts/${input.targetId}/reaction`
      : `/api/v1/comments/${input.targetId}/reaction`;
  return call<ReactionResponse>(path, { method: input.active ? "DELETE" : "POST" });
}

export function useToggleReaction() {
  return useMutation({ mutationFn: toggleReaction });
}

export function createPost(input: CreatePostRequest) {
  return call<PostResponse>("/api/v1/posts", { method: "POST", body: JSON.stringify(input) });
}

export function deletePost(postId: string) {
  return call<{ ok: true }>(`/api/v1/posts/${postId}`, { method: "DELETE" });
}

export function listPosts() {
  return call<{ items: Array<PostResponse & { likeCount: number; liked: boolean }> }>("/api/v1/posts", {
    method: "GET",
  });
}

export function createComment(postId: string, input: CreateCommentRequest) {
  return call<CommentResponse>(`/api/v1/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateComment(commentId: string, input: UpdateCommentRequest) {
  return call<CommentResponse>(`/api/v1/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteComment(commentId: string) {
  return call<{ ok: true }>(`/api/v1/comments/${commentId}`, { method: "DELETE" });
}

export function listComments(postId: string) {
  return call<{ items: Array<CommentResponse & { likeCount: number; liked: boolean }> }>(`/api/v1/posts/${postId}/comments`, {
    method: "GET",
  });
}
