// app/api/admin/products/route.ts — Protected by middleware
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
    console.error("Admin products fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    await connectDB();
    const body = (await request.json()) as CreateProductBody;

    const baseSlug = body.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    let slug = baseSlug;
    let attempt = 0;
    while (await Product.exists({ slug })) {
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    const product = await Product.create({
      ...body,
      slug,
      originalPrice: body.originalPrice ?? undefined,
      badge: body.badge ?? undefined,
      section: body.section ?? undefined,
      images: body.images ?? [],
      stockCount: body.stockCount ?? 0,
      inStock: body.inStock ?? true,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Admin create product error:", error);
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 });
  }
}
