// app/api/admin/orders/route.ts — Protected by middleware
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Admin orders fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
  }
}
