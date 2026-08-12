import type { ReactNode } from "react";
import { FozLogo } from "./FozLogo";

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

export { FozLogo };