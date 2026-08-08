import { useNavigate, Link } from "react-router-dom";
import { AuthShell, FozLogo } from "#frontend/components/AuthShell";
import { ChangePasswordForm } from "#frontend/components/ChangePasswordForm";

export function ChangePasswordPage() {
  const navigate = useNavigate();

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

        <ChangePasswordForm onSuccess={() => navigate("/")} />
      </div>

      <footer className="pb-8 pt-8 text-center">
        <Link to="/" className="font-body-md text-body-md text-secondary hover:text-primary">
          Back to home
        </Link>
      </footer>
    </AuthShell>
  );
}
