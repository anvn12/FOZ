import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useEscalatedReports,
  useInstantDeleteContent,
  useDismissReport,
  useSetUserStatus,
  type EscalatedReport,
} from "#frontend/api/admin";

export const AdminReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useEscalatedReports();
  const instantDeleteMutation = useInstantDeleteContent();
  const dismissReportMutation = useDismissReport();
  const setUserStatusMutation = useSetUserStatus();

  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedReport, setSelectedReport] = useState<EscalatedReport | null>(null);
  const [reviewResult, setReviewResult] = useState<{
    reportId: string;
    actionTaken: string;
    snippet: string;
  } | null>(null);
  const [rationaleInput, setRationaleInput] = useState("");

  const filterOptions = ["All", "Pending", "Urgent", "Phishing", "Spam", "Harassment"];

  const rawReports = data?.reports ?? [];
  const reportsList: EscalatedReport[] = rawReports;

  const filteredReports = reportsList.filter((item) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Pending") return item.status === "open" || item.status === "escalated";
    if (activeFilter === "Urgent") return item.reasonType === "phishing" || item.reasonType === "pii_leak";
    return item.reasonType.toLowerCase().includes(activeFilter.toLowerCase());
  });

  const handleExecuteAction = async (actionType: "remove_post" | "ban_user" | "safe") => {
    if (!selectedReport) return;
    if (!rationaleInput || rationaleInput.trim().length < 5) {
      toast.error("Rationale must be at least 5 characters");
      return;
    }

    try {
      let banSucceeded = false;

      if (actionType === "remove_post" || actionType === "ban_user") {
        await instantDeleteMutation.mutateAsync({
          type: selectedReport.targetType === "comment" ? "comment" : "post",
          id: selectedReport.targetId,
          input: { rationale: rationaleInput },
        });

        if (actionType === "ban_user") {
          if (selectedReport.authorId) {
            await setUserStatusMutation.mutateAsync({
              userId: selectedReport.authorId,
              input: { status: "banned", rationale: rationaleInput },
            });
            banSucceeded = true;
            toast.success("Content removed and user banned");
          } else {
            toast.error("Content removed, but the account to ban could not be determined");
          }
        } else {
          toast.success("Content permanently removed");
        }
      } else {
        await dismissReportMutation.mutateAsync({
          reportId: selectedReport.id,
          rationale: rationaleInput,
        });
        toast.success("Report marked safe and dismissed");
      }

      setReviewResult({
        reportId: selectedReport.id,
        actionTaken:
          actionType === "remove_post"
            ? "Post Permanently Removed"
            : actionType === "ban_user"
            ? banSucceeded
              ? "User Account Banned"
              : "Content Removed (Ban Skipped)"
            : "Report Marked Safe",
        snippet: selectedReport.details || `Target ${selectedReport.targetType} ID: ${selectedReport.targetId}`,
      });
      setSelectedReport(null);
      setRationaleInput("");
    } catch (err: any) {
      toast.error(err?.message || "Action execution failed");
    }
  };

  const getReasonBadge = (reason: string) => {
    const r = reason.toLowerCase();
    if (r.includes("phish") || r.includes("scam")) {
      return "bg-rose-100 text-rose-800 border-rose-200";
    }
    if (r.includes("spam")) {
      return "bg-slate-200 text-slate-800 border-slate-300";
    }
    if (r.includes("harass")) {
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
    return "bg-amber-100 text-amber-800 border-amber-200";
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-1">
            <Link to="/admin" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <span>›</span>
            <span className="text-slate-700">Moderation Queue</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Moderation Queue
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage and review reported content across the platform.
          </p>
        </div>
      </div>

      {/* Review Completed Receipt Screen */}
      {reviewResult ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-md max-w-2xl mx-auto text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Review Completed</h2>
            <p className="text-sm text-slate-500 mt-1">
              Moderation decision recorded in system audit log.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-left space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">REPORT ID</p>
                <p className="font-mono font-bold text-slate-900 text-sm">{reviewResult.reportId}</p>
              </div>
              <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-full">
                {reviewResult.actionTaken}
              </span>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 italic border-l-4 border-l-rose-500">
              "{reviewResult.snippet}"
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs font-medium text-slate-700">
              <div className="flex items-center space-x-2 text-emerald-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Action executed and applied to database</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>Audit log entry created for Administrator oversight</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={() => setReviewResult(null)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              Return to Queue
            </button>
            <button
              onClick={() => navigate("/admin/audit-logs")}
              className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              View Audit Log
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {filterOptions.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-blue-600/20"
                      : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100"
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          {/* Reports Table List */}
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-200/80">
              Loading moderation queue...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200/80">
              No reports found for selected category.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[11px] tracking-wider">
                      <th className="py-3.5 px-6">Reporter & Report ID</th>
                      <th className="py-3.5 px-6">Reported Details</th>
                      <th className="py-3.5 px-6">Status / Category</th>
                      <th className="py-3.5 px-6 text-right">Target & Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReports.map((rpt) => (
                      <tr
                        key={rpt.id}
                        onClick={() => {
                          setSelectedReport(rpt);
                          setRationaleInput("");
                        }}
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors font-mono text-xs">
                            {rpt.reporterName || `${rpt.reporterId.slice(0, 8)}...`}
                          </div>
                          <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 rounded">
                            #{rpt.id.slice(0, 8)}
                          </span>
                        </td>

                        <td className="py-4 px-6 max-w-md">
                          <p className="text-xs text-slate-700 italic line-clamp-2 leading-relaxed">
                            "{rpt.details || "Content item reported for review"}"
                          </p>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-block px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border tracking-wider ${getReasonBadge(
                                rpt.reasonType
                              )}`}
                            >
                              {rpt.reasonType}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-slate-400 font-mono">
                              ({rpt.status})
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end space-x-1.5 text-xs font-bold text-slate-700">
                            <span className="uppercase text-[11px] font-mono bg-slate-100 px-2 py-0.5 rounded">
                              {rpt.targetType}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {new Date(rpt.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Reported Content Detail Modal (Live Data) */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full overflow-hidden space-y-0 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
                <span>Moderation Queue</span>
                <span>›</span>
                <span className="text-slate-900 font-bold">
                  {selectedReport.targetType.toUpperCase()} Review: #{selectedReport.id.slice(0, 8)}
                </span>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* AI Summary Banner */}
              <div className="bg-blue-50/90 border border-blue-200 p-5 rounded-2xl flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/20">
                  💡
                </div>
                <div>
                  <h4 className="font-extrabold text-blue-900 text-sm">
                    AI Content Triage ({selectedReport.reasonType.toUpperCase()})
                  </h4>
                  <p className="text-xs text-blue-800 leading-relaxed mt-1">
                    Report reason classification: {selectedReport.reasonType}. Target item type: {selectedReport.targetType}. Status: {selectedReport.status}.
                  </p>
                </div>
              </div>

              {/* Main Detail Grid (Live Data) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Reported Content Panel (2 Cols) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center font-mono">
                        {selectedReport.reporterId.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm font-mono">
                          Reporter ID: {selectedReport.reporterId}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400">
                          Target {selectedReport.targetType.toUpperCase()}: {selectedReport.targetId}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(selectedReport.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs text-slate-800 leading-relaxed">
                    <p className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-slate-500">Report Details / Context</p>
                    <p className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800">
                      {selectedReport.details || "No additional text provided in this report payload."}
                    </p>
                  </div>
                </div>

                {/* Right Breakdown Panel (1 Col) */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                      Report Metadata
                    </h4>
                    <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-xs font-black rounded-full uppercase">
                      {selectedReport.status}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Reason</span>
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase">
                          {selectedReport.reasonType}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] font-mono mt-1">ID: {selectedReport.id}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">{new Date(selectedReport.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rationale Input & Action Bar */}
            <div className="bg-white px-6 py-4 border-t border-slate-200 space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Action Rationale / Audit Note
                </label>
                <input
                  type="text"
                  value={rationaleInput}
                  onChange={(e) => setRationaleInput(e.target.value)}
                  placeholder="Enter reason for moderation action (optional)..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">TRIAGE:</span>
                  <button
                    onClick={() => handleExecuteAction("safe")}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
                  >
                    Mark Safe / Dismiss
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleExecuteAction("remove_post")}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                  >
                    Remove Content
                  </button>
                  <button
                    onClick={() => handleExecuteAction("ban_user")}
                    className="px-4 py-2 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Ban & Delete Content
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

