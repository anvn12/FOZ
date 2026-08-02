import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuditLogs } from "#frontend/api/admin";
import { AuditLogTable } from "#frontend/components/admin/AuditLogTable";

export const AdminAuditLogsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [actorId, setActorId] = useState("");
  const [actionType, setActionType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = useAuditLogs({
    actorId: actorId.trim() || undefined,
    actionType: actionType || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    page,
    limit: 15,
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link to="/admin" className="hover:underline">
              Admin
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-700">Audit Logs</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Moderation & System Audit Logs
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Immutable tracking of all Moderator actions and Administrator interventions.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Actor User ID
          </label>
          <input
            type="text"
            placeholder="Search by UUID..."
            value={actorId}
            onChange={(e) => {
              setActorId(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs p-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Action Type
          </label>
          <select
            value={actionType}
            onChange={(e) => {
              setActionType(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs p-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Action Types</option>
            <option value="ROLE_ASSIGN">ROLE_ASSIGN</option>
            <option value="ROLE_REVOKE">ROLE_REVOKE</option>
            <option value="USER_DELETE">USER_DELETE</option>
            <option value="CONTENT_DELETE">CONTENT_DELETE</option>
            <option value="REPORT_FORWARD">REPORT_FORWARD</option>
            <option value="REPORT_DISMISS">REPORT_DISMISS</option>
            <option value="CATEGORY_CREATE">CATEGORY_CREATE</option>
            <option value="CATEGORY_UPDATE">CATEGORY_UPDATE</option>
            <option value="CATEGORY_DELETE">CATEGORY_DELETE</option>
            <option value="SETTING_UPDATE">SETTING_UPDATE</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs p-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs p-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <AuditLogTable
        logs={data?.items ?? []}
        isLoading={isLoading}
        page={data?.page ?? 1}
        totalPages={data?.totalPages ?? 1}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
};
