import { cn } from "#frontend/utils/cn";
import React from "react";
import { Link } from "react-router-dom";

interface FozLogoProps {
  className?: string;
  imgClassName?: string;
  textClassName?: string;
  to?: string;
  showText?: boolean;
  textSuffix?: string;
  whiteOverlay?: boolean;
}

export function FozLogo({
  className,
  imgClassName,
  textClassName = "text-2xl md:text-3xl font-black tracking-tighter",
  to = "/",
  showText = true,
  textSuffix = "",
  whiteOverlay = false,
}: FozLogoProps) {
  const logoSrc = "/foz-logo.svg";

  return (
    <Link to={to} className={cn("flex items-center gap-2.5", className)} aria-label="FOZ Home">
      <img
        src={logoSrc}
        alt="FOZ Logo"
        className={cn(
          "h-8 w-8 md:h-9 md:w-9 object-contain",
          imgClassName,
          whiteOverlay && "brightness-0 invert",
        )}
      />
      {showText && <span className={textClassName}>FOZ{textSuffix ? ` ${textSuffix}` : ""}</span>}
    </Link>
  );
}

