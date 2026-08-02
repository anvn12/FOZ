import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { createPost } from "#frontend/api/interactions";
import { useAuthStore } from "#frontend/stores/auth";
import { useProfile } from "#frontend/api/profile";
import { validateImageFile, compressImageToBase64 } from "#frontend/utils/imageCompressor";



type Attachment = { fileUrl: string; fileType: string; fileSize: number };

export function CreatePostModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const user = useAuthStore(s => s.user);
  const { data: profile } = useProfile(user?.id ?? "");
  const displayName = profile?.displayName || user?.email?.split("@")[0] || "U";
  const avatarUrl = profile?.avatarUrl;
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: async () => {
      setDraft("");
      setAttachments([]);
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Your post is live.");
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Something went wrong.");
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-[600px] rounded-2xl bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-outline-variant pb-4">
          <h2 className="text-xl font-bold text-primary">Create Post</h2>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-surface-container-low transition-colors">
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
            {attachments.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {attachments.map((att, i) => (
                  <div key={i} className="relative group">
                    {att.fileType.startsWith("image/") ? (
                      <img src={att.fileUrl} alt="attachment" className="h-20 w-20 object-cover rounded-xl border border-outline-variant" />
                    ) : (
                      <div className="h-20 w-20 flex items-center justify-center rounded-xl border border-outline-variant bg-surface-container">
                        <span className="material-symbols-outlined text-outline">movie</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter((_, index) => index !== i))}
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
                  onChange={async (e) => {
                    if (!e.target.files) return;
                    const files = Array.from(e.target.files);

                    if (attachments.length >= 5) {
                      toast.error("Maximum 5 images allowed per post.");
                      e.target.value = "";
                      return;
                    }

                    const availableSlots = 5 - attachments.length;
                    if (files.length > availableSlots) {
                      toast.error(`Maximum 5 images allowed per post. Adding first ${availableSlots} file(s).`);
                    }

                    const filesToProcess = files.slice(0, availableSlots);
                    const newAtts: Attachment[] = [];

                    for (const file of filesToProcess) {
                      if (file.type.startsWith("image/")) {
                        const validation = validateImageFile(file);
                        if (!validation.valid) {
                          toast.error(validation.error || `${file.name} is invalid.`);
                          continue;
                        }
                        const toastId = toast.loading(`Compressing ${file.name}...`);
                        try {
                          const compressed = await compressImageToBase64(file, "feed_post");
                          toast.success(`Image compressed & attached`, { id: toastId });
                          newAtts.push({
                            fileUrl: compressed.base64,
                            fileType: "image/webp",
                            fileSize: compressed.size,
                          });
                        } catch (err) {
                          console.warn("Client compression error, falling back:", err);
                          toast.error(`Failed to process ${file.name}`, { id: toastId });
                        }
                      } else {
                        if (file.size > 50 * 1024 * 1024) {
                          toast.error(`${file.name} is too large. Max 50MB.`);
                          continue;
                        }
                        const base64 = await new Promise<string>((resolve, reject) => {
                          const reader = new FileReader();
                          reader.onload = () => resolve(reader.result as string);
                          reader.onerror = reject;
                          reader.readAsDataURL(file);
                        });
                        newAtts.push({ fileUrl: base64, fileType: file.type, fileSize: file.size });
                      }
                    }
                    setAttachments((prev) => [...prev, ...newAtts]);
                    e.target.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (attachments.length >= 5) {
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
                disabled={(!draft.trim() && attachments.length === 0) || createMutation.isPending}
                onClick={() => createMutation.mutate({ content: draft, attachments: attachments.length > 0 ? (attachments as any) : undefined })}
                className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-on-primary disabled:opacity-40 transition-opacity hover:opacity-90"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
