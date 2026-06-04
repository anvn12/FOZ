import { useState } from "react";

interface Props {
  isOwner: boolean;
  onDelete: () => Promise<void>;
}

export function DeleteButton({ isOwner, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOwner) return null;

  if (confirming) {
    return (
      <span className="flex items-center gap-2 text-sm">
        <span className="text-neutral-400">Delete?</span>
        <button
          type="button"
          className="min-h-[44px] rounded px-2 text-red-400 hover:bg-red-950"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            try {
              await onDelete();
            } finally {
              setLoading(false);
              setConfirming(false);
            }
          }}
        >
          {loading ? "…" : "Confirm"}
        </button>
        <button
          type="button"
          className="min-h-[44px] rounded px-2 text-neutral-400"
          onClick={() => setConfirming(false)}
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      className="min-h-[44px] min-w-[44px] rounded-lg px-2 text-sm text-neutral-500 hover:text-red-400"
      onClick={() => setConfirming(true)}
    >
      Delete
    </button>
  );
}
