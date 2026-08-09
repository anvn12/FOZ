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
  textClassName = "text-2xl md:text-3xl font-black text-[#2E7DFF] tracking-tighter font-montserrat",
  to = "/",
  showText = true,
  textSuffix = "",
  whiteOverlay = false,
}: FozLogoProps) {
  const logoSrc =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAG2dtFpXOaoguUWWzA8emJhKPboHhLcxZslQ8tGT_lLFplkcqBDhOVkg32jQ8sIExp8wPgKIfaj8osR-leaC-yKpJ568k9ZF__Zm02prCaDwMlNcHQkxkar598Mu0V93Xx8-RYfiC1TGb1IvRIQsCK9IEKTbpdSuBrAfNg5-Q7GZWzqJZ33BXuuu0RGDpBHubPKbKP7mC221iIV-WHgtMPtarWBuWSMLVAKeBw4pkKj2vhv8L7gjCo0j0Jh95OB0o-8w";

  return (
    <Link to={to} className={cn(className, "flex items-center gap-2.5")} aria-label="FOZ Home">
      <img
        src={logoSrc}
        onError={(e) => {
          e.currentTarget.src = "/foz-logo.svg";
        }}
        alt="FOZ Logo"
        className={cn(
          imgClassName,
          "h-8 w-8 md:h-9 md:w-9 object-contain",
          whiteOverlay && "brightness-0 invert",
        )}
      />
      {showText && <span className={textClassName}>FOZ{textSuffix ? ` ${textSuffix}` : ""}</span>}
    </Link>
  );
}
