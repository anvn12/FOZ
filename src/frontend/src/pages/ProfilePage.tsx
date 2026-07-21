import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useProfile } from "#frontend/api/profile";
import { useAuthStore } from "#frontend/stores/auth";
import { ProfileEditModal } from "#frontend/components/ProfileEditModal.js";
import { NavBar } from "#frontend/components/NavBar.js";

export function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { data: profile, isLoading, error } = useProfile(userId || "");
  const currentUser = useAuthStore(s => s.user);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"threads" | "replies" | "reposts">("threads");
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-background flex justify-center text-on-background antialiased">
        <div className="w-full max-w-7xl flex relative justify-center">
          <NavBar />
          <div className="flex-1 w-full flex justify-center md:pl-24">
            <main className="max-w-2xl w-full pt-[60px] md:pt-0 min-h-screen flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
              <span className="ml-3 text-zinc-600 font-medium">Loading profile...</span>
            </main>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="w-full min-h-screen bg-background flex justify-center text-on-background antialiased">
        <div className="w-full max-w-7xl flex relative justify-center">
          <NavBar />
          <div className="flex-1 w-full flex justify-center md:pl-24">
            <main className="max-w-2xl w-full pt-[60px] md:pt-0 min-h-screen px-4 py-8">
              <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
                <h2 className="text-lg font-semibold">Profile Not Found</h2>
                <p className="mt-1 text-sm">The profile you are looking for does not exist or could not be loaded.</p>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.id === profile.userAccountId;
  const initials = profile.displayName.charAt(0).toUpperCase() || "?";
  const userHandle = `@${profile.displayName.toLowerCase().replace(/\s+/g, "")}`;

  const bioLimit = 100;
  const isBioLong = !!(profile.bio && profile.bio.length > bioLimit);
  const displayedBio = isBioLong && !isExpanded
    ? `${profile.bio!.slice(0, bioLimit)}...`
    : profile.bio;

  // Helper to ensure external links open correctly
  const websiteUrl = profile.website
    ? profile.website.match(/^https?:\/\//i)
      ? profile.website
      : `https://${profile.website}`
    : "";

  return (
    <div className="w-full min-h-screen bg-background flex justify-center text-on-background antialiased">
      <div className="w-full max-w-7xl flex relative justify-center">
        <NavBar />

        <div className="flex-1 w-full flex justify-center md:pl-24">
          <main className="max-w-2xl w-full pt-[60px] md:pt-0 min-h-screen pb-20">
            <div className="px-4 py-8">
              {/* Header Profile Section */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-8 border-b border-zinc-100">
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{profile.displayName}</h1>
                    <p className="text-zinc-500 font-medium">{userHandle}</p>
                  </div>

                  {profile.bio ? (
                    <p className="text-zinc-700 text-base leading-relaxed whitespace-pre-wrap break-words">
                      {displayedBio}
                      {isBioLong && (
                        <button
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="ml-1.5 text-sm font-semibold text-zinc-900 hover:underline focus:outline-none"
                        >
                          {isExpanded ? "show less" : "view more"}
                        </button>
                      )}
                    </p>
                  ) : (
                    <p className="text-zinc-400 italic">No bio written yet.</p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-500">
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        <span className="text-base">📍</span> {profile.location}
                      </span>
                    )}
                    {profile.website && (
                      <a
                        href={websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <span className="text-base">🔗</span> {profile.website}
                      </a>
                    )}
                  </div>
                </div>

                {/* Avatar Area */}
                <div className="flex flex-col items-center gap-4">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      className="h-24 w-24 rounded-full object-cover border border-zinc-200 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900 text-white font-bold text-3xl shadow-sm">
                      {initials}
                    </div>
                  )}

                  {isOwner && (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs Switcher */}
              <div className="mt-6">
                <div className="flex border-b border-zinc-200">
                  <button
                    onClick={() => setActiveTab("threads")}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition ${
                      activeTab === "threads"
                        ? "border-zinc-900 text-zinc-950"
                        : "border-transparent text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    Threads
                  </button>
                  <button
                    onClick={() => setActiveTab("replies")}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition ${
                      activeTab === "replies"
                        ? "border-zinc-900 text-zinc-950"
                        : "border-transparent text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    Replies
                  </button>
                  <button
                    onClick={() => setActiveTab("reposts")}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition ${
                      activeTab === "reposts"
                        ? "border-zinc-900 text-zinc-950"
                        : "border-transparent text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    Reposts
                  </button>
                </div>

                {/* Tabs Content */}
                <div className="py-8">
                  {activeTab === "threads" && (
                    <div className="text-center py-12 text-zinc-400">
                      <span className="block text-4xl mb-3">📝</span>
                      <p className="text-zinc-500 font-medium">No threads yet</p>
                    </div>
                  )}

                  {activeTab === "replies" && (
                    <div className="text-center py-12 text-zinc-400">
                      <span className="block text-4xl mb-3">💬</span>
                      <p className="text-zinc-500 font-medium">No replies yet</p>
                    </div>
                  )}

                  {activeTab === "reposts" && (
                    <div className="text-center py-12 text-zinc-400">
                      <span className="block text-4xl mb-3">🔁</span>
                      <p className="text-zinc-500 font-medium">No reposts yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {isOwner && (
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profile={profile}
        />
      )}
    </div>
  );
}
