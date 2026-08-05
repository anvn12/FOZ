import { type ReactNode, useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth";

export function ModeratorLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isQueue = location.pathname.includes("queue");
  const { user, clearSession } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileData, setProfileData] = useState<{ displayName?: string; avatarUrl?: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/v1/profile/${user.id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.profile) setProfileData(data.profile);
        })
        .catch(() => {});
    }
  }, [user?.id]);

  async function handleLogout() {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
    } catch {}
    clearSession();
    navigate("/login");
  }

  const avatarUrl = profileData?.avatarUrl || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";

  return (
    <div className="moderator-theme text-on-surface bg-background min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[260px] bg-surface-container-lowest shadow-sm flex flex-col py-6 px-4 z-50">
        <div className="mb-10 px-3">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-headline-sm text-headline-sm font-extrabold tracking-tight text-primary">FOZ Admin</h1>
              <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">Enterprise control</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          <Link to="/moderator" className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 cursor-pointer active:scale-95 font-body-md text-body-md ${!isQueue ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary' : 'text-secondary hover:bg-surface-container-high'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: !isQueue ? "'FILL' 1" : undefined }}>dashboard</span>
            <span className={!isQueue ? "font-semibold" : ""}>Dashboard</span>
          </Link>
          <Link to="/moderator/queue" className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 cursor-pointer active:scale-95 font-body-md text-body-md ${isQueue ? 'bg-secondary-container text-on-secondary-container border-l-4 border-primary' : 'text-secondary hover:bg-surface-container-high'}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isQueue ? "'FILL' 1" : undefined }}>gavel</span>
            <span className={isQueue ? "font-semibold" : ""}>Moderation Queue</span>
          </Link>
        </nav>
      </aside>

      {/* Top App Bar */}
      <header className="fixed top-0 right-0 left-[260px] h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-8 z-40">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2 text-body-md focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="Search moderation logs..." type="text" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="relative text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors">
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="h-8 w-px bg-outline-variant"></div>
          
          <div className="relative pl-2" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-1 rounded-full hover:bg-surface-container-low transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <img 
                className="w-10 h-10 rounded-full border-2 border-primary-container object-cover" 
                src={avatarUrl} 
                alt="avatar" 
              />
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-2 z-50">
                <div className="px-4 py-3 border-b border-outline-variant/30">
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Signed in as</p>
                  <p className="font-label-md text-label-md text-on-surface font-semibold truncate">{profileData?.displayName || user?.email}</p>
                </div>
                <div className="py-2">
                  <Link to={`/profiles/${user?.id}`} className="flex items-center gap-3 px-4 py-2 font-body-md text-body-md text-on-surface hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    Profile
                  </Link>
                  <Link to="/settings" className="flex items-center gap-3 px-4 py-2 font-body-md text-body-md text-on-surface hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-[20px]">settings</span>
                    Settings
                  </Link>
                </div>
                <div className="border-t border-outline-variant/30 py-2">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 font-body-md text-body-md text-error hover:bg-error-container/20 transition-colors text-left">
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="ml-[260px] pt-16 min-h-screen">
        <div className="p-8 max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
