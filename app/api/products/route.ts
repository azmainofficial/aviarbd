// app/api/products/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import type { CreateProductBody } from "@/lib/types";

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    await connectDB();
    const body = (await request.json()) as CreateProductBody;
    const slug = body.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const product = await Product.create({
      ...body,
      slug,
      originalPrice: body.originalPrice ?? undefined,
      badge: body.badge ?? undefined,
      section: body.section ?? undefined,
      images: body.images ?? [],
      stockCount: body.stockCount ?? 0,
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Failed to create product" },
      { status: 500 }
    );
  }
}
