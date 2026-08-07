import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "#frontend/stores/auth";
import { useUpdateAvatar } from "#frontend/api/profile";
import toast from "react-hot-toast";

export function OnboardingAvatarPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateAvatarMutation = useUpdateAvatar();

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.size > 2 * 1024 * 1024) {
        toast.error("File is too large (max 2MB)");
        return;
      }
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast.error("Please select an image first");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (!base64Data) {
        toast.error("Failed to process image");
        return;
      }

      updateAvatarMutation.mutate(
        { avatar: base64Data },
        {
          onSuccess: () => {
            toast.success("Profile picture updated!");
            navigate("/");
          },
          onError: (err: any) => {
            toast.error(err.message || "Failed to upload profile picture");
          },
        }
      );
    };
    reader.onerror = () => {
      toast.error("Failed to read image file");
    };
    reader.readAsDataURL(file);
  };

  const handleSkip = () => {
    navigate("/");
  };

  return (
    <div className="bg-[#f9f9ff] text-[#0f172a] min-h-screen flex flex-col antialiased overflow-x-hidden relative items-center justify-center p-4">
      <div className="shader-bg" aria-hidden="true">
        <div className="shader-orb orb-1" />
        <div className="shader-orb orb-2" />
      </div>

      <div className="glass-panel w-full max-w-md rounded-xl p-8 shadow-xl relative z-10 flex flex-col items-center">
        <h1 className="text-3xl font-extrabold mb-2 text-[#0f172a] font-montserrat text-center">
          Add a profile picture
        </h1>
        <p className="text-[#475569] font-plus-jakarta text-center mb-8">
          Help others recognize you by adding a photo.
        </p>

        <div className="relative mb-8 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-40 h-40 rounded-full border-4 border-[#2E7DFF] bg-white overflow-hidden flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-105">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[80px] text-[#94a3b8]">
                person
              </span>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-12 h-12 bg-[#2E7DFF] rounded-full flex items-center justify-center shadow-md border-4 border-[#f9f9ff] text-white">
            <span className="material-symbols-outlined text-[20px]">
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

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleUpload}
            disabled={!file || updateAvatarMutation.isPending}
            className="w-full min-h-[44px] py-3 rounded-lg btn-gradient text-white text-base font-bold font-montserrat flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {updateAvatarMutation.isPending ? "Uploading..." : "Save and continue"}
          </button>
          <button
            onClick={handleSkip}
            disabled={updateAvatarMutation.isPending}
            className="w-full min-h-[44px] py-3 rounded-lg btn-glass text-center text-[#0f172a] text-sm font-bold font-montserrat hover:text-[#2E7DFF] transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
