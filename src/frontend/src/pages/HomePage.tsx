import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "#frontend/stores/auth";
import { useProfile } from "#frontend/api/profile";
import { LogoutDialog } from "#frontend/components/LogoutDialog";
import { ComposeModal } from "#frontend/components/ComposeModal";
import { toast } from "react-hot-toast";

interface FeedPost {
  id: string;
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
  body: string;
  category?: string;
  createdAt: string;
  likesCount: number;
  repliesCount: number;
  repostsCount: number;
  attachmentUrl?: string;
}

const INITIAL_POSTS: FeedPost[] = [
  {
    id: "post-1",
    author: {
      id: "user-ohiris",
      displayName: "ohiris",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCb8ceQo5ojie7dEEoIS6rD-i1TD_CXFOiqh0yGP95fPhOvgdXrZzsU3riQTJTRMS9K8SAJxn4Fm0syYU2fAt19I3DcK0rJqRugN0D5qEl-Hom8yrHOhmIm0J2ioNkr9axcMgz-NxluvaU1GH-kdgnxfTGYgoQ4CTN7P0Plw86vqevI_jeNsCffeEI_2Jtn-MohT4DlCnPZ4i5WBFaj3dyneJVKYhgQdBqj7i46FDeT5bBJ2O9iGSzi9A"
    },
    body: "TRIGGER WARNING ⚠️ I am about to say something positive about Sincere!! This does not mean I am Team Sincere, but I am about to say something positive about him....",
    category: "Love Island USA",
    createdAt: "3h",
    likesCount: 1100,
    repliesCount: 92,
    repostsCount: 20
  },
  {
    id: "post-2",
    author: {
      id: "user-jillian",
      displayName: "jillianbydesignn",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBEb3WXeyHh_aEGQzz5Mly1G_f2IxTg1fy4qCgq9gXoJk64nriCzVJgEFOLtQ05v5zJadD_LHE-WXK6gTOA512tv_5m21DxJOORqpZLW9BlCxSBGHl-zsU7fEYtmBkweGDKxpbu1EXBcBYJbzqcaeVuF2hNLRQVtpsSBgGJuXj9OLoideHEH3NpgZIkPOtaBJFYG4FNHFop_R3OQnBKJv2iSoL2vahK3anBRRPCgoONSagaOiQIHhHYtQ"
    },
    body: "Kayda's downfall is as shocking as Corbin's redemption. I thought I was taking my girl to the finale",
    category: "Love Island USA",
    createdAt: "2h",
    likesCount: 6300,
    repliesCount: 48,
    repostsCount: 178
  },
  {
    id: "post-3",
    author: {
      id: "user-lu",
      displayName: "lu_28.97",
      avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuARtRcb-kY-sZoPRvPmaWhG2oKAZ-nzmBWt9I7olo4RLUKCugKkScXzPgyveFLoTVr14BQK1vzEhxv0TRPgd7RGu5FYfU6t36lDw2VB2dIchjrakcDFcblcAXDSqjPpdfW_QpSzGl8D9fJv2iku2TPqsqmp0yPYyDFSnAOzNpQjyarFPx7OjAdnB76oF3o2edK4LrxbX6NY-O9vaYpoJXKjSEtCAHBU8joe3mzNnmJJf713NSbOppfcLA"
    },
    body: "劉85敢不敢追平！",
    createdAt: "14h",
    likesCount: 5,
    repliesCount: 2,
    repostsCount: 1,
    attachmentUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlxcxb7eNgGHN3V7P2TbNR8Ir1rmMefa7eQDgi4Rgwu4UmlEQzDqWvp-adjKu8GL8ImkO6RJMzI7eACVbPkfBATYAW8wi8TQMKOgguK9fykjOeogM-Ofumub-Ne8hrxAU_2KaWtvK_L9MG0JdF5vHtAT6C3YJj2u3uUIWuFVqWOA350Zx6sXPhLWMxD367xidnbqK3pMsSn_cECONR6rOnw1msBi9_jrqhzNeg5ik5d4JUPmjM8UUtgpr392Glq1vaoTo"
  }
];

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

export function HomePage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_POSTS);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

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
    setIsComposeOpen(true);
  };

  const handleAddPost = (bodyText: string) => {
    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      author: {
        id: user?.id || "anonymous",
        displayName: user?.email.split("@")[0] || "member",
        avatarUrl: null
      },
      body: bodyText,
      createdAt: "1s",
      likesCount: 0,
      repliesCount: 0,
      repostsCount: 0
    };
    setPosts([newPost, ...posts]);
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
            <Link to="/" className="p-3 rounded-xl hover:bg-surface-container-low transition-colors group text-primary" aria-label="Home">
              <svg aria-hidden="true" className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 10.6v11.4h6v-8h8v8h6V10.6L12 2z"></path>
              </svg>
            </Link>

            <Link to="/search" className="p-3 rounded-xl hover:bg-surface-container-low transition-colors group text-outline hover:text-primary" aria-label="Search">
              <svg aria-hidden="true" className="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
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
        {/* MAIN CONTENT AREA: Centered Feed        */}
        {/* ======================================= */}
        <main className="flex-1 max-w-2xl w-full ml-0 md:ml-20 md:ml-24 lg:mr-[360px] pt-[60px] md:pt-0 min-h-screen border-r border-outline-variant pb-20">
          {/* Top Sticky Header */}
          <header className="sticky top-0 md:top-0 bg-surface/90 backdrop-blur-md z-40 flex justify-center items-center h-14 border-b border-outline-variant">
            <h1 className="text-[17px] font-semibold text-primary">Home</h1>
          </header>

          {/* Feed Container */}
          <div className="flex flex-col divide-y divide-outline-variant">
            {posts.map((post) => (
              <article key={post.id} className="p-4 hover:bg-surface-container-low/30 transition-colors">
                <div className="flex items-start gap-3">
                  {/* Avatar column */}
                  <div className="flex-shrink-0 relative">
                    {post.author.avatarUrl ? (
                      <img alt={post.author.displayName} className="w-9 h-9 rounded-full object-cover border border-outline-variant" src={post.author.avatarUrl} />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-semibold">
                        {post.author.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Content details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1 text-[15px]">
                        <Link to={`/profiles/${post.author.id}`} className="font-semibold hover:underline text-primary">
                          {post.author.displayName}
                        </Link>
                        {post.category && (
                          <>
                            <span className="text-outline text-xs">
                              <i className="fa-solid fa-chevron-right mx-1 text-[10px]"></i>
                            </span>
                            <span className="font-semibold text-primary">{post.category}</span>
                          </>
                        )}
                        <span className="text-secondary text-[14px] ml-1">· {post.createdAt}</span>
                      </div>
                    </div>
                    <div className="mt-1 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-primary">
                      {post.body}
                    </div>

                    {/* Image attachments */}
                    {post.attachmentUrl && (
                      <div className="mt-3 rounded-2xl overflow-hidden border border-outline-variant">
                        <img alt="Post media" className="w-full h-auto object-cover max-h-[500px]" src={post.attachmentUrl} />
                      </div>
                    )}

                    {/* Reaction Row */}
                    <div className="mt-3 flex items-center gap-6 text-outline">
                      <button className="flex items-center gap-1.5 hover:text-primary transition-colors group">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        {post.likesCount > 0 && <span className="text-[13px]">{post.likesCount.toLocaleString()}</span>}
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-primary transition-colors group">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                        {post.repliesCount > 0 && <span className="text-[13px]">{post.repliesCount.toLocaleString()}</span>}
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-primary transition-colors group">
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M17 1l4 4-4 4"></path>
                          <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                          <path d="M7 23l-4-4 4-4"></path>
                          <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                        </svg>
                        {post.repostsCount > 0 && <span className="text-[13px]">{post.repostsCount.toLocaleString()}</span>}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>

        {/* ======================================= */}
        {/* DESKTOP: Right Sidebar                  */}
        {/* ======================================= */}
        <aside className="hidden lg:block fixed right-0 top-0 bottom-0 w-[360px] p-6 bg-surface border-l border-outline-variant z-40">
          <div className="h-full flex flex-col justify-start pt-16">
            {!user ? (
              <div className="rounded-2xl border border-outline-variant p-6 bg-surface-container-lowest">
                <h2 className="font-headline-md text-headline-md mb-2 text-primary">A quieter place to talk</h2>
                <p className="text-secondary font-body-md text-body-md mb-6 leading-relaxed">
                  FOZ is a threads-style community forum. Create an account or sign in to join the conversation.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    to="/register"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-label-md text-label-md text-on-primary transition-opacity hover:opacity-90"
                  >
                    Create account
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                  <Link
                    to="/login"
                    className="flex w-full items-center justify-center rounded-xl border border-outline-variant py-3 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container-low"
                  >
                    Log in
                  </Link>
                </div>
              </div>
            ) : (
              // Empty/reserved sidebar area for authenticated user
              <div className="text-outline text-center py-10 font-label-md text-label-md">
                Reserved for notifications & trends
              </div>
            )}
          </div>
        </aside>

        {/* ======================================= */}
        {/* MOBILE: Bottom Navigation Bar           */}
        {/* ======================================= */}
        <nav className="fixed bottom-0 left-0 right-0 h-[56px] border-t border-outline-variant bg-surface/90 backdrop-blur-xl z-50 flex justify-around items-center md:hidden">
          <Link to="/" className="text-primary p-2" aria-label="Home">
            <span className="material-symbols-outlined font-bold">home</span>
          </Link>
          <Link to="/search" className="text-outline hover:text-primary p-2" aria-label="Search">
            <span className="material-symbols-outlined">search</span>
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
      <ComposeModal 
        isOpen={isComposeOpen} 
        onClose={() => setIsComposeOpen(false)} 
        onAddPost={handleAddPost} 
      />

      <LogoutDialog
        user={user}
        open={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />
    </div>
  );
}
