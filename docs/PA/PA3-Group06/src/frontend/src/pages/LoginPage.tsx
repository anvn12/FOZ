import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LoginRequest } from "#shared/schemas/auth";
import { useLogin, ApiError } from "#frontend/api/auth";
import { AuthShell, FozLogo } from "#frontend/components/AuthShell";
import { PasswordInput } from "#frontend/components/PasswordInput";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({ resolver: zodResolver(LoginRequest) });

  return (
    <AuthShell>
      {/* Header */}
      <header className="flex flex-col items-center justify-center pb-12 pt-8">
        <FozLogo className="mb-8" />
        <h1 className="text-center font-headline-lg-mobile text-headline-lg-mobile text-primary md:font-headline-lg md:text-headline-lg">
          Log in to FOZ
        </h1>
      </header>

      {/* Form area */}
      <div className="flex flex-1 flex-col justify-center">
        <form
          onSubmit={handleSubmit((values) => {
            login.mutate(values, {
              onSuccess: () => navigate("/"),
              onError: (err) =>
                toast.error(err instanceof ApiError ? err.message : "Something went wrong"),
            });
          })}
          className="flex flex-col space-y-4"
          noValidate
        >
          <div className="space-y-3">
            <div className="relative">
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Email"
                aria-invalid={errors.email ? true : undefined}
                {...field("email")}
                className="w-full rounded-xl border border-outline-variant bg-surface px-4 py-4 font-body-md text-body-md text-on-surface transition-colors placeholder:text-outline focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
              />
              {errors.email && (
                <p className="mt-1 px-1 text-label-sm text-error">{errors.email.message}</p>
              )}
            </div>

            <div>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                placeholder="Password"
                invalid={Boolean(errors.password)}
                registration={field("password")}
              />
              {errors.password && (
                <p className="mt-1 px-1 text-label-sm text-error">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-xl bg-primary py-4 font-label-md text-label-md text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Logging in…" : "Log in"}
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="pb-4 pt-8 text-center">
        <p className="font-body-md text-body-md text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="ml-1 font-label-md text-label-md text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </footer>
    </AuthShell>
  );
}