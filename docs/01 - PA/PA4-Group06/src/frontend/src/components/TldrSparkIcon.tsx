import React from "react";

export function TldrSparkIcon({ className = "w-5 h-5" }: { className?: string }) {
  const rawId = React.useId();
  const gradientId = `tldr-spark-gradient-${rawId.replace(/:/g, "")}`;

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gradientId} x1="12" y1="3" x2="12" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
      </defs>
      <g stroke={`url(#${gradientId})`} strokeWidth="2.8" strokeLinecap="round">
        <line x1="12" y1="4.5" x2="12" y2="19.5" />
        <line x1="4.5" y1="12" x2="19.5" y2="12" />
        <line x1="6.7" y1="6.7" x2="17.3" y2="17.3" />
        <line x1="17.3" y1="6.7" x2="6.7" y2="17.3" />
      </g>
    </svg>
  );
}
