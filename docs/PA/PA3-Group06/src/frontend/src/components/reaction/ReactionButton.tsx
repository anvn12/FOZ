export function ReactionButton({
  active,
  onClick,
  disabled,
  title,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="rounded-full border border-outline-variant px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
    >
      {active ? "Unlike" : "Like"}
    </button>
  );
}