import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ChangePasswordRequest } from "#shared/schemas/auth";
import { useChangePassword, ApiError } from "#frontend/api/auth";

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
    <form
      onSubmit={handleSubmit((values) => {
        change.mutate(values, {
          onSuccess: () => {
            toast.success("Password updated");
            reset();
            navigate("/");
          },
          onError: (err) => {
            if (err instanceof ApiError) {
              toast.error(err.message);
            } else {
              toast.error("Something went wrong");
            }
          },
        });
      })}
      className="space-y-4"
    >
      <h1 className="text-2xl font-semibold">Change password</h1>
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium">
          Current password
        </label>
        <input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          {...field("currentPassword")}
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
        />
        {errors.currentPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          {...field("newPassword")}
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
        />
        {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>}
        <p className="mt-1 text-xs text-zinc-500">At least 8 characters; must differ from current.</p>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded bg-zinc-900 px-3 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        Update password
      </button>
    </form>
  );
}
