import React from "react";

export interface SocialLoginButtonsProps {
  onSelectProvider: (provider: "google") => void;
  loadingProvider?: "google" | null;
  disabled?: boolean;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onSelectProvider,
  loadingProvider = null,
  disabled = false,
}) => {
  return (
    <div className="w-full mt-3">
      {/* "or continue with" Divider */}
      <div className="relative flex items-center justify-center my-4">
        <div className="border-t border-black/10 w-full" />
        <span className="bg-[#ffffff] px-3 text-xs font-medium text-[#727786] font-plus-jakarta absolute">
          or
        </span>
      </div>

      {/* Full-width Google Button */}
      <button
        type="button"
        aria-label="Continue with Google account"
        disabled={disabled || loadingProvider !== null}
        onClick={() => onSelectProvider("google")}
        className="w-full min-h-[44px] py-3 px-4 rounded-xl border border-black/10 bg-white/70 backdrop-blur-md hover:bg-white/90 flex items-center justify-center space-x-3 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2E7DFF]/40 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
      >
        {loadingProvider === "google" ? (
          <span className="material-symbols-outlined animate-spin text-[#1e2024]">
            progress_activity
          </span>
        ) : (
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span className="text-sm font-semibold text-[#1e2024] font-montserrat">
          Continue with Google
        </span>
      </button>
    </div>
  );
};
