import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminUsers, useAssignUserRole, useDeleteUserAccount, type AdminUserItem } from "#frontend/api/admin";
import { UserActionModal } from "#frontend/components/admin/UserActionModal";

export const AdminUsersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [actionMode, setActionMode] = useState<"role" | "delete" | null>(null);

  const { data, isLoading } = useAdminUsers({
    query: searchQuery.trim() || undefined,
    role: roleFilter || undefined,
    page,
    limit: 15,
  });

  const assignRoleMutation = useAssignUserRole();
  const deleteAccountMutation = useDeleteUserAccount();

  const handleConfirmRole = async (userId: string, newRole: "standard" | "moderator", rationale?: string) => {
    await assignRoleMutation.mutateAsync({ userId, input: { role: newRole, rationale } });
  };

  const handleConfirmDelete = async (userId: string, rationale: string) => {
    await deleteAccountMutation.mutateAsync({ userId, input: { rationale } });
  };

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
            <span className="font-semibold text-slate-700">Users</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            User Account Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Assign Moderator privileges, modify roles, or permanently delete user accounts.
          </p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Search Users
          </label>
          <input
            type="text"
            placeholder="Search by email or display name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div className="w-full md:w-64">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Role Filter
          </label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="standard">Standard Users</option>
            <option value="moderator">Moderators</option>
            <option value="administrator">Administrators</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-500 font-medium">Loading user accounts...</div>
      ) : (data?.items ?? []).length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
          No user accounts found matching criteria.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-xs tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(data?.items ?? []).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {u.displayName || "Unset Display Name"}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full border capitalize ${
                          u.role === "administrator"
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : u.role === "moderator"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-slate-100 text-slate-800 border-slate-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-emerald-50 text-emerald-700 capitalize">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 font-mono">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {u.role !== "administrator" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setActionMode("role");
                            }}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded transition-colors border border-slate-300"
                          >
                            {u.role === "moderator" ? "Revoke Mod" : "Assign Mod"}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setActionMode("delete");
                            }}
                            className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-medium text-xs rounded transition-colors border border-rose-300"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
            <div>
              Page <span className="font-semibold">{data?.page}</span> of{" "}
              <span className="font-semibold">{data?.totalPages}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded bg-white border border-slate-300 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= (data?.totalPages ?? 1)}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded bg-white border border-slate-300 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      <UserActionModal
        user={selectedUser}
        mode={actionMode}
        onClose={() => {
          setSelectedUser(null);
          setActionMode(null);
        }}
        onConfirmRole={handleConfirmRole}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};
