import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ChangePasswordRequest } from "#shared/schemas/auth";
import { useChangePassword, ApiError } from "#frontend/api/auth";
import { AuthShell, FozLogo } from "#frontend/components/AuthShell";
import { PasswordInput } from "#frontend/components/PasswordInput";

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const change = useChangePassword();
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordRequest>({ resolver: zodResolver(ChangePasswordRequest) });

  return (
    <AuthShell>
      <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col items-center">
        <header className="mb-10 w-full text-center md:mt-12">
          <FozLogo className="mb-2" />
          <span className="mb-6 block font-label-md text-label-md uppercase tracking-widest text-secondary">
            Account
          </span>
          <h1 className="mb-2 font-headline-lg-mobile text-headline-lg-mobile text-primary md:font-headline-lg md:text-headline-lg">
            Change password
          </h1>
          <p className="font-body-md text-body-md text-secondary">
            Choose a new password for your account.
          </p>
        </header>

        <form
          onSubmit={handleSubmit((values) => {
            change.mutate(values, {
              onSuccess: () => {
                toast.success("Password updated");
                reset();
                navigate("/");
              },
              onError: (err) =>
                toast.error(err instanceof ApiError ? err.message : "Something went wrong"),
            });
          })}
          className="w-full space-y-6"
          noValidate
        >
          <div className="space-y-1.5">
            <label
              htmlFor="currentPassword"
              className="block px-1 font-label-md text-label-md text-primary"
            >
              Current password
            </label>
            <PasswordInput
              id="currentPassword"
              autoComplete="current-password"
              placeholder="Current password"
              invalid={Boolean(errors.currentPassword)}
              registration={field("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="px-1 text-label-sm text-error">{errors.currentPassword.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="newPassword"
              className="block px-1 font-label-md text-label-md text-primary"
            >
              New password
            </label>
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              placeholder="Create a new password"
              invalid={Boolean(errors.newPassword)}
              registration={field("newPassword")}
            />
            {errors.newPassword ? (
              <p className="px-1 text-label-sm text-error">{errors.newPassword.message}</p>
            ) : (
              <p className="px-1 text-label-sm text-outline">
                At least 8 characters; must differ from current.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-label-md text-label-md text-on-primary transition-colors hover:bg-inverse-surface disabled:opacity-50"
          >
            {isSubmitting ? "Updating…" : "Update password"}
            {!isSubmitting && (
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            )}
          </button>
        </form>
      </div>

      <footer className="pb-8 pt-8 text-center">
        <Link to="/" className="font-body-md text-body-md text-secondary hover:text-primary">
          Back to home
        </Link>
      </footer>
    </AuthShell>
  );
}