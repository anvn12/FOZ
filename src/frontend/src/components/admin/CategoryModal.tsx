import React, { useState } from "react";
import type { ForumCategoryItem } from "#frontend/api/admin";

interface CategoryModalProps {
  category: ForumCategoryItem | null;
  mode: "create" | "edit" | "delete" | null;
  categories: ForumCategoryItem[];
  onClose: () => void;
  onConfirmCreate: (data: {
    name: string;
    slug: string;
    description?: string;
    displayOrder: number;
    allowNewPosts: boolean;
  }) => Promise<void>;
  onConfirmUpdate: (id: string, data: {
    name?: string;
    slug?: string;
    description?: string;
    displayOrder?: number;
    allowNewPosts?: boolean;
  }) => Promise<void>;
  onConfirmDelete: (id: string, targetCategoryId: string) => Promise<void>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  mode,
  categories,
  onClose,
  onConfirmCreate,
  onConfirmUpdate,
  onConfirmDelete,
}) => {
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [displayOrder, setDisplayOrder] = useState(category?.displayOrder || 0);
  const [allowNewPosts, setAllowNewPosts] = useState(category?.allowNewPosts ?? true);
  const [targetCategoryId, setTargetCategoryId] = useState(
    categories.find((c) => c.id !== category?.id)?.id || ""
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!mode) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        if (!name || !slug) {
          setErrorMsg("Name and slug are required");
          setIsSubmitting(false);
          return;
        }
        await onConfirmCreate({ name, slug, description, displayOrder, allowNewPosts });
      } else if (mode === "edit") {
        if (!category) return;
        await onConfirmUpdate(category.id, { name, slug, description, displayOrder, allowNewPosts });
      } else if (mode === "delete") {
        if (!category) return;
        if (!targetCategoryId) {
          setErrorMsg("Please select a target destination category for existing threads");
          setIsSubmitting(false);
          return;
        }
        await onConfirmDelete(category.id, targetCategoryId);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">
          {mode === "create"
            ? "Create Forum Category"
            : mode === "edit"
            ? "Edit Category"
            : "Delete Category & Reassign Threads"}
        </h3>

        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "delete" ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs leading-relaxed">
                <span className="font-bold">Mandatory Thread Reassignment:</span> Deleting category{" "}
                <span className="font-bold">{category?.name}</span> requires selecting a target destination category for all existing threads to ensure zero orphaned discussions.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Target Destination Category *
                </label>
                <select
                  value={targetCategoryId}
                  onChange={(e) => setTargetCategoryId(e.target.value)}
                  className="w-full text-xs p-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Category...</option>
                  {categories
                    .filter((c) => c.id !== category?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (mode === "create") {
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                    }
                  }}
                  placeholder="e.g. Technology & AI"
                  className="w-full p-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. tech-ai"
                  className="w-full p-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short explanation of topic scope..."
                  className="w-full p-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-5">
                  <input
                    type="checkbox"
                    id="allowNewPosts"
                    checked={allowNewPosts}
                    onChange={(e) => setAllowNewPosts(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="allowNewPosts" className="font-medium text-slate-700">
                    Allow New Posts
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-sm ${
                mode === "delete" ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting
                ? "Processing..."
                : mode === "create"
                ? "Create Category"
                : mode === "edit"
                ? "Save Changes"
                : "Delete & Reassign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
