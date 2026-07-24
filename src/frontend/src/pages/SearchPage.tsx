import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSearchProfiles } from "#frontend/api/search";
import { NavBar } from "#frontend/components/NavBar";

export function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");

  const { data: searchResults, isLoading } = useSearchProfiles(submittedTerm);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedTerm(searchTerm);
  };

  return (
    <div className="w-full min-h-screen bg-background flex justify-center text-on-background antialiased">
      {/* Container for layouts */}
      <div className="w-full max-w-7xl flex relative justify-center">
        
        <NavBar />
        


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

      </div>
    </div>
  );
}
