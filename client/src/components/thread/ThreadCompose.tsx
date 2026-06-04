import { useState } from "react";
import { ImageUpload } from "../common/ImageUpload";
import type { Thread } from "../../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

interface Props {
  onSuccess: (thread: Thread) => void;
}

export function ThreadCompose({ onSuccess }: Props) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const remaining = 500 - content.length;
  const canSubmit =
    (content.trim().length > 0 || file !== null) &&
    content.length <= 500 &&
    !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("content", content);
      if (file) form.append("image", file);

      const res = await fetch(`${API_BASE}/api/threads`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const body = await res.json();
      if (!res.ok || !body.data) {
        throw new Error(body.error?.message ?? "Failed to post");
      }
      setContent("");
      setFile(null);
      onSuccess(body.data as Thread);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-b border-neutral-800 p-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, 500))}
        placeholder="Start a thread…"
        className="w-full resize-none rounded-lg bg-neutral-900 p-3 text-sm outline-none ring-1 ring-neutral-800 focus:ring-neutral-600"
        rows={3}
      />
      <div
        className={`mt-1 text-right text-xs ${
          remaining <= 20 ? "text-red-400" : "text-neutral-500"
        }`}
      >
        {remaining}/500
      </div>
      <ImageUpload onFileChange={setFile} />
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <button
        type="button"
        disabled={!canSubmit}
        onClick={submit}
        className="mt-3 min-h-[44px] rounded-full bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-40"
      >
        {submitting ? "Posting…" : "Post"}
      </button>
    </div>
  );
}
