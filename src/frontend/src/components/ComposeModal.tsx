import React, { useState } from "react";
import { toast } from "react-hot-toast";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPost: (body: string) => void;
}

export function ComposeModal({ isOpen, onClose, onAddPost }: ComposeModalProps) {
  const [text, setText] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error("Post cannot be empty");
      return;
    }
    if (text.length > 5000) {
      toast.error("Post exceeds 5000 characters limit");
      return;
    }
    onAddPost(text);
    toast.success("Post shared successfully");
    setText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg rounded-2xl bg-surface-container-lowest border border-outline-variant p-6 shadow-2xl animate-foz-pop z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline-md text-headline-md text-primary">New Post</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary hover:text-primary transition-colors p-1"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's happening?"
            className="w-full h-40 bg-surface-container-low border border-outline-variant rounded-xl p-3 text-body-md font-body-md text-primary placeholder-outline focus:outline-none focus:border-primary resize-none mb-3"
            maxLength={5000}
          />
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline">
              {text.length.toLocaleString()} / 5,000
            </span>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-full hover:opacity-90 transition-opacity"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
