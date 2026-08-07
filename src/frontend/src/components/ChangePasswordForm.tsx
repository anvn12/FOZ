import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { ChangePasswordRequest } from "#shared/schemas/auth";
import { useChangePassword, ApiError } from "#frontend/api/auth";
import { PasswordInput } from "#frontend/components/PasswordInput";

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const change = useChangePassword();
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordRequest>({ resolver: zodResolver(ChangePasswordRequest) });

  return (
    <form
      onSubmit={handleSubmit((values) => {
        change.mutate(values, {
          onSuccess: () => {
            toast.success("Password updated");
            reset();
            onSuccess?.();
          },
          onError: (err) =>
            toast.error(err instanceof ApiError ? err.message : "Something went wrong"),
        });
      })}
      className="w-full space-y-5"
      noValidate
    >
      <div className="space-y-1.5">
        <label
          htmlFor="settings-currentPassword"
          className="block px-1 font-label-md text-label-md text-primary"
        >
          Current password
        </label>
        <PasswordInput
          id="settings-currentPassword"
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
          htmlFor="settings-newPassword"
          className="block px-1 font-label-md text-label-md text-primary"
        >
          New password
        </label>
        <PasswordInput
          id="settings-newPassword"
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
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-label-md text-label-md text-on-primary transition-colors hover:bg-inverse-surface disabled:opacity-50"
      >
        {isSubmitting ? "Updating…" : "Update password"}
        {!isSubmitting && (
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        )}
      </button>
    </form>
  );
}
