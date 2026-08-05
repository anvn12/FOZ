import React, { useState } from "react";

export interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  maxLines?: number;
  className?: string;
  buttonClassName?: string;
}

export function ExpandableText({
  text,
  maxLength = 280,
  maxLines = 4,
  className = "",
  buttonClassName = "",
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) {
    return null;
  }

  const lines = text.split("\n");
  const isLineExceeded = lines.length > maxLines;
  const isLengthExceeded = text.length > maxLength;
  const isTooLong = isLineExceeded || isLengthExceeded;

  if (!isTooLong) {
    return <div className={className}>{text}</div>;
  }

  let displayText = text;
  if (!isExpanded) {
    if (isLineExceeded) {
      displayText = lines.slice(0, maxLines).join("\n");
    }
    if (displayText.length > maxLength) {
      const sub = displayText.slice(0, maxLength);
      const lastSpace = sub.lastIndexOf(" ");
      displayText = lastSpace > maxLength * 0.7 ? sub.slice(0, lastSpace) : sub;
    }
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  const defaultBtnStyle =
    "font-semibold text-black dark:text-white hover:underline focus:outline-none cursor-pointer text-sm ml-1 inline-block transition-colors no-card-click";

  return (
    <div className={className}>
      <span>{isExpanded ? text : `${displayText.trimEnd()}...`}</span>
      <button
        type="button"
        onClick={handleToggle}
        className={buttonClassName || defaultBtnStyle}
        aria-expanded={isExpanded}
      >
        {isExpanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}
