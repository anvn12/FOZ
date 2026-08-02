import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminMetrics, useAuditLogs } from "#frontend/api/admin";

export const AdminDashboardPage: React.FC = () => {
  const { data: metrics, isLoading: isMetricsLoading } = useAdminMetrics();
  const { data: recentLogs, isLoading: isLogsLoading } = useAuditLogs({ page: 1, limit: 6 });
  const [timeRange, setTimeRange] = useState("Last 7 Days");

  const totalUsers = isMetricsLoading ? "..." : (metrics?.totalUsers ?? 0).toLocaleString();
  const activeModerators = isMetricsLoading ? "..." : (metrics?.activeModerators ?? 0).toLocaleString();
  const pendingReports = isMetricsLoading ? "..." : (metrics?.pendingEscalations ?? 0).toLocaleString();
  const contentRemoved = isMetricsLoading ? "..." : (metrics?.contentRemoved24h ?? 0).toLocaleString();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            System status and key metrics at a glance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/reports"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Moderation Queue</span>
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              TOTAL USERS
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {totalUsers}
            </div>
            <div className="mt-2 flex items-center space-x-1.5 text-xs font-semibold text-emerald-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>+2.4% this week</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Posts / Moderators */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              ACTIVE MODERATORS
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {activeModerators}
            </div>
            <div className="mt-2 flex items-center space-x-1.5 text-xs font-semibold text-emerald-600">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>+12% this week</span>
            </div>
          </div>
        </div>

        {/* Card 3: Pending Reports (Red Accent Border) */}
        <div className="bg-white p-5 rounded-2xl border-l-4 border-l-rose-500 border-t border-r border-b border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              PENDING REPORTS
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-rose-600 tracking-tight">
              {pendingReports}
            </div>
            <div className="mt-2 flex items-center space-x-1.5 text-xs font-bold text-rose-600">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
              <span>Action required</span>
            </div>
          </div>
        </div>

        {/* Card 4: Recent Removals / Bans */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              CONTENT REMOVED (24H)
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {contentRemoved}
            </div>
            <div className="mt-2 text-xs text-slate-500 font-medium">Past 24 hours</div>
          </div>
        </div>
      </div>

      {/* Main Section: Chart & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Post Activity Trend Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Post Activity Trend
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily activity volume & engagement telemetry
              </p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
            </select>
          </div>

          {/* SVG Area Chart Graphic */}
          <div className="w-full pt-4 pb-2">
            <div className="h-56 relative flex items-end justify-between px-2 border-b border-slate-200">
              {/* Y Axis Gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[10px] text-slate-400 font-mono">
                <div className="border-b border-slate-100 pb-1">250</div>
                <div className="border-b border-slate-100 pb-1">200</div>
                <div className="border-b border-slate-100 pb-1">150</div>
                <div className="border-b border-slate-100 pb-1">100</div>
                <div>0</div>
              </div>

              {/* Area SVG Gradient Line */}
              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 200">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 140 Q 100 80, 200 120 T 400 40 T 600 90 L 600 200 L 0 200 Z"
                  fill="url(#chartGrad)"
                />
                <path
                  d="M 0 140 Q 100 80, 200 120 T 400 40 T 600 90"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                />
                <circle cx="0" cy="140" r="5" className="fill-white stroke-blue-600 stroke-2" />
                <circle cx="100" cy="95" r="5" className="fill-white stroke-blue-600 stroke-2" />
                <circle cx="200" cy="120" r="5" className="fill-white stroke-blue-600 stroke-2" />
                <circle cx="300" cy="70" r="5" className="fill-white stroke-blue-600 stroke-2" />
                <circle cx="400" cy="40" r="5" className="fill-white stroke-blue-600 stroke-2" />
                <circle cx="500" cy="65" r="5" className="fill-white stroke-blue-600 stroke-2" />
                <circle cx="600" cy="90" r="5" className="fill-white stroke-blue-600 stroke-2" />
              </svg>
            </div>

            {/* X Axis Labels */}
            <div className="flex justify-between mt-3 text-xs font-semibold text-slate-500 px-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Recent Activities Feed (1 Col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900">
              Recent Activities
            </h3>
            <Link
              to="/admin/audit-logs"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="mt-4 flex-1 space-y-4">
            {isLogsLoading ? (
              <p className="text-xs text-slate-400 py-4">Loading audit activity...</p>
            ) : (recentLogs?.items ?? []).length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs font-medium">
                No recent audit log activities recorded.
              </div>
            ) : (
              recentLogs?.items.map((log) => (
                <div key={log.id} className="flex items-start space-x-3 text-xs">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 uppercase">
                    {log.actionType.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-800 font-semibold truncate">
                      {log.actorName} <span className="font-normal text-slate-600">performed</span> {log.actionType}
                    </p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
