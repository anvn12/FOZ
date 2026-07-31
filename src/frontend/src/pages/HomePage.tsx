import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "#frontend/stores/auth";
import { NavBar } from "#frontend/components/NavBar.js";
import { toast } from "react-hot-toast";

import { useQuery } from "@tanstack/react-query";
import { listPosts } from "#frontend/api/interactions";
import { FeedPostItem } from "#frontend/components/FeedPostItem";





export function HomePage() {
  const { data: postsData, isLoading } = useQuery({ queryKey: ["posts"], queryFn: () => listPosts() });
  const posts = postsData?.items || [];
  const feedRef = React.useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (feedRef.current && !feedRef.current.contains(e.target as Node)) {
      feedRef.current.scrollTop += e.deltaY;
    }
  };

  return (
    <div onWheel={handleWheel} className="w-full min-h-screen md:h-screen bg-background flex justify-center text-on-background antialiased md:overflow-hidden">
      {/* Container for layouts */}
      <div className="w-full max-w-7xl flex relative justify-center h-full">

        {/* Shared Navigation Bar */}
        <NavBar />

        {/* ======================================= */}
        {/* MAIN CONTENT AREA: Centered Feed        */}
        {/* ======================================= */}
        <div className="flex-1 w-full flex justify-center md:pl-24 h-full">
          <main className="max-w-2xl w-full pt-[60px] md:pt-0 min-h-screen md:min-h-0 md:h-full flex flex-col pb-20 md:pb-4">
            {/* Top Sticky Header */}
            <header className="sticky top-0 md:relative bg-surface/90 backdrop-blur-md z-40 flex justify-center items-center h-14 flex-shrink-0">
              <h1 className="text-[17px] font-semibold text-primary">Home</h1>
            </header>

            {/* Feed Container */}
            <div className="flex-1 min-h-0 flex flex-col md:my-2 md:border md:border-outline-variant md:rounded-3xl bg-surface overflow-hidden">
              <div ref={feedRef} className="flex-1 overflow-y-auto divide-y divide-outline-variant [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {isLoading && <div className="p-4 text-center text-outline">Loading posts...</div>}
                {!isLoading && posts.length === 0 && <div className="p-4 text-center text-outline">No posts yet. Be the first to share something!</div>}
                {posts.map((post) => (
                  <FeedPostItem key={post.id} post={post} />
                ))}
              </div>
            </div>
          </main>
        </div>

      </div>
    </div>
  );
}
