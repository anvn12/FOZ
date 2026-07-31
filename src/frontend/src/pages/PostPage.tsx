import React, { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  listPosts,
  listComments,
  createComment,
  deleteComment,
  updateComment,
  toggleReaction,
} from "#frontend/api/interactions";
import { useAuthStore } from "#frontend/stores/auth";
import { NavBar } from "#frontend/components/NavBar";
import { FeedPostItem, formatRelativeTime } from "#frontend/components/FeedPostItem";
import { useProfile } from "#frontend/api/profile";

import { PostSummaryCard } from "#frontend/components/PostSummaryCard";

function showError(error: Error) { toast.error(error.message || "Something went wrong. Please try again."); }

export function PostPage() {
  const { postId = "" } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  const { data: postsData, isLoading: isPostsLoading } = useQuery({ queryKey: ["posts"], queryFn: () => listPosts() });
  const post = postsData?.items?.find((item) => item.id === postId);

  const commentsQuery = useQuery({ queryKey: ["comments", postId], queryFn: () => listComments(postId), enabled: Boolean(post) });
  
  const [draft, setDraft] = useState(""); 
  const [replyTo, setReplyTo] = useState<any | null>(null); 
  const queryClient = useQueryClient();
  
  const create = useMutation({ 
    mutationFn: () => createComment(postId, { body: draft, ...(replyTo ? { parentCommentId: replyTo.id } : {}) }), 
    onSuccess: async () => { 
      setDraft(""); 
      setReplyTo(null); 
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] }); 
      toast.success("Reply posted."); 
    }, 
    onError: showError 
  });
  
  const roots = useMemo(() => (commentsQuery.data?.items ?? []).filter((comment) => !comment.parentCommentId), [commentsQuery.data]);

  return (
    <div className="w-full min-h-screen bg-background flex justify-center text-on-background antialiased">
      <div className="w-full max-w-7xl flex relative justify-center">
        <NavBar />
        <div className="flex-1 w-full flex justify-center md:pl-24">
          <main className="max-w-2xl w-full pt-[60px] md:pt-0 min-h-screen pb-24 relative">
            <header className="sticky top-0 md:top-0 bg-surface/90 backdrop-blur-md z-40 flex items-center px-4 h-14 border-b border-outline-variant gap-4">
              <button onClick={() => navigate(-1)} className="hover:bg-surface-container rounded-full p-2 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <h1 className="text-[17px] font-semibold text-primary">Post</h1>
            </header>

            {isPostsLoading ? (
              <div className="p-8 text-center text-outline">Loading...</div>
            ) : post ? (
              <>
                <div className="border-b border-outline-variant border-4">
                  <FeedPostItem post={post} />
                </div>
                <div className="px-4">
                  <PostSummaryCard postId={post.id} />
                </div>

                {/* Comment Input */}
                <div className="px-4 py-3 border-b border-outline-variant bg-surface">
                  {replyTo && (
                    <div className="flex justify-between text-xs text-secondary mb-2 px-2">
                      <span>Replying to comment...</span>
                      <button onClick={() => setReplyTo(null)} className="hover:text-primary font-medium">Cancel</button>
                    </div>
                  )}
                  <form onSubmit={(e) => { e.preventDefault(); if (!user) return navigate("/login"); if (draft.trim()) create.mutate(); }} className="flex items-center gap-3">
                    <input 
                      value={draft} 
                      onFocus={() => !user && navigate("/login")} 
                      onChange={(e) => setDraft(e.target.value)} 
                      placeholder={replyTo ? "Write a reply..." : "Post your reply..."} 
                      className="flex-1 bg-surface-container rounded-full px-5 py-2.5 outline-none focus:ring-1 focus:ring-outline transition-all text-sm"
                    />
                    <button type="submit" disabled={!draft.trim() || create.isPending} className="bg-primary text-on-primary px-5 py-2.5 rounded-full font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity">
                      Reply
                    </button>
                  </form>
                </div>

                {/* Comments List */}
                <div className="pb-20 divide-y divide-outline-variant">
                  {roots.map((comment) => (
                    <CommentBranch key={comment.id} comment={comment} comments={commentsQuery.data?.items ?? []} user={user} postId={postId} onReply={setReplyTo} />
                  ))}
                  {roots.length === 0 && <div className="p-8 text-center text-outline">No comments yet. Be the first to reply!</div>}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-outline">Post not found</div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function CommentBranch({ comment, comments, user, postId, onReply, depth = 0 }: { comment: any; comments: any[]; user: any; postId: string; onReply: (comment: any) => void; depth?: number }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(comment.liked);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.body);
  const { data: profile } = useProfile(comment.authorId);
  const displayName = profile?.displayName || `Member ${comment.authorId.slice(0, 4)}`;

  const react = useMutation({ 
    mutationFn: () => toggleReaction({ targetType: "comment", targetId: comment.id, active: liked }), 
    onSuccess: async (result: any) => { 
      setLiked(result.active); 
      setLikeCount(result.likeCount); 
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] }); 
    }, 
    onError: showError 
  });
  
  const save = useMutation({ 
    mutationFn: () => updateComment(comment.id, { body }), 
    onSuccess: async () => { 
      setEditing(false); 
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] }); 
    }, 
    onError: showError 
  });
  
  const remove = useMutation({ 
    mutationFn: () => deleteComment(comment.id), 
    onSuccess: async () => { 
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] }); 
    }, 
    onError: showError 
  });
  
  const children = comments.filter((item) => item.parentCommentId === comment.id);
  const act = (callback: () => void) => user ? callback() : navigate("/login");
  
  return (
    <div className={depth ? "ml-4 md:ml-8 border-l border-outline-variant pl-4 pt-3" : ""}>
      <article className="p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-1">
            {profile?.avatarUrl ? (
              <img alt={displayName} className="w-8 h-8 rounded-full object-cover border border-outline-variant" src={profile.avatarUrl} />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[14px]">
                <Link to={`/profiles/${comment.authorId}`} className="font-semibold hover:underline text-primary">
                  {displayName}
                </Link>
                <span className="text-secondary ml-1">· {formatRelativeTime(comment.createdAt)}</span>
              </div>
              
              {user?.id === comment.authorId && (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(true)} className="text-secondary hover:text-primary"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                  <button onClick={() => confirm("Delete this comment?") && remove.mutate()} className="text-red-500 hover:text-red-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                </div>
              )}
            </div>
            
            {editing ? (
              <div className="mt-2">
                <textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full rounded-lg bg-surface-container p-3 outline-none focus:ring-1 focus:ring-outline text-primary"/>
                <div className="mt-2 flex gap-3 text-sm font-semibold">
                  <button onClick={() => save.mutate()} disabled={!body.trim()} className="text-primary hover:opacity-80">Save</button>
                  <button onClick={() => { setBody(comment.body); setEditing(false); }} className="text-secondary hover:text-primary">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="mt-1 whitespace-pre-wrap leading-6 text-[15px] text-primary">{comment.body}</p>
            )}
            
            <div className="mt-2 flex items-center gap-5 text-sm text-outline">
              <button onClick={() => act(() => onReply(comment))} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button onClick={() => act(() => react.mutate())} className={`flex items-center gap-1.5 transition-colors ${liked ? "text-red-500" : "hover:text-primary"}`}>
                <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {likeCount > 0 && <span>{likeCount}</span>}
              </button>
            </div>
          </div>
        </div>
      </article>
      {children.map((child) => <CommentBranch key={child.id} comment={child} comments={comments} user={user} postId={postId} onReply={onReply} depth={depth + 1} />)}
    </div>
  );
}
