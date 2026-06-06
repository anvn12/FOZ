const pending = new Set<string>();

export function likePendingKey(targetType: string, targetId: string) {
  return `${targetType}:${targetId}`;
}

export function addLikePending(key: string) {
  pending.add(key);
}

export function removeLikePending(key: string) {
  pending.delete(key);
}

export function isLikePending(key: string) {
  return pending.has(key);
}
