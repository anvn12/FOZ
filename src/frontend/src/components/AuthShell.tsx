import type { ReactNode } from "react";

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

/** FOZ wordmark — monochrome, used where the design reference places a logo. */
export function FozLogo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex select-none items-center justify-center ${className}`}
      aria-label="FOZ"
    >
      <span className="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-[-0.06em] md:font-headline-lg md:text-headline-lg">
        FOZ
      </span>
    </div>
  );
}