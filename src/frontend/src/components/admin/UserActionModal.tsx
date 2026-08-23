import React, { useEffect, useState } from "react";
import type { AdminUserItem } from "#frontend/api/admin";

export interface StatusAction {
  targetStatus: "active" | "suspended" | "banned";
  label: string;
  description: string;
  tone: "amber" | "rose" | "emerald";
}

interface UserActionModalProps {
  user: AdminUserItem | null;
  mode: "role" | "delete" | "status" | null;
  statusAction?: StatusAction | null;
  onClose: () => void;
  onConfirmRole: (userId: string, newRole: "standard" | "moderator", rationale?: string) => Promise<void>;
  onConfirmDelete: (userId: string, rationale: string) => Promise<void>;
  onConfirmStatus: (userId: string, status: "active" | "suspended" | "banned", rationale: string) => Promise<void>;
}

const toneClasses: Record<StatusAction["tone"], { box: string; button: string }> = {
  amber: { box: "bg-amber-50 border-amber-200 text-amber-800", button: "bg-amber-600 hover:bg-amber-700" },
  rose: { box: "bg-rose-50 border-rose-200 text-rose-800", button: "bg-rose-600 hover:bg-rose-700" },
  emerald: { box: "bg-emerald-50 border-emerald-200 text-emerald-800", button: "bg-emerald-600 hover:bg-emerald-700" },
};

export const UserActionModal: React.FC<UserActionModalProps> = ({
  user,
  mode,
  statusAction,
  onClose,
  onConfirmRole,
  onConfirmDelete,
  onConfirmStatus,
}) => {
  const [rationale, setRationale] = useState("");
  const [targetRole, setTargetRole] = useState<"standard" | "moderator">(
    user?.role === "moderator" ? "standard" : "moderator"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !mode) return;
    setRationale("");
    setTargetRole(user.role === "moderator" ? "standard" : "moderator");
    setErrorMsg(null);
  }, [user, mode, statusAction]);

  if (!user || !mode || (mode === "status" && !statusAction)) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      if (mode === "role") {
        await onConfirmRole(user.id, targetRole, rationale);
      } else if (mode === "delete") {
        if (!rationale || rationale.trim().length < 5) {
          setErrorMsg("Rationale must be at least 5 characters long for account deletion.");
          setIsSubmitting(false);
          return;
        }
        await onConfirmDelete(user.id, rationale);
      } else {
        if (!rationale || rationale.trim().length < 5) {
          setErrorMsg("Rationale must be at least 5 characters long.");
          setIsSubmitting(false);
          return;
        }
        await onConfirmStatus(user.id, statusAction!.targetStatus, rationale);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">
          {mode === "role" ? "Assign / Change Role" : mode === "delete" ? "Permanently Remove User Account" : statusAction!.label}
        </h3>

        <div className="text-sm text-slate-600 space-y-1">
          <p>
            <span className="font-semibold">Target Account:</span> {user.email}
          </p>
          <p>
            <span className="font-semibold">Current Role:</span>{" "}
            <span className="capitalize font-mono">{user.role}</span>
          </p>
          <p>
            <span className="font-semibold">Current Status:</span>{" "}
            <span className="capitalize font-mono">{user.status}</span>
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "role" ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                New Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as "standard" | "moderator")}
                className="w-full text-sm p-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="standard">Standard User</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>
          ) : mode === "delete" ? (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs leading-relaxed">
              <span className="font-bold">Warning:</span> Permanent user account deletion purges user credentials and invalidates active session tokens immediately. All historical posts and comments authored by this user will be reattributed to <span className="font-mono">[Deleted User]</span> to preserve thread structure.
            </div>
          ) : (
            <div className={`p-3 rounded-lg border text-xs leading-relaxed ${toneClasses[statusAction!.tone].box}`}>
              {statusAction!.description}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Rationale / Reason {mode !== "role" && "*"}
            </label>
            <textarea
              rows={3}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              placeholder="Enter administrative rationale for audit log..."
              className="w-full text-sm p-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm ${
                mode === "delete"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : mode === "status"
                    ? toneClasses[statusAction!.tone].button
                    : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting
                ? "Processing..."
                : mode === "role"
                  ? "Confirm Role Update"
                  : mode === "delete"
                    ? "Delete Account"
                    : statusAction!.label}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
