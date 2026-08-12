import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { LoginRequest } from "#shared/schemas/auth";
import { useLogin, ApiError } from "#frontend/api/auth";
import { useAuthStore } from "#frontend/stores/auth";
import { AuthLayout } from "#frontend/components/AuthLayout";
import { LuArrowRight } from "react-icons/lu";

const INPUT_CLASS =
  "w-full min-h-[44px] px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const currentUser = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in as admin on initial mount, redirect to dashboard
  useEffect(() => {
    if (currentUser?.role === "administrator") {
      navigate("/admin", { replace: true });
    }
  }, []);

  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({ resolver: zodResolver(LoginRequest) });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: (data) => {
        if (data.user.role === "administrator") {
          toast.success("Administrator login successful!");
          navigate("/admin", { replace: true });
        } else {
          clearSession();
          toast.error("Access Denied: Administrator privileges required to access the admin portal.");
        }
      },
      onError: (err) => {
        toast.error(err instanceof ApiError ? err.message : "Authentication failed");
      },
    });
  });

  return (
    <AuthLayout
      headline={
        <>
          Focus on <br />
          <span className="bg-gradient-to-r from-[#2891DD] via-[#00A4EF] to-[#6366D9] bg-clip-text text-transparent inline-block">
            Control.
          </span>
        </>
      }
    >
      <h2 className="font-headline-md text-4xl text-primary mb-4 text-left tracking-tighter">
        Admin Control Login
      </h2>

      <h1 className="text-sm tracking-tighter mb-8">
        Standard User?{" "}
        <span className="font-bold hover:underline">
          <Link to="/login">Log in to standard portal instead</Link>
        </span>
      </h1>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="admin-email" className="block mb-1.5 text-label-md font-label-md text-on-surface-variant">
            Admin Email address <span className="text-error">*</span>
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            placeholder="Admin Email address (e.g. admin@foz.dev)"
            aria-invalid={errors.email ? true : undefined}
            {...field("email")}
            className={INPUT_CLASS}
          />
          {errors.email && (
            <p className="mt-1 px-1 text-xs text-error font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="admin-password" className="block mb-1.5 text-label-md font-label-md text-on-surface-variant">
            Password <span className="text-error">*</span>
          </label>
          <div className="relative">
            <label className="sr-only" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Password"
              aria-invalid={errors.password ? true : undefined}
              {...field("password")}
              className={`${INPUT_CLASS} pr-12`}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center min-h-[44px] text-outline hover:text-primary transition-colors focus:outline-none cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility" : "visibility_off"}
              </span>
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 px-1 text-xs text-error font-medium">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || login.isPending}
          className="w-full min-h-11 py-3 rounded-full bg-primary text-on-primary font-label-md text-label-md mt-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span>{isSubmitting || login.isPending ? "Authenticating Admin…" : "Log in to Admin Control"}</span>
          {!isSubmitting && !login.isPending && (
            <LuArrowRight size={16} />
          )}
        </button>
      </form>
    </AuthLayout>
  );
}

