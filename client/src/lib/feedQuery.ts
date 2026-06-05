/** TanStack Query key for the infinite feed — scoped per session user. */
export function feedQueryKey(userId: string | undefined) {
  return ["feed", userId] as const;
}
