import { useRef, useState } from "react";

interface Props {
  onFileChange: (file: File | null) => void;
}

const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp"];

export function ImageUpload({ onFileChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (file: File | null) => {
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    if (!file) {
      setPreview(null);
      onFileChange(null);
      return;
    }
    if (!ALLOWED.includes(file.type)) {
      setError("Use JPEG, PNG, GIF, or WebP");
      onFileChange(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
    onFileChange(file);
  };

  return (
    <div className="mt-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleChange(e.target.files?.[0] ?? null)}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="min-h-[44px] rounded-lg border border-neutral-700 px-3 text-sm"
          onClick={() => inputRef.current?.click()}
        >
          Attach image
        </button>
        {preview && (
          <button
            type="button"
            className="text-sm text-neutral-400"
            onClick={() => {
              handleChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            Remove
          </button>
        )}
      </div>
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="mt-2 max-h-40 rounded-lg object-cover"
        />
      )}
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
