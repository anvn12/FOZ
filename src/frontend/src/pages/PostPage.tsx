import React, { useMemo, useState, useEffect, useRef } from "react";
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
  InteractionApiError,
} from "#frontend/api/interactions";
import { useAuthStore } from "#frontend/stores/auth";
import { NavBar } from "#frontend/components/NavBar";
import { FeedPostItem, formatRelativeTime } from "#frontend/components/FeedPostItem";
import { useProfile } from "#frontend/api/profile";
import { ExpandableText } from "#frontend/components/ExpandableText";
import { GuestLoginModal } from "#frontend/components/GuestLoginModal";

import { ReportModal } from "#frontend/components/ReportModal";
import { PostSummaryCard } from "#frontend/components/PostSummaryCard";
import { isMobileDevice } from "#frontend/utils/device";
import { sortComments, type SortMode } from "#frontend/utils/comment-sorting";

function showError(error: Error) {
  if (error instanceof InteractionApiError && error.fields) {
    const messages = Object.values(error.fields);
    const firstMsg = messages[0];
    if (firstMsg) {
      toast.error(firstMsg);
      return;
    }
  }
  toast.error(error.message || "Something went wrong. Please try again.");
}

export function PostPage() {
  const { postId = "" } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const feedRef = React.useRef<HTMLDivElement>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (feedRef.current && !feedRef.current.contains(e.target as Node)) {
      feedRef.current.scrollTop += e.deltaY;
    }
  };

  const { data: postsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => listPosts(),
  });
  const post = postsData?.items?.find((item) => item.id === postId);

  const commentsQuery = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => listComments(postId),
    enabled: Boolean(post),
  });

  const [draft, setDraft] = useState("");
  const queryClient = useQueryClient();
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => createComment(postId, { body: draft }),
    onSuccess: async () => {
      setDraft("");
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Comment posted.");
    },
    onError: showError,
  });

  const [sortMode, setSortMode] = useState<SortMode>("top");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSortMenu) return;
    const handler = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSortMenu]);

  const roots = useMemo(() => {
    const rawItems = (commentsQuery.data?.items ?? []).filter(
      (comment) => !comment.parentCommentId,
    );
    // Always re-sort from the raw data so the selected mode is honored on every
    // data change (e.g. new comments, like/reply counts). Caching a previous
    // order here caused "Top" sorting to go stale and new comments to be
    // prepended regardless of their ranking.
    return sortComments(rawItems, sortMode);
  }, [commentsQuery.data, sortMode]);

  return (
    <NavBar>
      <div
        onWheel={handleWheel}
        className="w-full min-h-screen md:h-screen bg-background flex justify-center text-on-background antialiased md:overflow-hidden"
      >
        <div className="w-full max-w-7xl flex relative justify-center h-full">
          <div className="flex-1 w-full flex justify-center h-full">
            <main className="max-w-2xl w-full min-h-screen md:min-h-0 md:h-full flex flex-col pb-24 md:pb-4 relative">
              <header className="sticky top-0 md:relative bg-surface/90 backdrop-blur-md z-40 flex items-center px-4 h-14 gap-4 flex-shrink-0">
                <button
                  onClick={() => navigate(-1)}
                  className="hover:bg-surface-container rounded-full p-2 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <h1 className="text-[17px] font-semibold text-primary">Post</h1>
              </header>

              {isPostsLoading ? (
                <div className="p-8 text-center text-outline">Loading...</div>
              ) : post ? (
                <div className="flex-1 min-h-0 flex flex-col md:my-2 md:border md:border-outline-variant md:rounded-3xl bg-surface overflow-hidden">
                  <div
                    ref={feedRef}
                    className="flex-1 overflow-y-auto divide-y divide-outline-variant [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  >
                    <div className="border-b border-outline-variant">
                      <FeedPostItem post={post} isDetailsPage={true} />
                    </div>
                    <div className="px-4">
                      <PostSummaryCard postId={post.id} />
                    </div>

                    {/* Sort Comment & Comment Input Section */}
                    <div className="px-4 pt-2.5 pb-3 border-b border-outline-variant bg-surface flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="relative" ref={sortMenuRef}>
                          <button
                            type="button"
                            onClick={() => setShowSortMenu((prev) => !prev)}
                            className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-sm font-semibold text-primary hover:bg-surface-container-low transition-colors"
                            aria-expanded={showSortMenu}
                            aria-haspopup="menu"
                          >
                            <svg
                              className="w-4 h-4 text-primary"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span>{sortMode === "top" ? "Top" : "Recent"}</span>
                            <svg
                              className={`w-3.5 h-3.5 text-secondary transition-transform ${showSortMenu ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M19 9l-7 7-7-7"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          {showSortMenu && (
                            <div className="absolute left-0 top-full mt-1 z-30 min-w-[160px] rounded-2xl border border-outline-variant bg-surface-container-lowest p-1.5 shadow-xl animate-foz-pop">
                              <button
                                type="button"
                                onClick={() => {
                                  setSortMode("top");
                                  setShowSortMenu(false);
                                }}
                                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-primary hover:bg-surface-container-low transition-colors"
                              >
                                <span>Top</span>
                                {sortMode === "top" && (
                                  <svg
                                    className="w-4 h-4 text-primary"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      d="M5 13l4 4L19 7"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSortMode("recent");
                                  setShowSortMenu(false);
                                }}
                                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-primary hover:bg-surface-container-low transition-colors"
                              >
                                <span>Recent</span>
                                {sortMode === "recent" && (
                                  <svg
                                    className="w-4 h-4 text-primary"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      d="M5 13l4 4L19 7"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <form onSubmit={(e) => e.preventDefault()} className="w-full">
                        <div className="relative w-full bg-surface-container rounded-2xl px-4 py-2.5 transition-all focus-within:ring-1 focus-within:ring-outline min-h-[44px]">
                          <textarea
                            rows={1}
                            value={draft}
                            onFocus={() => {
                              if (!user) setShowLoginModal(true);
                            }}
                            onChange={(e) => {
                              const val = e.target.value;
                              setDraft(val);
                              const el = e.target;
                              // Auto-expand the box as the user types (wrapped lines or explicit newlines).
                              if (val) {
                                el.style.height = "auto";
                                el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
                              } else {
                                el.style.height = "";
                              }
                            }}
                            onBlur={(e) => {
                              if (!draft.trim()) {
                                setDraft("");
                                e.target.style.height = "";
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                                if (isMobileDevice()) return;
                                e.preventDefault();
                                if (!user) return setShowLoginModal(true);
                                if (draft.trim() && !create.isPending) {
                                  create.mutate();
                                  setDraft("");
                                  e.currentTarget.style.height = "";
                                }
                              }
                            }}
                            placeholder="Add a comment..."
                            className="w-full bg-transparent p-0 pr-10 outline-none border-0 text-sm leading-[20px] resize-none max-h-[168px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/40 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.2)_transparent]"
                          />
                          {draft.trim() && (
                            <button
                              type="button"
                              onClick={(e) => {
                                if (!user) return setShowLoginModal(true);
                                if (draft.trim()) {
                                  create.mutate();
                                  setDraft("");
                                  const textarea =
                                    e.currentTarget.parentElement?.querySelector("textarea");
                                  if (textarea) textarea.style.height = "";
                                }
                              }}
                              disabled={create.isPending}
                              className="absolute right-2.5 bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-black text-white hover:opacity-80 transition-opacity disabled:opacity-40"
                              aria-label="Comment"
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                className="w-4 h-4 text-white"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 19V5M5 12l7-7 7 7"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </form>
                    </div>

                    {/* Comments List */}
                    <div className="divide-y divide-outline-variant">
                      {roots.map((comment) => (
                        <CommentBranch
                          key={comment.id}
                          comment={comment}
                          comments={commentsQuery.data?.items ?? []}
                          user={user}
                          postId={postId}
                          onReport={setReportingCommentId}
                          onRequireLogin={() => setShowLoginModal(true)}
                        />
                      ))}
                      {roots.length === 0 && (
                        <div className="p-8 text-center text-outline">
                          No comments yet. Be the first to reply!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-outline">Post not found</div>
              )}
            </main>
          </div>
        </div>
      </div>
      <ReportModal
        isOpen={!!reportingCommentId}
        onClose={() => setReportingCommentId(null)}
        targetId={reportingCommentId}
        targetType="comment"
      />
      <GuestLoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Log in to leave a comment"
        description="You need to be logged in to comment on or reply to posts."
        persistDismissal={false}
      />
    </NavBar>
  );
}

function countTotalDescendants(commentId: string, comments: any[]): number {
  const children = comments.filter((c) => c.parentCommentId === commentId);
  let count = children.length;
  for (const child of children) {
    count += countTotalDescendants(child.id, comments);
  }
  return count;
}

function CommentBranch({
  comment,
  comments,
  user,
  postId,
  depth = 0,
  onReport,
  onRequireLogin,
}: {
  comment: any;
  comments: any[];
  user: any;
  postId: string;
  depth?: number;
  onReport: (commentId: string) => void;
  onRequireLogin: () => void;
}) {
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(comment.liked);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(comment.body);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [wasEdited, setWasEdited] = useState(false);
  const { data: profile } = useProfile(comment.authorId);
  const displayName = profile?.displayName || `Member ${comment.authorId.slice(0, 4)}`;

  const isEdited =
    wasEdited ||
    Boolean(
      comment.updatedAt &&
      new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 1000,
    );

  useEffect(() => {
    setLiked(Boolean(comment.liked));
    setLikeCount(Number(comment.likeCount || 0));
  }, [comment.liked, comment.likeCount]);

  const updateCommentInCache = (targetCommentId: string, updates: Record<string, any>) => {
    queryClient.setQueriesData({ queryKey: ["comments", postId] }, (oldData: any) => {
      if (!oldData || !oldData.items) return oldData;
      return {
        ...oldData,
        items: oldData.items.map((item: any) =>
          item.id === targetCommentId ? { ...item, ...updates } : item,
        ),
      };
    });
  };

  const react = useMutation({
    mutationFn: (targetActive: boolean) =>
      toggleReaction({ targetType: "comment", targetId: comment.id, active: targetActive }),
    onSuccess: (result: any) => {
      const finalLiked = result && typeof result.active === "boolean" ? result.active : !liked;
      const finalLikeCount =
        result && typeof result.likeCount === "number" ? result.likeCount : likeCount;
      setLiked(finalLiked);
      setLikeCount(finalLikeCount);
      updateCommentInCache(comment.id, { liked: finalLiked, likeCount: finalLikeCount });
    },
    onError: (err: Error, targetActive: boolean) => {
      setLiked(targetActive);
      setLikeCount((prev: number) => (targetActive ? prev + 1 : Math.max(0, prev - 1)));
      showError(err);
    },
  });

  const handleCommentLike = () => {
    const prevLiked = liked;
    const prevCount = likeCount;
    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    setLiked(nextLiked);
    setLikeCount(nextCount);

    react.mutate(prevLiked);
  };

  const save = useMutation({
    mutationFn: () => updateComment(comment.id, { body }),
    onSuccess: async () => {
      setEditing(false);
      setWasEdited(true);
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: showError,
  });

  const remove = useMutation({
    mutationFn: () => deleteComment(comment.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Comment deleted.");
    },
    onError: showError,
  });

  const reply = useMutation({
    mutationFn: () => createComment(postId, { body: replyDraft, parentCommentId: comment.id }),
    onSuccess: async () => {
      setReplyDraft("");
      setShowReplyBox(false);
      setExpanded(true);
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      toast.success("Reply posted.");
    },
    onError: showError,
  });

  const children = comments.filter((item) => item.parentCommentId === comment.id);
  const totalReplies = comment.replyCount ?? countTotalDescendants(comment.id, comments);
  const [expanded, setExpanded] = useState(false);
  const [visibleReplyCount, setVisibleReplyCount] = useState(10);

  const act = (callback: () => void) => (user ? callback() : onRequireLogin());

  const MAX_DEPTH = 2;
  const paddingClass = depth === 0 ? "px-6 md:px-10" : "";

  return (
    <div className={paddingClass}>
      {/* Parent row: avatar lane + content */}
      <div className="flex gap-3">
        <div className="flex flex-col items-center w-8 flex-shrink-0">
          <Link
            to={
              profile?.username ? `/profiles/@${profile.username}` : `/profiles/${comment.authorId}`
            }
            className="w-8 h-8 flex-shrink-0 mt-3 block hover:opacity-85 transition-opacity"
          >
            {profile?.avatarUrl ? (
              <img
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border border-outline-variant"
                src={profile.avatarUrl}
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          {/* Spine line — shown when totalReplies > 0 & depth < MAX_DEPTH */}
          {totalReplies > 0 && depth < MAX_DEPTH && (
            <div className="w-[2px] flex-1 mt-1 bg-outline-variant/40" />
          )}
        </div>

        <div className="min-w-0 flex-1 pt-3 pb-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[14px] min-w-0 flex-wrap">
              <Link
                to={
                  profile?.username
                    ? `/profiles/@${profile.username}`
                    : `/profiles/${comment.authorId}`
                }
                className="font-semibold hover:underline text-primary truncate max-w-[140px] sm:max-w-[220px]"
              >
                {displayName}
              </Link>
              {profile?.username && (
                <Link
                  to={`/profiles/@${profile.username}`}
                  className="text-secondary text-[12px] hover:underline truncate"
                >
                  @{profile.username}
                </Link>
              )}
              <span className="text-secondary ml-1 shrink-0">
                · {formatRelativeTime(comment.createdAt)}
              </span>
              {isEdited && (
                <span className="text-secondary text-[12px] font-normal ml-0.5 shrink-0">
                  (Edited)
                </span>
              )}
            </div>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowMenu((prev) => !prev)}
                className="p-1 rounded-full text-secondary hover:text-primary hover:bg-surface-container transition-colors"
                aria-label="Comment options"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>

              {showMenu && (
                <div className="absolute right-0 top-full mt-1 z-20 min-w-[120px] rounded-xl border border-outline-variant bg-surface-container-lowest py-1 shadow-lg">
                  {user?.id === comment.authorId ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          setEditing(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-primary hover:bg-surface-container-low transition-colors"
                      >
                        <svg
                          className="w-4 h-4 text-secondary"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowMenu(false);
                          setShowDeleteDialog(true);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <svg
                          className="w-4 h-4 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Delete
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        if (!user) {
                          onRequireLogin();
                          return;
                        }
                        onReport(comment.id);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-surface-container-low transition-colors"
                    >
                      <svg
                        className="w-4 h-4 text-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                        ></path>
                      </svg>
                      Report
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {editing ? (
            <div className="mt-2">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    if (isMobileDevice()) return;
                    e.preventDefault();
                    if (body.trim() && !save.isPending) {
                      save.mutate();
                    }
                  }
                }}
                className="w-full rounded-lg bg-surface-container p-3 outline-none focus:ring-1 focus:ring-outline text-primary"
              />
              <div className="mt-2 flex gap-3 text-sm font-semibold">
                <button
                  onClick={() => save.mutate()}
                  disabled={!body.trim()}
                  className="text-primary hover:opacity-80"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setBody(comment.body);
                    setEditing(false);
                  }}
                  className="text-secondary hover:text-primary"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <ExpandableText
              text={comment.body}
              maxLength={240}
              maxLines={4}
              className="mt-1 whitespace-pre-wrap break-words leading-6 text-[15px] text-primary"
            />
          )}

          <div className="mt-2 flex items-center gap-3 text-outline">
            <button
              onClick={() => act(handleCommentLike)}
              className={`min-w-[54px] flex items-center gap-1.5 transition-colors group ${liked ? "text-red-500" : "hover:text-primary"}`}
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {likeCount > 0 && <span className="text-[13px]">{likeCount}</span>}
            </button>
            <button
              onMouseDown={(e) => {
                if (showReplyBox && !replyDraft.trim()) {
                  e.preventDefault();
                  setShowReplyBox(false);
                }
              }}
              onClick={() =>
                act(() => {
                  setShowReplyBox((prev) => !prev);
                  setReplyDraft("");
                })
              }
              className={`min-w-[54px] flex items-center gap-1.5 transition-colors group ${showReplyBox ? "text-primary" : "hover:text-primary"}`}
            >
              <svg
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Inline reply box */}
          {showReplyBox && (
            <div className="mt-2 mb-1">
              <form onSubmit={(e) => e.preventDefault()} className="w-full">
                <div className="relative w-full bg-surface-container rounded-2xl px-3 py-2 transition-all focus-within:ring-1 focus-within:ring-outline min-h-[38px]">
                  <textarea
                    autoFocus
                    rows={1}
                    value={replyDraft}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReplyDraft(val);
                      const el = e.target;
                      // Auto-expand the box as the user types (wrapped lines or explicit newlines).
                      if (val) {
                        el.style.height = "auto";
                        el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
                      } else {
                        el.style.height = "";
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                        if (isMobileDevice()) return;
                        e.preventDefault();
                        if (replyDraft.trim() && !reply.isPending) {
                          reply.mutate();
                          setReplyDraft("");
                          e.currentTarget.style.height = "";
                        }
                      }
                    }}
                    onBlur={(e) => {
                      if (!replyDraft.trim()) {
                        setReplyDraft("");
                        e.target.style.height = "";
                        setShowReplyBox(false);
                      }
                    }}
                    placeholder="Write a reply..."
                    className="w-full bg-transparent p-0 pr-8 outline-none border-0 text-sm leading-[20px] resize-none max-h-[168px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-black/40 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.2)_transparent]"
                  />
                  {replyDraft.trim() && (
                    <button
                      type="button"
                      onClick={(e) => {
                        if (replyDraft.trim()) {
                          reply.mutate();
                          setReplyDraft("");
                          const textarea = e.currentTarget.parentElement?.querySelector("textarea");
                          if (textarea) textarea.style.height = "";
                        }
                      }}
                      disabled={reply.isPending}
                      className="absolute right-2 bottom-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white hover:opacity-80 transition-opacity disabled:opacity-40"
                      aria-label="Reply"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="w-3.5 h-3.5 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 19V5M5 12l7-7 7 7"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Expand Replies Button (YouTube Style) with L-shaped connector line (shown when collapsed) */}
      {!expanded && totalReplies > 0 && (
        <div className="flex gap-3">
          <div className="relative flex flex-col items-center w-8 flex-shrink-0">
            <div className="w-[2px] h-5 flex-shrink-0 bg-outline-variant/40" />
            <div className="absolute top-5 left-[15px] w-[29px] h-[2px] bg-outline-variant/40" />
          </div>
          <div className="flex-1 min-w-0 py-1">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:bg-surface-container-low px-3 py-1 rounded-full transition-colors group"
            >
              <span>{`${totalReplies} ${totalReplies === 1 ? "reply" : "replies"}`}</span>
              <svg
                className="w-4 h-4 text-primary group-hover:translate-y-0.5 transition-transform"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
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
                    <div className="w-[2px] h-7 flex-shrink-0 bg-outline-variant/40" />
                    <div className="absolute top-7 left-[15px] w-[29px] h-[2px] bg-outline-variant/40" />
                    <div className="w-[2px] flex-1 bg-outline-variant/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CommentBranch
                      comment={child}
                      comments={comments}
                      user={user}
                      postId={postId}
                      depth={depth + 1}
                      onReport={onReport}
                      onRequireLogin={onRequireLogin}
                    />
                  </div>
                </div>
              );
            }

            return (
              <CommentBranch
                key={child.id}
                comment={child}
                comments={comments}
                user={user}
                postId={postId}
                depth={MAX_DEPTH}
                onReport={onReport}
                onRequireLogin={onRequireLogin}
              />
            );
          })}

          {/* Show more replies button if remaining replies exist with L-shaped connector line */}
          {children.length > visibleReplyCount && (
            <div className="flex gap-3">
              <div className="relative flex flex-col items-center w-8 flex-shrink-0">
                <div className="w-[2px] h-5 flex-shrink-0 bg-outline-variant/40" />
                <div className="absolute top-5 left-[15px] w-[29px] h-[2px] bg-outline-variant/40" />
                <div className="w-[2px] flex-1 bg-outline-variant/40" />
              </div>
              <div className="flex-1 min-w-0 py-1">
                <button
                  type="button"
                  onClick={() => setVisibleReplyCount((prev) => prev + 10)}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:bg-surface-container-low px-3 py-1.5 rounded-full transition-colors group"
                >
                  <svg
                    className="w-3.5 h-3.5 text-primary group-hover:translate-y-0.5 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
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
              <div className="w-[2px] h-5 flex-shrink-0 bg-outline-variant/40" />
              <div className="absolute top-5 left-[15px] w-[29px] h-[2px] bg-outline-variant/40" />
            </div>
            <div className="flex-1 min-w-0 py-1">
              <button
                type="button"
                onClick={() => {
                  setExpanded(false);
                  setVisibleReplyCount(10);
                }}
                className="inline-flex items-center gap-2 text-[14px] font-semibold text-primary hover:bg-surface-container-low px-3 py-1 rounded-full transition-colors group"
              >
                <span>{`Hide ${totalReplies === 1 ? "reply" : "replies"}`}</span>
                <svg
                  className="w-4 h-4 text-primary transition-transform rotate-180"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
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
            className="animate-foz-pop flex w-full max-w-[360px] flex-col rounded-3xl bg-surface-container-lowest p-6 text-center shadow-2xl border border-outline-variant"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40 text-red-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-primary">Delete comment?</h3>
            <p className="mt-1 text-sm text-secondary">
              This comment will be deleted permanently. This action cannot be undone.
            </p>
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
                className="w-full rounded-xl border border-outline-variant bg-transparent py-3 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-low"
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
