import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { CommentResponse, PostResponse, ReactionResponse } from "#shared/schemas/interactions";
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  listComments,
  listPosts,
  toggleReaction,
  updateComment,
} from "#frontend/api/interactions";
import { useAuthStore } from "#frontend/stores/auth";

type Viewer = ReturnType<typeof useAuthStore.getState>["user"];
type Post = PostResponse & { likeCount: number; liked: boolean };
type Comment = CommentResponse & { likeCount: number; liked: boolean };

export function FeedPage({ user, onAccount, postId }: { user: Viewer; onAccount: () => void; postId?: string }) {
  const navigate = useNavigate();
  const focusComposer = () => {
    if (!user) return navigate("/login");
    document.getElementById("post-composer")?.focus();
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 hidden h-16 border-b border-black/5 bg-[#f9f9f9]/90 px-6 backdrop-blur md:flex md:items-center md:justify-between md:pl-[25rem]">
        <Link to="/" className="text-[32px] font-black tracking-[-0.08em] text-black">FOZ</Link>
        <div className="flex items-center gap-3 text-[#5c3f41]">
          <button type="button" aria-label="Settings" className="icon-button"><span className="material-symbols-outlined">settings</span></button>
          <button type="button" aria-label="Help" className="icon-button"><span className="material-symbols-outlined">help</span></button>
          <button type="button" aria-label="Account" onClick={user ? onAccount : () => navigate("/login")} className="avatar">{initials(user?.email ?? "FOZ")}</button>
        </div>
      </header>

      {!postId && <SideNav onNewPost={focusComposer} />}
      <main className={postId ? "mx-auto w-full max-w-[640px] pb-28" : "w-full pb-24 md:pl-64 md:pt-4"}>
        {postId ? <ThreadDetail postId={postId} user={user} onAccount={onAccount} /> : <Feed user={user} onNewPost={focusComposer} />}
      </main>
    </div>
  );
}

function SideNav({ onNewPost }: { onNewPost: () => void }) {
  return <aside className="fixed inset-y-0 left-0 z-20 hidden w-80 flex-col border-r border-black/5 bg-[#f9f9f9] p-7 md:flex">
    <div className="mb-12 pt-14"><p className="text-[27px] font-bold tracking-tight">FOZ</p><p className="text-sm text-[#5c3f41]">Community Forum</p></div>
    <nav className="space-y-2 text-[16px] font-semibold">
      <Link to="/" className="nav-link nav-link-active"><span className="material-symbols-outlined">home</span>Home</Link>
      <button type="button" className="nav-link"><span className="material-symbols-outlined">search</span>Search</button>
      <button type="button" onClick={onNewPost} className="nav-link"><span className="material-symbols-outlined">add_box</span>New Post</button>
      <button type="button" className="nav-link"><span className="material-symbols-outlined">favorite</span>Activity</button>
      <button type="button" className="nav-link"><span className="material-symbols-outlined">person</span>Profile</button>
    </nav>
    <button type="button" onClick={onNewPost} className="mt-auto rounded-full bg-[#1b1b1b] py-3 text-sm font-bold text-white">New Thread</button>
  </aside>;
}

function Feed({ user, onNewPost }: { user: Viewer; onNewPost: () => void }) {
  const { data, isLoading } = useQuery({ queryKey: ["posts"], queryFn: listPosts });
  const [draft, setDraft] = useState("");
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: async () => { setDraft(""); await queryClient.invalidateQueries({ queryKey: ["posts"] }); toast.success("Your post is live."); },
    onError: showError,
  });

  return <div className="mx-auto w-full max-w-[800px] px-4 md:px-0">
    <div className="sticky top-0 z-20 -mx-4 flex h-16 items-center justify-between border-b border-black/5 bg-white/90 px-4 backdrop-blur md:hidden">
      <button type="button" onClick={onNewPost} className="avatar">{initials(user?.email ?? "FOZ")}</button><Link to="/" className="text-[28px] font-black tracking-[-0.08em]">FOZ</Link><span className="material-symbols-outlined">settings</span>
    </div>
    <section className="border-b border-black/5 py-6">
      <div className="flex gap-4"><div className="avatar h-11 w-11 shrink-0">{initials(user?.email ?? "FOZ")}</div><div className="min-w-0 flex-1">
        <textarea id="post-composer" rows={draft ? 4 : 1} value={draft} onFocus={onNewPost} onChange={(event) => setDraft(event.target.value)} placeholder="Start a discussion on FOZ..." className="w-full resize-none bg-transparent pt-2 text-[17px] text-[#5c3f41] outline-none placeholder:text-[#5c3f41]" />
        {draft && <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3"><span className="text-xs text-[#5c3f41]">{draft.length}/5000</span><button type="button" disabled={!draft.trim() || createMutation.isPending} onClick={() => createMutation.mutate({ body: draft })} className="rounded-full bg-[#1b1b1b] px-5 py-2 text-sm font-bold text-white disabled:opacity-40">Post</button></div>}
      </div></div>
    </section>
    {isLoading && <Loading />}
    {data?.items.map((post) => <FeedPost key={post.id} post={post} user={user} />)}
    {!isLoading && !data?.items.length && <p className="py-16 text-center text-[#5c3f41]">No discussions yet. Start the first one.</p>}
  </div>;
}

function FeedPost({ post, user }: { post: Post; user: Viewer }) {
  const navigate = useNavigate(); const queryClient = useQueryClient();
  const [liked, setLiked] = useState(post.liked); const [likeCount, setLikeCount] = useState(post.likeCount);
  const reaction = useMutation({ mutationFn: () => toggleReaction({ targetType: "post", targetId: post.id, active: liked }), onSuccess: async (result) => { setLiked(result.active); setLikeCount(result.likeCount); await queryClient.invalidateQueries({ queryKey: ["posts"] }); }, onError: showError });
  const remove = useMutation({ mutationFn: () => deletePost(post.id), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["posts"] }); toast.success("Post deleted."); }, onError: showError });
  const enter = () => { if (!user) navigate("/login"); else reaction.mutate(); };
  return <article className="border-b border-black/5 px-2 py-7">
    <div className="flex gap-4"><Avatar id={post.authorId} /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><div><span className="font-bold">{authorName(post.authorId, user)}</span><span className="ml-2 text-[#5c3f41]">@{shortId(post.authorId)} · {relativeTime(post.createdAt)}</span></div>{user?.id === post.authorId && <button type="button" onClick={() => confirm("Delete this post? This cannot be undone.") && remove.mutate()} aria-label="Delete post" className="text-[#ba0035]"><span className="material-symbols-outlined">delete</span></button>}</div>
      <Link to={`/posts/${post.id}`} className="mt-2 block whitespace-pre-wrap text-[18px] leading-8 text-[#262121]">{post.body}</Link>
      <div className="mt-5 flex max-w-[520px] items-center justify-between text-[#6a6161]"><Action icon="chat_bubble" label="Comments" onClick={() => navigate(`/posts/${post.id}`)} /><Action icon="repeat" label="Repost" onClick={() => toast("Reposts are not part of this interaction slice.")} /><Action icon={liked ? "favorite" : "favorite_border"} active={liked} count={likeCount} label="Like" onClick={enter} /><Action icon="ios_share" label="Share" onClick={() => navigator.share?.({ text: post.body }).catch(() => undefined)} /></div>
    </div></div>
  </article>;
}

function ThreadDetail({ postId, user, onAccount }: { postId: string; user: Viewer; onAccount: () => void }) {
  const navigate = useNavigate(); const { data } = useQuery({ queryKey: ["posts"], queryFn: listPosts }); const post = data?.items.find((item) => item.id === postId);
  const commentsQuery = useQuery({ queryKey: ["comments", postId], queryFn: () => listComments(postId), enabled: Boolean(post) });
  const [draft, setDraft] = useState(""); const [replyTo, setReplyTo] = useState<Comment | null>(null); const queryClient = useQueryClient();
  const create = useMutation({ mutationFn: () => createComment(postId, { body: draft, ...(replyTo ? { parentCommentId: replyTo.id } : {}) }), onSuccess: async () => { setDraft(""); setReplyTo(null); await queryClient.invalidateQueries({ queryKey: ["comments", postId] }); toast.success("Reply posted."); }, onError: showError });
  const roots = useMemo(() => (commentsQuery.data?.items ?? []).filter((comment) => !comment.parentCommentId), [commentsQuery.data]);
  if (!post && data) return <p className="px-4 py-20 text-center">This post is no longer available.</p>;
  return <><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/5 bg-[#f9f9f9]/90 px-4 backdrop-blur"><button type="button" onClick={() => navigate("/")} className="icon-button" aria-label="Back"><span className="material-symbols-outlined">arrow_back</span></button><Link to="/" className="text-[30px] font-black tracking-[-0.08em]">FOZ</Link><button type="button" onClick={user ? onAccount : () => navigate("/login")} className="icon-button" aria-label="Account"><span className="material-symbols-outlined">settings</span></button></header>
    {post ? <article className="border-b border-black/5 px-4 py-7"><div className="flex gap-3"><Avatar id={post.authorId} /><div><p className="font-bold">{authorName(post.authorId, user)}</p><p className="text-sm text-[#6a6161]">@{shortId(post.authorId)} · {relativeTime(post.createdAt)}</p></div></div><p className="mt-5 whitespace-pre-wrap text-[18px] leading-8">{post.body}</p><div className="mt-5 border-t border-black/5 pt-3"><Action icon="chat_bubble" count={commentsQuery.data?.items.length ?? 0} label="Comments" onClick={() => undefined} /></div></article> : <Loading />}
    <section className="px-4 py-2">{roots.map((comment) => <CommentBranch key={comment.id} comment={comment} comments={commentsQuery.data?.items ?? []} user={user} postId={postId} onReply={setReplyTo} />)}</section>
    <form onSubmit={(event) => { event.preventDefault(); if (!user) return navigate("/login"); if (draft.trim()) create.mutate(); }} className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/95 p-3 backdrop-blur"><div className="mx-auto flex max-w-[640px] items-center gap-3">{replyTo && <button type="button" onClick={() => setReplyTo(null)} className="text-xs text-[#ba0035]">Replying to {shortId(replyTo.authorId)} ×</button>}<input value={draft} onFocus={() => !user && navigate("/login")} onChange={(event) => setDraft(event.target.value)} placeholder={replyTo ? "Write a reply..." : "Reply to this post..."} className="min-w-0 flex-1 rounded-full bg-[#f3f3f3] px-5 py-3 outline-none"/><button type="submit" disabled={!draft.trim() || create.isPending} className="font-bold text-[#ba0035] disabled:opacity-40">Post</button></div></form>
  </>;
}

function CommentBranch({ comment, comments, user, postId, onReply, depth = 0 }: { comment: Comment; comments: Comment[]; user: Viewer; postId: string; onReply: (comment: Comment) => void; depth?: number }) {
  const navigate = useNavigate(); const queryClient = useQueryClient(); const [liked, setLiked] = useState(comment.liked); const [likeCount, setLikeCount] = useState(comment.likeCount); const [editing, setEditing] = useState(false); const [body, setBody] = useState(comment.body);
  const react = useMutation({ mutationFn: () => toggleReaction({ targetType: "comment", targetId: comment.id, active: liked }), onSuccess: async (result: ReactionResponse) => { setLiked(result.active); setLikeCount(result.likeCount); await queryClient.invalidateQueries({ queryKey: ["comments", postId] }); }, onError: showError });
  const save = useMutation({ mutationFn: () => updateComment(comment.id, { body }), onSuccess: async () => { setEditing(false); await queryClient.invalidateQueries({ queryKey: ["comments", postId] }); }, onError: showError });
  const remove = useMutation({ mutationFn: () => deleteComment(comment.id), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["comments", postId] }); }, onError: showError }); const children = comments.filter((item) => item.parentCommentId === comment.id);
  const act = (callback: () => void) => user ? callback() : navigate("/login");
  return <div className={depth ? "ml-5 border-l border-black/10 pl-4" : ""}><article className="py-5"><div className="flex gap-3"><Avatar id={comment.authorId} small /><div className="min-w-0 flex-1"><div className="flex items-center justify-between"><div><span className="font-bold">{authorName(comment.authorId, user)}</span><span className="ml-2 text-sm text-[#6a6161]">@{shortId(comment.authorId)} · {relativeTime(comment.createdAt)}</span></div>{user?.id === comment.authorId && <div className="flex gap-1"><button type="button" aria-label="Edit comment" onClick={() => setEditing(true)} className="icon-button"><span className="material-symbols-outlined text-[18px]">edit</span></button><button type="button" aria-label="Delete comment" onClick={() => confirm("Delete this comment?") && remove.mutate()} className="icon-button text-[#ba0035]"><span className="material-symbols-outlined text-[18px]">delete</span></button></div>}</div>
    {editing ? <div className="mt-2"><textarea value={body} onChange={(event) => setBody(event.target.value)} className="w-full rounded-lg border border-black/10 p-3 outline-none"/><div className="mt-2 flex gap-3 text-sm font-bold"><button type="button" onClick={() => save.mutate()} disabled={!body.trim()}>Save</button><button type="button" onClick={() => { setBody(comment.body); setEditing(false); }}>Cancel</button></div></div> : <p className="mt-2 whitespace-pre-wrap leading-6">{comment.body}</p>}
    <div className="mt-3 flex items-center gap-5 text-sm text-[#6a6161]"><Action icon="chat_bubble" label="Reply" onClick={() => act(() => onReply(comment))} /><Action icon={liked ? "favorite" : "favorite_border"} active={liked} count={likeCount} label="Like comment" onClick={() => act(() => react.mutate())} /></div></div></div></article>{children.map((child) => <CommentBranch key={child.id} comment={child} comments={comments} user={user} postId={postId} onReply={onReply} depth={depth + 1} />)}</div>;
}

function Avatar({ id, small = false }: { id: string; small?: boolean }) { return <div className={`avatar shrink-0 ${small ? "h-8 w-8 text-[10px]" : "h-11 w-11"}`}>{initials(id)}</div>; }
function Action({ icon, count, active, label, onClick }: { icon: string; count?: number; active?: boolean; label: string; onClick: () => void }) { return <button type="button" aria-label={label} onClick={onClick} className={`flex items-center gap-2 transition-colors hover:text-[#ba0035] ${active ? "text-[#ba0035]" : ""}`}><span className={`material-symbols-outlined text-[22px] ${active ? "icon-filled" : ""}`}>{icon}</span>{count !== undefined && <span className="text-sm">{count}</span>}</button>; }
function Loading() { return <div className="py-16 text-center text-[#6a6161]">Loading discussions…</div>; }
function initials(value: string) { return value.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() || "F"; }
function shortId(id: string) { return id.slice(0, 8); }
function authorName(authorId: string, user: Viewer) { return authorId === user?.id ? user.email.split("@")[0] : `Member ${shortId(authorId)}`; }
function relativeTime(value: string) { const minutes = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60000)); return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h`; }
function showError(error: Error) { toast.error(error.message || "Something went wrong. Please try again."); }
