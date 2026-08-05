import { isMobileDevice } from "#frontend/utils/device";

export function CommentEditor({
  value,
  onChange,
  onSave,
  onCancel,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            if (isMobileDevice()) return;
            e.preventDefault();
            if (value.trim() && !disabled) {
              onSave();
            }
          }
        }}
        className="w-full rounded-xl border border-outline-variant px-3 py-2"
        rows={3}
      />
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded-full border px-3 py-1 text-xs"
          onClick={onSave}
          disabled={disabled || !value.trim()}
        >
          Save
        </button>
        <button type="button" className="rounded-full border px-3 py-1 text-xs" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}