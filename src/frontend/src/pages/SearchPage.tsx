import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSearchProfiles, useSearchDiscovery } from "#frontend/api/search";
import { NavBar } from "#frontend/components/NavBar";

export function SearchPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");

  const { data: searchResults, isLoading } = useSearchProfiles(submittedTerm);
  const { data: discoveryData } = useSearchDiscovery();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedTerm(searchTerm);
  };

  const handleViewAllCreators = () => {
    setSubmittedTerm("%");
  };

  const handleTopicClick = (topicTag: string) => {
    setSearchTerm(topicTag);
    setSubmittedTerm(topicTag);
  };

  return (
    <NavBar>
    <div className="w-full min-h-screen bg-background flex justify-center text-on-background antialiased">
      {/* Container for layouts */}
      <div className="w-full max-w-7xl flex relative justify-center">
        
        {/* ======================================= */}
        {/* MAIN CONTENT AREA: Search Page          */}
        {/* ======================================= */}
        <div className="flex-1 w-full flex justify-center">
          <main className="max-w-2xl w-full min-h-screen pb-20 relative">
            
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
                    {searchTerm.trim() !== "" && (
                      <button 
                        type="submit"
                        className="bg-primary text-on-primary p-2 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity ml-1"
                        aria-label="Submit search"
                      >
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                      </button>
                    )}
                  </div>
                </form>
              </section>

              {submittedTerm !== "" ? (
                /* Search Results UI */
                <section className="flex flex-col gap-4">
                  <h2 className="text-[20px] font-semibold text-primary tracking-tight px-2 mb-2">
                    {isLoading ? "Searching..." : "People"}
                  </h2>
                  <div className="flex flex-col gap-3">
                    {searchResults?.length === 0 && !isLoading && (
                      <div className="text-on-surface-variant px-2 py-4">No results found for "{submittedTerm.trim() || "creators"}"</div>
                    )}
                    {searchResults?.map(profile => {
                      const handle = profile.username ? `@${profile.username}` : `@${profile.displayName.toLowerCase().replace(/\s+/g, "")}`;
                      const linkPath = profile.username ? `/profiles/@${profile.username}` : `/profiles/${profile.userAccountId}`;
                      return (
                        <Link 
                          key={profile.id} 
                          to={linkPath}
                          className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container transition-colors group"
                        >
                          {profile.avatarUrl ? (
                            <img 
                              alt={profile.displayName} 
                              className="w-12 h-12 rounded-full object-cover border border-outline-variant/30 shrink-0" 
                              src={profile.avatarUrl}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-zinc-800 text-white font-bold flex items-center justify-center text-lg shrink-0">
                              {(profile.displayName || "U").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-[16px] font-bold text-primary group-hover:underline truncate">{profile.displayName}</span>
                            <span className="text-[13px] font-medium text-secondary truncate">{handle}</span>
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
                      {discoveryData?.topics?.map(topic => (
                        <span 
                          key={topic.id} 
                          onClick={() => handleTopicClick(topic.tag)}
                          className="bg-surface-container-lowest text-primary border border-primary text-[14px] font-semibold px-4 py-2 rounded-full cursor-pointer hover:bg-surface-variant transition-colors"
                        >
                          {topic.tag}
                        </span>
                      ))}
                    </div>
                  </section>

                  {/* Suggested Creators (Horizontal Scroll) */}
                  <section className="flex flex-col gap-6 w-full overflow-hidden">
                    <div className="flex justify-between items-center px-2">
                      <h2 className="text-[20px] font-semibold text-primary tracking-tight">Suggested Creators</h2>
                      <span 
                        onClick={handleViewAllCreators}
                        className="text-[14px] font-semibold text-outline cursor-pointer hover:text-primary transition-colors"
                      >
                        View all
                      </span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory max-md:[&::-webkit-scrollbar]:hidden max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:h-1.5 md:[&::-webkit-scrollbar-track]:bg-transparent md:[&::-webkit-scrollbar-thumb]:rounded-full md:[&::-webkit-scrollbar-thumb]:bg-outline-variant hover:md:[&::-webkit-scrollbar-thumb]:bg-outline">
                      {discoveryData?.creators?.map(creator => {
                        const handle = creator.username ? `@${creator.username}` : `@${creator.displayName.toLowerCase().replace(/\s+/g, "")}`;
                        const linkPath = creator.username ? `/profiles/@${creator.username}` : `/profiles/${creator.userAccountId}`;
                        return (
                          <div 
                            key={creator.id}
                            onClick={() => navigate(linkPath)}
                            className="flex-shrink-0 w-48 bg-surface-container-lowest rounded-xl p-6 flex flex-col items-center text-center gap-3 border border-outline-variant shadow-sm hover:shadow-md transition-shadow cursor-pointer group snap-center"
                          >
                            {creator.avatarUrl ? (
                              <img alt={creator.displayName} className="w-16 h-16 rounded-full object-cover border border-outline-variant/50 shrink-0" src={creator.avatarUrl}/>
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-zinc-800 text-white font-bold flex items-center justify-center text-2xl shrink-0">
                                {(creator.displayName || "U").charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h3 className="text-[14px] font-bold text-primary truncate max-w-[140px]">{creator.displayName}</h3>
                              <p className="text-[12px] font-medium text-on-surface-variant mt-1 truncate max-w-[140px]">{handle}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Trending Discussions */}
                  <section className="flex flex-col gap-0 mt-6">
                    <h2 className="text-[20px] font-semibold text-primary tracking-tight px-2 mb-4">Trending Discussions</h2>
                    {discoveryData?.discussions?.map(discussion => {
                      return (
                        <article 
                          key={discussion.id}
                          onClick={() => navigate(`/posts/${discussion.id}`)}
                          className="flex gap-6 py-4 px-2 border-b border-outline-variant hover:bg-surface-container-lowest transition-colors cursor-pointer"
                        >
                          <div className="flex-shrink-0 relative">
                            {discussion.authorAvatarUrl ? (
                              <img alt={discussion.authorName} className="w-10 h-10 rounded-full object-cover border border-outline-variant/30 shrink-0" src={discussion.authorAvatarUrl}/>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-zinc-800 text-white font-semibold flex items-center justify-center text-sm shrink-0">
                                {(discussion.authorName || "U").charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 flex-1">
                            <div className="flex items-baseline gap-2">
                              <span className="text-[14px] font-bold text-primary">{discussion.authorName}</span>
                              <span className="text-[12px] font-medium text-on-surface-variant">{discussion.authorHandle}</span>
                            </div>
                            <h3 className="text-[16px] text-on-surface leading-tight line-clamp-2">{discussion.content}</h3>
                            <div className="flex gap-6 mt-2 text-outline text-[13px] font-medium">
                              <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span>{discussion.likeCount}</span>
                              </div>
                              <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                                <span>{discussion.commentCount}</span>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </section>
                </>
              )}
            </div>
          </main>
        </div>

      </div>
    </div>
    </NavBar>
  );
}
