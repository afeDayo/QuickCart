// admin.ts client/src/types/admin.ts
// The shapes of the admin API's replies (server STEPs 25–28). Kept apart from types/api.ts so the shop's types stay short.

// STEP 41 (part 1): Admin types

import type { Order, OrderStatus, Address } from "./api";

export type DashboardRange = "7d" | "30d" | "90d" | "year";

// GET /api/admin/dashboard?range=30d   (server: adminDashboardController.ts, STEP 27)
export type DashboardResponse = {
  range: DashboardRange;
  cards: {
    totalSales: number;
    salesChange: number | null; // % vs the period before; null = nothing to compare with
    totalOrders: number;
    ordersChange: number | null;
    catalogProducts: number;
    needsRestock: number;
    totalCustomers: number;
    newCustomers: number;
    subscribers: number;
  };
  chart: { date: string; label: string; sales: number; orders: number }[];
  peak: { date: string; label: string; sales: number; orders: number } | null;
  avgOrderValue: number;
  refundRate: number; // 0.8 = 0.8%
  recentOrders: Pick<
    Order,
    | "_id"
    | "orderNumber"
    | "contact"
    | "total"
    | "status"
    | "payment"
    | "createdAt"
  >[];
  totalOrdersAllTime: number;
  topProducts: {
    productId: string;
    name: string;
    image: string;
    sku: string;
    sold: number;
    revenue: number;
  }[];
  lowStock: {
    _id: string;
    name: string;
    sku: string;
    stock: number;
    lowStockThreshold: number;
    images: string[];
  }[];
};

// The tab numbers of GET /api/admin/orders (STEP 26), used by the sidebar's "12 New"
export type AdminOrderCounts = Record<"all" | OrderStatus, number>;

// STEP 42: Admin products and categories (server: adminProductController.ts, adminCategoryController.ts, STEP 25)

export type ProductStatus = "published" | "draft" | "scheduled";

// One row of GET /api/admin/products (the server's TABLE_FIELDS)
export type AdminProductRow = {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  category: { _id: string; name: string; slug: string } | null;
  price: number;
  oldPrice?: number;
  costPrice?: number;
  images: string[];
  trackStock: boolean;
  stock: number;
  lowStockThreshold: number;
  status: ProductStatus;
  publishAt?: string;
  badge?: string;
  updatedAt: string;
};

export type AdminProductTab =
  | "all"
  | "in-stock"
  | "low-stock"
  | "out-of-stock"
  | "drafts";

export type AdminProductsResponse = {
  products: AdminProductRow[];
  total: number;
  page: number;
  pages: number;
  counts: Record<AdminProductTab, number>;
};

// GET /api/admin/products/:id -> the whole product, for the edit form (category is just its id here)
export type AdminProductDetail = Omit<AdminProductRow, "category"> & {
  category: string;
  description: string;
  tagline?: string;
  features: string[];
  tags: string[];
};

// GET /api/admin/categories -> every category, counting drafts too
export type AdminCategory = {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  productCount: number;
};

// STEP 43: Admin orders (server: adminOrderController.ts, STEP 26)

export type AdminOrderTab = "all" | OrderStatus;

// One row of GET /api/admin/orders (the server's TABLE_FIELDS)
export type AdminOrderRow = Pick<
  Order,
  | "_id"
  | "orderNumber"
  | "waybill"
  | "courier"
  | "contact"
  | "total"
  | "status"
  | "createdAt"
> & {
  shippingAddress: { city: string; state: string };
  items: { name: string; image: string; quantity: number }[];
  payment: Pick<Order["payment"], "method" | "status" | "cardBrand">;
};

export type AdminOrdersResponse = {
  orders: AdminOrderRow[];
  total: number;
  page: number;
  pages: number;
  counts: AdminOrderCounts; // the tabs and the cards, for ALL orders
  sales: number; // the money of every order that isn't cancelled
  refunded: number; // the money of the cancelled orders
  couriers: string[]; // "QuickCart Express", "GIG Logistics", "DHL Express"
};

// GET /api/admin/orders/:orderNumber -> the order with its customer's account, and the buttons it may have
export type AdminOrderResponse = {
  order: Order & {
    user: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      createdAt: string;
    } | null;
  };
  nextStatuses: OrderStatus[]; // where it may go next, e.g. ["shipped", "cancelled"]
  couriers: string[];
};

// STEP 44: Admin customers (server: adminCustomerController.ts, STEP 26)

// One row of GET /api/admin/customers: the customer + numbers worked out from their orders
export type AdminCustomerRow = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isEmailVerified: boolean;
  createdAt: string;
  orderCount: number;
  totalSpent: number; // cancelled orders not counted
  lastOrderAt: string | null;
};

export type AdminCustomersResponse = {
  customers: AdminCustomerRow[];
  total: number;
  page: number;
  pages: number;
};

// GET /api/admin/customers/:id -> the customer, their addresses and their 20 newest orders
export type AdminCustomerResponse = {
  customer: AdminCustomerRow & { addresses: Address[] };
  orders: (Pick<
    Order,
    "_id" | "orderNumber" | "total" | "status" | "createdAt"
  > & { items: { quantity: number }[] })[];
};

// Admin → Settings → Team (server: adminTeamController.ts)
export type AdminTeamMember = { _id: string; firstName: string; lastName: string; email: string; createdAt: string };
