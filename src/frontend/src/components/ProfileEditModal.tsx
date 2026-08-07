import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { z } from "zod";
import { UpdateProfileRequest } from "#shared/schemas/profile.js";
import { useUpdateProfile, useUpdateAvatar, type Profile } from "#frontend/api/profile.js";
import { ApiError } from "#frontend/api/auth.js";
import { validateImageFile, compressImageClient } from "#frontend/utils/imageCompressor.js";
import { uploadMediaToCloudinary } from "#frontend/api/upload.js";
import { CloseIcon, MapPinIcon, LinkIcon } from "#frontend/components/icons/ProfileIcons.js";

type UpdateProfileInput = z.input<typeof UpdateProfileRequest>;

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
}

export function ProfileEditModal({ isOpen, onClose, profile }: ProfileEditModalProps) {
  const updateProfileMutation = useUpdateProfile();
  const updateAvatarMutation = useUpdateAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatarUrl || null);
  const [fileError, setFileError] = useState<string | null>(null);

  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileRequest),
    defaultValues: {
      displayName: profile.displayName || "",
      bio: profile.bio || "",
      location: profile.location || "",
      website: profile.website || "",
    },
  });

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      const msg = validation.error || "Invalid avatar image format.";
      setFileError(msg);
      toast.error(msg);
      if (e.target) e.target.value = "";
      return;
    }

    setFileError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const onSubmit = async (values: UpdateProfileInput) => {
    try {
      if (selectedFile) {
        const toastId = toast.loading("Compressing & uploading avatar...");
        let finalAvatarUrl = "";

        try {
          // Compress to WebP first, then stream the smaller blob to Cloudinary
          const compressed = await compressImageClient(selectedFile, "avatar");
          const compressedFile = new File([compressed.blob], compressed.fileName, { type: "image/webp" });
          const asset = await uploadMediaToCloudinary(compressedFile, compressedFile.name, "avatars");
          finalAvatarUrl = asset.url;
          toast.success("Avatar uploaded", { id: toastId });
        } catch (cErr) {
          console.warn("Cloudinary upload failed, falling back to base64:", cErr);
          try {
            const compressed = await compressImageClient(selectedFile, "avatar");
            finalAvatarUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(compressed.blob);
            });
            toast.dismiss(toastId);
          } catch (err) {
            console.warn("Avatar compression error, using raw file fallback:", err);
            finalAvatarUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(selectedFile);
            });
            toast.dismiss(toastId);
          }
        }

        if (finalAvatarUrl) {
          await updateAvatarMutation.mutateAsync({ avatar: finalAvatarUrl });
        }
      }

      await updateProfileMutation.mutateAsync(values as any);
      toast.success("Profile updated successfully");
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update profile");
      }
    }
  };

  const initials = profile.displayName.charAt(0).toUpperCase() || "?";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-zinc-100 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <h2 className="text-xl font-bold text-zinc-950">Edit profile</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Avatar Upload Area */}
          <div className="flex flex-col items-center gap-2">
            <label htmlFor="avatar-file" className="text-sm font-semibold text-zinc-700">
              Avatar Image
            </label>
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="h-20 w-20 rounded-full object-cover border border-zinc-200 shadow-sm group-hover:opacity-85 transition"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 text-white font-bold text-2xl shadow-sm group-hover:bg-zinc-800 transition">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition">
                <span className="text-white text-xs font-semibold">Upload</span>
              </div>
            </div>
            <input
              id="avatar-file"
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
            {fileError && <p className="text-xs text-red-600 font-medium">{fileError}</p>}
          </div>

          <div>
            <label htmlFor="username-handle" className="block text-sm font-semibold text-zinc-700">
              Username Handle
            </label>
            <input
              id="username-handle"
              type="text"
              disabled
              readOnly
              value={`@${profile.username || profile.displayName.toLowerCase().replace(/\s+/g, "")}`}
              className="mt-1 w-full rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed font-medium"
            />
            <p className="mt-1 text-xs text-zinc-400">Usernames are permanent and cannot be changed.</p>
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-semibold text-zinc-700">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              {...field("displayName")}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
                errors.displayName
                  ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                  : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-100"
              }`}
            />
            {errors.displayName && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-semibold text-zinc-700">
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              {...field("bio")}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
                errors.bio
                  ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                  : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-100"
              }`}
            />
            {errors.bio && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.bio.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-zinc-700 flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5 text-zinc-500" />
                <span>Location</span>
              </label>
              <input
                id="location"
                type="text"
                {...field("location")}
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
                  errors.location
                    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                    : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-100"
                }`}
              />
              {errors.location && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-semibold text-zinc-700 flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-zinc-500" />
                <span>Website</span>
              </label>
              <input
                id="website"
                type="text"
                placeholder="e.g. website.com"
                {...field("website")}
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
                  errors.website
                    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                    : "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-100"
                }`}
              />
              {errors.website && (
                <p className="mt-1 text-xs text-red-600 font-medium">{errors.website.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || updateAvatarMutation.isPending || updateProfileMutation.isPending}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || updateAvatarMutation.isPending || updateProfileMutation.isPending}
              className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-semibold text-white hover:bg-zinc-800 transition disabled:opacity-50 flex items-center justify-center min-w-[70px]"
            >
              {isSubmitting || updateAvatarMutation.isPending || updateProfileMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
