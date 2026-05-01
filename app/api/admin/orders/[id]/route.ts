// app/api/admin/orders/[id]/route.ts — Protected by middleware
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import type { OrderStatus } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { status } = (await request.json()) as { status: OrderStatus };
    await connectDB();
    const order = await Order.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    if (!order) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ message: "Failed to update order" }, { status: 500 });
  }
}
