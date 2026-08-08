import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

function getStoredTheme(): Theme {
  const t = localStorage.getItem("foz-theme");
  if (t === "light" || t === "dark") return t;
  return "system";
}

function applyTheme(theme: Theme) {
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.classList.toggle("dark", isDark);

  if (theme === "system") {
    localStorage.removeItem("foz-theme");
  } else {
    localStorage.setItem("foz-theme", theme);
  }
}

export function AppearanceToggle() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);

    // Listen for system theme changes when in "system" mode
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme]);

  const options: { value: Theme; label: string; icon: string }[] = [
    { value: "light", label: "Light", icon: "light_mode" },
    { value: "dark", label: "Dark", icon: "dark_mode" },
    { value: "system", label: "System", icon: "brightness_auto" },
  ];

  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          className={`flex-1 flex flex-col items-center gap-1.5 rounded-xl py-3 px-2 transition-colors ${
            theme === opt.value
              ? "bg-primary text-on-primary"
              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
          }`}
          aria-pressed={theme === opt.value}
        >
          <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
          <span className="font-label-sm text-label-sm">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
