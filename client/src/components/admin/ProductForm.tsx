// ProductForm.tsx client/src/components/admin/ProductForm.tsx
// The Add / Edit Product form (design: Edit Product): Basic Information, Pricing & Inventory, Product Gallery,
// Publishing Status, Taxonomy & Tags, and the dark save bar. Saves with POST /api/admin/products (new) or
// PATCH /api/admin/products/:id (edit), server STEP 25.
// AdminProductsFormPage loads the product first and gives it here, so the form starts with the right values.

// STEP 42 (part 8): The product form

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { IconType } from "react-icons";
import {
  MdArrowBack,
  MdDeleteOutline,
  MdInfoOutline,
  MdOutlineInventory2,
  MdOutlinePayments,
  MdOutlinePhotoLibrary,
  MdOutlineSell,
  MdRemoveRedEye,
} from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import type {
  AdminCategory,
  AdminProductDetail,
  ProductStatus,
} from "../../types/admin";
import { api } from "../../utils/api";
import RadioCard from "../form/RadioCard";
import SelectInput from "../form/SelectInput";
import TextArea from "../form/TextArea";
import TextInput from "../form/TextInput";
import ImageUploader from "./ImageUploader";
import TagInput from "./TagInput";
import UnsavedChangesBar from "./UnsavedChangesBar";
import { announceCountsChanged } from "../../utils/adminEvents";

// What the form boxes hold. Numbers are kept as text while typing ("" = empty box), and turned into numbers on save.
type FormValues = {
  name: string;
  description: string;
  category: string; // the category's _id
  sku: string;
  brand: string;
  regularPrice: string;
  salePrice: string;
  costPrice: string;
  trackStock: boolean;
  stock: string;
  lowStockThreshold: string;
  images: string[];
  status: ProductStatus;
  publishAt: string; // "2026-12-01T09:00", the format <input type="datetime-local"> uses
  tags: string[];
  badge: string;
  tagline: string;
};

type Errors = Partial<Record<keyof FormValues, string>>;

// An ISO date ("2026-12-01T08:00:00.000Z") -> local time for the datetime-local box ("2026-12-01T09:00" in Lagos)
const toLocalInput = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};

// The product from the server -> the form's values. On sale, "Regular Price" is oldPrice and "Sale Price" is price.
const toValues = (product?: AdminProductDetail): FormValues => {
  const onSale = product?.oldPrice != null && product.oldPrice > product.price;
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "",
    sku: product?.sku ?? "",
    brand: product?.brand ?? "",
    regularPrice: product
      ? String(onSale ? product.oldPrice : product.price)
      : "",
    salePrice: product && onSale ? String(product.price) : "",
    costPrice: product?.costPrice != null ? String(product.costPrice) : "",
    trackStock: product?.trackStock ?? true,
    stock: product ? String(product.stock) : "0",
    lowStockThreshold: product ? String(product.lowStockThreshold) : "10",
    images: product?.images ?? [],
    status: product?.status ?? "published",
    publishAt: toLocalInput(product?.publishAt),
    tags: product?.tags ?? [],
    badge: product?.badge ?? "",
    tagline: product?.tagline ?? "",
  };
};

const toNumber = (text: string) => (text.trim() === "" ? null : Number(text));

// The checks the browser can do. The server checks again (and has the final word).
const validate = (values: FormValues): Errors => {
  const errors: Errors = {};
  const regular = toNumber(values.regularPrice);
  const sale = toNumber(values.salePrice);
  const cost = toNumber(values.costPrice);
  const stock = toNumber(values.stock);
  const threshold = toNumber(values.lowStockThreshold);

  if (!values.name.trim()) errors.name = "Please enter the product title.";
  if (!values.category) errors.category = "Please choose a category.";
  if (regular === null || !(regular > 0))
    errors.regularPrice = "Enter a price above ₦0.";
  if (sale !== null && !(sale > 0))
    errors.salePrice = "Enter a price above ₦0, or leave it empty.";
  else if (sale !== null && regular !== null && sale >= regular)
    errors.salePrice = "The sale price must be lower than the regular price.";
  if (cost !== null && !(cost >= 0))
    errors.costPrice = "Enter ₦0 or more, or leave it empty.";
  if (values.trackStock) {
    if (stock === null || !Number.isInteger(stock) || stock < 0)
      errors.stock = "Enter a whole number, 0 or more.";
    if (threshold === null || !Number.isInteger(threshold) || threshold < 0)
      errors.lowStockThreshold = "Enter a whole number, 0 or more.";
  }
  if (values.status === "scheduled" && !values.publishAt)
    errors.publishAt = "Pick the date and time it goes live.";
  // A live product without a photo would show an empty card in the shop. A draft can wait for its photos.
  if (values.status !== "draft" && values.images.length === 0)
    errors.images = "Add at least 1 photo, or save it as a draft.";
  return errors;
};

// One white box of the form, with its title row
const FormCard = ({
  icon: Icon,
  title,
  right,
  children,
}: {
  icon: IconType;
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) => (
  <section className="rounded-3xl bg-surface p-6 shadow-card">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-3 text-xl font-semibold text-ink">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary-light text-primary">
          <Icon size={20} aria-hidden="true" />
        </span>
        {title}
      </h2>
      {right}
    </div>
    {children}
  </section>
);

const Pill = ({
  children,
  classes,
}: {
  children: ReactNode;
  classes: string;
}) => (
  <span
    className={`rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap ${classes}`}
  >
    {children}
  </span>
);

const STATUS_PILL: Record<ProductStatus, { label: string; classes: string }> = {
  published: { label: "Live", classes: "bg-mint text-forest" },
  draft: { label: "Draft", classes: "bg-field text-ink-soft" },
  scheduled: {
    label: "Scheduled",
    classes: "bg-primary-light text-primary-hover",
  },
};

const SAVE_LABEL: Record<ProductStatus, string> = {
  published: "Save & Publish Product",
  draft: "Save Draft",
  scheduled: "Schedule Product",
};

const BADGES = ["SALE", "TOP SELLER", "NEW", "FEATURED"]; // the badges the shop's product cards show

type ProductFormProps = {
  product?: AdminProductDetail;
  categories: AdminCategory[];
};

const ProductForm = ({ product, categories }: ProductFormProps) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [initial] = useState(() => toValues(product)); // the values it opened with (Discard goes back to these)
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dirty = JSON.stringify(values) !== JSON.stringify(initial);

  // Change one field (and clear its red message, and the message in the save bar, which is now out of date)
  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setServerError("");
  };

  // Closing the tab or refreshing with unsaved changes: the browser asks "Leave site?"
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const regular = toNumber(values.regularPrice);
  const sale = toNumber(values.salePrice);
  const cost = toNumber(values.costPrice);
  const sellingPrice = sale ?? regular; // what the customer pays
  const percentOff =
    regular && sale && sale < regular
      ? Math.round(((regular - sale) / regular) * 100)
      : null;
  const margin =
    sellingPrice && cost !== null && sellingPrice > 0
      ? ((sellingPrice - cost) / sellingPrice) * 100
      : null;

  const regenerateSku = async () => {
    try {
      const query = values.category ? `?category=${values.category}` : "";
      const { sku } = await api<{ sku: string }>(
        `/admin/products/new-sku${query}`,
      );
      set("sku", sku);
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't make a new SKU",
        message: (err as Error).message,
      });
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    setServerError("");
    if (Object.keys(found).length > 0) {
      setServerError("Please fix the fields marked in red.");
      return;
    }

    // Only the fields this form edits. Specs, colours, highlights and bundles stay as they are (PATCH changes only what's sent).
    const body = {
      name: values.name.trim(),
      description: values.description.trim(),
      tagline: values.tagline.trim(),
      category: values.category,
      sku: values.sku.trim() || undefined, // empty on a new product = the server makes one (undefined isn't sent)
      brand: values.brand.trim(),
      price: sellingPrice,
      oldPrice: sale !== null ? regular : null, // null removes an old sale price
      costPrice: cost,
      trackStock: values.trackStock,
      stock: Number(values.stock) || 0,
      lowStockThreshold: Number(values.lowStockThreshold) || 0,
      images: values.images,
      status: values.status,
      publishAt:
        values.status === "scheduled"
          ? new Date(values.publishAt).toISOString()
          : null,
      tags: values.tags,
      badge: values.badge || null,
    };

    setSaving(true);
    try {
      const { message } = product
        ? await api<{ message: string }>(`/admin/products/${product._id}`, {
            method: "PATCH",
            body,
          })
        : await api<{ message: string }>("/admin/products", {
            method: "POST",
            body,
          });
      showToast({
        type: "success",
        title: product ? "Product updated successfully" : "Product created",
        message,
      });
      announceCountsChanged(); // the menu's "Products 40" (STEP 43)
      navigate("/admin/products");
    } catch (err) {
      setServerError((err as Error).message); // e.g. "That sku is already in use."
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    try {
      const { message } = await api<{ message: string }>(
        `/admin/products/${product._id}`,
        { method: "DELETE" },
      );
      showToast({ type: "success", title: message });
      navigate("/admin/products");
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't delete the product",
        message: (err as Error).message,
      });
      announceCountsChanged();
    }
  };

  const pill = product ? STATUS_PILL[product.status] : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            to="/admin/products"
            className="mb-2 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            <MdArrowBack size={16} aria-hidden="true" /> All products
          </Link>
          <h1 className="flex flex-wrap items-center gap-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            {product ? "Edit Product" : "Add Product"}
            {pill && (
              <Pill classes={`text-sm uppercase ${pill.classes}`}>
                ● {pill.label}
              </Pill>
            )}
          </h1>
        </div>
        {product && (
          <div className="flex flex-wrap items-center gap-3">
            {product.status === "published" && (
              // target="_blank": opens the shop page in a new tab, so the form stays open
              <a
                href={`/product/${product.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center gap-2 rounded-xl bg-surface px-4 font-semibold text-ink shadow-card hover:text-primary"
              >
                <MdRemoveRedEye size={20} aria-hidden="true" /> Preview Store
                Page
              </a>
            )}
            {confirmDelete ? (
              <span className="flex h-11 items-center gap-3 rounded-xl bg-danger-light px-4 text-sm text-danger">
                Delete for good?
                <button
                  type="button"
                  onClick={handleDelete}
                  className="font-bold hover:underline"
                >
                  Yes, delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="font-semibold text-ink-soft hover:underline"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex h-11 items-center gap-2 rounded-xl px-4 font-semibold text-danger hover:bg-danger-light"
              >
                <MdDeleteOutline size={20} aria-hidden="true" /> Delete
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left column */}
        <div className="flex flex-col gap-6">
          <FormCard
            icon={MdInfoOutline}
            title="Basic Information"
            right={
              <span className="text-xs font-bold tracking-wider text-ink-soft uppercase">
                Core attributes
              </span>
            }
          >
            <div className="flex flex-col gap-5">
              <TextInput
                label="Product Title"
                value={values.name}
                onChange={(event) => set("name", event.target.value)}
                error={errors.name}
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
              />
              <TextArea
                label="Description & Details"
                value={values.description}
                onChange={(event) => set("description", event.target.value)}
                rows={5}
                maxLength={2000}
                hint="Plain text. Shown under the price on the product page."
              />
              <div className="grid gap-5 md:grid-cols-3">
                <SelectInput
                  label="Primary Category"
                  value={values.category}
                  onChange={(event) => set("category", event.target.value)}
                  error={errors.category}
                >
                  <option value="">Choose a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </SelectInput>
                <TextInput
                  label="SKU Identifier"
                  value={values.sku}
                  onChange={(event) =>
                    set("sku", event.target.value.toUpperCase())
                  }
                  placeholder={product ? "" : "Made for you on save"}
                  labelAction={
                    <button
                      type="button"
                      onClick={regenerateSku}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Regenerate
                    </button>
                  }
                />
                <TextInput
                  label="Brand / Vendor"
                  value={values.brand}
                  onChange={(event) => set("brand", event.target.value)}
                />
              </div>
            </div>
          </FormCard>

          <FormCard icon={MdOutlinePayments} title="Pricing & Inventory">
            <div className="flex flex-col gap-6">
              <div className="grid gap-5 md:grid-cols-3">
                <TextInput
                  label="Regular Price (₦)"
                  type="number"
                  min={0}
                  inputMode="decimal"
                  value={values.regularPrice}
                  onChange={(event) => set("regularPrice", event.target.value)}
                  error={errors.regularPrice}
                />
                <TextInput
                  label="Sale Price (₦)"
                  type="number"
                  min={0}
                  inputMode="decimal"
                  value={values.salePrice}
                  onChange={(event) => set("salePrice", event.target.value)}
                  error={errors.salePrice}
                  placeholder="Not on sale"
                  labelAction={
                    percentOff !== null && (
                      <Pill classes="bg-danger-light text-danger">
                        {percentOff}% OFF
                      </Pill>
                    )
                  }
                />
                <TextInput
                  label="Cost Per Unit (₦)"
                  type="number"
                  min={0}
                  inputMode="decimal"
                  value={values.costPrice}
                  onChange={(event) => set("costPrice", event.target.value)}
                  error={errors.costPrice}
                  placeholder="Optional"
                  labelAction={
                    margin !== null && (
                      <Pill
                        classes={
                          margin >= 0
                            ? "bg-mint text-forest"
                            : "bg-danger-light text-danger"
                        }
                      >
                        {margin.toFixed(1)}% Margin
                      </Pill>
                    )
                  }
                />
              </div>

              {/* The toggle: a button with role="switch", so screen readers say "Track stock, switch, on" */}
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-panel p-4">
                <div className="flex items-start gap-3">
                  <MdOutlineInventory2
                    size={24}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-primary"
                  />
                  <div>
                    <p
                      id="track-stock-label"
                      className="font-semibold text-ink"
                    >
                      Track Stock Quantities
                    </p>
                    <p className="text-sm text-ink-soft">
                      Stop sales when 0 units are left, and warn you when it
                      runs low.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.trackStock}
                  aria-labelledby="track-stock-label"
                  onClick={() => set("trackStock", !values.trackStock)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${values.trackStock ? "bg-primary" : "bg-line"}`}
                >
                  <span
                    className={`absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform ${values.trackStock ? "translate-x-5" : ""}`}
                  />
                </button>
              </div>

              {values.trackStock ? (
                <div className="grid gap-5 md:grid-cols-2">
                  <TextInput
                    label="Available Stock Units"
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={values.stock}
                    onChange={(event) => set("stock", event.target.value)}
                    error={errors.stock}
                  />
                  <TextInput
                    label="Low-Stock Alert Threshold"
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={values.lowStockThreshold}
                    onChange={(event) =>
                      set("lowStockThreshold", event.target.value)
                    }
                    error={errors.lowStockThreshold}
                  />
                </div>
              ) : (
                <p className="text-sm text-ink-soft">
                  Not tracked: the shop always shows it as in stock (e.g. made
                  to order).
                </p>
              )}
            </div>
          </FormCard>

          <FormCard
            icon={MdOutlinePhotoLibrary}
            title="Product Gallery Assets"
            right={
              <Pill classes="bg-field text-ink-soft">
                {values.images.length} / 5 Slots Active
              </Pill>
            }
          >
            <ImageUploader
              images={values.images}
              onChange={(images) => set("images", images)}
              // functional update: the upload takes a while, and "values" may have changed meanwhile
              onUploaded={(urls) => {
                setValues((current) => ({
                  ...current,
                  images: [...current.images, ...urls].slice(0, 5),
                }));
                setErrors((current) => ({ ...current, images: undefined }));
              }}
            />
            {errors.images && (
              <p className="mt-3 text-sm text-danger">{errors.images}</p>
            )}
          </FormCard>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <section className="rounded-3xl bg-surface p-6 shadow-card">
            <h2 className="mb-5 text-xl font-semibold text-ink">
              Publishing Status
            </h2>
            <div className="flex flex-col gap-3">
              <RadioCard
                name="status"
                value="published"
                checked={values.status === "published"}
                onChange={() => set("status", "published")}
                title="Published"
                badge={<Pill classes="bg-forest text-white">Active</Pill>}
                description="Visible in the shop"
              />
              <RadioCard
                name="status"
                value="draft"
                checked={values.status === "draft"}
                onChange={() => set("status", "draft")}
                title="Draft"
                badge={<Pill classes="bg-field text-ink-soft">Hidden</Pill>}
                description="Only admins can see it"
              />
              <RadioCard
                name="status"
                value="scheduled"
                checked={values.status === "scheduled"}
                onChange={() => set("status", "scheduled")}
                title="Scheduled"
                description="Goes live on a date and time you pick"
              >
                <TextInput
                  label="Goes live on"
                  type="datetime-local"
                  value={values.publishAt}
                  onChange={(event) => set("publishAt", event.target.value)}
                  error={errors.publishAt}
                />
              </RadioCard>
            </div>
          </section>

          <section className="rounded-3xl bg-surface p-6 shadow-card">
            <h2 className="mb-1 flex items-center gap-2 text-xl font-semibold text-ink">
              <MdOutlineSell
                size={20}
                aria-hidden="true"
                className="text-primary"
              />{" "}
              Taxonomy & Tags
            </h2>
            <p className="mb-5 text-sm text-ink-soft">
              Search keywords.{" "}
              <strong className="font-semibold">flash-deal</strong> and{" "}
              <strong className="font-semibold">todays-deal</strong> put it in
              those rows on the Home page.
            </p>
            <TagInput
              tags={values.tags}
              onChange={(tags) => set("tags", tags)}
            />
            <div className="mt-6 flex flex-col gap-5">
              <SelectInput
                label="Card Badge"
                value={values.badge}
                onChange={(event) => set("badge", event.target.value)}
              >
                <option value="">No badge</option>
                {BADGES.map((badge) => (
                  <option key={badge} value={badge}>
                    {badge}
                  </option>
                ))}
              </SelectInput>
              <TextInput
                label="Tagline"
                value={values.tagline}
                onChange={(event) => set("tagline", event.target.value)}
                placeholder="e.g. 40-hour battery, studio sound"
              />
            </div>
          </section>
        </div>
      </div>

      <UnsavedChangesBar
        dirty={dirty}
        saving={saving}
        saveLabel={SAVE_LABEL[values.status]}
        note={product ? `Editing SKU ${product.sku}` : "New product"}
        error={serverError}
        onDiscard={() => {
          setValues(initial);
          setErrors({});
          setServerError("");
        }}
      />
    </form>
  );
};

export default ProductForm;
