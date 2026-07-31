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
          <main className="max-w-2xl w-full pt-[60px] md:pt-0 min-h-screen pb-20">
            {/* Top Sticky Header */}
            <header className="sticky top-0 md:top-0 bg-surface/90 backdrop-blur-md z-40 flex justify-center items-center h-14 border-b border-outline-variant">
              <h1 className="text-[17px] font-semibold text-primary">Home</h1>
            </header>

            {/* Feed Container */}
            <div className="flex flex-col divide-y divide-outline-variant">
              {isLoading && <div className="p-4 text-center text-outline">Loading posts...</div>}
              {!isLoading && posts.length === 0 && <div className="p-4 text-center text-outline">No posts yet. Be the first to share something!</div>}
              {posts.map((post) => (
                <FeedPostItem key={post.id} post={post} />
              ))}
            </div>
          </main>
        </div>

      </div>
    </div>
  );
}
