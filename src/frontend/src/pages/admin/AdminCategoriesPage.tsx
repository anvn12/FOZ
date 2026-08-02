import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  }) => {
    await createMutation.mutateAsync(input);
  };

  const handleConfirmUpdate = async (
    id: string,
    input: {
      name?: string;
      slug?: string;
      description?: string;
      displayOrder?: number;
      allowNewPosts?: boolean;
    }
  ) => {
    await updateMutation.mutateAsync({ id, input });
  };

  const handleConfirmDelete = async (id: string, targetCategoryId: string) => {
    await deleteMutation.mutateAsync({ id, input: { targetCategoryId } });
  };

  const categories = data?.categories ?? [];

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
            <Link to="/admin" className="hover:underline">
              Admin
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-700">Categories</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Forum Category Governance
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Create, reorder, edit properties, or delete discussion categories with mandatory thread reassignment.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setModalMode("create");
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors"
        >
          + Create Category
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-slate-500 font-medium">Loading forum categories...</div>
      ) : categories.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
          No discussion categories configured. Click "+ Create Category" to initialize.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-xs tracking-wider">
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Posting</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-xs text-slate-500">
                      {cat.displayOrder}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{cat.name}</td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-600">{cat.slug}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs max-w-[240px] truncate">
                      {cat.description || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${
                          cat.allowNewPosts
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {cat.allowNewPosts ? "Allowed" : "Disabled"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedCategory(cat);
                          setModalMode("edit");
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs rounded border border-slate-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCategory(cat);
                          setModalMode("delete");
                        }}
                        className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-medium text-xs rounded border border-rose-300"
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

      {/* Modal */}
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
