import React from "react";
import { usePostSummary, useRefreshPostSummary } from "#frontend/api/post-summary";
import { toast } from "react-hot-toast";

interface PostSummaryCardProps {
  postId: string;
}

export function PostSummaryCard({ postId }: PostSummaryCardProps) {
  const [requested, setRequested] = React.useState(false);
  const { data, isLoading, isError, error, refetch } = usePostSummary(postId, requested);
  const refreshMutation = useRefreshPostSummary();

  const handleGenerate = () => {
    setRequested(true);
    refetch();
  };

  const handleRefresh = async () => {
    try {
      await refreshMutation.mutateAsync(postId);
      toast.success("Summary refreshed with latest comments");
    } catch (err: any) {
      toast.error(err.message || "Failed to refresh summary");
    }
  };

  if (!requested) {
    return (
      <div className="my-3 p-3 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 rounded-xl border border-indigo-500/20 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-indigo-400 font-medium">
          <svg className="w-5 h-5 text-indigo-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Get AI TL;DR Summary & Key Comment Highlights</span>
        </div>
        <button
          onClick={handleGenerate}
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg transition shadow hover:shadow-indigo-500/25 flex items-center space-x-1.5"
        >
          <span>Generate TL;DR</span>
        </button>
      </div>
    );
  }

  if (isLoading || refreshMutation.isPending) {
    return (
      <div className="my-3 p-4 bg-slate-900/60 rounded-xl border border-indigo-500/30 animate-pulse flex flex-col space-y-2">
        <div className="h-4 bg-indigo-500/20 rounded w-1/3"></div>
        <div className="h-3 bg-slate-700/50 rounded w-full"></div>
        <div className="h-3 bg-slate-700/50 rounded w-4/5"></div>
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="my-3 p-3 bg-red-950/30 rounded-xl border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
        <span>{error?.message || "Failed to load summary"}</span>
        <button
          onClick={() => refetch()}
          className="px-2.5 py-1 bg-red-800 hover:bg-red-700 text-white rounded font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  const summary = data.summary;

  return (
    <div className="my-3 p-4 bg-slate-900/80 backdrop-blur rounded-xl border border-indigo-500/30 shadow-lg text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/30">
            AI TL;DR
          </span>
          <span className="text-xs text-slate-400">
            Sampled {summary.commentCount} top comments (40% liked / 30% replied / 30% recent)
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
            {summary.sentiment}
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
            title="Refresh summary with latest comments"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Post Snapshot */}
      <div className="mb-3">
        <h4 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-1">Post Snapshot</h4>
        <p className="text-sm text-slate-300 leading-relaxed italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
          "{summary.postSnapshot}"
        </p>
      </div>

      {/* Key Discussion Highlights */}
      {summary.keyHighlights.length > 0 && (
        <div>
          <h4 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-1.5">Key Discussion Points</h4>
          <ul className="space-y-1.5">
            {summary.keyHighlights.map((highlight, i) => (
              <li key={i} className="flex items-start text-xs text-slate-300">
                <span className="text-indigo-400 mr-2 font-bold">•</span>
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
