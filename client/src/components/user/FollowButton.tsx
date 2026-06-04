interface Props {
  userId: string;
  activeUserId?: string;
  isFollowing: boolean;
  onToggle: () => void;
}

export function FollowButton({
  userId,
  activeUserId,
  isFollowing,
  onToggle,
}: Props) {
  if (activeUserId && userId === activeUserId) return null;

  return (
    <button
      type="button"
      onClick={onToggle}
      className="min-h-[44px] rounded-full border border-neutral-600 px-3 text-xs font-medium hover:bg-neutral-800"
    >
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
