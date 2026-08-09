import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LoginRequest } from "#shared/schemas/auth";
import { useLogin, initiateSocialAuth, ApiError } from "#frontend/api/auth";
import { SocialLoginButtons } from "#frontend/components/SocialLoginButtons";
import { isMobileDevice } from "#frontend/utils/device";
import { AuthLayout } from "#frontend/components/AuthLayout";

const INPUT_CLASS =
  "w-full min-h-[44px] px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | null>(null);

  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({ resolver: zodResolver(LoginRequest) });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: (data) => {
        if (data.user.role === "administrator") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      },
      onError: (err) =>
        toast.error(err instanceof ApiError ? err.message : "Something went wrong"),
    });
  });

  const handleSocialSelect = async (provider: "google") => {
    try {
      setSocialLoading(provider);
      const isMobile = isMobileDevice();
      const res = await initiateSocialAuth(provider, isMobile);
      if (res) {
        toast.success("Successfully logged in!");
        navigate("/");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Social authentication failed or was cancelled.");
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleForgotPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
    toast.error("Password recovery feature coming soon.");
  };

  return (
    <AuthLayout
      headline={
        <>
          Focus on <br /> Zillions.
        </>
      }
    >
      <h2 className="font-headline-md text-headline-md text-primary mb-6 text-center">
        Log in to FOZ
      </h2>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="block mb-1.5 text-label-md font-label-md text-on-surface-variant">
            Email address <span className="text-error">*</span>
          </label>
          <input
            id="email"
            type="text"
            autoComplete="email"
            placeholder="Email address"
            aria-invalid={errors.email ? true : undefined}
            {...field("email")}
            className={INPUT_CLASS}
          />
          {errors.email && (
            <p className="mt-1 px-1 text-xs text-error font-medium">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block mb-1.5 text-label-md font-label-md text-on-surface-variant">
            Password <span className="text-error">*</span>
          </label>
          <div className="relative">
            <label className="sr-only" htmlFor="password">
              Password
            </label>
            <input
              id="password"
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
          className="w-full min-h-[44px] py-3 rounded-full bg-primary text-on-primary font-label-md text-label-md mt-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span>{isSubmitting || login.isPending ? "Logging in…" : "Log in"}</span>
          {!isSubmitting && !login.isPending && (
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <a
          href="/forgot-password"
          onClick={handleForgotPassword}
          className="text-secondary hover:text-primary transition-colors text-label-md font-label-md inline-block py-1 min-h-[32px]"
        >
          Forgotten password?
        </a>
      </div>

      <div className="mt-4 pt-4 border-t border-outline-variant text-center">
        <Link
          to="/register"
          className="block w-full min-h-[44px] py-3 rounded-full border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center justify-center"
        >
          Create new account
        </Link>
      </div>

      <SocialLoginButtons
        onSelectProvider={handleSocialSelect}
        loadingProvider={socialLoading}
        disabled={isSubmitting || login.isPending}
      />
    </AuthLayout>
  );
}
