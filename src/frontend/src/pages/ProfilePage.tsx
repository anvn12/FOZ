import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useProfile, useProfileByUsername } from "#frontend/api/profile";
import { useAuthStore } from "#frontend/stores/auth";
import { ProfileEditModal } from "#frontend/components/ProfileEditModal.js";
import { NavBar } from "#frontend/components/NavBar.js";
import { useQuery } from "@tanstack/react-query";
import { listPosts, listUserComments } from "#frontend/api/interactions";
import { FeedPostItem, formatRelativeTime } from "#frontend/components/FeedPostItem";
import toast from "react-hot-toast";
import {
  MapPinIcon,
  LinkIcon,
  CalendarIcon,
  EditPencilIcon,
  ShareIcon,
  ThreadsTabIcon,
  RepliesTabIcon,
  RepostsTabIcon,
  VerifiedBadgeIcon,
  ShieldBadgeIcon,
} from "#frontend/components/icons/ProfileIcons.js";

export function ProfilePage() {
  const { username, userId } = useParams<{ username?: string; userId?: string }>();
  const navigate = useNavigate();

  const profileByUserIdQuery = useProfile(userId || "");
  const profileByUsernameQuery = useProfileByUsername(username || "");

  const profile = username ? profileByUsernameQuery.data : profileByUserIdQuery.data;
  const isLoading = username ? profileByUsernameQuery.isLoading : profileByUserIdQuery.isLoading;
  const error = username ? profileByUsernameQuery.error : profileByUserIdQuery.error;

  const targetUserId = profile?.userAccountId || "";

  useEffect(() => {
    if (userId && profile?.username) {
      navigate(`/profiles/@${profile.username}`, { replace: true });
    }
  }, [userId, profile?.username, navigate]);

  const currentUser = useAuthStore((s) => s.user);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"threads" | "replies" | "reposts">("threads");
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: postsData } = useQuery({
    queryKey: ["posts", "profile", targetUserId],
    queryFn: () => listPosts(targetUserId),
    enabled: !!profile?.userAccountId,
  });
  const posts = postsData?.items || [];

  const { data: repliesData } = useQuery({
    queryKey: ["replies", "profile", targetUserId],
    queryFn: () => listUserComments(targetUserId),
    enabled: !!profile?.userAccountId,
  });
  const replies = repliesData?.items || [];

  const threads = posts.filter((p) => !p.repostId);
  const reposts = posts.filter((p) => p.repostId);

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
  const userHandle = `@${profile.username || profile.displayName.toLowerCase().replace(/\s+/g, "")}`;

  const bioLimit = 100;
  const isBioLong = !!(profile.bio && profile.bio.length > bioLimit);
  const displayedBio = isBioLong && !isExpanded ? `${profile.bio!.slice(0, bioLimit)}...` : profile.bio;

  // Helper to ensure external links open correctly
  const websiteUrl = profile.website
    ? profile.website.match(/^https?:\/\//i)
      ? profile.website
      : `https://${profile.website}`
    : "";

  const joinedDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  const handleShareProfile = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied to clipboard!");
    }
  };

  return (
    <div className="w-full min-h-screen bg-background flex justify-center text-on-background antialiased">
      <div className="w-full max-w-7xl flex relative justify-center">
        <NavBar />

        <div className="flex-1 w-full flex justify-center md:pl-24">
          <main className="max-w-2xl w-full pt-[60px] md:pt-0 min-h-screen pb-20">
            <div className="px-4 py-6">
              {/* Header Profile Section with Modern Banner */}
              <div className="relative mb-6 rounded-2xl overflow-hidden border border-zinc-200/80 shadow-sm bg-zinc-900">
                <div className="h-28 sm:h-36 w-full relative bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                  <div className="absolute -top-10 -left-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
                </div>

                {/* Header Content Overlay */}
                <div className="px-4 sm:px-6 pb-6 pt-0 relative bg-white">
                  <div className="flex items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4">
                    {/* Avatar */}
                    <div className="relative group">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.displayName}
                          className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover ring-4 ring-white bg-white shadow-md transition group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-zinc-900 text-white font-extrabold text-3xl ring-4 ring-white shadow-md transition group-hover:scale-105">
                          {initials}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        onClick={handleShareProfile}
                        className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-400 shadow-sm transition active:scale-95"
                        title="Share profile"
                      >
                        <ShareIcon className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Share</span>
                      </button>

                      {isOwner && (
                        <button
                          onClick={() => setIsEditModalOpen(true)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-zinc-800 shadow-sm transition active:scale-95 whitespace-nowrap"
                        >
                          <EditPencilIcon className="w-3.5 h-3.5 text-zinc-300" />
                          <span>Edit Profile</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Profile Info Details */}
                  <div className="space-y-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 break-words [overflow-wrap:anywhere]">
                          {profile.displayName}
                        </h1>
                        {(() => {
                          const role = profile.role || (isOwner ? currentUser?.role : undefined);
                          if (role === "administrator" || role === "admin") {
                            return (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                                <ShieldBadgeIcon className="w-3.5 h-3.5 text-purple-600" />
                                Admin
                              </span>
                            );
                          }
                          if (role === "moderator" || role === "mod") {
                            return (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                <ShieldBadgeIcon className="w-3.5 h-3.5 text-blue-600" />
                                Mod
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <p className="text-zinc-500 font-medium text-sm break-all mt-0.5">{userHandle}</p>
                    </div>

                    {profile.bio ? (
                      <p className="text-zinc-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
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
                      <p className="text-zinc-400 italic text-sm sm:text-base">No bio written yet.</p>
                    )}

                    {/* Metadata Badges / Info Icons */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-zinc-500 pt-1">
                      {profile.location && (
                        <span className="flex items-center gap-1.5 text-zinc-600 break-words">
                          <MapPinIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                          <span>{profile.location}</span>
                        </span>
                      )}
                      {profile.website && (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:underline font-medium break-all"
                        >
                          <LinkIcon className="w-4 h-4 text-blue-500 shrink-0" />
                          <span>{profile.website}</span>
                        </a>
                      )}
                      {joinedDate && (
                        <span className="flex items-center gap-1.5 text-zinc-500">
                          <CalendarIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                          <span>Joined {joinedDate}</span>
                        </span>
                      )}
                    </div>

                    {/* Stats Bar */}
                    <div className="flex items-center gap-6 pt-3 border-t border-zinc-100 text-xs sm:text-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-zinc-900">{threads.length}</span>
                        <span className="text-zinc-500">Threads</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-zinc-900">{replies.length}</span>
                        <span className="text-zinc-500">Replies</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-zinc-900">{reposts.length}</span>
                        <span className="text-zinc-500">Reposts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Switcher */}
              <div className="mt-2">
                <div className="flex border-b border-zinc-200">
                  <button
                    onClick={() => setActiveTab("threads")}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition flex items-center justify-center gap-2 ${
                      activeTab === "threads"
                        ? "border-zinc-900 text-zinc-950"
                        : "border-transparent text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    <ThreadsTabIcon className={`w-4 h-4 ${activeTab === "threads" ? "text-zinc-950" : "text-zinc-400"}`} />
                    <span>Threads</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                        activeTab === "threads" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {threads.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("replies")}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition flex items-center justify-center gap-2 ${
                      activeTab === "replies"
                        ? "border-zinc-900 text-zinc-950"
                        : "border-transparent text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    <RepliesTabIcon className={`w-4 h-4 ${activeTab === "replies" ? "text-zinc-950" : "text-zinc-400"}`} />
                    <span>Replies</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                        activeTab === "replies" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {replies.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("reposts")}
                    className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition flex items-center justify-center gap-2 ${
                      activeTab === "reposts"
                        ? "border-zinc-900 text-zinc-950"
                        : "border-transparent text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    <RepostsTabIcon className={`w-4 h-4 ${activeTab === "reposts" ? "text-zinc-950" : "text-zinc-400"}`} />
                    <span>Reposts</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                        activeTab === "reposts" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {reposts.length}
                    </span>
                  </button>
                </div>

                {/* Tabs Content */}
                <div className="py-6">
                  {activeTab === "threads" &&
                    (threads.length > 0 ? (
                      <div className="flex flex-col">
                        {threads.map((post: any) => (
                          <FeedPostItem key={post.id} post={post} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400">
                          <ThreadsTabIcon className="w-6 h-6" />
                        </div>
                        <p className="text-zinc-700 font-semibold text-sm">No threads yet</p>
                        <p className="text-zinc-400 text-xs mt-1">Posts shared by {profile.displayName} will appear here.</p>
                      </div>
                    ))}

                  {activeTab === "replies" &&
                    (replies.length > 0 ? (
                      <div className="flex flex-col divide-y divide-outline-variant">
                        {replies.map((reply: any) => (
                          <ProfileReplyItem key={reply.id} reply={reply} profile={profile} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400">
                          <RepliesTabIcon className="w-6 h-6" />
                        </div>
                        <p className="text-zinc-700 font-semibold text-sm">No replies yet</p>
                        <p className="text-zinc-400 text-xs mt-1">Replies made on threads will show up here.</p>
                      </div>
                    ))}

                  {activeTab === "reposts" &&
                    (reposts.length > 0 ? (
                      <div className="flex flex-col">
                        {reposts.map((post: any) => (
                          <FeedPostItem key={post.repostId} post={post} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 px-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-400">
                          <RepostsTabIcon className="w-6 h-6" />
                        </div>
                        <p className="text-zinc-700 font-semibold text-sm">No reposts yet</p>
                        <p className="text-zinc-400 text-xs mt-1">Reposted threads will be saved here.</p>
                      </div>
                    ))}
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

function ProfileReplyItem({ reply, profile }: { reply: any; profile: any }) {
  const displayName = profile?.displayName || `Member ${reply.authorId.slice(0, 4)}`;
  const handle = profile?.username ? `@${profile.username}` : null;
  const profileLink = profile?.username ? `/profiles/@${profile.username}` : `/profiles/${reply.authorId}`;
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("a, button, input, textarea, [role='button'], .no-card-click")) {
      return;
    }
    navigate(`/posts/${reply.postId}`);
  };

  return (
    <article onClick={handleCardClick} className="p-4 hover:bg-surface-container-low/30 transition-colors cursor-pointer">
      <div className="flex gap-3">
        <Link to={profileLink} className="flex-shrink-0 mt-1 block hover:opacity-85 transition-opacity">
          {profile?.avatarUrl ? (
            <img alt={displayName} className="w-9 h-9 rounded-full object-cover border border-outline-variant" src={profile.avatarUrl} />
          ) : (
            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[15px] min-w-0 flex-wrap">
            <span className="font-semibold text-primary truncate max-w-[200px] sm:max-w-[300px]">{displayName}</span>
            {handle && <span className="text-secondary text-[13px]">{handle}</span>}
            <span className="text-secondary text-[14px] ml-1 shrink-0">· {formatRelativeTime(reply.createdAt)}</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap leading-relaxed text-[15px] text-primary">{reply.body}</p>
          <div className="mt-3">
            <Link to={`/posts/${reply.postId}`} className="text-sm font-semibold text-primary hover:underline">
              View original post
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
