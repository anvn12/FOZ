import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSystemSettings, useUpdateSystemSetting } from "#frontend/api/admin";

export const AdminSettingsPage: React.FC = () => {
  const { data, isLoading } = useSystemSettings();
  const updateSettingMutation = useUpdateSystemSetting();

  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const settingsList = data?.settings ?? [];

  const handleValueChange = (key: string, val: string) => {
    setFormValues((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (key: string) => {
    const val = formValues[key];
    if (val === undefined) return;
    setSavingKey(key);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await updateSettingMutation.mutateAsync({
        key,
        value: val,
        rationale: `Updated ${key} setting via Admin Settings dashboard`,
      });
      setSuccessMsg(`Setting '${key}' updated successfully.`);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update system setting");
    } finally {
      setSavingKey(null);
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
            <span className="font-semibold text-slate-700">System Settings</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Global System Configuration
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure site registration status, global rate limits, maintenance mode, and AI service parameters.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-sm rounded-xl border border-emerald-200">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-800 text-sm rounded-xl border border-rose-200">
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <div className="p-8 text-center text-slate-500 font-medium">Loading system settings...</div>
      ) : settingsList.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Initialize Global Configuration</h3>
          <p className="text-slate-600 text-xs leading-relaxed">
            No system settings entries found in database. You can save initial key-value parameters below.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingCard
              settingKey="allow_user_registration"
              label="Allow New User Registration"
              defaultValue="true"
              description="Controls whether new visitors can sign up for Standard User accounts."
              onSave={handleSave}
              onChange={handleValueChange}
              formValues={formValues}
              isSaving={savingKey === "allow_user_registration"}
            />

            <SettingCard
              settingKey="ai_rate_limit_per_hour"
              label="AI Summarization Hourly Quota"
              defaultValue="50"
              description="Maximum number of AI TL;DR post summaries allowed per user per hour."
              onSave={handleSave}
              onChange={handleValueChange}
              formValues={formValues}
              isSaving={savingKey === "ai_rate_limit_per_hour"}
            />

            <SettingCard
              settingKey="ai_provider_priority"
              label="AI Fallback Provider Priority"
              defaultValue="openai,gemini"
              description="Comma-separated provider order for AI service fallback chain."
              onSave={handleSave}
              onChange={handleValueChange}
              formValues={formValues}
              isSaving={savingKey === "ai_provider_priority"}
            />

            <SettingCard
              settingKey="maintenance_banner_text"
              label="Global Announcement / Maintenance Banner"
              defaultValue=""
              description="Optional announcement banner text displayed across all user pages."
              onSave={handleSave}
              onChange={handleValueChange}
              formValues={formValues}
              isSaving={savingKey === "maintenance_banner_text"}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {settingsList.map((s) => (
            <SettingCard
              key={s.key}
              settingKey={s.key}
              label={s.key}
              defaultValue={s.value}
              description={s.description || "System configuration parameter"}
              onSave={handleSave}
              onChange={handleValueChange}
              formValues={formValues}
              isSaving={savingKey === s.key}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SettingCardProps {
  settingKey: string;
  label: string;
  defaultValue: string;
  description: string;
  onSave: (key: string) => void;
  onChange: (key: string, val: string) => void;
  formValues: Record<string, string>;
  isSaving: boolean;
}

const SettingCard: React.FC<SettingCardProps> = ({
  settingKey,
  label,
  defaultValue,
  description,
  onSave,
  onChange,
  formValues,
  isSaving,
}) => {
  const currentValue = formValues[settingKey] !== undefined ? formValues[settingKey] : defaultValue;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
      <div>
        <div className="font-bold text-slate-900 text-sm capitalize">{label}</div>
        <div className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</div>
      </div>

      <div className="space-y-2 pt-2">
        <input
          type="text"
          value={currentValue}
          onChange={(e) => onChange(settingKey, e.target.value)}
          className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
        />

        <div className="flex justify-end">
          <button
            onClick={() => onSave(settingKey)}
            disabled={isSaving}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
          >
            {isSaving ? "Saving..." : "Save Setting"}
          </button>
        </div>
      </div>
    </div>
  );
};
