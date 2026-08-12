import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAdminUsers, useAssignUserRole, useDeleteUserAccount, type AdminUserItem } from "#frontend/api/admin";
import { UserActionModal } from "#frontend/components/admin/UserActionModal";

export const AdminUsersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [actionMode, setActionMode] = useState<"role" | "delete" | null>(null);

  const { data, isLoading } = useAdminUsers({
    query: searchQuery.trim() || undefined,
    role: roleFilter || undefined,
    page,
    limit: 10,
  });

  const assignRoleMutation = useAssignUserRole();
  const deleteAccountMutation = useDeleteUserAccount();

  const handleConfirmRole = async (userId: string, newRole: "standard" | "moderator", rationale?: string) => {
    try {
      await assignRoleMutation.mutateAsync({ userId, input: { role: newRole, rationale } });
      toast.success(`User role updated to ${newRole}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update role");
      throw err;
    }
  };

  const handleConfirmDelete = async (userId: string, rationale: string) => {
    try {
      await deleteAccountMutation.mutateAsync({ userId, input: { rationale } });
      toast.success("User account permanently deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete user account");
      throw err;
    }
  };

  const userItems = data?.items ?? [];
  const filteredUsers = statusFilter
    ? userItems.filter((u) => u.status === statusFilter)
    : userItems;

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
            <span className="text-slate-700">User Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            User Management
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            View, manage, and moderate user accounts across the platform.
          </p>
        </div>

        <button
          onClick={() => toast.success("System announcement dispatch initialized.")}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center space-x-2 self-start sm:self-auto cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <span>Send Announcement</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Filters:
          </span>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Roles</option>
            <option value="standard">Standard Users</option>
            <option value="moderator">Moderators</option>
            <option value="administrator">Administrators</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>

        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>
      </div>

      {/* User Table */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-200/80">
          Loading user accounts...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200/80">
          No user accounts found matching your filter criteria.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-6">User Details</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Join Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const initials = (u.displayName || u.email || "US")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {u.displayName || u.email.split("@")[0]}
                            </p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-xs font-semibold text-slate-700 capitalize">
                        {u.role === "administrator" ? (
                          <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                            Admin
                          </span>
                        ) : u.role === "moderator" ? (
                          <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Moderator
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
                            User
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {u.status === "active" ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Active</span>
                          </span>
                        ) : u.status === "banned" ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>Banned</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            <span>Suspended</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500 font-mono">
                        {new Date(u.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        {u.role !== "administrator" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setActionMode("role");
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded-xl transition-colors border border-slate-200"
                            >
                              {u.role === "moderator" ? "Revoke Mod" : "Assign Mod"}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUser(u);
                                setActionMode("delete");
                              }}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs rounded-xl transition-colors border border-rose-200"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 border-t border-slate-200/80 text-xs font-medium text-slate-500">
            <div>
              Showing page <span className="font-bold text-slate-900">{data?.page}</span> of{" "}
              <span className="font-bold text-slate-900">{data?.totalPages ?? 1}</span> ({data?.total ?? 0} users total)
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-sm"
              >
                Previous
              </button>
              <button
                disabled={page >= (data?.totalPages ?? 1)}
                onClick={() => setPage(page + 1)}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Action Confirmation Modal */}
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
