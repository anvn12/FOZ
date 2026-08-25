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
  const [showUsernameConfirm, setShowUsernameConfirm] = useState(false);
  const [pendingValues, setPendingValues] = useState<UpdateProfileInput | null>(null);

  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(UpdateProfileRequest),
    defaultValues: {
      username: profile.username || "",
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

  const onSubmit = async (values: UpdateProfileInput, bypassCollision = false) => {
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

      const submitData = { ...values } as any;
      if (bypassCollision) {
        submitData.allowUsernameAutoGeneration = true;
      }

      await updateProfileMutation.mutateAsync(submitData);
      toast.success("Profile updated successfully");
      setShowUsernameConfirm(false);
      setPendingValues(null);
      onClose();
    } catch (err: any) {
      if (err instanceof ApiError) {
        if (err.status === 409 || err.message.includes("generate a unique name by adding a number")) {
          setPendingValues(values);
          setShowUsernameConfirm(true);
        } else {
          toast.error(err.message);
        }
      } else if (err.response?.status === 409 || err.response?.data?.message?.includes("generate a unique name by adding a number")) {
         setPendingValues(values);
         setShowUsernameConfirm(true);
      } else {
        toast.error("Failed to update profile");
      }
    }
  };

  const handleConfirmCollision = () => {
    if (pendingValues) {
      onSubmit(pendingValues, true);
    }
  };

  const handleCancelCollision = () => {
    setShowUsernameConfirm(false);
    setPendingValues(null);
  };

  const initials = profile.displayName.charAt(0).toUpperCase() || "?";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-zinc-950 p-6 shadow-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
        
        {showUsernameConfirm && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 dark:bg-zinc-950/90 rounded-xl backdrop-blur-sm">
            <div className="p-6 text-center animate-in fade-in zoom-in duration-200">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Username Taken</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                The username has already existed. The system will generate a unique name by adding a number. Do you want to proceed?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCancelCollision}
                  disabled={isSubmitting || updateProfileMutation.isPending}
                  className="rounded-full border border-zinc-300 dark:border-zinc-700 px-5 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition disabled:opacity-50"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCollision}
                  disabled={isSubmitting || updateProfileMutation.isPending}
                  className="rounded-full bg-zinc-900 dark:bg-white px-5 py-2 text-sm font-semibold text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition disabled:opacity-50 flex items-center justify-center min-w-[70px]"
                >
                  {isSubmitting || updateProfileMutation.isPending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black" />
                  ) : (
                    "Yes"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white">Edit profile</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((values) => onSubmit(values, false))} className="space-y-4">
          {/* Avatar Upload Area */}
          <div className="flex flex-col items-center gap-2">
            <label htmlFor="avatar-file" className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Avatar Image
            </label>
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="h-20 w-20 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 shadow-sm group-hover:opacity-85 transition"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-800 text-white font-bold text-2xl shadow-sm group-hover:bg-zinc-800 dark:group-hover:bg-zinc-700 transition">
                  {initials}
                </div>
              )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition">
                  <span className="text-white text-xs font-semibold">Upload</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                id="avatar-file"
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              {previewUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold"
                >
                  Remove Avatar
                </button>
              )}
              {fileError && <p className="text-xs text-red-500">{fileError}</p>}
            </div>

          <div>
            <label htmlFor="username-handle" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Username Handle
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 dark:text-zinc-400">@</span>
              <input
                id="username-handle"
                type="text"
                {...field("username")}
                className={`mt-1 w-full rounded-lg border pl-8 pr-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 dark:bg-zinc-900 dark:text-white ${
                  errors.username
                    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                    : "border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-500 focus:ring-zinc-100 dark:focus:ring-zinc-800"
                }`}
              />
            </div>
            {errors.username ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.username.message}</p>
            ) : (
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">You can now change your username. If it is already taken, a number will be appended automatically.</p>
            )}
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              {...field("displayName")}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 dark:bg-zinc-900 dark:text-white ${
                errors.displayName
                  ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                  : "border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-500 focus:ring-zinc-100 dark:focus:ring-zinc-800"
              }`}
            />
            {errors.displayName && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Bio
            </label>
            <textarea
              id="bio"
              rows={3}
              {...field("bio")}
              className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 dark:bg-zinc-900 dark:text-white ${
                errors.bio
                  ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                  : "border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-500 focus:ring-zinc-100 dark:focus:ring-zinc-800"
              }`}
            />
            {errors.bio && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.bio.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <MapPinIcon className="w-3.5 h-3.5 text-zinc-500" />
                <span>Location</span>
              </label>
              <input
                id="location"
                type="text"
                {...field("location")}
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 dark:bg-zinc-900 dark:text-white ${
                  errors.location
                    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                    : "border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-500 focus:ring-zinc-100 dark:focus:ring-zinc-800"
                }`}
              />
              {errors.location && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.location.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-zinc-500" />
                <span>Website</span>
              </label>
              <input
                id="website"
                type="text"
                placeholder="e.g. website.com"
                {...field("website")}
                className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-600 ${
                  errors.website
                    ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                    : "border-zinc-300 dark:border-zinc-700 focus:border-zinc-900 dark:focus:border-zinc-500 focus:ring-zinc-100 dark:focus:ring-zinc-800"
                }`}
              />
              {errors.website && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 font-medium">{errors.website.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || updateAvatarMutation.isPending || updateProfileMutation.isPending}
              className="rounded-full border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || updateAvatarMutation.isPending || updateProfileMutation.isPending}
              className="rounded-full bg-zinc-900 dark:bg-white px-5 py-2 text-sm font-semibold text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition disabled:opacity-50 flex items-center justify-center min-w-[70px]"
            >
              {isSubmitting || updateAvatarMutation.isPending || updateProfileMutation.isPending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black" />
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

