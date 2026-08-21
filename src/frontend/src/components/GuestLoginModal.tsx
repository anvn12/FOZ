import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const GUEST_LOGIN_PROMPT_KEY = "foz_guest_login_prompt_seen";

/**
 * Login prompt for guests. Used on the home page as a first-visit invite and
 * on the post page when a guest tries to comment.
 *
 * - `title` / `description` customize the message (e.g. commenting requires
 *   authentication).
 * - `persistDismissal` controls whether dismissing records the prompt as seen
 *   in localStorage (home-page first-visit behavior). On the post page we do
 *   not persist, so the prompt can reappear whenever a guest tries to comment.
 */
export function GuestLoginModal({
  open,
  onClose,
  title = "Join FOZ",
  description = "Log in to follow people, personalize your feed, and join the conversation.",
  persistDismissal = true,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  persistDismissal?: boolean;
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
    if (persistDismissal) {
      try {
        localStorage.setItem(GUEST_LOGIN_PROMPT_KEY, "1");
      } catch {
        // Ignore storage failures (e.g. private mode) — modal still closes.
      }
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
          {title}
        </h2>
        <p className="mb-8 font-body-lg text-body-lg text-secondary">{description}</p>

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
