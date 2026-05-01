import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_: Request, { params }: Params): Promise<NextResponse> {
  try {
    const { slug } = await params;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ message: "Invalid slug" }, { status: 400 });
    }

    await connectDB();
    const product = await Product.findOne({ slug: slug.toLowerCase().trim() }).lean();
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch product" }, { status: 500 });
  }
}
