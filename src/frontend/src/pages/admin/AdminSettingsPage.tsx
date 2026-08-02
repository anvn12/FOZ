import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSystemSettings, useUpdateSystemSetting, type SystemSettingItem } from "#frontend/api/admin";

export const AdminSettingsPage: React.FC = () => {
  const { data, isLoading } = useSystemSettings();
  const updateSettingMutation = useUpdateSystemSetting();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [rationale, setRationale] = useState("");

  const settingsList = data?.settings ?? [];

  const handleStartEdit = (setting: SystemSettingItem) => {
    setEditingKey(setting.key);
    setEditValue(setting.value);
    setRationale("Updating system configuration");
  };

  const handleSave = async (key: string) => {
    await updateSettingMutation.mutateAsync({
      key,
      value: editValue,
      rationale,
    });
    setEditingKey(null);
  };

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
            <span className="text-slate-700">System Settings</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            System Settings
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Configure global site parameters, registration toggles, rate limits, and AI summarization thresholds.
          </p>
        </div>
      </div>

      {/* Settings Grid / List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-200/80">
          Loading system settings...
        </div>
      ) : settingsList.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200/80 space-y-3">
          <p className="font-semibold text-slate-700">No system settings records found in database.</p>
          <p className="text-xs text-slate-400">Settings will automatically initialize as system features are configured.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
          {settingsList.map((setting) => {
            const isEditing = editingKey === setting.key;

            return (
              <div key={setting.key} className="p-6 space-y-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {setting.key}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-600 rounded">
                        {setting.dataType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {setting.description || "System configuration key"}
                    </p>
                  </div>

                  {!isEditing && (
                    <button
                      onClick={() => handleStartEdit(setting)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 transition-colors self-start sm:self-auto"
                    >
                      Configure
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Setting Value
                      </label>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Rationale / Audit Reason
                      </label>
                      <input
                        type="text"
                        value={rationale}
                        onChange={(e) => setRationale(e.target.value)}
                        placeholder="Reason for modifying this system setting..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-1">
                      <button
                        onClick={() => setEditingKey(null)}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(setting.key)}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-600/20 transition-all"
                      >
                        Save Setting
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-xs text-slate-800 flex items-center justify-between">
                    <span>Value: <strong className="text-slate-900">{setting.value}</strong></span>
                    <span className="text-[10px] text-slate-400">
                      Updated: {new Date(setting.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
