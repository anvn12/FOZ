import React, { useState } from "react";
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
        <div className="mt-auto flex flex-col items-center w-full relative">
          {isMoreMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMoreMenuOpen(false)} />
              <div className="absolute bottom-16 left-4 w-60 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant overflow-hidden z-50 flex flex-col py-1">
                <button
                  onClick={() => { setIsMoreMenuOpen(false); toast("Settings coming soon"); }}
                  className="flex items-center px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors w-full text-left"
                >
                  Settings
                </button>
                <button
                  onClick={() => { setIsMoreMenuOpen(false); toast("Report feature coming soon"); }}
                  className="flex items-center px-4 py-3 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors w-full text-left"
                >
                  Report a problem
                </button>
                {user && (
                  <button
                    onClick={() => { setIsMoreMenuOpen(false); setIsLogoutOpen(true); }}
                    className="flex items-center px-4 py-3 text-sm font-medium text-error hover:bg-surface-container-low transition-colors w-full text-left border-t border-outline-variant"
                  >
                    Log out
                  </button>
                )}
              </div>
            </>
          )}

          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="p-3 rounded-xl hover:bg-surface-container-low transition-colors text-outline hover:text-primary focus:outline-none"
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
      {/* MOBILE: Top App Bar                     */}
      {/* ======================================= */}
      <header className="fixed top-0 w-full z-50 h-[60px] bg-surface/90 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center px-4 left-0 right-0 md:hidden">
        <button
          aria-label="Menu"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="text-primary hover:opacity-80 transition-opacity p-2 -ml-2"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="font-headline-lg-mobile text-headline-lg-mobile font-black tracking-tighter text-primary">
          FOZ
        </div>
        {!user ? (
          <Link
            to="/login"
            className="bg-primary text-on-primary font-label-lg text-label-lg px-4 py-1.5 rounded-full hover:opacity-80 transition-opacity"
          >
            Log in
          </Link>
        ) : (
          <div className="w-8 h-8 flex items-center justify-center">
            <ProfileNavBarAvatar userId={user.id} />
          </div>
        )}
      </header>

      {/* ======================================= */}
      {/* MOBILE: Navigation Drawer (Bottom Sheet) */}
      {/* ======================================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          {/* Drawer Content */}
          <div className="absolute bottom-0 w-full bg-surface-container-lowest rounded-t-2xl shadow-xl flex flex-col p-4 left-0 right-0">
            <div className="font-headline-md text-headline-md font-bold mb-4 px-4 pt-2 text-primary">
              Menu
            </div>
            <div className="flex flex-col w-full divide-y divide-outline-variant">
              <button
                onClick={() => { setIsMobileDrawerOpen(false); toast("Settings coming soon"); }}
                className="flex items-center gap-4 py-4 px-4 hover:bg-surface-container-low transition-colors text-on-surface-variant font-label-lg text-label-lg w-full text-left"
              >
                <span className="material-symbols-outlined">settings</span>
                Settings
              </button>
              <button
                onClick={() => { setIsMobileDrawerOpen(false); toast("Report feature coming soon"); }}
                className="flex items-center gap-4 py-4 px-4 hover:bg-surface-container-low transition-colors text-on-surface-variant font-label-lg text-label-lg w-full text-left"
              >
                <span className="material-symbols-outlined">report</span>
                Report a Problem
              </button>
              {user && (
                <button
                  onClick={() => { setIsMobileDrawerOpen(false); setIsLogoutOpen(true); }}
                  className="flex items-center gap-4 py-4 px-4 hover:bg-surface-container-low transition-colors text-error font-label-lg text-label-lg w-full text-left"
                >
                  <span className="material-symbols-outlined text-error">logout</span>
                  Log out
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* MOBILE: Bottom Navigation Bar           */}
      {/* ======================================= */}
      <nav className="fixed bottom-0 left-0 right-0 h-[56px] border-t border-outline-variant bg-surface/90 backdrop-blur-xl z-50 flex justify-around items-center md:hidden">
        <Link
          to="/"
          className={`p-2 ${isHomeActive ? "text-primary" : "text-outline hover:text-primary"}`}
          aria-label="Home"
        >
          <span className={`material-symbols-outlined ${isHomeActive ? "font-bold" : ""}`}>
            home
          </span>
        </Link>
        <Link to="/search" className={`p-2 ${isSearchActive ? "text-primary" : "text-outline hover:text-primary"}`} aria-label="Search">
          <span className={`material-symbols-outlined ${isSearchActive ? "font-bold" : ""}`} style={isSearchActive ? { fontVariationSettings: "'FILL' 1" } : {}}>search</span>
        </Link>
        <button
          onClick={handleCreateClick}
          className="text-outline hover:text-primary p-2"
          aria-label="Create"
        >
          <span className="material-symbols-outlined">add_circle</span>
        </button>
        <button
          onClick={(e) => handleProtectedClick(e, `/profiles/${user?.id}`)}
          className={`p-2 ${isProfileActive ? "text-primary" : "text-outline hover:text-primary"}`}
          aria-label="Profile"
        >
          {user ? (
            <ProfileNavBarAvatar userId={user.id} />
          ) : (
            <span className="material-symbols-outlined">account_circle</span>
          )}
        </button>
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
