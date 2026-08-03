import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "#frontend/stores/auth";
import { useProfile } from "#frontend/api/profile";
import { LogoutDialog } from "#frontend/components/LogoutDialog";
import { toast } from "react-hot-toast";
import { CreatePostModal } from "#frontend/components/CreatePostModal";

// Internal helper — renders the user's avatar (or a placeholder) in the nav bar.
function ProfileNavBarAvatar({ userId }: { userId: string }) {
  const { data: profile } = useProfile(userId);
  if (!profile) {
    return (
      <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-semibold" />
    );
  }
  if (profile.avatarUrl) {
    return (
      <img
        src={profile.avatarUrl}
        alt="avatar"
        className="h-7 w-7 rounded-full object-cover border border-outline-variant"
      />
    );
  }
  const initials = profile.displayName.charAt(0).toUpperCase() || "?";
  return (
    <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-semibold">
      {initials}
    </div>
  );
}

/**
 * Shared navigation bar used by all main pages (HomePage, ProfilePage, etc.).
 * Renders a desktop left sidebar, a mobile top app bar, a mobile slide-up
 * drawer, and a mobile bottom navigation bar.
 *
 * Active icon is derived automatically from the current route:
 *   /            → Home icon active
 *   /profiles/*  → Profile icon active
 *   (anything else) → no icon active
 */
export function NavBar() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isMoreMenuOpen &&
        desktopMenuRef.current &&
        !desktopMenuRef.current.contains(event.target as Node)
      ) {
        setIsMoreMenuOpen(false);
      }
      if (
        isMobileDrawerOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileDrawerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMoreMenuOpen, isMobileDrawerOpen]);

  // Determine which nav icon is active based on current route.
  const isHomeActive = location.pathname === "/";
  const isSearchActive = location.pathname === "/search";
  const isProfileActive = location.pathname.startsWith("/profiles/");

  const handleProtectedClick = (e: React.MouseEvent, path?: string) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (path) {
      navigate(path);
    }
  };

  const handleCreateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    setIsCreateOpen(true);
  };

  return (
    <>
      {/* DESKTOP/TABLET: Top Right Log in Button (when unauthenticated) */}
      {!user && (
        <Link
          to="/login"
          className="hidden md:inline-flex fixed top-4 right-6 z-50 bg-primary text-on-primary font-semibold text-sm px-6 py-2 rounded-full hover:opacity-90 transition-opacity shadow-sm"
        >
          Log in
        </Link>
      )}

      {/* ======================================= */}
      {/* DESKTOP/TABLET: Left Sidebar Navigation */}
      {/* ======================================= */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 md:w-24 flex-col items-center py-6 border-r border-outline-variant bg-surface z-50">
        {/* Brand Logo */}
        <div className="mb-12 cursor-pointer">
          <Link to="/" className="text-3xl font-black tracking-tighter text-primary">
            FOZ
          </Link>
        </div>

        {/* Navigation Icons */}
        <div className="flex-1 flex flex-col items-center space-y-8 w-full">
          <Link
            to="/"
            className={`p-3 rounded-xl hover:bg-surface-container-low transition-colors group ${
              isHomeActive ? "text-primary" : "text-outline hover:text-primary"
            }`}
            aria-label="Home"
          >
            <svg
              aria-hidden="true"
              className="w-7 h-7 group-hover:scale-110 transition-transform"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 10.6v11.4h6v-8h8v8h6V10.6L12 2z" />
            </svg>
          </Link>

          <Link
            to="/search"
            className={`p-3 rounded-xl hover:bg-surface-container-low transition-colors group ${
              isSearchActive ? "text-primary" : "text-outline hover:text-primary"
            }`}
            aria-label="Search"
          >
            <svg
              aria-hidden="true"
              className="w-7 h-7 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" x2="16.65" y1="21" y2="16.65" />
            </svg>
          </Link>

          <button
            onClick={handleCreateClick}
            className="p-3 rounded-xl hover:bg-surface-container-low transition-colors group text-outline hover:text-primary"
            aria-label="Create"
          >
            <svg
              aria-hidden="true"
              className="w-7 h-7 group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <line x1="12" x2="12" y1="5" y2="19" />
              <line x1="5" x2="19" y1="12" y2="12" />
            </svg>
          </button>

          <button
            onClick={(e) => handleProtectedClick(e, `/profiles/${user?.id}`)}
            className={`p-3 rounded-xl hover:bg-surface-container-low transition-colors group ${
              isProfileActive ? "text-primary" : "text-outline hover:text-primary"
            }`}
            aria-label="Profile"
          >
            {user ? (
              <ProfileNavBarAvatar userId={user.id} />
            ) : (
              <svg
                aria-hidden="true"
                className="w-7 h-7 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </button>
        </div>

        {/* Bottom Actions — More/Hamburger Menu (Desktop) */}
        <div ref={desktopMenuRef} className="mt-auto flex flex-col items-center w-full relative">
          {isMoreMenuOpen && (
            <div className="absolute bottom-0 left-full ml-3 w-60 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/50 overflow-hidden z-50 flex flex-col divide-y divide-outline-variant/30 animate-foz-pop">
              <button
                onClick={() => { setIsMoreMenuOpen(false); toast("Settings coming soon"); }}
                className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors w-full text-left"
              >
                <svg className="w-5 h-5 text-outline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
              <button
                onClick={() => { setIsMoreMenuOpen(false); toast("Report feature coming soon"); }}
                className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors w-full text-left"
              >
                <svg className="w-5 h-5 text-outline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Report a Problem
              </button>
              {user && (
                <button
                  onClick={() => { setIsMoreMenuOpen(false); setIsLogoutOpen(true); }}
                  className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-error hover:bg-surface-container-low transition-colors w-full text-left"
                >
                  <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Log out
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`p-3 rounded-xl hover:bg-surface-container-low transition-colors focus:outline-none ${
              isMoreMenuOpen ? "text-primary" : "text-outline hover:text-primary"
            }`}
            aria-label="More"
          >
            <svg
              aria-hidden="true"
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <line x1="3" x2="21" y1="12" y2="12" />
              <line x1="3" x2="21" y1="6" y2="6" />
              <line x1="3" x2="21" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ======================================= */}
      {/* MOBILE: Top App Bar & Menu Dropdown     */}
      {/* ======================================= */}
      <header className="fixed top-0 inset-x-0 z-50 h-[60px] bg-surface/90 backdrop-blur-xl border-b border-outline-variant flex items-center justify-between px-4 md:hidden">
        <div ref={mobileMenuRef} className="relative flex items-center justify-start">
          <button
            aria-label="Menu"
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className={`p-2 -ml-2 rounded-xl transition-colors flex items-center justify-center focus:outline-none ${
              isMobileDrawerOpen ? "text-primary" : "text-outline hover:text-primary"
            }`}
          >
            <svg
              aria-hidden="true"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <line x1="3" x2="21" y1="12" y2="12" />
              <line x1="3" x2="21" y1="6" y2="6" />
              <line x1="3" x2="21" y1="18" y2="18" />
            </svg>
          </button>

          {/* MOBILE: Dropdown Menu (below hamburger icon) */}
          {isMobileDrawerOpen && (
            <div className="absolute top-12 left-0 w-60 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/50 overflow-hidden z-50 flex flex-col divide-y divide-outline-variant/30 animate-foz-pop">
                <button
                  onClick={() => { setIsMobileDrawerOpen(false); toast("Settings coming soon"); }}
                  className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors w-full text-left"
                >
                  <svg className="w-5 h-5 text-outline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
                <button
                  onClick={() => { setIsMobileDrawerOpen(false); toast("Report feature coming soon"); }}
                  className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors w-full text-left"
                >
                  <svg className="w-5 h-5 text-outline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Report a Problem
                </button>
                {user && (
                  <button
                    onClick={() => { setIsMobileDrawerOpen(false); setIsLogoutOpen(true); }}
                    className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-error hover:bg-surface-container-low transition-colors w-full text-left"
                  >
                    <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log out
                  </button>
                )}
              </div>
          )}
        </div>

        <Link to="/" className="absolute left-1/2 -translate-x-1/2 text-2xl font-black tracking-tighter text-primary">
          FOZ
        </Link>
        <Link
          to="/search"
          className={`p-2 -mr-2 rounded-xl transition-colors flex items-center justify-center ${
            isSearchActive ? "text-primary" : "text-outline hover:text-primary"
          }`}
          aria-label="Search"
        >
          <svg
            aria-hidden="true"
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" x2="16.65" y1="21" y2="16.65" />
          </svg>
        </Link>
      </header>

      {/* ======================================= */}
      {/* MOBILE: Bottom Navigation Bar           */}
      {/* ======================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-outline-variant bg-surface backdrop-blur-xl md:hidden pb-[env(safe-area-inset-bottom,0px)]">
        <div className="grid grid-cols-3 h-14 w-full max-w-md mx-auto items-center justify-items-center">
          <Link
            to="/"
            className={`w-full h-full flex items-center justify-center transition-colors ${
              isHomeActive ? "text-primary" : "text-outline hover:text-primary"
            }`}
            aria-label="Home"
          >
            <svg
              aria-hidden="true"
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 10.6v11.4h6v-8h8v8h6V10.6L12 2z" />
            </svg>
          </Link>
          <button
            onClick={handleCreateClick}
            className="w-full h-full flex items-center justify-center text-outline hover:text-primary transition-colors"
            aria-label="Create"
          >
            <svg
              aria-hidden="true"
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <line x1="12" x2="12" y1="5" y2="19" />
              <line x1="5" x2="19" y1="12" y2="12" />
            </svg>
          </button>
          <button
            onClick={(e) => handleProtectedClick(e, `/profiles/${user?.id}`)}
            className={`w-full h-full flex items-center justify-center transition-colors ${
              isProfileActive ? "text-primary" : "text-outline hover:text-primary"
            }`}
            aria-label="Profile"
          >
            {user ? (
              <ProfileNavBarAvatar userId={user.id} />
            ) : (
              <svg
                aria-hidden="true"
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ======================================= */}
      {/* DIALOGS: Logout Dialog                  */}
      {/* ======================================= */}
      <LogoutDialog
        user={user}
        open={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />
      <CreatePostModal 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </>
  );
}
