import { useEffect } from "react";
import { useLogout } from "#frontend/api/auth";
import { useProfile } from "#frontend/api/profile";
import type { AuthUser } from "#frontend/stores/auth";

/**
 * Confirmation modal for logging out (per FOZ "log out" design):
 * blurred backdrop, monochrome avatar/profile picture, confirm + cancel.
 */
export function LogoutDialog({
  user,
  open,
  onClose,
}: {
  user: AuthUser | null;
  open: boolean;
  onClose: () => void;
}) {
  const logout = useLogout();
  const { data: profile } = useProfile(user?.id ?? "");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleLogout = () => {
    logout.mutate(undefined, { onSettled: onClose });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-tertiary/40 p-margin-mobile backdrop-blur-xl"
      onClick={onClose}
    >
      <div
        className="animate-foz-pop flex w-full max-w-[400px] flex-col items-center rounded-3xl bg-surface-container-lowest p-6 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Avatar */}
        {profile?.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.displayName || user?.email || "User profile"}
            className="mb-4 h-20 w-20 rounded-full object-cover border border-outline-variant shadow-sm"
          />
        ) : (
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container">
            {profile?.displayName ? (
              <span className="text-2xl font-semibold text-secondary">
                {profile.displayName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <span className="material-symbols-outlined text-4xl text-secondary">person</span>
            )}
          </div>
        )}

        {/* Identity & prompt */}
        <div className="mb-8">
          <h2 className="mb-1 break-all font-headline-md text-headline-md text-primary">
            {user?.email ?? "Your account"}
          </h2>
          <p className="font-body-lg text-body-lg text-secondary">
            Log out of your account?
          </p>
        </div>

        {/* Actions */}
        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={logout.isPending}
            className="w-full rounded-xl bg-primary py-4 font-label-md text-label-md text-on-primary transition-opacity hover:opacity-80 active:scale-95 disabled:opacity-50"
          >
            {logout.isPending ? "Logging out…" : "Log out"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-outline-variant bg-transparent py-4 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container-low active:scale-95"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}