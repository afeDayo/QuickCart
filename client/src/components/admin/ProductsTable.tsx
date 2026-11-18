// ProductsTable.tsx client/src/components/admin/ProductsTable.tsx
// The products table (design: Admin - Products Management): product (photo, name, SKU and a note), category, price,
// stock with a coloured bar, and the Edit / Delete actions.

// STEP 42 (part 2): The products table

import { useState } from "react";
import {
  MdDeleteOutline,
  MdEdit,
  MdOutlineImageNotSupported,
} from "react-icons/md";
import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import type { AdminProductRow } from "../../types/admin";
import { api } from "../../utils/api";
import { shortDate } from "../../utils/dates";
import { naira } from "../../utils/format";

// The small note under the SKU, depending on the product
const noteFor = (product: AdminProductRow) => {
  if (product.status === "draft")
    return { text: "Unpublished draft", classes: "text-muted" };
  if (product.status === "scheduled")
    return {
      text: `Goes live ${product.publishAt ? shortDate(product.publishAt) : "soon"}`,
      classes: "text-primary",
    };
  if (product.trackStock && product.stock === 0)
    return { text: "Sold out", classes: "text-danger" };
  if (product.badge) return { text: product.badge, classes: "text-success" };
  return { text: product.brand, classes: "text-ink-soft" };
};

// The stock column: "124 in stock" with a green bar, "3 left in stock" in red, "Not tracked"...
const StockCell = ({ product }: { product: AdminProductRow }) => {
  if (!product.trackStock) {
    return (
      <span className="text-sm text-muted">Not tracked (made to order)</span>
    );
  }
  const low = product.stock <= product.lowStockThreshold;
  // A full bar = 5 times the alert level (an arbitrary "well stocked" mark, just for the picture)
  const width = Math.min(
    100,
    Math.round(
      (product.stock / Math.max(1, product.lowStockThreshold * 5)) * 100,
    ),
  );
  return (
    <div className="w-44">
      <p className="mb-1.5 flex justify-between text-xs font-semibold">
        <span
          className={
            product.stock === 0
              ? "text-danger"
              : low
                ? "text-danger"
                : "text-success"
          }
        >
          {product.stock === 0
            ? "0 units"
            : low
              ? `${product.stock} left in stock`
              : `${product.stock} in stock`}
        </span>
        {low && (
          <span className="text-ink-soft">
            Reorder @ {product.lowStockThreshold}
          </span>
        )}
      </p>
      <span
        aria-hidden="true"
        className="block h-1.5 overflow-hidden rounded-full bg-line-soft"
      >
        <span
          className={`block h-full rounded-full ${low ? "bg-danger" : "bg-success"}`}
          style={{ width: `${Math.max(width, product.stock > 0 ? 4 : 0)}%` }}
        />
      </span>
    </div>
  );
};

type ProductsTableProps = {
  products: AdminProductRow[];
  onDeleted: () => void;
};

const ProductsTable = ({ products, onDeleted }: ProductsTableProps) => {
  const { showToast } = useToast();
  const [confirmId, setConfirmId] = useState<string | null>(null); // the row asking "Delete?"

  const remove = async (product: AdminProductRow) => {
    try {
      const { message } = await api<{ message: string }>(
        `/admin/products/${product._id}`,
        { method: "DELETE" },
      );
      showToast({ type: "success", title: message }); // "'Demo Speaker' has been deleted."
      setConfirmId(null);
      onDeleted();
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't delete the product",
        message: (err as Error).message,
      });
    }
  };

  return (
    // overflow-x-auto: the table scrolls sideways on phones. relative: the sr-only "Actions" text is position: absolute,
    // and without a positioned box around it, it escapes the scroll box and makes the whole page wider on phones.
    <div className="relative overflow-x-auto">
      <table className="w-full min-w-200 text-left text-sm">
        <thead className="bg-panel text-xs font-bold tracking-wider text-ink-soft uppercase">
          <tr>
            <th scope="col" className="px-6 py-3">
              Product
            </th>
            <th scope="col" className="px-4 py-3">
              Category
            </th>
            <th scope="col" className="px-4 py-3">
              Price
            </th>
            <th scope="col" className="px-4 py-3">
              Stock quantity
            </th>
            <th scope="col" className="px-6 py-3 text-right">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {products.map((product) => {
            const note = noteFor(product);
            return (
              <tr key={product._id} className="hover:bg-panel/50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt=""
                        className="size-14 shrink-0 rounded-xl bg-field object-cover"
                      />
                    ) : (
                      <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-field text-muted">
                        <MdOutlineImageNotSupported
                          size={22}
                          aria-hidden="true"
                        />
                      </span>
                    )}
                    <div className="min-w-0">
                      <Link
                        to={`/admin/products/${product._id}/edit`}
                        className="block text-base font-semibold text-ink hover:text-primary"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs font-semibold tracking-wide text-ink-soft">
                        SKU: {product.sku}{" "}
                        <span className={`ml-1 font-medium ${note.classes}`}>
                          · {note.text}
                        </span>
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-field px-3 py-1 text-xs font-semibold whitespace-nowrap text-ink">
                    {product.category?.name ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="block text-base font-bold text-ink">
                    {naira(product.price)}
                  </span>
                  {product.oldPrice && product.oldPrice > product.price && (
                    <del className="text-xs text-muted">
                      {naira(product.oldPrice)}
                    </del>
                  )}
                </td>
                <td className="px-4 py-4">
                  <StockCell product={product} />
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  {confirmId === product._id ? (
                    <span className="flex items-center justify-end gap-2 text-sm">
                      Delete?
                      <button
                        type="button"
                        onClick={() => remove(product)}
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
                    <span className="flex justify-end gap-1">
                      <Link
                        to={`/admin/products/${product._id}/edit`}
                        aria-label={`Edit ${product.name}`}
                        className="flex size-9 items-center justify-center rounded-lg text-ink-soft hover:bg-field hover:text-primary"
                      >
                        <MdEdit size={18} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmId(product._id)}
                        aria-label={`Delete ${product.name}`}
                        className="flex size-9 items-center justify-center rounded-lg text-ink-soft hover:bg-danger-light hover:text-danger"
                      >
                        <MdDeleteOutline size={18} />
                      </button>
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
