/**
 * Helper to detect whether the current environment is a mobile device / screen.
 * Checks for window matchMedia for mobile width (<= 768px), touch capability, or mobile user agent.
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(max-width: 768px)").matches ||
    "ontouchstart" in window ||
    Boolean(navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  );
}
