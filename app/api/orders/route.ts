import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";
import mongoose from "mongoose";
import type { CreateOrderBody } from "@/lib/types";

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json()) as CreateOrderBody;

    // Basic input validation
    if (!body.customer?.email) {
      return NextResponse.json({ message: "Customer email is required" }, { status: 400 });
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ message: "Order must contain at least one item" }, { status: 400 });
    }
    if (typeof body.total !== "number" || body.total <= 0) {
      return NextResponse.json({ message: "Invalid order total" }, { status: 400 });
    }

    // Sanitize and validate email
    const email = String(body.customer.email).slice(0, 254).toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Invalid email address" }, { status: 400 });
    }
    const resolvedName = String(
      body.customer.name ??
      `${body.customer.firstName ?? ""} ${body.customer.lastName ?? ""}`.trim()
    ).slice(0, 200);

    await connectDB();

    // Only check stock for items whose id is a real MongoDB ObjectId
    const validProductIds = body.items
      .map((i) => i.id)
      .filter((id): id is string => !!id && mongoose.Types.ObjectId.isValid(id));

    if (validProductIds.length > 0) {
      const dbProducts = await Product.find({ _id: { $in: validProductIds } }).lean();
      for (const item of body.items) {
        if (!item.id || !mongoose.Types.ObjectId.isValid(item.id)) continue;
        const dbProduct = dbProducts.find((p) => String(p._id) === item.id);
        if (dbProduct && dbProduct.stockCount !== undefined && dbProduct.stockCount < (item.qty ?? 1)) {
          return NextResponse.json(
            { message: `"${item.name}" is out of stock or has insufficient quantity` },
            { status: 400 }
          );
        }
      }
    }

    // Map cart items to order schema shape (id → productId) so Mongoose
    // doesn't try to cast non-ObjectId strings into subdocument _id fields
    const orderItems = body.items.map(({ id, name, price, qty, size, color, image, category }) => ({
      productId: mongoose.Types.ObjectId.isValid(id ?? "") ? id : undefined,
      name,
      price,
      qty,
      size,
      color,
      image,
      category,
    }));

    const orderNumber = "AV" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const order = await Order.create({
      customer: { ...body.customer, email, name: resolvedName },
      items: orderItems,
      total: body.total,
      paymentMethod: body.paymentMethod,
      paymentIntentId: body.paymentIntentId,
      status: body.status,
      orderNumber,
    });

    // Decrement stock counts (non-fatal — order already committed)
    for (const item of body.items) {
      if (!item.id || !mongoose.Types.ObjectId.isValid(item.id)) continue;
      await Product.findByIdAndUpdate(item.id, {
        $inc: { stockCount: -(item.qty ?? 1) },
      }).catch(() => null);
    }

    return NextResponse.json({ order, orderNumber }, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ message: "Failed to create order. Please try again." }, { status: 500 });
  }
}
