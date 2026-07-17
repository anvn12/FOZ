import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LoginRequest } from "#shared/schemas/auth";
import { useLogin, ApiError } from "#frontend/api/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const login = useLogin();
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({ resolver: zodResolver(LoginRequest) });

  return (
    <form
      onSubmit={handleSubmit((values) => {
        login.mutate(values, {
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
      <h1 className="text-2xl font-semibold">Sign in</h1>
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
          autoComplete="current-password"
          {...field("password")}
          className="mt-1 w-full rounded border border-zinc-300 px-3 py-2"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded bg-zinc-900 px-3 py-2 text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        Sign in
      </button>
      <p className="text-sm text-zinc-600">
        New here?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
