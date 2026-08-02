import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useEscalatedReports, useInstantDeleteContent, type EscalatedReport } from "#frontend/api/admin";

export const AdminReportsPage: React.FC = () => {
  const { data, isLoading } = useEscalatedReports();
  const [selectedReport, setSelectedReport] = useState<EscalatedReport | null>(null);
  const [rationale, setRationale] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const instantDeleteMutation = useInstantDeleteContent();

  const handleInstantDelete = async () => {
    if (!selectedReport) return;
    if (!rationale || rationale.trim().length < 3) {
      setErrorMsg("Rationale is required for instant content deletion.");
      return;
    }
    setErrorMsg(null);
    try {
      const type = selectedReport.targetType === "post" ? "post" : "comment";
      await instantDeleteMutation.mutateAsync({
        type,
        id: selectedReport.targetId,
        input: { rationale },
      });
      setSelectedReport(null);
      setRationale("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Instant deletion failed");
    }
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
            <span className="font-semibold text-slate-700">Reports</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Escalated Content Moderation
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review reported content and execute instant deletion when severe violations occur.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500 font-medium">Loading reports...</div>
      ) : (data?.reports ?? []).length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
          No pending escalated reports found.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Pending Reports ({(data?.reports ?? []).length})
            </h3>
            <div className="space-y-2">
              {(data?.reports ?? []).map((rep) => (
                <div
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedReport?.id === rep.id
                      ? "bg-blue-50 border-blue-400 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold uppercase text-slate-700">{rep.targetType}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                      {rep.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900">
                    Reason: {rep.reasonType}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {rep.details || "No additional reporter details provided."}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-2">
                    {new Date(rep.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed View / Action Panel */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Report Review & Instant Action
                    </h3>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      Report ID: {selectedReport.id}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full uppercase border border-rose-200">
                    {selectedReport.reasonType}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">Target Entity</span>
                    <p className="font-mono text-xs text-slate-800 bg-slate-100 p-2 rounded mt-1">
                      Type: {selectedReport.targetType} | ID: {selectedReport.targetId}
                    </p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase">Reporter Details</span>
                    <p className="text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-1 text-xs leading-relaxed">
                      {selectedReport.details || "No reporter note included."}
                    </p>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                    {errorMsg}
                  </div>
                )}

                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Administrative Rationale for Instant Delete *
                  </label>
                  <textarea
                    rows={3}
                    value={rationale}
                    onChange={(e) => setRationale(e.target.value)}
                    placeholder="Provide rationale for deleting content and logging audit entry..."
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />

                  <div className="flex justify-end space-x-3 pt-2">
                    <button
                      onClick={handleInstantDelete}
                      disabled={instantDeleteMutation.isPending}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
                    >
                      {instantDeleteMutation.isPending ? "Deleting..." : "Instant Delete Content"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm text-center text-slate-500 text-sm">
                Select a report from the list to view details and execute moderation actions.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
