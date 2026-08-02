import React from "react";
import type { AuditLogItem } from "#frontend/api/admin";

interface AuditLogTableProps {
  logs: AuditLogItem[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  isLoading,
  page,
  totalPages,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading audit logs...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
        No audit log records match the selected filter criteria.
      </div>
    );
  }

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case "USER_DELETE":
      case "CONTENT_DELETE":
      case "CATEGORY_DELETE":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "ROLE_ASSIGN":
      case "CATEGORY_CREATE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "SETTING_UPDATE":
      case "CATEGORY_UPDATE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-xs tracking-wider">
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Target Type</th>
              <th className="py-3 px-4">Target ID</th>
              <th className="py-3 px-4">Rationale / Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="py-3 px-4 font-medium text-slate-900">
                  {log.actorName}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 capitalize">
                    {log.actorRole}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full border ${getActionBadgeClass(
                      log.actionType
                    )}`}
                  >
                    {log.actionType}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600 text-xs font-semibold uppercase">
                  {log.targetType}
                </td>
                <td className="py-3 px-4 font-mono text-xs text-slate-500 max-w-[120px] truncate">
                  {log.targetId}
                </td>
                <td className="py-3 px-4 text-slate-700 text-sm max-w-[260px] truncate">
                  {log.rationale || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
        <div>
          Page <span className="font-semibold">{page}</span> of{" "}
          <span className="font-semibold">{totalPages}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="px-3 py-1.5 rounded bg-white border border-slate-300 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-3 py-1.5 rounded bg-white border border-slate-300 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
