// app/api/admin/products/[id]/route.ts — Protected by middleware
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import type { CreateProductBody } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params): Promise<NextResponse> {
  try {
    const { id } = await params;
    await connectDB();
    const product = await Product.findById(id);
    if (!product) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params): Promise<NextResponse> {
  try {
    const { id } = await params;
    await connectDB();
    const body = (await request.json()) as Partial<CreateProductBody>;
    const product = await Product.findByIdAndUpdate(id, { $set: body }, { new: true });
    if (!product) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params): Promise<NextResponse> {
  try {
    const { id } = await params;
    await connectDB();
    const product = await Product.findByIdAndDelete(id);
    if (!product) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 });
  }
}
