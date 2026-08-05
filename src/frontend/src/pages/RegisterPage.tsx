import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { RegisterRequest, type RegisterRequest as RegisterRequestType } from "#shared/schemas/auth";
import { useRegister, ApiError } from "#frontend/api/auth";
import { AuthShell, FozLogo } from "#frontend/components/AuthShell";
import { PasswordInput } from "#frontend/components/PasswordInput";

// Extends the server schema with a client-only confirm field. confirmPassword
// is stripped before the call so the API still receives RegisterRequest shape.
const formSchema = RegisterRequest.extend({
  confirmPassword: z.string().min(1, "Confirm your password"),
}).refine((v) => v.password === v.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type FormValues = z.infer<typeof formSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  return (
    <AuthShell>
      <div className="mx-auto mt-6 flex w-full max-w-[400px] flex-1 flex-col items-center md:mt-12">
        <header className="mb-10 w-full text-center">
          <FozLogo className="mb-2" />
          <span className="mb-6 block font-label-md text-label-md uppercase tracking-widest text-secondary">
            Sign Up
          </span>
          <h1 className="mb-2 font-headline-lg-mobile text-headline-lg-mobile text-primary md:font-headline-lg md:text-headline-lg">
            Create your account
          </h1>
          <p className="font-body-md text-body-md text-secondary">
            Set up your login credentials.
          </p>
        </header>

        <form
          onSubmit={handleSubmit((values) => {
            const payload: RegisterRequestType = {
              email: values.email,
              password: values.password,
            };
            register.mutate(payload, {
              onSuccess: () => {
                toast.success("Account created successfully.");
                navigate("/login");
              },
              onError: (err) =>
                toast.error(err instanceof ApiError ? err.message : "Something went wrong"),
            });
          })}
          className="w-full space-y-6"
          noValidate
        >
          <div className="space-y-1.5">
            <label htmlFor="email" className="block px-1 font-label-md text-label-md text-primary">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={errors.email ? true : undefined}
              {...field("email")}
              className="w-full rounded-xl border border-transparent bg-surface-container-low px-4 py-3 font-body-md text-body-md text-primary transition-colors placeholder:text-outline focus:border-primary focus:bg-surface-container-lowest focus:outline-none"
            />
            {errors.email && (
              <p className="px-1 text-label-sm text-error">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block px-1 font-label-md text-label-md text-primary">
              Password
            </label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="Create a password"
              invalid={Boolean(errors.password)}
              registration={field("password")}
            />
            {errors.password ? (
              <p className="px-1 text-label-sm text-error">{errors.password.message}</p>
            ) : (
              <p className="px-1 text-label-sm text-outline">At least 8 characters.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="confirmPassword"
              className="block px-1 font-label-md text-label-md text-primary"
            >
              Confirm Password
            </label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="Confirm your password"
              invalid={Boolean(errors.confirmPassword)}
              registration={field("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="px-1 text-label-sm text-error">{errors.confirmPassword.message}</p>
            )}
          </div>
        </form>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-[400px] flex-col items-center pb-8">
        <button
          type="button"
          onClick={handleSubmit((values) => {
            const payload: RegisterRequestType = {
              email: values.email,
              password: values.password,
            };
            register.mutate(payload, {
              onSuccess: () => {
                toast.success("Account created successfully. Please log in.");
                navigate("/login");
              },
              onError: (err) =>
                toast.error(err instanceof ApiError ? err.message : "Something went wrong"),
            });
          })}
          disabled={isSubmitting}
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-label-md text-label-md text-on-primary transition-colors hover:bg-inverse-surface disabled:opacity-50"
        >
          {isSubmitting ? "Creating…" : "Sign up"}
          {!isSubmitting && (
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          )}
        </button>
        <p className="font-body-md text-body-md text-secondary">
          Already have an account?{" "}
          <Link to="/login" className="font-label-md text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}