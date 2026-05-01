import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

// GET /api/orders/track?orderNumber=AVxxxxxx&email=foo@bar.com
// Public endpoint — but requires BOTH fields to match, so order numbers
// can't be enumerated by ID alone.
export async function GET(req: NextRequest) {
  try {
    const orderNumber = req.nextUrl.searchParams.get("orderNumber")?.trim().toUpperCase();
    const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase();

    if (!orderNumber || !email) {
      return NextResponse.json({ error: "Order number and email are required" }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findOne({
      orderNumber,
      "customer.email": email,
    }).lean();

    if (!order) {
      return NextResponse.json({ error: "No order found with those details" }, { status: 404 });
    }

    // Return only the fields a customer should see
    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        paymentMethod: order.paymentMethod,
        items: order.items,
        customer: {
          name: order.customer?.name,
          email: order.customer?.email,
          city: order.customer?.city,
          country: order.customer?.country,
        },
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    });
  } catch (err) {
    console.error("Track order error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
