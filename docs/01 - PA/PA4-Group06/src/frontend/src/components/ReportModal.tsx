import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { reportPost } from "#frontend/api/interactions";
import { useMutation } from "@tanstack/react-query";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
}

export function ReportModal({ isOpen, onClose, postId }: ReportModalProps) {
  const [reasonType, setReasonType] = useState<string>("");
  const [details, setDetails] = useState("");

  const mutation = useMutation({
    mutationFn: async ({ rType, d }: { rType: string, d: string }) => await reportPost(postId, { reasonType: rType as any, details: d }),
    onSuccess: () => {
      toast.success("The report has been sent to a moderator to handle");
      setReasonType("");
      setDetails("");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit report");
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-container rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-outline-variant animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h2 className="text-xl font-bold text-primary">Report Post</h2>
          <button 
            onClick={onClose}
            className="text-secondary hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-highest"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div className="p-6">
          <label className="block text-sm font-medium text-secondary mb-2">
            Select a reason for reporting
          </label>
          <select
            value={reasonType}
            onChange={(e) => setReasonType(e.target.value)}
            className="w-full bg-surface-container-highest border border-outline-variant rounded-xl p-3 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
          >
            <option value="" disabled>Choose a reason...</option>
            <option value="harassment">Harassment</option>
            <option value="spam">Spam</option>
            <option value="inappropriate">Inappropriate</option>
            <option value="other">Other</option>
          </select>
          
          <label className="block text-sm font-medium text-secondary mb-2">
            Additional details (optional)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full bg-surface-container-highest border border-outline-variant rounded-xl p-3 text-primary placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] resize-y"
            placeholder="Please provide details about how this post violates community guidelines..."
          />
        </div>
        
        <div className="px-6 py-4 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 font-semibold text-secondary hover:text-primary transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (!reasonType) {
                toast.error("Please select a reason");
                return;
              }
              mutation.mutate({ rType: reasonType, d: details });
            }}
            disabled={mutation.isPending}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {mutation.isPending ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
