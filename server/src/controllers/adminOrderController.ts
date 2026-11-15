// adminOrderController.ts server/src/controllers/adminOrderController.ts
// The admin's Orders Management page: every customer's orders, and moving an order along
// processing -> shipped -> delivered (or cancelling it).

// STEP 26 (part 1): Admin orders
// GET   /api/admin/orders                      ?status=processing&search=ada&payment=paid&courier=GIG Logistics&days=30&page=1
// GET   /api/admin/orders/:orderNumber         -> one order with its customer
// PATCH /api/admin/orders/:orderNumber/status  { "status": "shipped", "courier": "GIG Logistics", "waybill"?: "..." }
//                                              { "status": "delivered" }
//                                              { "status": "cancelled", "reason": "Out of stock" }

import { randomInt } from "crypto";
import { Request, Response } from "express";
import { env } from "../config/env";
import { IOrder, Order, ORDER_STATUSES, OrderStatus } from "../models/Order";
import { PromoCode } from "../models/PromoCode";
import { AppError } from "../utils/AppError";
import { escapeRegex } from "../utils/escapeRegex";
import { naira } from "../utils/promo";
import { sendEmail } from "../utils/sendEmail";
import { releaseStock } from "./orderController";
import { wholeNumber } from "./productController";

// The courier partners from the design, with the start of their waybill numbers ("GIG-882012")
export const COURIERS: Record<string, string> = {
  "QuickCart Express": "QCX",
  "GIG Logistics": "GIG",
  "DHL Express": "DHL",
};

// Where an order may go next. Anything not listed is refused (e.g. delivered -> processing).
const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"], // cancelled while shipped = the courier brought it back
  delivered: [],
  cancelled: [],
};

const text = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

// "QC-1042", "qc-1042", "#QC-1042" or "1042" -> "QC-1042"
const toOrderNumber = (value: string) => {
  const cleaned = value.trim().toUpperCase().replace(/^#/, "");
  return /^\d+$/.test(cleaned) ? `QC-${cleaned}` : cleaned;
};

const findOrder = async (orderNumber: string) => {
  const order = await Order.findOne({
    orderNumber: toOrderNumber(orderNumber),
  });
  if (!order) {
    throw new AppError(404, "Order not found");
  }
  return order;
};

// ---- The orders table ----------------------------------------------------------------------

// The columns: order number, waybill, customer, date, address, items, total, payment, status
const TABLE_FIELDS =
  "orderNumber waybill courier contact shippingAddress.city shippingAddress.state items.name items.image items.quantity total payment.method payment.status payment.cardBrand status createdAt";

// GET /api/admin/orders
export const getAdminOrders = async (req: Request, res: Response) => {
  const conditions: Record<string, unknown>[] = [];

  // The tabs: All Orders / Processing / Shipped / Delivered / Cancelled
  const status = text(req.query.status) || "all";
  if (status !== "all") {
    if (!ORDER_STATUSES.includes(status as OrderStatus)) {
      throw new AppError(
        400,
        `Unknown status: ${status}. Use all, ${ORDER_STATUSES.join(", ")}.`,
      );
    }
    conditions.push({ status });
  }

  // "Search by Order ID, customer name, email, or waybill"
  const search = text(req.query.search).replace(/^#/, "");
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    conditions.push({
      $or: [
        { orderNumber: pattern },
        { waybill: pattern },
        { "contact.email": pattern },
        // "Ada Obi": first name + " " + last name joined together, then searched
        {
          $expr: {
            $regexMatch: {
              input: {
                $concat: ["$contact.firstName", " ", "$contact.lastName"],
              },
              regex: escapeRegex(search),
              options: "i",
            },
          },
        },
      ],
    });
  }

  // "Payment: All" dropdown: paid / pending / refunded
  const payment = text(req.query.payment);
  if (payment) {
    conditions.push({ "payment.status": payment });
  }

  // "Courier: All" dropdown
  const courier = text(req.query.courier);
  if (courier) {
    conditions.push({ courier });
  }

  // "Date: Last 30 Days": ?days=30 (no days = all time)
  const days = wholeNumber(req.query.days, 0);
  if (days > 0) {
    conditions.push({
      createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
    });
  }

  const filter = conditions.length > 0 ? { $and: conditions } : {};
  const limit = Math.min(wholeNumber(req.query.limit, 10), 100); // "Showing 1 - 10 of 1,248 orders"
  const page = wholeNumber(req.query.page, 1);

  const [orders, total, groups] = await Promise.all([
    Order.find(filter)
      .select(TABLE_FIELDS)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
    // The 5 cards at the top: how many orders, and how much money, in each status (all orders, no filters)
    Order.aggregate<{ _id: OrderStatus; count: number; amount: number }>([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          amount: { $sum: "$total" },
        },
      },
    ]),
  ]);

  const counts = {
    all: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
  let sales = 0; // "₦18,420,500 GMV": everything ordered, except cancelled orders
  let refunded = 0; // "₦214K reimbursed"
  for (const group of groups) {
    counts[group._id] = group.count;
    counts.all += group.count;
    if (group._id === "cancelled") {
      refunded = group.amount;
    } else {
      sales += group.amount;
    }
  }

  res.json({
    orders,
    total,
    page,
    pages: Math.ceil(total / limit),
    counts,
    sales,
    refunded,
    couriers: Object.keys(COURIERS), // for the "Courier" dropdowns
  });
};

// GET /api/admin/orders/:orderNumber
export const getAdminOrder = async (
  req: Request<{ orderNumber: string }>,
  res: Response,
) => {
  const order = await findOrder(req.params.orderNumber);
  await order.populate("user", "firstName lastName email phone createdAt"); // the customer's account

  res.json({
    order,
    nextStatuses: NEXT_STATUS[order.status],
    couriers: Object.keys(COURIERS),
  });
};

// ---- Moving an order along -------------------------------------------------------------------

// The email the customer gets for each change
const statusEmail = (order: IOrder) => {
  const hi = `Hi ${order.contact.firstName},`;
  const track = `Track your order: ${env.clientUrl}/account/orders/${order.orderNumber}`;

  if (order.status === "shipped") {
    return {
      subject: `Order #${order.orderNumber} is on its way 🚚`,
      text: [
        hi,
        "",
        `Your order has left our warehouse with ${order.courier}.`,
        `Waybill number: ${order.waybill}`,
        "",
        track,
        "",
        "The QuickCart team",
      ],
    };
  }
  if (order.status === "delivered") {
    return {
      subject: `Order #${order.orderNumber} has been delivered`,
      text: [
        hi,
        "",
        "Your order has been delivered. We hope you love it!",
        "",
        `Tell other shoppers what you think: ${env.clientUrl}/account/orders/${order.orderNumber}`,
        "",
        "The QuickCart team",
      ],
    };
  }
  return {
    subject: `Order #${order.orderNumber} cancelled`,
    text: [
      hi,
      "",
      `We're sorry: we had to cancel your order #${order.orderNumber}.`,
      ...(order.cancelReason ? [`Reason: ${order.cancelReason}`] : []), // the line is left out when there is no reason
      order.payment.status === "refunded"
        ? `Your payment of ${naira(order.total)} will be refunded to your ${order.payment.cardBrand} card ending in ${order.payment.cardLast4}.`
        : "You have not been charged.",
      "",
      "The QuickCart team",
    ],
  };
};

// PATCH /api/admin/orders/:orderNumber/status
export const updateOrderStatus = async (
  req: Request<{ orderNumber: string }>,
  res: Response,
) => {
  const order = await findOrder(req.params.orderNumber);
  const next = text(req.body?.status) as OrderStatus;

  if (!ORDER_STATUSES.includes(next)) {
    throw new AppError(
      400,
      `Please choose the new status: ${ORDER_STATUSES.join(", ")}.`,
    );
  }
  if (!NEXT_STATUS[order.status].includes(next)) {
    throw new AppError(
      400,
      `A ${order.status} order can't be marked as ${next}.`,
    );
  }

  const now = new Date();
  const set: Record<string, unknown> = { status: next };
  let note: string;

  if (next === "shipped") {
    const courier = text(req.body?.courier);
    if (!COURIERS[courier]) {
      throw new AppError(
        400,
        `Please choose a courier: ${Object.keys(COURIERS).join(", ")}.`,
      );
    }
    // No waybill typed? Make one like the design: "GIG-882012"
    const waybill =
      text(req.body?.waybill).toUpperCase() ||
      `${COURIERS[courier]}-${randomInt(100000, 1000000)}`;
    set.courier = courier;
    set.waybill = waybill;
    note = `Dispatched with ${courier} (waybill ${waybill})`;
  } else if (next === "delivered") {
    set.deliveredAt = now;
    // Pay on delivery: the customer paid the rider, so the payment is now "paid"
    if (order.payment.status === "pending") {
      set["payment.status"] = "paid";
      set["payment.paidAt"] = now;
    }
    note = "Delivered";
  } else {
    set.cancelledAt = now;
    const reason = text(req.body?.reason);
    if (reason) {
      set.cancelReason = reason;
    }
    if (order.payment.status === "paid") {
      set["payment.status"] = "refunded";
    }
    note =
      order.status === "shipped"
        ? "Returned by the courier and cancelled by QuickCart"
        : "Cancelled by QuickCart";
  }

  // Change it ONLY if it still has the status we checked. Two admins clicking at the same moment
  // (or an admin and the customer's own Cancel button) can't both win, so stock is never given back twice.
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: order.status },
    { $set: set, $push: { statusHistory: { status: next, note, at: now } } },
    { returnDocument: "after", runValidators: true },
  );

  if (!updated) {
    throw new AppError(
      409,
      "This order was just changed by someone else. Please refresh and try again.",
    );
  }

  // Cancelled: the items go back on the shelf and the promo code use is given back (like STEP 22's cancel)
  if (next === "cancelled") {
    await releaseStock(updated.items);
    if (updated.promoCode) {
      await PromoCode.updateOne(
        { code: updated.promoCode },
        { $inc: { usedCount: -1 } },
      );
    }
  }

  const email = statusEmail(updated);
  void sendEmail(updated.contact.email, email.subject, email.text.join("\n"));

  res.json({
    message: `Order #${updated.orderNumber} is now ${next}.`,
    order: updated,
    nextStatuses: NEXT_STATUS[updated.status],
  });
};
