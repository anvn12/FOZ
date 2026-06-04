import { useEffect, useRef } from "react";

interface Props {
  onIntersect: () => void;
  disabled?: boolean;
}

export function InfiniteScrollTrigger({ onIntersect, disabled }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersect();
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onIntersect, disabled]);

  return <div ref={ref} className="h-4 w-full" aria-hidden />;
}
