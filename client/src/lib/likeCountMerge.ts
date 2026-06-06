/** Avoid count regressions when likedByMe is true (socket/API race). */
export function mergeLikeCount(
  current: number,
  incoming: number,
  likedByMe: boolean,
): number {
  if (likedByMe) return Math.max(current, incoming);
  return incoming;
}
