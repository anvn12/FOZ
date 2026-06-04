import type { ApiErrorBody, ApiResponse } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    credentials: "include",
    ...options,
  });

  const body = (await res.json()) as ApiResponse<T> | ApiErrorBody;

  if (!res.ok || !("data" in body)) {
    const err = body as ApiErrorBody;
    throw new ApiError(
      err.error?.message ?? "Request failed",
      err.error?.code ?? "UNKNOWN",
      res.status,
    );
  }

  return body.data;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  del: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};
