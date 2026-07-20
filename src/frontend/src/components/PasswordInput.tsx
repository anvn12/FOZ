import { useState, type Ref } from "react";

type Props = {
  id: string;
  autoComplete: "current-password" | "new-password";
  placeholder?: string;
  ariaLabel?: string;
  invalid?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  // react-hook-form register returns a ref + name/onChange/onBlur spread
  registration?: Record<string, unknown>;
};

/**
 * Password field with a visibility toggle, matching the FOZ input language:
 * surface-container-low fill, transparent border, black border on focus.
 */
export function PasswordInput({
  id,
  autoComplete,
  placeholder,
  ariaLabel,
  invalid,
  inputRef,
  registration,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        ref={inputRef}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        aria-invalid={invalid || undefined}
        className="w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 font-body-md text-body-md text-primary transition-colors placeholder:text-outline focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
        {...registration}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-0 flex items-center pr-4 text-secondary transition-colors hover:text-primary focus:outline-none"
      >
        <span
          className="material-symbols-outlined text-[20px]"
          style={{ fontVariationSettings: "'FILL' 0" }}
        >
          {visible ? "visibility" : "visibility_off"}
        </span>
      </button>
    </div>
  );
}