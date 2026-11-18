// AdminCategoriesPage.tsx client/src/pages/admin/AdminCategoriesPage.tsx
// "Categories": the shop's departments with their product counts (drafts included). Add one, rename it or change its
// icon, or delete it (only when no product uses it: every product must have a category).
// GET / POST / PATCH / DELETE /api/admin/categories (server STEP 25). There's no design, so it follows the other admin pages.

// STEP 44 (part 5): The admin Categories page

import { useState } from "react";
import { MdAddCircleOutline, MdDeleteOutline, MdEdit } from "react-icons/md";
import { Link } from "react-router-dom";
import CategoryForm from "../../components/admin/CategoryForm";
import { useToast } from "../../context/ToastContext";
import { useApi } from "../../hooks/useApi";
import type { AdminCategory } from "../../types/admin";
import { api } from "../../utils/api";
import { categoryIcons, DefaultCategoryIcon } from "../../utils/categoryIcons";
import { plural } from "../../utils/format";

const AdminCategoriesPage = () => {
  const { showToast } = useToast();
  const { data, error, reload } = useApi<{ categories: AdminCategory[] }>(
    "/admin/categories",
  );
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // the card showing its form
  const [confirmId, setConfirmId] = useState<string | null>(null); // the card asking "Delete?"

  const add = async (name: string, icon: string) => {
    const { message } = await api<{ message: string }>("/admin/categories", {
      method: "POST",
      body: { name, icon },
    });
    showToast({ type: "success", title: message }); // "'Toys & Games' has been added."
    setAdding(false);
    reload();
  };

  const save = async (id: string, name: string, icon: string) => {
    const { message } = await api<{ message: string }>(
      `/admin/categories/${id}`,
      { method: "PATCH", body: { name, icon } },
    );
    showToast({ type: "success", title: message });
    setEditingId(null);
    reload();
  };

  const remove = async (category: AdminCategory) => {
    try {
      const { message } = await api<{ message: string }>(
        `/admin/categories/${category._id}`,
        { method: "DELETE" },
      );
      showToast({ type: "success", title: message });
      reload();
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't delete the category",
        message: (err as Error).message,
      });
    }
    setConfirmId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Categories
          </h1>
          <p className="mt-2 max-w-130 text-ink-soft">
            The departments shoppers browse. A renamed category keeps its link,
            so old links still work.
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex h-12 items-center gap-2 rounded-xl bg-primary-hover px-6 text-lg font-semibold text-white hover:bg-primary"
          >
            <MdAddCircleOutline size={22} aria-hidden="true" /> Add Category
          </button>
        )}
      </div>

      {adding && (
        <section
          aria-label="New category"
          className="rounded-3xl bg-surface p-6 shadow-card"
        >
          <h2 className="mb-4 text-xl font-semibold text-ink">New category</h2>
          <CategoryForm
            submitLabel="Add Category"
            onSubmit={add}
            onCancel={() => setAdding(false)}
          />
        </section>
      )}

      {error ? (
        <div
          role="alert"
          className="flex items-center justify-between rounded-2xl bg-danger-light p-4 text-sm text-danger"
        >
          {error}
          <button
            type="button"
            onClick={reload}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      ) : !data ? (
        <div
          aria-busy="true"
          className="h-64 animate-pulse rounded-3xl bg-surface shadow-card"
        />
      ) : (
        <ul
          aria-label="Categories"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {data.categories.map((category) => {
            const Icon = categoryIcons[category.icon] ?? DefaultCategoryIcon;
            return (
              <li
                key={category._id}
                className="rounded-3xl bg-surface p-5 shadow-card"
              >
                {editingId === category._id ? (
                  // key: a fresh form each time Edit is clicked
                  <CategoryForm
                    key={category._id}
                    initialName={category.name}
                    initialIcon={category.icon || "category"}
                    submitLabel="Save"
                    onSubmit={(name, icon) => save(category._id, name, icon)}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <div className="flex items-start gap-4">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary-hover">
                        <Icon size={26} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-semibold text-ink">
                          {category.name}
                        </h2>
                        <p className="text-xs text-ink-soft">
                          /shop?category={category.slug}
                        </p>
                        <Link
                          to={`/admin/products?category=${category.slug}`}
                          className="mt-1 inline-block text-sm font-semibold text-primary hover:underline"
                        >
                          {plural(category.productCount, "product")}
                        </Link>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-end gap-1 border-t border-line pt-3">
                      {confirmId === category._id ? (
                        <span className="flex items-center gap-3 text-sm">
                          Delete '{category.name}'?
                          <button
                            type="button"
                            onClick={() => remove(category)}
                            className="font-semibold text-danger hover:underline"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            className="font-semibold text-ink-soft hover:underline"
                          >
                            No
                          </button>
                        </span>
                      ) : (
                        <>
                          {category.productCount > 0 && (
                            <span className="mr-auto text-xs text-muted">
                              Move its products before deleting
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(category._id);
                              setConfirmId(null);
                            }}
                            aria-label={`Edit ${category.name}`}
                            className="flex size-9 items-center justify-center rounded-lg text-ink-soft hover:bg-field hover:text-primary"
                          >
                            <MdEdit size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(category._id)}
                            disabled={category.productCount > 0}
                            aria-label={`Delete ${category.name}`}
                            className="flex size-9 items-center justify-center rounded-lg text-ink-soft hover:bg-danger-light hover:text-danger disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-soft"
                          >
                            <MdDeleteOutline size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
