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
  toggleRepost,
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
  const { data, isLoading } = useQuery({ queryKey: ["posts"], queryFn: () => listPosts() });
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
        {draft && <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3"><span className="text-xs text-[#5c3f41]">{draft.length}/5000</span><button type="button" disabled={!draft.trim() || createMutation.isPending} onClick={() => createMutation.mutate({ content: draft })} className="rounded-full bg-[#1b1b1b] px-5 py-2 text-sm font-bold text-white disabled:opacity-40">Post</button></div>}
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const reaction = useMutation({ mutationFn: () => toggleReaction({ targetType: "post", targetId: post.id, active: liked }), onSuccess: async (result) => { setLiked(result.active); setLikeCount(result.likeCount); await queryClient.invalidateQueries({ queryKey: ["posts"] }); }, onError: showError });
  const remove = useMutation({ mutationFn: () => deletePost(post.id), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["posts"] }); toast.success("Post deleted."); }, onError: showError });
  const enter = () => { if (!user) navigate("/login"); else reaction.mutate(); };
  const repost = useMutation({ mutationFn: () => toggleRepost(post.id, (post as any).reposted ?? false), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["posts"] }); }, onError: showError });
  const handleRepost = () => { if (!user) navigate("/login"); else repost.mutate(); };
  return (
    <article className="border-b border-black/5 px-2 py-7">
      <div className="flex gap-4">
        <Avatar id={post.authorId} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="font-bold">{authorName(post.authorId, user)}</span>
              <span className="ml-2 text-[#5c3f41]">@{shortId(post.authorId)} · {relativeTime(post.createdAt)}</span>
            </div>
            {user?.id === post.authorId && (
              <button type="button" onClick={() => setShowDeleteDialog(true)} aria-label="Delete post" className="text-[#ba0035]">
                <span className="material-symbols-outlined">delete</span>
              </button>
            )}
          </div>
          <Link to={`/posts/${post.id}`} className="mt-2 block whitespace-pre-wrap text-[18px] leading-8 text-[#262121]">{post.content}</Link>
          <div className="mt-5 flex max-w-[520px] items-center justify-between text-[#6a6161]">
            <Action icon="chat_bubble" count={post.commentCount} label="Comments" onClick={() => navigate(`/posts/${post.id}`)} />
            <Action icon="repeat" label="Repost" onClick={handleRepost} />
            <Action icon={liked ? "favorite" : "favorite_border"} active={liked} count={likeCount} label="Like" onClick={enter} />
            <Action icon="ios_share" label="Share" onClick={() => navigator.share?.({ text: post.content || "" }).catch(() => undefined)} />
          </div>
        </div>
      </div>

      {showDeleteDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setShowDeleteDialog(false)}
        >
          <div
            className="animate-foz-pop flex w-full max-w-[360px] flex-col rounded-3xl bg-white p-6 text-center shadow-2xl border border-black/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-black">Delete post?</h3>
            <p className="mt-1 text-sm text-[#6a6161]">This post will be deleted permanently. This action cannot be undone.</p>
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  remove.mutate();
                }}
                disabled={remove.isPending}
                className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition-opacity hover:bg-red-700 disabled:opacity-50"
              >
                {remove.isPending ? "Deleting..." : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                className="w-full rounded-xl border border-black/10 bg-transparent py-3 text-sm font-semibold text-black transition-colors hover:bg-black/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function ThreadDetail({ postId, user, onAccount }: { postId: string; user: Viewer; onAccount: () => void }) {
  const navigate = useNavigate(); const { data } = useQuery({ queryKey: ["posts"], queryFn: () => listPosts() }); const post = data?.items?.find((item) => item.id === postId);
  const commentsQuery = useQuery({ queryKey: ["comments", postId], queryFn: () => listComments(postId), enabled: Boolean(post) });
  const [draft, setDraft] = useState(""); const [replyTo, setReplyTo] = useState<Comment | null>(null); const queryClient = useQueryClient();
  const create = useMutation({ mutationFn: () => createComment(postId, { body: draft, ...(replyTo ? { parentCommentId: replyTo.id } : {}) }), onSuccess: async () => { setDraft(""); setReplyTo(null); await queryClient.invalidateQueries({ queryKey: ["comments", postId] }); toast.success("Reply posted."); }, onError: showError });
  const roots = useMemo(() => (commentsQuery.data?.items ?? []).filter((comment) => !comment.parentCommentId), [commentsQuery.data]);
  if (!post && data) return <p className="px-4 py-20 text-center">This post is no longer available.</p>;
  return <><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/5 bg-[#f9f9f9]/90 px-4 backdrop-blur"><button type="button" onClick={() => navigate("/")} className="icon-button" aria-label="Back"><span className="material-symbols-outlined">arrow_back</span></button><Link to="/" className="text-[30px] font-black tracking-[-0.08em]">FOZ</Link><button type="button" onClick={user ? onAccount : () => navigate("/login")} className="icon-button" aria-label="Account"><span className="material-symbols-outlined">settings</span></button></header>
    {post ? <article className="border-b border-black/5 px-4 py-7"><div className="flex gap-3"><Avatar id={post.authorId} /><div><p className="font-bold">{authorName(post.authorId, user)}</p><p className="text-sm text-[#6a6161]">@{shortId(post.authorId)} · {relativeTime(post.createdAt)}</p></div></div><p className="mt-5 whitespace-pre-wrap text-[18px] leading-8">{post.content}</p><div className="mt-5 border-t border-black/5 pt-3"><Action icon="chat_bubble" count={commentsQuery.data?.items.length ?? 0} label="Comments" onClick={() => undefined} /></div></article> : <Loading />}
    <section className="px-4 py-2">{roots.map((comment) => <CommentBranch key={comment.id} comment={comment} comments={commentsQuery.data?.items ?? []} user={user} postId={postId} onReply={setReplyTo} />)}</section>
    <form onSubmit={(event) => event.preventDefault()} className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/95 p-3 backdrop-blur"><div className="mx-auto flex max-w-[640px] items-center gap-3">{replyTo && <button type="button" onClick={() => setReplyTo(null)} className="text-xs text-[#ba0035]">Replying to {shortId(replyTo.authorId)} ×</button>}<div className="relative flex-1 flex items-center bg-[#f3f3f3] rounded-2xl px-4 py-2.5 min-h-[40px]"><textarea rows={1} value={draft} onFocus={() => !user && navigate("/login")} onChange={(event) => { const val = event.target.value; setDraft(val); const el = event.target; el.style.height = "auto"; if (val.includes("\n") || el.scrollHeight > 48) { el.style.height = `${el.scrollHeight}px`; } }} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.stopPropagation(); } }} onBlur={(e) => { if (!draft.trim()) { setDraft(""); e.target.style.height = "auto"; if (replyTo) setReplyTo(null); } }} placeholder={replyTo ? "Write a reply..." : "Reply to this post..."} className="w-full bg-transparent p-0 pr-10 outline-none border-0 text-sm leading-[20px] resize-none max-h-[168px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/40 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.2)_transparent]"/>{draft.trim() && (<button type="button" onClick={(e) => { if (!user) return navigate("/login"); if (draft.trim()) { create.mutate(); setDraft(""); const textarea = e.currentTarget.parentElement?.querySelector("textarea"); if (textarea) textarea.style.height = "auto"; } }} disabled={create.isPending} className="absolute right-2.5 bottom-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black text-white hover:opacity-80 transition-opacity disabled:opacity-40" aria-label="Post"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" /></svg></button>)}</div></div></form>
  </>;
}

function countTotalDescendants(commentId: string, comments: any[]): number {
  const children = comments.filter((c) => c.parentCommentId === commentId);
  let count = children.length;
  for (const child of children) {
    count += countTotalDescendants(child.id, comments);
  }
  return count;
}

function CommentBranch({ comment, comments, user, postId, onReply, depth = 0 }: { comment: Comment; comments: Comment[]; user: Viewer; postId: string; onReply: (comment: Comment) => void; depth?: number }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(comment.liked);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.body);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [wasEdited, setWasEdited] = useState(false);

  const isEdited = wasEdited || Boolean(
    comment.updatedAt && new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 1000
  );

  const react = useMutation({ mutationFn: () => toggleReaction({ targetType: "comment", targetId: comment.id, active: liked }), onSuccess: async (result: ReactionResponse) => { setLiked(result.active); setLikeCount(result.likeCount); await queryClient.invalidateQueries({ queryKey: ["comments", postId] }); }, onError: showError });
  const save = useMutation({ mutationFn: () => updateComment(comment.id, { body }), onSuccess: async () => { setEditing(false); setWasEdited(true); await queryClient.invalidateQueries({ queryKey: ["comments", postId] }); }, onError: showError });
  const remove = useMutation({ mutationFn: () => deleteComment(comment.id), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["comments", postId] }); }, onError: showError });
  const children = comments.filter((item) => item.parentCommentId === comment.id);
  const totalReplies = (comment as any).replyCount ?? countTotalDescendants(comment.id, comments);
  const [expanded, setExpanded] = useState(false);
  const [visibleReplyCount, setVisibleReplyCount] = useState(10);
  const act = (callback: () => void) => user ? callback() : navigate("/login");
  const MAX_DEPTH = 2;
  return (
    <div className={depth === 0 ? "px-4" : ""}>
      {/* Parent row: avatar lane + content */}
      <div className="flex gap-3">
        <div className="flex flex-col items-center w-8 flex-shrink-0">
          <div className="mt-3">
            <Avatar id={comment.authorId} small />
          </div>
          {totalReplies > 0 && depth < MAX_DEPTH && <div className="w-[2px] flex-1 mt-1 bg-black/10" />}
        </div>
        <div className="min-w-0 flex-1 pt-3 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold">{authorName(comment.authorId, user)}</span>
              <span className="ml-2 text-sm text-[#6a6161]">
                @{shortId(comment.authorId)} · {relativeTime(comment.createdAt)}
                {isEdited && <span className="ml-1 text-xs text-[#6a6161] font-normal">(Edited)</span>}
              </span>
            </div>
            {user?.id === comment.authorId && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  className="p-1 rounded-full text-secondary hover:text-primary hover:bg-black/5 transition-colors"
                  aria-label="Comment options"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>

                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-1 z-20 min-w-[120px] rounded-xl border border-black/10 bg-white py-1 shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          setEditing(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-black hover:bg-black/5 transition-colors"
                      >
                        <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          setShowDeleteDialog(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          {editing ? (
            <div className="mt-2"><textarea value={body} onChange={(event) => setBody(event.target.value)} className="w-full rounded-lg border border-black/10 p-3 outline-none"/><div className="mt-2 flex gap-3 text-sm font-bold"><button type="button" onClick={() => save.mutate()} disabled={!body.trim()}>Save</button><button type="button" onClick={() => { setBody(comment.body); setEditing(false); }}>Cancel</button></div></div>
          ) : (
            <p className="mt-2 whitespace-pre-wrap leading-6">{comment.body}</p>
          )}
          <div className="mt-3 flex items-center gap-3 text-sm text-[#6a6161]">
            <Action icon={liked ? "favorite" : "favorite_border"} active={liked} count={likeCount} label="Like comment" onClick={() => act(() => react.mutate())} />
            <Action icon="chat_bubble" label="Reply" onClick={() => act(() => { setExpanded(true); onReply(comment); })} />
          </div>
        </div>
      </div>

      {/* Expand Replies Button (YouTube Style) with L-shaped connector line (shown when collapsed) */}
      {!expanded && totalReplies > 0 && (
        <div className="flex gap-3">
          <div className="relative flex flex-col items-center w-8 flex-shrink-0">
            <div className="w-[2px] h-5 flex-shrink-0 bg-black/10" />
            <div className="absolute top-5 left-[15px] w-[29px] h-[2px] bg-black/10" />
          </div>
          <div className="flex-1 min-w-0 py-1">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-black hover:bg-black/5 px-3 py-1 rounded-full transition-colors group"
            >
              <span>{`${totalReplies} ${totalReplies === 1 ? "reply" : "replies"}`}</span>
              <svg className="w-4 h-4 text-black group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Child rows — rendered only when expanded */}
      {expanded && (
        <>
          {children.slice(0, visibleReplyCount).map((child) => {
            if (depth < MAX_DEPTH) {
              return (
                <div key={child.id} className="flex gap-3">
                  <div className="relative flex flex-col items-center w-8 flex-shrink-0">
                    <div className="w-[2px] h-7 flex-shrink-0 bg-black/10" />
                    <div className="absolute top-7 left-[15px] w-[29px] h-[2px] bg-black/10" />
                    <div className="w-[2px] flex-1 bg-black/10" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CommentBranch comment={child} comments={comments} user={user} postId={postId} onReply={onReply} depth={depth + 1} />
                  </div>
                </div>
              );
            }

            return (
              <CommentBranch key={child.id} comment={child} comments={comments} user={user} postId={postId} onReply={onReply} depth={MAX_DEPTH} />
            );
          })}

          {/* Show more replies button if remaining replies exist with L-shaped connector line */}
          {children.length > visibleReplyCount && (
            <div className="flex gap-3">
              <div className="relative flex flex-col items-center w-8 flex-shrink-0">
                <div className="w-[2px] h-5 flex-shrink-0 bg-black/10" />
                <div className="absolute top-5 left-[15px] w-[29px] h-[2px] bg-black/10" />
                <div className="w-[2px] flex-1 bg-black/10" />
              </div>
              <div className="flex-1 min-w-0 py-1">
                <button
                  type="button"
                  onClick={() => setVisibleReplyCount((prev) => prev + 10)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-black hover:bg-black/5 px-3 py-1.5 rounded-full transition-colors group"
                >
                  <svg className="w-3.5 h-3.5 text-black group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[13px]">Show more replies</span>
                </button>
              </div>
            </div>
          )}

          {/* Hide replies button at the bottom of expanded replies with L-shaped connector line */}
          <div className="flex gap-3">
            <div className="relative flex flex-col items-center w-8 flex-shrink-0">
              <div className="w-[2px] h-5 flex-shrink-0 bg-black/10" />
              <div className="absolute top-5 left-[15px] w-[29px] h-[2px] bg-black/10" />
            </div>
            <div className="flex-1 min-w-0 py-1">
              <button
                type="button"
                onClick={() => {
                  setExpanded(false);
                  setVisibleReplyCount(10);
                }}
                className="inline-flex items-center gap-2 text-[14px] font-semibold text-black hover:bg-black/5 px-3 py-1 rounded-full transition-colors group"
              >
                <span>{`Hide ${totalReplies === 1 ? "reply" : "replies"}`}</span>
                <svg className="w-4 h-4 text-black transition-transform rotate-180" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Comment Confirmation Dialog */}
      {showDeleteDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setShowDeleteDialog(false)}
        >
          <div
            className="animate-foz-pop flex w-full max-w-[360px] flex-col rounded-3xl bg-white p-6 text-center shadow-2xl border border-black/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-black">Delete comment?</h3>
            <p className="mt-1 text-sm text-[#6a6161]">This comment will be deleted permanently. This action cannot be undone.</p>
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  remove.mutate();
                }}
                disabled={remove.isPending}
                className="w-full rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition-opacity hover:bg-red-700 disabled:opacity-50"
              >
                {remove.isPending ? "Deleting..." : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                className="w-full rounded-xl border border-black/10 bg-transparent py-3 text-sm font-semibold text-black transition-colors hover:bg-black/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ id, small = false }: { id: string; small?: boolean }) { return <div className={`avatar shrink-0 ${small ? "h-8 w-8 text-[10px]" : "h-11 w-11"}`}>{initials(id)}</div>; }
function Action({ icon, count, active, label, onClick }: { icon: string; count?: number; active?: boolean; label: string; onClick: () => void }) { return <button type="button" aria-label={label} onClick={onClick} className={`min-w-[54px] flex items-center gap-2 transition-colors hover:text-[#ba0035] ${active ? "text-[#ba0035]" : ""}`}><span className={`material-symbols-outlined text-[22px] ${active ? "icon-filled" : ""}`}>{icon}</span>{count !== undefined && <span className="text-sm">{count}</span>}</button>; }
function Loading() { return <div className="py-16 text-center text-[#6a6161]">Loading discussions…</div>; }
function initials(value: string) { return value.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() || "F"; }
function shortId(id: string) { return id.slice(0, 8); }
function authorName(authorId: string, user: Viewer) { return authorId === user?.id ? user.email.split("@")[0] : `Member ${shortId(authorId)}`; }
function relativeTime(value: string) { const minutes = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60000)); return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h`; }
function showError(error: Error) { toast.error(error.message || "Something went wrong. Please try again."); }
