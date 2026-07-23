import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "#frontend/stores/auth";
import { NavBar } from "#frontend/components/NavBar.js";
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



export function HomePage() {
  const user = useAuthStore((s) => s.user);

  const [posts, setPosts] = useState<FeedPost[]>(INITIAL_POSTS);

  const handleCreateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast("Post creation coming soon");
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

        {/* Shared Navigation Bar */}
        <NavBar />

        {/* ======================================= */}
        {/* MAIN CONTENT AREA: Centered Feed        */}
        {/* ======================================= */}
        <div className="flex-1 w-full flex justify-center md:pl-24">
          <main className="max-w-2xl w-full pt-[60px] md:pt-0 min-h-screen border-r md:border-x border-outline-variant pb-20">
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
        </div>

      </div>
    </div>
  );
}
