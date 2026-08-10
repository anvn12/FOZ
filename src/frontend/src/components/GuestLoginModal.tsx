import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const GUEST_LOGIN_PROMPT_KEY = "foz_guest_login_prompt_seen";

/**
 * First-visit prompt for guests: invites them to log in or create an account.
 * Dismissing (Not now / backdrop / Escape) records the prompt as seen so it
 * only appears once per browser.
 */
export function GuestLoginModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(GUEST_LOGIN_PROMPT_KEY, "1");
    } catch {
      // Ignore storage failures (e.g. private mode) — modal still closes.
    }
    onClose();
  };

  const goTo = (path: string) => {
    dismiss();
    navigate(path);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-tertiary/40 p-margin-mobile backdrop-blur-xl"
      onClick={dismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-login-title"
        className="animate-foz-pop flex w-full max-w-[400px] flex-col items-center rounded-3xl bg-surface-container-lowest p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container">
          <span className="material-symbols-outlined text-4xl text-secondary">person</span>
        </div>

        <h2 id="guest-login-title" className="mb-1 font-headline-md text-headline-md text-primary">
          Join FOZ
        </h2>
        <p className="mb-8 font-body-lg text-body-lg text-secondary">
          Log in to follow people, personalize your feed, and join the conversation.
        </p>

        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={() => goTo("/login")}
            className="w-full rounded-xl bg-primary py-4 font-label-md text-label-md text-on-primary transition-opacity hover:opacity-80 active:scale-95"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => goTo("/register")}
            className="w-full rounded-xl border border-outline-variant bg-transparent py-4 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container-low active:scale-95"
          >
            Create account
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="w-full rounded-xl py-4 font-label-md text-label-md text-secondary transition-colors hover:bg-surface-container-low active:scale-95"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
