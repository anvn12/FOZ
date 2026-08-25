import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  useForumCategories,
  useCreateForumCategory,
  useUpdateForumCategory,
  useDeleteForumCategory,
  type ForumCategoryItem,
} from "#frontend/api/admin";
import { CategoryModal } from "#frontend/components/admin/CategoryModal";

export const AdminCategoriesPage: React.FC = () => {
  const { data, isLoading } = useForumCategories();
  const [selectedCategory, setSelectedCategory] = useState<ForumCategoryItem | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "delete" | null>(null);

  const createMutation = useCreateForumCategory();
  const updateMutation = useUpdateForumCategory();
  const deleteMutation = useDeleteForumCategory();

  const handleConfirmCreate = async (input: {
    name: string;
    slug: string;
    description?: string;
    displayOrder: number;
    allowNewPosts: boolean;
    rationale: string;
  }) => {
    try {
      await createMutation.mutateAsync(input);
      toast.success(`Category "${input.name}" created successfully`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create category");
      throw err;
    }
  };

  const handleConfirmUpdate = async (
    id: string,
    input: {
      name?: string;
      slug?: string;
      description?: string;
      displayOrder?: number;
      allowNewPosts?: boolean;
      rationale: string;
    }
  ) => {
    try {
      await updateMutation.mutateAsync({ id, input });
      toast.success("Category updated successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update category");
      throw err;
    }
  };

  const handleConfirmDelete = async (id: string, targetCategoryId: string, rationale: string) => {
    try {
      await deleteMutation.mutateAsync({ id, input: { targetCategoryId, rationale } });
      toast.success("Category deleted and threads reassigned");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete category");
      throw err;
    }
  };

  const categories = data?.categories ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-1">
            <Link to="/admin" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <span>›</span>
            <span className="text-slate-700">Forum Categories</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Forum Categories
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Create, reorder, edit properties, or delete discussion categories with mandatory thread reassignment.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setModalMode("create");
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <span>+ Create Category</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-medium bg-white rounded-2xl border border-slate-200/80">
          Loading forum categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200/80">
          No discussion categories configured. Click "+ Create Category" to initialize.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-6">Order</th>
                  <th className="py-3.5 px-6">Name</th>
                  <th className="py-3.5 px-6">Slug</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6">Posting</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-xs text-slate-500">
                      {cat.displayOrder}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">{cat.name}</td>
                    <td className="py-4 px-6 text-xs font-mono text-slate-600">{cat.slug}</td>
                    <td className="py-4 px-6 text-slate-600 text-xs max-w-[240px] truncate">
                      {cat.description || "-"}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full border ${
                          cat.allowNewPosts
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {cat.allowNewPosts ? "Allowed" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCategory(cat);
                          setModalMode("edit");
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCategory(cat);
                          setModalMode("delete");
                        }}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs rounded-xl border border-rose-200 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        category={selectedCategory}
        mode={modalMode}
        categories={categories}
        onClose={() => {
          setSelectedCategory(null);
          setModalMode(null);
        }}
        onConfirmCreate={handleConfirmCreate}
        onConfirmUpdate={handleConfirmUpdate}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};
