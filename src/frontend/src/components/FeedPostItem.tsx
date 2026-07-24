import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProfile } from "#frontend/api/profile";
import { useToggleReaction, useToggleRepost } from "#frontend/api/interactions";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function FeedPostItem({ post }: { post: any }) {
  const navigate = useNavigate();
  const { data: profile } = useProfile(post.authorId);
  const displayName = profile?.displayName || `Member ${post.authorId.slice(0, 4)}`;
  
  const queryClient = useQueryClient();
  const toggleReaction = useToggleReaction();
  const toggleRepost = useToggleRepost();

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleReaction.mutate(
      { targetType: "post", targetId: post.id, active: post.liked },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: () => {
          toast.error("Failed to like post");
        }
      }
    );
  };

  const handleComment = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/posts/${post.id}`);
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleRepost.mutate(
      { postId: post.id, active: post.reposted },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
        onError: () => {
          toast.error("Failed to repost");
        }
      }
    );
  };
  
  return (
    <article className="p-4 hover:bg-surface-container-low/30 transition-colors border-b border-outline-variant">
      {post.repostedBy && (
        <div className="flex items-center gap-2 mb-2 text-secondary text-[13px] font-semibold pl-12">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          <Link to={`/profiles/${post.repostedBy.id}`} className="hover:underline hover:text-primary">
            {post.repostedBy.displayName} reposted
          </Link>
        </div>
      )}
      <div className="flex items-start gap-3">
        {/* Avatar column */}
        <div className="flex-shrink-0 relative">
          {profile?.avatarUrl ? (
            <img alt={displayName} className="w-9 h-9 rounded-full object-cover border border-outline-variant" src={profile.avatarUrl} />
          ) : (
            <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Content details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-1 text-[15px]">
              <Link to={`/profiles/${post.authorId}`} className="font-semibold hover:underline text-primary">
                {displayName}
              </Link>
              <span className="text-secondary text-[14px] ml-1">· {formatRelativeTime(post.createdAt)}</span>
            </div>
          </div>
          <div className="mt-1 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-primary">
            {post.content}
          </div>

          {post.attachments && post.attachments.length > 0 && (
            <div className={`mt-3 grid gap-2 ${post.attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {post.attachments.map((att: any, idx: number) => (
                <div key={idx} className="relative rounded-2xl overflow-hidden border border-outline-variant bg-surface-container max-h-[400px]">
                  {att.fileType.startsWith("image/") ? (
                    <img src={att.fileUrl} alt="attachment" className="w-full h-full object-cover" />
                  ) : (
                    <video src={att.fileUrl} controls className="w-full h-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reaction Row */}
          <div className="mt-3 flex items-center gap-6 text-outline">
            <button onClick={handleLike} className={`flex items-center gap-1.5 transition-colors group ${post.liked ? 'text-red-500' : 'hover:text-primary'}`}>
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill={post.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {post.likeCount > 0 && <span className="text-[13px]">{post.likeCount.toLocaleString()}</span>}
            </button>
            <button onClick={handleComment} className="flex items-center gap-1.5 hover:text-primary transition-colors group">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </button>
            <button onClick={handleRepost} className={`flex items-center gap-1.5 transition-colors group ${post.reposted ? 'text-green-500' : 'hover:text-primary'}`}>
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
