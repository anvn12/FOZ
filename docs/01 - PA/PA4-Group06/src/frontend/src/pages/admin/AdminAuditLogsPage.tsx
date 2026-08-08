import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuditLogs } from "#frontend/api/admin";
import { AuditLogTable } from "#frontend/components/admin/AuditLogTable";

export const AdminAuditLogsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [actionTypeFilter, setActionTypeFilter] = useState("");
  const [actorIdInput, setActorIdInput] = useState("");

  const { data, isLoading } = useAuditLogs({
    actionType: actionTypeFilter || undefined,
    actorId: actorIdInput.trim() || undefined,
    page,
    limit: 15,
  });

  const actionTypes = [
    "ROLE_ASSIGN",
    "ROLE_REVOKE",
    "USER_DELETE",
    "CONTENT_DELETE",
    "REPORT_FORWARD",
    "REPORT_DISMISS",
    "CATEGORY_CREATE",
    "CATEGORY_UPDATE",
    "CATEGORY_DELETE",
    "SETTING_UPDATE",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-1">
            <Link to="/admin" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <span>›</span>
            <span className="text-slate-700">Audit Logs</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Audit Logs
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Tamper-evident audit trail of all Administrator and Moderator actions.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Filter Action:
          </span>
          <select
            value={actionTypeFilter}
            onChange={(e) => {
              setActionTypeFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Action Types</option>
            {actionTypes.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Filter by Actor UUID..."
            value={actorIdInput}
            onChange={(e) => {
              setActorIdInput(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <AuditLogTable
        logs={data?.items ?? []}
        isLoading={isLoading}
        page={data?.page ?? page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
};
