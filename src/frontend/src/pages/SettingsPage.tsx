import { Link } from "react-router-dom";
import { ChangePasswordForm } from "#frontend/components/ChangePasswordForm";
import { AppearanceToggle } from "#frontend/components/AppearanceToggle";
import { useAuthStore } from "#frontend/stores/auth";

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <div className="mx-auto max-w-[600px] px-4 py-6 md:px-6 md:py-10">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="text-sm text-outline hover:text-primary transition-colors">
            ← Back
          </Link>
          <h1 className="mt-3 font-headline-md text-headline-md text-primary">
            Settings
          </h1>
        </div>

        {/* Change Password / Account Settings Section (Logged in users only) */}
        {user && (
          <section className="mb-8">
            <h2 className="mb-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Account Settings
            </h2>
            <div className="rounded-2xl border border-outline-variant bg-surface p-5">
              <ChangePasswordForm />
            </div>
          </section>
        )}

        {/* Appearance Section */}
        <section>
          <h2 className="mb-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Appearance
          </h2>
          <div className="rounded-2xl border border-outline-variant bg-surface p-5">
            <AppearanceToggle />
          </div>
        </section>
      </div>
    </div>
  );
}
