interface Props {
  likeCount: number;
  likedByMe: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function LikeButton({ likeCount, likedByMe, onToggle, disabled }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`flex min-h-[44px] min-w-[44px] items-center gap-1 rounded-lg px-2 text-sm transition ${
        likedByMe ? "text-pink-500" : "text-neutral-400 hover:text-pink-400"
      }`}
      aria-pressed={likedByMe}
    >
      <span aria-hidden>{likedByMe ? "♥" : "♡"}</span>
      <span>{likeCount}</span>
    </button>
  );
}
