import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { RegisterRequest, type RegisterRequest as RegisterRequestType } from "#shared/schemas/auth";
import { useRegister, initiateSocialAuth, ApiError } from "#frontend/api/auth";
import { SocialLoginButtons } from "#frontend/components/SocialLoginButtons";
import { isMobileDevice } from "#frontend/utils/device";
import { AuthLayout } from "#frontend/components/AuthLayout";

const formSchema = RegisterRequest.extend({
  confirmPassword: z.string().min(1, "Confirm your password"),
}).refine((v) => v.password === v.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const INPUT_CLASS =
  "w-full min-h-[44px] px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors";

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | null>(null);

  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = handleSubmit((values) => {
    const payload: RegisterRequestType = {
      email: values.email,
      password: values.password,
      username: values.username,
      displayName: values.displayName,
      location: values.location,
      website: values.website,
    };
    register.mutate(payload, {
      onSuccess: () => navigate("/onboarding/avatar"),
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

  return (
    <AuthLayout
      headline={
        <>
          Join <br /> FOZ.
        </>
      }
    >
      <h2 className="font-headline-md text-headline-md text-primary mb-6 text-center">
        Create an account
      </h2>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="username" className="block mb-1.5 text-label-md font-label-md text-on-surface-variant">
              Username <span className="text-error">*</span>
            </label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              aria-invalid={errors.username ? true : undefined}
              {...field("username")}
              className={INPUT_CLASS}
            />
            {errors.username && (
              <p className="mt-1 px-1 text-xs text-error font-medium">
                {errors.username.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="displayName" className="block mb-1.5 text-label-md font-label-md text-on-surface-variant">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              placeholder="Display Name"
              aria-invalid={errors.displayName ? true : undefined}
              {...field("displayName")}
              className={INPUT_CLASS}
            />
            {errors.displayName && (
              <p className="mt-1 px-1 text-xs text-error font-medium">
                {errors.displayName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block mb-1.5 text-label-md font-label-md text-on-surface-variant">
            Email address <span className="text-error">*</span>
          </label>
          <input
            id="email"
            type="email"
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
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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

        <div>
          <label htmlFor="confirmPassword" className="block mb-1.5 text-label-md font-label-md text-on-surface-variant">
            Confirm Password <span className="text-error">*</span>
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Confirm Password"
              aria-invalid={errors.confirmPassword ? true : undefined}
              {...field("confirmPassword")}
              className={`${INPUT_CLASS} pr-12`}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 px-1 text-xs text-error font-medium">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || register.isPending}
          className="w-full min-h-[44px] py-3 rounded-full bg-primary text-on-primary font-label-md text-label-md mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-80 transition-opacity"
        >
          <span>{isSubmitting || register.isPending ? "Creating account…" : "Sign up"}</span>
          {!isSubmitting && !register.isPending && (
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          )}
        </button>
      </form>

      <SocialLoginButtons
        onSelectProvider={handleSocialSelect}
        loadingProvider={socialLoading}
        disabled={isSubmitting || register.isPending}
      />

      <div className="mt-4 pt-4 border-t border-outline-variant text-center">
        <Link
          to="/login"
          className="block w-full min-h-[44px] py-3 rounded-full border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center justify-center"
        >
          Already have an account? Log in
        </Link>
      </div>
    </AuthLayout>
  );
}
