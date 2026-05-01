// app/api/admin/dashboard/route.ts — Protected by middleware
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();

    const [orders, products] = await Promise.all([
      Order.find({}).sort({ createdAt: -1 }).lean(),
      Product.find({}).sort({ createdAt: -1 }).lean(),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newCustomerEmails = new Set(
      orders
        .filter((o) => new Date(o.createdAt) >= startOfMonth)
        .map((o) => o.customer?.email)
        .filter(Boolean)
    );
    const newCustomers = newCustomerEmails.size;

    const recentOrders = orders.slice(0, 5);
    const lowStock = products.filter((p) => p.stockCount !== undefined && p.stockCount < 5);

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalProducts,
      newCustomers,
      recentOrders,
      lowStock,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ message: "Failed to load dashboard" }, { status: 500 });
  }
}
