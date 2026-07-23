import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "#frontend/stores/auth";
import { useProfile } from "#frontend/api/profile";
import { useSearchProfiles } from "#frontend/api/search";
import { LogoutDialog } from "#frontend/components/LogoutDialog";
import { toast } from "react-hot-toast";

function ProfileNavBarAvatar({ userId }: { userId: string }) {
  const { data: profile } = useProfile(userId);
  if (!profile) {
    return <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-semibold" />;
  }
  if (profile.avatarUrl) {
    return <img src={profile.avatarUrl} alt="avatar" className="h-7 w-7 rounded-full object-cover border border-outline-variant" />;
  }
  const initials = profile.displayName.charAt(0).toUpperCase() || "?";
  return (
    <div className="h-7 w-7 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-semibold">
      {initials}
    </div>
  );
}

export function SearchPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");

  const { data: searchResults, isLoading } = useSearchProfiles(submittedTerm);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedTerm(searchTerm);
  };

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
    toast("Post creation coming soon");
  };

  return (
    <div className="w-full min-h-screen bg-background flex justify-center text-on-background antialiased">
      {/* Container for layouts */}
      <div className="w-full max-w-7xl flex relative justify-center">
        
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
            <Link to="/" className="p-3 rounded-xl hover:bg-surface-container-low transition-colors group text-outline hover:text-primary" aria-label="Home">
              <svg aria-hidden="true" className="w-7 h-7 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 10.6v11.4h6v-8h8v8h6V10.6L12 2z"></path>
              </svg>
            </Link>

            <Link to="/search" className="p-3 rounded-xl hover:bg-surface-container-low transition-colors group text-primary" aria-label="Search">
              <svg aria-hidden="true" className="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" x2="16.65" y1="21" y2="16.65"></line>
              </svg>
            </Link>

            <button onClick={handleCreateClick} className="p-3 rounded-xl hover:bg-surface-container-low transition-colors group text-outline hover:text-primary" aria-label="Create">
              <svg aria-hidden="true" className="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="12" x2="12" y1="5" y2="19"></line>
                <line x1="5" x2="19" y1="12" y2="12"></line>
              </svg>
            </button>

            <button onClick={(e) => handleProtectedClick(e, `/profiles/${user?.id}`)} className="p-3 rounded-xl hover:bg-surface-container-low transition-colors group text-outline hover:text-primary" aria-label="Profile">
              {user ? (
                <ProfileNavBarAvatar userId={user.id} />
              ) : (
                <svg aria-hidden="true" className="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
            </button>
          </div>

          {/* Bottom Actions Hamburger (Desktop) */}
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

            <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className="p-3 rounded-xl hover:bg-surface-container-low transition-colors text-outline hover:text-primary focus:outline-none" aria-label="More">
              <svg aria-hidden="true" className="w-7 h-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="3" x2="21" y1="12" y2="12"></line>
                <line x1="3" x2="21" y1="6" y2="6"></line>
                <line x1="3" x2="21" y1="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </nav>

        {/* ======================================= */}
        {/* MOBILE: Top App Bar                     */}
        {/* ======================================= */}
        <header className="fixed top-0 w-full z-50 h-[60px] bg-surface/90 backdrop-blur-xl border-b border-outline-variant flex justify-between items-center px-4 left-0 right-0 md:hidden">
          <button aria-label="Menu" onClick={() => setIsMobileDrawerOpen(true)} className="text-primary hover:opacity-80 transition-opacity p-2 -ml-2">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="font-headline-lg-mobile text-headline-lg-mobile font-black tracking-tighter text-primary">
            FOZ
          </div>
          {!user ? (
            <Link to="/login" className="bg-primary text-on-primary font-label-lg text-label-lg px-4 py-1.5 rounded-full hover:opacity-80 transition-opacity">
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
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileDrawerOpen(false)} />
            {/* Drawer Content */}
            <div className="absolute bottom-0 w-full bg-surface-container-lowest rounded-t-2xl shadow-xl flex flex-col p-4 left-0 right-0">
              <div className="font-headline-md text-headline-md font-bold mb-4 px-4 pt-2 text-primary">
                Menu
              </div>
              <div className="flex flex-col w-full divide-y divide-outline-variant">
                <button onClick={() => { setIsMobileDrawerOpen(false); toast("Settings coming soon"); }} className="flex items-center gap-4 py-4 px-4 hover:bg-surface-container-low transition-colors text-on-surface-variant font-label-lg text-label-lg w-full text-left">
                  <span className="material-symbols-outlined">settings</span>
                  Settings
                </button>
                <button onClick={() => { setIsMobileDrawerOpen(false); toast("Report feature coming soon"); }} className="flex items-center gap-4 py-4 px-4 hover:bg-surface-container-low transition-colors text-on-surface-variant font-label-lg text-label-lg w-full text-left">
                  <span className="material-symbols-outlined">report</span>
                  Report a Problem
                </button>
                {user && (
                  <button onClick={() => { setIsMobileDrawerOpen(false); setIsLogoutOpen(true); }} className="flex items-center gap-4 py-4 px-4 hover:bg-surface-container-low transition-colors text-error font-label-lg text-label-lg w-full text-left">
                    <span className="material-symbols-outlined text-error">logout</span>
                    Log out
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* MAIN CONTENT AREA: Search Page          */}
        {/* ======================================= */}
        <div className="flex-1 w-full flex justify-center md:pl-24">
          <main className="max-w-2xl w-full pt-[60px] md:pt-0 min-h-screen border-r md:border-x border-outline-variant pb-20 relative">
            
            {/* Search Canvas Area */}
            <div className="px-6 py-10 flex flex-col gap-10">
              
              {/* Large Search Bar */}
              <section className="flex flex-col gap-2 relative">
                <form className="relative w-full group" onSubmit={handleSearchSubmit}>
                  <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
                  <input 
                    className="w-full bg-surface-container-lowest border border-outline-variant text-on-surface text-[18px] leading-[1.6] rounded-xl py-4 pl-[60px] pr-[100px] focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none transition-all placeholder:text-outline shadow-sm" 
                    placeholder="Search FOZ..." 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {searchTerm && (
                      <button 
                        type="button"
                        onClick={() => {
                          setSearchTerm("");
                          setSubmittedTerm("");
                        }}
                        className="text-outline hover:text-primary p-2 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Clear search"
                      >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    )}
                    <button 
                      type="submit"
                      className="bg-primary text-on-primary p-2 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity ml-1"
                      aria-label="Submit search"
                    >
                      <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                    </button>
                  </div>
                </form>
              </section>

              {submittedTerm.trim() !== "" ? (
                /* Search Results UI */
                <section className="flex flex-col gap-4">
                  <h2 className="text-[20px] font-semibold text-primary tracking-tight px-2 mb-2">
                    {isLoading ? "Searching..." : "People"}
                  </h2>
                  <div className="flex flex-col gap-0">
                    {searchResults?.length === 0 && !isLoading && (
                      <div className="text-on-surface-variant px-2 py-4">No results found for "{submittedTerm}"</div>
                    )}
                    {searchResults?.map(profile => {
                      const avatarSrc = profile.avatarUrl || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
                      return (
                        <Link 
                          key={profile.id} 
                          to={`/profiles/${profile.userAccountId}`}
                          className="flex gap-4 py-4 px-2 border-b border-outline-variant hover:bg-surface-container-lowest transition-colors items-center cursor-pointer group"
                        >
                          <img 
                            alt={profile.displayName} 
                            className="w-12 h-12 rounded-full object-cover border border-outline-variant/30" 
                            src={avatarSrc}
                          />
                          <div className="flex flex-col flex-1">
                            <span className="text-[16px] font-bold text-primary group-hover:underline">{profile.displayName}</span>
                            {profile.bio && (
                              <span className="text-[14px] text-on-surface-variant line-clamp-1 mt-0.5">{profile.bio}</span>
                            )}
                          </div>
                          <button className="bg-transparent border border-outline-variant text-on-surface text-[12px] font-medium py-1.5 px-4 rounded-full hover:bg-surface-container hover:border-outline transition-colors">
                            View
                          </button>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <>
                  {/* Trending Topics (Chips) */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-[14px] font-semibold text-on-surface-variant uppercase tracking-widest px-2">Trending Topics</h2>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-surface-container-lowest text-primary border border-primary text-[14px] font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-surface-variant transition-colors">#DesignSystems</span>
                      <span className="bg-surface-container-lowest text-primary border border-primary text-[14px] font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-surface-variant transition-colors">AI Architecture</span>
                      <span className="bg-surface-container-lowest text-primary border border-primary text-[14px] font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-surface-variant transition-colors">#Minimalism</span>
                      <span className="bg-surface-container-lowest text-primary border border-primary text-[14px] font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-surface-variant transition-colors">UI Engineering</span>
                      <span className="bg-surface-container-lowest text-primary border border-primary text-[14px] font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-surface-variant transition-colors">Future of Work</span>
                    </div>
                  </section>

                  {/* Suggested Users (Horizontal Scroll) */}
                  <section className="flex flex-col gap-6 w-full overflow-hidden">
                    <div className="flex justify-between items-center px-2">
                      <h2 className="text-[20px] font-semibold text-primary tracking-tight">Suggested Creators</h2>
                      <span className="text-[14px] font-semibold text-outline cursor-pointer hover:text-primary transition-colors">View all</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory max-md:[&::-webkit-scrollbar]:hidden max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:h-1.5 md:[&::-webkit-scrollbar-track]:bg-transparent md:[&::-webkit-scrollbar-thumb]:rounded-full md:[&::-webkit-scrollbar-thumb]:bg-outline-variant hover:md:[&::-webkit-scrollbar-thumb]:bg-outline">
                      {/* User Card 1 */}
                      <div className="flex-shrink-0 w-48 bg-surface-container-lowest rounded-xl p-6 flex flex-col items-center text-center gap-4 border border-outline-variant shadow-sm hover:shadow-md transition-shadow cursor-pointer group snap-center">
                        <img alt="Elena Rostova" className="w-16 h-16 rounded-full object-cover border border-outline-variant/50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA6UsA1UnudoPBcYpXkQ1qrW3YrY7RVfsge3p-7T8aTwLsOMlffPtZBSNev0RbOV8AmIrzdEL2eYuxHJXYuo8QRwCKL9ii0hCsaXvYrZ8vLNxllgDI4qOIPku9SO4nLeKPCXjtOIJbu4PpjSBAxxMJt4a2oquNROsEqsArrHj3yNLDN3qy0OCkVQAQbrdy04tEx6ngPbO06iygREyzre8ydigDxu9DDW7jTJrNtlsrCeCE-k8Sm07Wl"/>
                        <div>
                          <h3 className="text-[14px] font-bold text-primary">Elena Rostova</h3>
                          <p className="text-[12px] font-medium text-on-surface-variant mt-2">@erostova</p>
                        </div>
                        <button className="mt-2 bg-transparent border border-outline-variant text-on-surface text-[12px] font-medium py-2 px-6 rounded-full w-full group-hover:bg-surface-container hover:border-outline transition-colors">Follow</button>
                      </div>
                      {/* User Card 2 */}
                      <div className="flex-shrink-0 w-48 bg-surface-container-lowest rounded-xl p-6 flex flex-col items-center text-center gap-4 border border-outline-variant shadow-sm hover:shadow-md transition-shadow cursor-pointer group snap-center">
                        <img alt="Marcus Vance" className="w-16 h-16 rounded-full object-cover border border-outline-variant/50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAd64GIUZFwTzXs8wJ2knlxuLkc18knI7jnOUYdVj6tR_UnjXyPPAwenwcV9of3jp79Qbn1sY1O26wNW7OO8gcui4tuaezRCc7hXD0rGrrDzhA3bXJwLm4R78rU96tsZJI_aEIyt5TysBIvgqmmrEI4YLCEYN50JZsEewsrKlA_DOw0F_E5ztF2rfvXdMQvMvPT5IHJJeFHq1SvrMTvlsAYx_fsuqll4o4kM4VVYxTOIIc2RD7VLxjL"/>
                        <div>
                          <h3 className="text-[14px] font-bold text-primary">Marcus Vance</h3>
                          <p className="text-[12px] font-medium text-on-surface-variant mt-2">@vancedesign</p>
                        </div>
                        <button className="mt-2 bg-transparent border border-outline-variant text-on-surface text-[12px] font-medium py-2 px-6 rounded-full w-full group-hover:bg-surface-container hover:border-outline transition-colors">Follow</button>
                      </div>
                      {/* User Card 3 */}
                      <div className="flex-shrink-0 w-48 bg-surface-container-lowest rounded-xl p-6 flex flex-col items-center text-center gap-4 border border-outline-variant shadow-sm hover:shadow-md transition-shadow cursor-pointer group snap-center">
                        <img alt="Sophia Chen" className="w-16 h-16 rounded-full object-cover border border-outline-variant/50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDXgzz0WXoPlkH90grbE2nGPmc7pDstNa7gLjzg5mX_4RuCibjq_Dg8Cd1X3v401X3dqOENyVE815Az_LAYoq0MNoER6S11ktmjM0wpjCbjlJFM76vRqS8Bacb24PUUmdgz4u2jWWmdmUlmxguMlT2TVEAC1dpNhB8CpH_6QNiR4zzKrhHUBkl-2EW9JVBs-Y_WvENNANm50ahVXvAJ3lyrI2hz6YlsWld8OvKoS7a34wyARuUynlQ"/>
                        <div>
                          <h3 className="text-[14px] font-bold text-primary">Sophia Chen</h3>
                          <p className="text-[12px] font-medium text-on-surface-variant mt-2">@sophiadesign</p>
                        </div>
                        <button className="mt-2 bg-transparent border border-outline-variant text-on-surface text-[12px] font-medium py-2 px-6 rounded-full w-full group-hover:bg-surface-container hover:border-outline transition-colors">Follow</button>
                      </div>
                      {/* User Card 4 */}
                      <div className="flex-shrink-0 w-48 bg-surface-container-lowest rounded-xl p-6 flex flex-col items-center text-center gap-4 border border-outline-variant shadow-sm hover:shadow-md transition-shadow cursor-pointer group snap-center">
                        <img alt="Alex Rivera" className="w-16 h-16 rounded-full object-cover border border-outline-variant/50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOIGgAu_Ia3aY_Temn0CPLWzrSkSEfhZc0O8L0Ot8Rod6ug8UwYQ3oDl1E8Tzy6NkQNj5cG-cTh5g7l82blPVG6rgcNtkVUKou9OIyIcIP6fs8wtkkgxxEUgEt4wNrMwrcMm9TPnr6PvarGOnckF2LpDHA7OAxh6wVqWHE4H_Qktw4UdEFc1D1HIbqdSTqWRfxhpuDRAivW5AIIIZ8pTroOCe3tTpT1BXSFO3JYajubeLdhiEMa6ID"/>
                        <div>
                          <h3 className="text-[14px] font-bold text-primary">Alex Rivera</h3>
                          <p className="text-[12px] font-medium text-on-surface-variant mt-2">@arivera</p>
                        </div>
                        <button className="mt-2 bg-transparent border border-outline-variant text-on-surface text-[12px] font-medium py-2 px-6 rounded-full w-full group-hover:bg-surface-container hover:border-outline transition-colors">Follow</button>
                      </div>
                      {/* View All / More Card */}
                      <div className="flex-shrink-0 w-48 bg-surface-container-lowest rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4 border border-outline-variant border-dashed hover:bg-surface-container-low transition-colors cursor-pointer group snap-center">
                        <div className="w-16 h-16 rounded-full border border-outline-variant flex items-center justify-center bg-surface group-hover:bg-primary group-hover:text-on-primary transition-colors text-primary shadow-sm">
                          <span className="material-symbols-outlined text-[32px]">add</span>
                        </div>
                        <span className="text-[14px] font-bold text-primary mt-2 group-hover:underline">View all</span>
                      </div>
                    </div>
                  </section>

                  {/* Trending Discussions */}
                  <section className="flex flex-col gap-0 mt-6">
                    <h2 className="text-[20px] font-semibold text-primary tracking-tight px-2 mb-4">Trending Discussions</h2>
                    {/* Discussion Item 1 */}
                    <article className="flex gap-6 py-4 px-2 border-b border-outline-variant hover:bg-surface-container-lowest transition-colors cursor-pointer">
                      <div className="flex-shrink-0 relative">
                        <img alt="System Architecture" className="w-10 h-10 rounded-full object-cover border border-outline-variant/30" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOIGgAu_Ia3aY_Temn0CPLWzrSkSEfhZc0O8L0Ot8Rod6ug8UwYQ3oDl1E8Tzy6NkQNj5cG-cTh5g7l82blPVG6rgcNtkVUKou9OIyIcIP6fs8wtkkgxxEUgEt4wNrMwrcMm9TPnr6PvarGOnckF2LpDHA7OAxh6wVqWHE4H_Qktw4UdEFc1D1HIbqdSTqWRfxhpuDRAivW5AIIIZ8pTroOCe3tTpT1BXSFO3JYajubeLdhiEMa6ID"/>
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[14px] font-bold text-primary">System Architecture</span>
                          <span className="text-[12px] font-medium text-on-surface-variant">@sysarch · 2h</span>
                        </div>
                        <h3 className="text-[16px] text-on-surface leading-tight">Purely functional UI components without semantic overhead. What are the maintainability costs?</h3>
                        <div className="flex gap-6 mt-2 text-outline text-[12px] font-medium">
                          <div className="flex items-center gap-2 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                            <span>142</span>
                          </div>
                          <div className="flex items-center gap-2 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[16px]">favorite</span>
                            <span>890</span>
                          </div>
                        </div>
                      </div>
                    </article>
                    {/* Discussion Item 2 */}
                    <article className="flex gap-6 py-4 px-2 border-b border-outline-variant hover:bg-surface-container-lowest transition-colors cursor-pointer">
                      <div className="flex-shrink-0 relative">
                        <img alt="UI Paradigms" className="w-10 h-10 rounded-full object-cover border border-outline-variant/30" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDXgzz0WXoPlkH90grbE2nGPmc7pDstNa7gLjzg5mX_4RuCibjq_Dg8Cd1X3v401X3dqOENyVE815Az_LAYoq0MNoER6S11ktmjM0wpjCbjlJFM76vRqS8Bacb24PUUmdgz4u2jWWmdmUlmxguMlT2TVEAC1dpNhB8CpH_6QNiR4zzKrhHUBkl-2EW9JVBs-Y_WvENNANm50ahVXvAJ3lyrI2hz6YlsWld8OvKoS7a34wyARuUynlQ"/>
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-[14px] font-bold text-primary">UI Paradigms</span>
                          <span className="text-[12px] font-medium text-on-surface-variant">@uipara · 4h</span>
                        </div>
                        <h3 className="text-[16px] text-on-surface leading-tight">Eliminating shadows requires stricter tonal shifts and precise 1px borders for visual hierarchy.</h3>
                        <div className="flex gap-6 mt-2 text-outline text-[12px] font-medium">
                          <div className="flex items-center gap-2 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                            <span>89</span>
                          </div>
                          <div className="flex items-center gap-2 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[16px]">favorite</span>
                            <span>452</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </section>
                </>
              )}
            </div>
          </main>
        </div>

        {/* ======================================= */}
        {/* MOBILE: Bottom Navigation Bar           */}
        {/* ======================================= */}
        <nav className="fixed bottom-0 left-0 right-0 h-[56px] border-t border-outline-variant bg-surface/90 backdrop-blur-xl z-50 flex justify-around items-center md:hidden">
          <Link to="/" className="text-outline hover:text-primary p-2" aria-label="Home">
            <span className="material-symbols-outlined">home</span>
          </Link>
          <Link to="/search" className="text-primary p-2" aria-label="Search">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
          </Link>
          <button onClick={handleCreateClick} className="text-outline hover:text-primary p-2" aria-label="Create">
            <span className="material-symbols-outlined">add_circle</span>
          </button>
          <button onClick={(e) => handleProtectedClick(e, `/profiles/${user?.id}`)} className="text-outline hover:text-primary p-2" aria-label="Profile">
            {user ? (
              <ProfileNavBarAvatar userId={user.id} />
            ) : (
              <span className="material-symbols-outlined">account_circle</span>
            )}
          </button>
        </nav>

      </div>

      {/* ======================================= */}
      {/* DIALOGS: Compose Modal & Logout Dialog  */}
      {/* ======================================= */}
      <LogoutDialog
        user={user}
        open={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />
    </div>
  );
}
