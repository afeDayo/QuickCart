// AdminProductsFormPage.tsx client/src/pages/admin/AdminProductsFormPage.tsx
// /admin/products/new (Add Product) and /admin/products/:productId/edit (Edit Product).
// Loads what the form needs (the categories, and the product when editing), then shows ProductForm.

// STEP 42 (part 9): The Add / Edit Product page

import { Link, useParams } from "react-router-dom";
import ProductForm from "../../components/admin/ProductForm";
import { useApi } from "../../hooks/useApi";
import type { AdminCategory, AdminProductDetail } from "../../types/admin";

const AdminProductsFormPage = () => {
  const { productId } = useParams(); // undefined on /admin/products/new

  const { data: productData, error: productError } = useApi<{
    product: AdminProductDetail;
  }>(productId ? `/admin/products/${productId}` : null);
  const { data: categoryData, error: categoryError } = useApi<{
    categories: AdminCategory[];
  }>("/admin/categories");

  const error = productError ?? categoryError;
  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-3xl bg-surface p-8 shadow-card"
      >
        <h1 className="text-2xl font-bold text-ink">
          {productError === "Product not found"
            ? "That product doesn't exist"
            : "Couldn't open the form"}
        </h1>
        <p className="text-ink-soft">{error}</p>
        <Link
          to="/admin/products"
          className="font-semibold text-primary hover:underline"
        >
          Back to products
        </Link>
      </div>
    );
  }

  // Still loading: the form must start with the real values, so it waits.
  // (useApi keeps the previous answer while loading, so also check it's THIS product.)
  if (!categoryData || (productId && productData?.product._id !== productId)) {
    return (
      <div
        aria-busy="true"
        className="h-150 animate-pulse rounded-3xl bg-surface shadow-card"
      />
    );
  }

  // key: going from one product's form to another (or to "new") starts a fresh form, not the old values
  return (
    <ProductForm
      key={productId ?? "new"}
      product={productData?.product}
      categories={categoryData.categories}
    />
  );
};

export default AdminProductsFormPage;
