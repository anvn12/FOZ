import type { ReactNode, InputHTMLAttributes, Ref } from "react";

type FieldProps = {
  id: string;
  label: string;
  invalid?: boolean;
  error?: string;
  hint?: string;
  leftAdornment?: ReactNode;
  registration?: Record<string, unknown>;
  inputRef?: Ref<HTMLInputElement>;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id">;

/**
 * Labeled input following the FOZ surface language (tonal fill, black border
 * on focus). Optional leftAdornment for prefixes like "@".
 */
export function Field({
  id,
  label,
  invalid,
  error,
  hint,
  leftAdornment,
  registration,
  inputRef,
  ...inputProps
}: FieldProps) {
  const hasIcon = Boolean(leftAdornment);
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="font-label-sm text-label-sm text-secondary px-1"
      >
        {label}
      </label>
      <div className="relative flex items-center">
        {hasIcon && (
          <span className="absolute left-4 font-body-md text-secondary-fixed-dim">
            {leftAdornment}
          </span>
        )}
        <input
          id={id}
          ref={inputRef}
          aria-invalid={invalid || undefined}
          className={`w-full rounded-xl border border-transparent bg-surface-container-low py-3 font-body-md text-body-md text-primary transition-colors placeholder:text-outline focus:border-primary focus:bg-surface-container-lowest focus:outline-none ${
            hasIcon ? "pl-10 pr-4" : "px-4"
          }`}
          {...registration}
          {...inputProps}
        />
      </div>
      {error ? (
        <p className="px-1 text-label-sm text-error">{error}</p>
      ) : hint ? (
        <p className="px-1 text-label-sm text-outline">{hint}</p>
      ) : null}
    </div>
  );
}