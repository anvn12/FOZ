import type { ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * Centered content stream shell shared by the auth pages.
 * Capped at the FOZ max-width (640px), generous whitespace, monochrome.
 */
export function AuthShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-max-width flex-col px-margin-mobile py-8 md:py-16 md:px-margin-desktop">
      {children}
    </main>
  );
}

/** FOZ wordmark — monochrome, links home. Used where the design reference places a logo. */
export function FozLogo({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="FOZ — back to home"
      className={`flex select-none items-center justify-center transition-opacity hover:opacity-70 ${className}`}
    >
      <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-[-0.06em] md:font-headline-lg md:text-headline-lg">
        FOZ
      </span>
    </Link>
  );
}