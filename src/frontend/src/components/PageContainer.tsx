import React from "react";
import { cn } from "@/lib/utils";

/**
 * Shared centering shell for every NavBar page (feed, post detail, profile,
 * search, hashtag feed, ...). All of these sit in a `max-w-7xl` row next to
 * an optional right-hand widget (e.g. TrendingHashtagsWidget). The widget's
 * width pulls the centered `max-w-2xl` column left of true-center, so any
 * page that renders without a `sidebar` must still reserve that same width
 * — otherwise its content lands ~160px further right than the same content
 * did on a page that has the widget, producing a visible jump when
 * navigating between them (e.g. feed -> post detail).
 *
 * Always render pages through this component instead of hand-rolling the
 * `max-w-7xl flex justify-center` wrapper, so the spacer can't be forgotten.
 */
export function PageContainer({
  children,
  sidebar,
  className,
}: {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full max-w-7xl flex relative justify-center h-full gap-6", className)}>
      <div className="flex-1 w-full flex justify-center h-full">{children}</div>
      <aside
        className="hidden lg:block w-80 pt-4 pr-16 shrink-0"
        aria-hidden={sidebar ? undefined : true}
      >
        {sidebar}
      </aside>
    </div>
  );
}
