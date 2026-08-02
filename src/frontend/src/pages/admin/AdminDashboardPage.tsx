import React from "react";
import { Link } from "react-router-dom";
import { useAdminMetrics, useAuditLogs } from "#frontend/api/admin";
import { AuditLogTable } from "#frontend/components/admin/AuditLogTable";

export const AdminDashboardPage: React.FC = () => {
  const { data: metrics, isLoading: isMetricsLoading } = useAdminMetrics();
  const { data: recentLogs, isLoading: isLogsLoading } = useAuditLogs({ page: 1, limit: 5 });

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Administrator Control Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            System overview, operational metrics, and governance oversight.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/admin/users"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
          >
            User Management
          </Link>
          <Link
            to="/admin/audit-logs"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm rounded-lg transition-colors border border-slate-300"
          >
            Audit Logs
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Registered Users</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900">
            {isMetricsLoading ? "..." : metrics?.totalUsers ?? 0}
          </div>
          <div className="mt-2 text-xs text-slate-500">Platform user base</div>
        </div>

        {/* Active Moderators */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Active Moderators</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900">
            {isMetricsLoading ? "..." : metrics?.activeModerators ?? 0}
          </div>
          <div className="mt-2 text-xs text-slate-500">Assigned moderator roles</div>
        </div>

        {/* Pending Escalations */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Pending Escalations</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900">
            {isMetricsLoading ? "..." : metrics?.pendingEscalations ?? 0}
          </div>
          <div className="mt-2 text-xs text-slate-500">Requires Admin review</div>
        </div>

        {/* Content Removals 24h */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Content Removed (24h)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          </div>
          <div className="mt-4 text-3xl font-extrabold text-slate-900">
            {isMetricsLoading ? "..." : metrics?.contentRemoved24h ?? 0}
          </div>
          <div className="mt-2 text-xs text-slate-500">Instant deletion count</div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/reports"
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all group"
        >
          <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
            Reported Content & Escalations →
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Review escalated posts and comments. Execute instant deletion or dismiss reports.
          </p>
        </Link>

        <Link
          to="/admin/categories"
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all group"
        >
          <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
            Forum Category Management →
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Create, reorder, or delete discussion categories with mandatory thread reassignment.
          </p>
        </Link>

        <Link
          to="/admin/settings"
          className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all group"
        >
          <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-600 transition-colors">
            Global System Settings →
          </h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Manage site registration status, global rate limits, and AI summarization parameters.
          </p>
        </Link>
      </div>

      {/* Recent Audit Logs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Audit Logs</h2>
          <Link
            to="/admin/audit-logs"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View Full Log History →
          </Link>
        </div>
        <AuditLogTable
          logs={recentLogs?.items ?? []}
          isLoading={isLogsLoading}
          page={recentLogs?.page ?? 1}
          totalPages={recentLogs?.totalPages ?? 1}
          onPageChange={() => {}}
        />
      </div>
    </div>
  );
};
