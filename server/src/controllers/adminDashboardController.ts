// adminDashboardController.ts server/src/controllers/adminDashboardController.ts
// The admin's Dashboard Overview: the 4 cards, the sales chart, average order value, refund rate,
// recent orders, top-selling products and low-stock alerts, all in ONE request.

// STEP 27: Admin dashboard
// GET /api/admin/dashboard?range=30d     (7d | 30d | 90d | year; the buttons at the top of the design)

import { Request, Response } from "express";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { Subscriber } from "../models/Subscriber";
import { User } from "../models/User";
import { AppError } from "../utils/AppError";

const DAY = 24 * 60 * 60 * 1000;

// Each button: how many days it covers, and whether the chart shows one point per day or per month
const RANGES: Record<string, { days: number; per: "day" | "month" }> = {
  "7d": { days: 7, per: "day" },
  "30d": { days: 30, per: "day" },
  "90d": { days: 90, per: "day" },
  year: { days: 365, per: "month" },
};

// The shop is in Nigeria, so "a day" is a day in Lagos time (not the server's time, which may be UTC)
const TIME_ZONE = "Africa/Lagos";

// A date -> "2026-10-24" (day) or "2026-10" (month), in Lagos time. en-CA writes dates as YYYY-MM-DD.
const dateKey = (date: Date, per: "day" | "month") => {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(
    date,
  );
  return per === "day" ? day : day.slice(0, 7);
};

// "2026-10-24" -> "Oct 24", "2026-10" -> "Oct 2026" (the labels under the chart, written like the design)
const keyLabel = (key: string) => {
  const date = new Date(`${key.length === 7 ? `${key}-15` : key}T12:00:00Z`); // midday: never the wrong day
  return key.length === 7
    ? date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });
};

// "+14.2%" vs the previous period. null when there was nothing before (you can't grow from 0 by a %).
const percentChange = (now: number, before: number) =>
  before === 0 ? null : Math.round(((now - before) / before) * 1000) / 10;

// Orders placed between two dates, added up in one go.
// sales = money from orders that weren't cancelled ("Total Sales"); orders = every order placed ("Total Orders")
const totalsBetween = async (from: Date, to: Date) => {
  const [totals] = await Order.aggregate<{
    orders: number;
    keptOrders: number;
    sales: number;
    refunded: number;
  }>([
    { $match: { createdAt: { $gte: from, $lt: to } } },
    {
      $group: {
        _id: null, // one group for all of them
        orders: { $sum: 1 },
        keptOrders: {
          $sum: { $cond: [{ $ne: ["$status", "cancelled"] }, 1, 0] },
        },
        sales: {
          $sum: { $cond: [{ $ne: ["$status", "cancelled"] }, "$total", 0] },
        },
        refunded: {
          $sum: { $cond: [{ $eq: ["$payment.status", "refunded"] }, 1, 0] },
        },
      },
    },
  ]);
  return totals ?? { orders: 0, keptOrders: 0, sales: 0, refunded: 0 }; // no orders at all -> no group
};

// The products that need restocking: counted stock at or below their alert level (out of stock included)
const NEEDS_RESTOCK = {
  trackStock: true,
  $expr: { $lte: ["$stock", "$lowStockThreshold"] },
};

// GET /api/admin/dashboard
export const getDashboard = async (req: Request, res: Response) => {
  const rangeName =
    typeof req.query.range === "string" ? req.query.range : "30d";
  const range = RANGES[rangeName];
  if (!range) {
    throw new AppError(
      400,
      `Unknown range: ${rangeName}. Use one of: ${Object.keys(RANGES).join(", ")}.`,
    );
  }

  const now = new Date();
  const from = new Date(now.getTime() - range.days * DAY); // e.g. 30 days ago
  const previousFrom = new Date(from.getTime() - range.days * DAY); // the 30 days before that, for "vs. previous period"

  const [
    current,
    previous,
    chartRows,
    productCount,
    restockCount,
    lowStock,
    customerCount,
    newCustomers,
    subscribers,
    orderCount,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    totalsBetween(from, now),
    totalsBetween(previousFrom, from),

    // The chart: sales per day (or month) in Lagos time
    Order.aggregate<{ _id: string; sales: number; orders: number }>([
      {
        $match: {
          createdAt: { $gte: from, $lt: now },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              date: "$createdAt",
              format: range.per === "day" ? "%Y-%m-%d" : "%Y-%m",
              timezone: TIME_ZONE,
            },
          },
          sales: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
    ]),

    Product.countDocuments(), // "Catalog Products"
    Product.countDocuments(NEEDS_RESTOCK), // "4 Low Stock"
    Product.find(NEEDS_RESTOCK)
      .select("name sku stock lowStockThreshold images")
      .sort({ stock: 1, name: 1 })
      .limit(5)
      .lean(),

    User.countDocuments({ role: "customer" }), // "Total Customers"
    User.countDocuments({ role: "customer", createdAt: { $gte: from } }), // "+210 new"
    Subscriber.countDocuments({ isSubscribed: true }), // the newsletter (STEP 24)

    Order.countDocuments(), // "View All Orders (1,248)"
    Order.find()
      .select(
        "orderNumber contact total status payment.status payment.method createdAt",
      )
      .sort({ createdAt: -1, _id: -1 })
      .limit(5)
      .lean(),

    // "Top-Selling Products: by volume sold": one row per product from the order lines in this period
    Order.aggregate<{
      _id: unknown;
      name: string;
      image: string;
      sku: string;
      sold: number;
      revenue: number;
    }>([
      {
        $match: {
          createdAt: { $gte: from, $lt: now },
          status: { $ne: "cancelled" },
        },
      },
      { $unwind: "$items" }, // one row per order LINE instead of per order
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          image: { $first: "$items.image" },
          sku: { $first: "$items.sku" },
          sold: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.lineTotal" },
        },
      },
      { $sort: { sold: -1, revenue: -1 } },
      { $limit: 5 },
    ]),
  ]);

  // Every day (or month) of the range gets a point, even with no sales: the line must drop to 0, not skip it
  const byKey = new Map(chartRows.map((row) => [row._id, row]));
  const keys = new Set<string>();
  for (let time = from.getTime(); time <= now.getTime(); time += DAY) {
    keys.add(dateKey(new Date(time), range.per));
  }
  keys.add(dateKey(now, range.per));

  const chart = [...keys].map((key) => ({
    date: key,
    label: keyLabel(key),
    sales: byKey.get(key)?.sales ?? 0,
    orders: byKey.get(key)?.orders ?? 0,
  }));

  // "Oct 24 · Peak Sales ₦1,150,000" (null when nothing sold)
  const peak = chart.reduce<(typeof chart)[number] | null>(
    (best, point) =>
      point.sales > 0 && (!best || point.sales > best.sales) ? point : best,
    null,
  );

  res.json({
    range: rangeName,
    from,
    to: now,
    cards: {
      totalSales: current.sales,
      salesChange: percentChange(current.sales, previous.sales),
      totalOrders: current.orders,
      ordersChange: percentChange(current.orders, previous.orders),
      catalogProducts: productCount,
      needsRestock: restockCount,
      totalCustomers: customerCount,
      newCustomers,
      subscribers,
    },
    chart,
    peak,
    // The 3 small boxes next to the chart. (No "store conversion": we don't count website visits.)
    avgOrderValue:
      current.keptOrders === 0
        ? 0
        : Math.round(current.sales / current.keptOrders),
    refundRate:
      current.orders === 0
        ? 0
        : Math.round((current.refunded / current.orders) * 1000) / 10, // 0.8 = 0.8%
    recentOrders,
    totalOrdersAllTime: orderCount,
    topProducts: topProducts.map(({ _id, ...product }) => ({
      productId: _id,
      ...product,
    })),
    lowStock,
  });
};
