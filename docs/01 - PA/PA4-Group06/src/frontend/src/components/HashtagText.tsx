import React from "react";
import { Link } from "react-router-dom";

interface HashtagTextProps {
  text: string;
  className?: string;
}

export function HashtagText({ text, className = "" }: HashtagTextProps) {
  if (!text) return null;

  // Match #hashtag (letters, numbers, underscores)
  const regex = /(#\w+)/g;
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.match(/^#\w+$/)) {
          const tag = part.slice(1);
          return (
            <Link
              key={index}
              to={`/hashtags/${tag.toLowerCase()}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[#00C2FF] font-medium hover:underline inline-block no-card-click"
            >
              {part}
            </Link>
          );
        }
        return part;
      })}
    </span>
  );
}
