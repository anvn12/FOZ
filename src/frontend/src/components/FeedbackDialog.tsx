import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Mail, Copy, Check, X, MessageSquare } from "lucide-react";

// export const SUPPORT_EMAIL = "support@foz.com";
export const SUPPORT_EMAIL = "ntan2422@clc.fitus.edu.vn";

export interface FeedbackDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal dialog instructing users to submit feedback via email.
 * Includes mailto: link, copy email address button with toast notification,
 * and keyboard/backdrop dismissal.
 */
export function FeedbackDialog({ open, onClose }: FeedbackDialogProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleCopyEmail = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(SUPPORT_EMAIL);
      } else {
        // Fallback for non-secure or older contexts
        const textarea = document.createElement("textarea");
        textarea.value = SUPPORT_EMAIL;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      toast.success("Email copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy email address");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-tertiary/40 p- margin-mobile backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="animate-foz-pop relative flex w-full max-w-[420px] flex-col items-center rounded-3xl bg-surface-container-lowest p-6 text-center shadow-2xl border border-outline-variant"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close feedback dialog"
          className="absolute right-4 top-4 rounded-full p-2 text-secondary transition-colors hover:bg-surface-container hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MessageSquare className="h-8 w-8" />
        </div>

        {/* Title & Guidance */}
        <h2 id="feedback-dialog-title" className="mb-2 font-headline-md text-headline-md font-bold text-primary">
          Send Us Feedback
        </h2>
        <p className="mb-6 font-body-md text-body-md text-secondary leading-relaxed px-2">
          We’d love to hear your thoughts, ideas, or issue reports! Please reach out to us directly at our support email address below:
        </p>

        {/* Support Email Card */}
        <div className="mb-6 flex w-full items-center justify-between gap-3 rounded-2xl bg-surface-container-low p-3.5 border border-outline-variant">
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=FOZ%20User%20Feedback`}
            className="flex items-center gap-2 font-title-sm text-title-sm font-semibold text-primary underline underline-offset-4 transition-colors hover:text-primary/80 min-w-0 truncate"
          >
            <Mail className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{SUPPORT_EMAIL}</span>
          </a>

          <button
            type="button"
            onClick={handleCopyEmail}
            aria-label="Copy email address"
            className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-surface-container py-2 px-3 font-label-md text-label-md font-medium text-primary transition-colors hover:bg-surface-container-high active:scale-95 border border-outline-variant"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-secondary" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Close action */}
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-primary py-3.5 font-label-md text-label-md font-semibold text-on-primary transition-opacity hover:opacity-90 active:scale-95"
        >
          Close
        </button>
      </div>
    </div>
  );
}
