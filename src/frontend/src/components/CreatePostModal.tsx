import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createPost } from "#frontend/api/interactions";
import { useAuthStore } from "#frontend/stores/auth";
import { useProfile } from "#frontend/api/profile";
import { validateImageFile, compressImageClient, compressImageToBase64 } from "#frontend/utils/imageCompressor";
import { uploadMediaToCloudinary } from "#frontend/api/upload";

type Attachment = { fileUrl: string; fileType: string; fileSize: number };
type PendingAttachment = { id: string; file: File; previewUrl: string; fileType: string; fileSize: number };

export function CreatePostModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useProfile(user?.id ?? "");
  const displayName = profile?.displayName || user?.email?.split("@")[0] || "U";
  const avatarUrl = profile?.avatarUrl;
  const [draft, setDraft] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: async () => {
      setDraft("");
      pendingAttachments.forEach((att) => URL.revokeObjectURL(att.previewUrl));
      setPendingAttachments([]);
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Your post is live.");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong.");
    },
  });

  if (!isOpen) return null;

  const handlePostSubmit = async () => {
    if (!draft.trim() && pendingAttachments.length === 0) return;
    setIsUploading(true);

    try {
      const finalAttachments: Attachment[] = [];

      for (const item of pendingAttachments) {
        if (item.fileType.startsWith("image/")) {
          const toastId = toast.loading(`Compressing & uploading ${item.file.name}...`);
          try {
            // Compress to WebP first, then stream the smaller blob to Cloudinary
            const compressed = await compressImageClient(item.file, "feed_post");
            const compressedFile = new File([compressed.blob], compressed.fileName, { type: "image/webp" });
            const asset = await uploadMediaToCloudinary(compressedFile, compressedFile.name, "posts");
            toast.success(`Uploaded ${item.file.name}`, { id: toastId });
            finalAttachments.push({
              fileUrl: asset.url,
              fileType: "image/webp",
              fileSize: asset.bytes,
            });
          } catch (cErr) {
            console.warn("Cloudinary upload failed, falling back to base64:", cErr);
            try {
              const compressed = await compressImageToBase64(item.file, "feed_post");
              toast.dismiss(toastId);
              finalAttachments.push({
                fileUrl: compressed.base64,
                fileType: "image/webp",
                fileSize: compressed.size,
              });
            } catch (err) {
              console.warn("Compression fallback error:", err);
              toast.error(`Failed to process ${item.file.name}`, { id: toastId });
            }
          }
        } else {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(item.file);
          });
          finalAttachments.push({ fileUrl: base64, fileType: item.fileType, fileSize: item.fileSize });
        }
      }

      await createMutation.mutateAsync({
        content: draft,
        attachments: finalAttachments.length > 0 ? (finalAttachments as any) : undefined,
      });
    } catch (err: any) {
      toast.error(err?.message || "Failed to create post");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCloseModal = () => {
    pendingAttachments.forEach((att) => URL.revokeObjectURL(att.previewUrl));
    setPendingAttachments([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal} />

      {/* Modal */}
      <div className="relative w-full max-w-[600px] rounded-2xl bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-outline-variant pb-4">
          <h2 className="text-xl font-bold text-primary">Create Post</h2>
          <button onClick={handleCloseModal} className="rounded-full p-2 hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mt-6 flex gap-4">
          {avatarUrl ? (
            <img alt={displayName} className="avatar h-12 w-12 shrink-0 rounded-full object-cover border border-outline-variant" src={avatarUrl} />
          ) : (
            <div className="avatar h-12 w-12 shrink-0 rounded-full bg-zinc-800 flex items-center justify-center text-white text-sm font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 flex flex-col">
            <textarea
              autoFocus
              rows={4}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Start a discussion on FOZ..."
              className="w-full resize-none bg-transparent text-[17px] text-on-surface outline-none placeholder:text-outline"
            />

            {/* Previews */}
            {pendingAttachments.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {pendingAttachments.map((att, i) => (
                  <div key={att.id} className="relative group">
                    {att.fileType.startsWith("image/") ? (
                      <img src={att.previewUrl} alt="attachment" className="h-20 w-20 object-cover rounded-xl border border-outline-variant" />
                    ) : (
                      <div className="h-20 w-20 flex items-center justify-center rounded-xl border border-outline-variant bg-surface-container">
                        <span className="material-symbols-outlined text-outline">movie</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        URL.revokeObjectURL(att.previewUrl);
                        setPendingAttachments((prev) => prev.filter((_, index) => index !== i));
                      }}
                      className="absolute -top-2 -right-2 bg-error text-on-error rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-outline-variant pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    const files = Array.from(e.target.files);

                    if (pendingAttachments.length >= 5) {
                      toast.error("Maximum 5 images allowed per post.");
                      e.target.value = "";
                      return;
                    }

                    const availableSlots = 5 - pendingAttachments.length;
                    if (files.length > availableSlots) {
                      toast.error(`Maximum 5 images allowed per post. Adding first ${availableSlots} file(s).`);
                    }

                    const filesToProcess = files.slice(0, availableSlots);
                    const newAtts: PendingAttachment[] = [];

                    for (const file of filesToProcess) {
                      if (file.type.startsWith("image/")) {
                        const validation = validateImageFile(file);
                        if (!validation.valid) {
                          toast.error(validation.error || `${file.name} is invalid.`);
                          continue;
                        }
                      } else if (file.size > 50 * 1024 * 1024) {
                        toast.error(`${file.name} is too large. Max 50MB.`);
                        continue;
                      }

                      newAtts.push({
                        id: Math.random().toString(36).substring(2, 9),
                        file,
                        previewUrl: URL.createObjectURL(file),
                        fileType: file.type,
                        fileSize: file.size,
                      });
                    }

                    setPendingAttachments((prev) => [...prev, ...newAtts]);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (pendingAttachments.length >= 5) {
                      toast.error("Maximum 5 images allowed per post.");
                      return;
                    }
                    fileInputRef.current?.click();
                  }}
                  className="p-2 rounded-full text-outline hover:bg-surface-container hover:text-primary transition-colors flex items-center justify-center"
                  aria-label="Add photo or video"
                >
                  <span className="material-symbols-outlined">image</span>
                </button>

                <span className="text-sm font-medium text-outline ml-2">{draft.length}/5000</span>
              </div>
              <button
                type="button"
                disabled={(!draft.trim() && pendingAttachments.length === 0) || isUploading || createMutation.isPending}
                onClick={handlePostSubmit}
                className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-on-primary disabled:opacity-40 transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
              >
                {isUploading || createMutation.isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Posting...</span>
                  </>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
