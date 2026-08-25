import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "#frontend/stores/auth";
import { useProfile, useUpdateAvatar, useUpdateProfile } from "#frontend/api/profile";
import toast from "react-hot-toast";

const INPUT_CLASS =
  "w-full min-h-[44px] px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors";

/**
 * First-run profile setup shown right after registration (email or Google).
 * Renders as a modal-style overlay; Google signups arrive with their Google
 * display name and avatar already stored, so those are pre-filled.
 */
export function OnboardingAvatarPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id ?? "");
  const updateAvatarMutation = useUpdateAvatar();
  const updateProfileMutation = useUpdateProfile();

  const [displayName, setDisplayName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setPreviewUrl((prev) => prev ?? profile.avatarUrl);
  }, [profile]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 2 * 1024 * 1024) {
      toast.error("File is too large (max 2MB)");
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleSave = () => {
    const name = displayName.trim();
    if (!name) {
      toast.error("Display name is required");
      return;
    }

    const uploadAvatar = file
      ? new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64Data = event.target?.result as string;
            if (!base64Data) {
              reject(new Error("Failed to process image"));
              return;
            }
            resolve(base64Data);
          };
          reader.onerror = () => reject(new Error("Failed to read image file"));
          reader.readAsDataURL(file);
        }).then((avatar) => updateAvatarMutation.mutateAsync({ avatar }))
      : Promise.resolve();

    Promise.all([
      updateProfileMutation.mutateAsync({
        displayName: name,
        bio: profile?.bio ?? null,
        location: profile?.location ?? null,
        website: profile?.website ?? null,
      }),
      uploadAvatar,
    ])
      .then(() => {
        toast.success("Profile updated!");
        navigate("/");
      })
      .catch((err: Error) => {
        toast.error(err.message || "Failed to update profile");
      });
  };

  const saving =
    updateProfileMutation.isPending || updateAvatarMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-tertiary/40 p-margin-mobile backdrop-blur-xl">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="animate-foz-pop w-full max-w-[400px] rounded-3xl bg-surface-container-lowest p-6 text-center shadow-2xl"
      >
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container">
          <span className="material-symbols-outlined text-4xl text-secondary">person</span>
        </div>

        <h2 id="onboarding-title" className="font-headline-md text-headline-md text-primary">
          Set up your profile
        </h2>
        <p className="mb-6 font-body-lg text-body-lg text-secondary">
          Add a display name and photo so people recognize you.
        </p>

        {/* Avatar picker */}
        <div
          className="group relative mx-auto mb-6 h-28 w-28 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          role="button"
          aria-label="Choose profile picture"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-surface-container">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile picture preview" className="h-full w-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[56px] text-outline">person</span>
            )}
          </div>
          <div className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary">
            <span className="material-symbols-outlined text-[18px]">
              {previewUrl ? "edit" : "add_a_photo"}
            </span>
          </div>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* Display name */}
        <label
          htmlFor="displayName"
          className="mb-1.5 block text-left text-label-md font-label-md text-on-surface-variant"
        >
          Display name
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={50}
          placeholder="Your display name"
          className={INPUT_CLASS}
        />

        <div className="mt-6 flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || profileLoading}
            className="w-full rounded-xl bg-primary py-4 font-label-md text-label-md text-on-primary transition-opacity hover:opacity-80 active:scale-95 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save and continue"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            disabled={saving}
            className="w-full rounded-xl border border-outline-variant bg-transparent py-4 font-label-md text-label-md text-primary transition-colors hover:bg-surface-container-low active:scale-95 disabled:opacity-50"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
