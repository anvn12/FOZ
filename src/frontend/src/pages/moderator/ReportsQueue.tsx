import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { resolveReport } from "../../api/interactions";
import { fetchWithNetworkGuard } from "../../api/network";
import { ModeratorLayout } from "../../components/layout/ModeratorLayout";

import { useAuthStore } from "../../stores/auth";

type Report = {
  id: string;
  targetType: string;
  targetId: string;
  contextPostId?: string | null;
  reasonType: string;
  details: string;
  status: string;
  createdAt: string;
  reporter?: {
    id: string;
    displayName: string;
  };
};

export function ReportsQueuePage() {
  const queryClient = useQueryClient();
  const isAdministrator = useAuthStore((s) => s.user?.role === "administrator");
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [searchQuery, setSearchQuery] = useState("");
  const [escalateDialog, setEscalateDialog] = useState(false);
  const [escalateId, setEscalateId] = useState<string | null>(null);
  const [escalatePriority, setEscalatePriority] = useState("Standard");
  const [escalateNotes, setEscalateNotes] = useState("");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredReports = reports.filter((report) => {
    if (
      typeFilter !== "All Types" &&
      report.targetType?.toLowerCase() !== typeFilter.toLowerCase()
    ) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = (report.id || "").toLowerCase().includes(q);
      const matchDetails = (report.details || "").toLowerCase().includes(q);
      const matchReporter = (report.reporter?.displayName || "").toLowerCase().includes(q);
      const matchReason = (report.reasonType || "").toLowerCase().includes(q);
      return matchId || matchDetails || matchReporter || matchReason;
    }
    return true;
  });

  useEffect(() => {
    fetchReports();
  }, [filter]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setEscalateDialog(false);
        setDeleteDialog(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function fetchReports() {
    setLoading(true);
    try {
      const token = useAuthStore.getState().accessToken;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const url =
        filter === "all"
          ? "/api/v1/moderation/reports"
          : `/api/v1/moderation/reports?status=${filter}`;

      const res = await fetchWithNetworkGuard(url, { credentials: "include", headers });
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
      } else {
        toast.error("Failed to load reports queue");
      }
    } catch (err) {
      toast.error("Failed to load reports queue");
    } finally {
      setLoading(false);
    }
  }

  async function resolveReportAction(
    reportId: string,
    action: "delete_content" | "dismiss" | "escalate",
    notes?: string,
  ) {
    try {
      await resolveReport(reportId, { action, notes });
      toast.success(`Action applied successfully`);
      queryClient.invalidateQueries({ queryKey: ["admin"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to process report action");
    } finally {
      fetchReports();
    }
  }

  function getStatusStyle(status: string) {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-primary-container text-on-primary-container";
      case "under_review":
        return "bg-secondary-container text-on-secondary-container";
      case "escalated":
        return "bg-error-container text-on-error-container animate-pulse";
      case "dismissed":
        return "bg-surface-container-highest text-secondary";
      default:
        return "bg-surface-container-highest text-secondary";
    }
  }

  function getStatusDot(status: string) {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-white";
      case "under_review":
        return "bg-secondary";
      case "escalated":
        return "bg-error";
      case "dismissed":
        return "bg-secondary";
      default:
        return "bg-secondary";
    }
  }

  return (
    <ModeratorLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-display-lg text-display-lg text-on-surface tracking-tight">
              Moderation Queue
            </h2>
            <p className="font-body-md text-body-md text-secondary mt-1">
              Review and manage reported content across the platform.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant text-secondary px-4 py-2 rounded-xl font-label-md hover:bg-surface-container-high transition-all">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Data
            </button>
            <button className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl font-label-md hover:shadow-lg transition-all active:scale-95">
              <span className="material-symbols-outlined text-[18px]">history</span>
              Review History
            </button>
          </div>
        </div>
      </div>

      {/* AI Summary Card (Style Guidance) */}
      <div className="mb-8 bg-surface-container-lowest border border-primary/20 border-l-4 border-l-primary rounded-xl p-6 shadow-sm opacity-80 grayscale-[20%]">
        <div className="flex items-start gap-4">
          <div className="bg-primary/10 p-2 rounded-lg">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-1 flex items-center gap-2">
              Queue Intelligence Summary
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded uppercase tracking-wider">
                Coming Soon
              </span>
            </h3>
            <p className="font-body-lg text-body-lg text-secondary">
              Predictive queue analytics and automated tagging intelligence are currently under
              development. This space will soon provide real-time insights into reporting spikes and
              content trends.
            </p>
          </div>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 mb-4 flex flex-wrap items-center gap-4 border border-outline-variant/30">
        <div className="flex-1 min-w-[200px]">
          <label className="block font-label-sm text-label-sm text-secondary mb-1 uppercase px-1">
            Status
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-surface border-outline-variant rounded-lg text-body-md focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="under_review">Under Review</option>
            <option value="escalated">Escalated</option>
            <option value="dismissed">Dismissed</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block font-label-sm text-label-sm text-secondary mb-1 uppercase px-1">
            Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-surface border-outline-variant rounded-lg text-body-md focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option>All Types</option>
            <option>Post</option>
            <option>Comment</option>
            <option>User</option>
          </select>
        </div>
        <div className="flex-[1.5] min-w-[280px]">
          <label className="block font-label-sm text-label-sm text-secondary mb-1 uppercase px-1">
            Search Context
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border-outline-variant rounded-lg pl-10 pr-4 py-[7px] text-body-md focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="ID, content, or username..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-end h-full self-end pb-1">
          <button
            onClick={() => {
              setFilter("all");
              setTypeFilter("All Types");
              setSearchQuery("");
            }}
            className="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-lg font-label-md hover:bg-outline-variant transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Data Table Container */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/30">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">
                  Report ID
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">
                  Subject/Target
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">
                  Reporter
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-4 font-label-md text-label-md text-secondary uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                    Loading queue...
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                    No reports found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className={`hover:bg-surface-container-low transition-colors group ${report.status === "dismissed" ? "opacity-70" : ""}`}
                  >
                    <td className="px-6 py-4 font-body-md text-body-md font-mono text-primary">
                      #{report.id.substring(0, 6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-body-md text-body-md text-on-surface font-semibold capitalize">
                          {report.targetType}
                        </span>
                        {report.targetType === "post" ? (
                          <Link
                            to={`/posts/${report.targetId}`}
                            target="_blank"
                            className="text-label-sm text-primary hover:underline"
                          >
                            View Content
                          </Link>
                        ) : report.contextPostId ? (
                          <Link
                            to={`/posts/${report.contextPostId}`}
                            target="_blank"
                            className="text-label-sm text-primary hover:underline cursor-pointer"
                          >
                            View Context
                          </Link>
                        ) : (
                          <span className="text-label-sm text-outline cursor-not-allowed">
                            Context Unavailable
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">
                      {report.reporter?.displayName || "Anonymous User"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-surface-container-high text-on-surface-variant rounded text-label-sm font-medium capitalize">
                        {report.reasonType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-bold ${getStatusStyle(report.status)}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-2 ${getStatusDot(report.status)}`}
                        ></span>
                        {report.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-body-md text-body-md text-secondary">
                      {new Date(report.createdAt).toLocaleDateString()} -{" "}
                      {new Date(report.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {report.status === "dismissed" || report.status === "closed" ? (
                        <span className="text-label-sm italic text-secondary">
                          No further action
                        </span>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => resolveReportAction(report.id, "dismiss")}
                            className="p-2 text-secondary hover:text-error hover:bg-error-container/20 rounded-lg transition-all"
                            title="Dismiss"
                          >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                          </button>
                          <button
                            onClick={() => {
                              setEscalateId(report.id);
                              setEscalateNotes("");
                              setEscalatePriority("Standard");
                              setEscalateDialog(true);
                            }}
                            className="p-2 text-secondary hover:text-primary hover:bg-primary-container/20 rounded-lg transition-all"
                            title="Escalate"
                          >
                            <span className="material-symbols-outlined text-[20px]">
                              priority_high
                            </span>
                          </button>
                          {isAdministrator && (
                            <button
                              onClick={() => {
                                setDeleteId(report.id);
                                setDeleteDialog(true);
                              }}
                              className="p-2 text-secondary hover:text-error hover:bg-error-container/20 rounded-lg transition-all"
                              title="Delete Content"
                            >
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center border-t border-outline-variant">
          <p className="font-label-sm text-label-sm text-secondary">
            Showing {filteredReports.length} reports
          </p>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-secondary hover:bg-surface-container-high">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary text-label-md">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-secondary hover:bg-surface-container-high">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Escalate Dialog */}
      {escalateDialog && (
        <div className="fixed inset-0 bg-on-background/40 backdrop-blur-sm z-[60] flex items-center justify-center">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-2xl p-8 border border-outline-variant transform transition-transform duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-error-container p-2 rounded-lg">
                  <span
                    className="material-symbols-outlined text-error"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    priority_high
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Escalate Report #{escalateId?.substring(0, 6).toUpperCase()}
                </h3>
              </div>
              <button
                className="text-secondary hover:text-on-surface"
                onClick={() => setEscalateDialog(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="font-body-md text-body-md text-secondary mb-6">
              You are escalating this report for higher-level administrative review. Please provide
              a brief justification below.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-2">
                  Escalation Reason
                </label>
                <textarea
                  value={escalateNotes}
                  onChange={(e) => setEscalateNotes(e.target.value)}
                  className="w-full bg-surface border-outline-variant rounded-xl text-body-md focus:ring-primary/20 focus:border-primary p-3"
                  placeholder="Explain why this content requires specialist intervention..."
                  rows={4}
                ></textarea>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-2">
                  Priority Level
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setEscalatePriority("Standard")}
                    className={`flex-1 py-2 rounded-lg border ${escalatePriority === "Standard" ? "border-2 border-primary bg-primary/5 text-primary font-bold" : "border-outline-variant"} font-label-md hover:bg-surface-container-high`}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setEscalatePriority("High Priority")}
                    className={`flex-1 py-2 rounded-lg border ${escalatePriority === "High Priority" ? "border-2 border-primary bg-primary/5 text-primary font-bold" : "border-outline-variant"} font-label-md hover:bg-surface-container-high`}
                  >
                    High Priority
                  </button>
                  <button
                    onClick={() => setEscalatePriority("Critical")}
                    className={`flex-1 py-2 rounded-lg border ${escalatePriority === "Critical" ? "border-2 border-primary bg-primary/5 text-primary font-bold" : "border-outline-variant text-error"} font-label-md hover:bg-error-container/20`}
                  >
                    Critical
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                className="flex-1 py-2.5 rounded-xl border border-outline-variant text-secondary font-label-md hover:bg-surface-container-high transition-all"
                onClick={() => setEscalateDialog(false)}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const words = escalateNotes.trim().split(/\s+/).filter(Boolean);
                  if (words.length < 5) {
                    toast.error("A rationale of at least 5 words is required for every moderation decision.");
                    return;
                  }
                  const notes = `[Priority: ${escalatePriority}] ${escalateNotes}`.trim();
                  resolveReportAction(escalateId!, "escalate", notes);
                  setEscalateDialog(false);
                }}
                disabled={!escalateNotes.trim()}
                className={`flex-1 py-2.5 rounded-xl font-bold font-label-md transition-all ${
                  !escalateNotes.trim()
                    ? "bg-surface-container-high text-on-surface-variant cursor-not-allowed"
                    : "bg-primary text-on-primary shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                }`}
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Content Dialog */}
      {deleteDialog && (
        <div className="fixed inset-0 bg-on-background/40 backdrop-blur-sm z-[60] flex items-center justify-center">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-xl shadow-2xl p-8 border border-outline-variant transform transition-transform duration-300 scale-100">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-error-container p-2 rounded-lg">
                  <span
                    className="material-symbols-outlined text-error"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    delete
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Delete Content?
                </h3>
              </div>
              <button
                className="text-secondary hover:text-on-surface"
                onClick={() => setDeleteDialog(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="font-body-md text-body-md text-secondary mb-6">
              Are you sure you want to delete this reported content? This action cannot be undone,
              and the report will be marked as closed.
            </p>
            <div className="flex gap-3 mt-8">
              <button
                className="flex-1 py-2.5 rounded-xl border border-outline-variant text-secondary font-label-md hover:bg-surface-container-high transition-all"
                onClick={() => setDeleteDialog(false)}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resolveReportAction(deleteId!, "delete_content");
                  setDeleteDialog(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold font-label-md shadow-md hover:bg-red-700 transition-all"
              >
                Delete Content
              </button>
            </div>
          </div>
        </div>
      )}
    </ModeratorLayout>
  );
}
