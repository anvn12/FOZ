import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { RegisterRequest } from "#shared/schemas/auth";
import { useRegister, ApiError } from "#frontend/api/auth";

export function RegisterPage() {
  const navigate = useNavigate();
  const register = useRegister();
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>({ resolver: zodResolver(RegisterRequest) });

  return (
    <form
      onSubmit={handleSubmit((values) => {
        register.mutate(values, {
          onSuccess: () => navigate("/"),
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
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...field("email")}
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...field("password")}
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        <p className="mt-1 text-xs text-zinc-500">At least 8 characters.</p>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded bg-zinc-900 px-3 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        Create account
      </button>
      <p className="text-sm text-zinc-600">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
