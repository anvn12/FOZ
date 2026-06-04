import { useState } from "react";

interface Props {
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
}

export function ReplyCompose({ onSubmit, onCancel }: Props) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || content.length > 500) return;
    setLoading(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ml-4 mt-2 flex flex-col gap-2 border-l-2 border-neutral-700 pl-3">
      <input
        type="text"
        value={content}
        maxLength={500}
        placeholder="Write a reply…"
        className="rounded-lg bg-neutral-900 px-3 py-2 text-sm outline-none ring-1 ring-neutral-800"
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!content.trim() || loading}
          onClick={handleSubmit}
          className="min-h-[44px] rounded-full bg-white px-4 text-sm font-medium text-black disabled:opacity-40"
        >
          Reply
        </button>
        <button
          type="button"
          className="min-h-[44px] text-sm text-neutral-400"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
