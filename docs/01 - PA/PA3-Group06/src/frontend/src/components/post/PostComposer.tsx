export function PostComposer({
  value,
  onChange,
  onSubmit,
  disabled,
  helperText,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  helperText?: string;
}) {
  return (
    <section className="rounded-2xl border border-outline-variant bg-surface p-4">
      <h2 className="mb-3 font-label-md text-label-md text-primary">Create a post</h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none"
        placeholder="Share something with the community"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={disabled || !value.trim()}
          onClick={onSubmit}
          className="rounded-xl bg-primary px-4 py-2 text-on-primary disabled:opacity-50"
        >
          Post
        </button>
      </div>
      {helperText && <p className="mt-2 text-label-sm text-outline">{helperText}</p>}
    </section>
  );
}