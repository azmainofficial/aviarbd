import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AbandonedCheckout from "@/models/AbandonedCheckout";

export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const records = await AbandonedCheckout.find({})
      .sort({ updatedAt: -1 })
      .lean();
    return NextResponse.json(records);
  } catch (error) {
    console.error("Abandoned fetch error:", error);
    return NextResponse.json({ message: "Failed to fetch" }, { status: 500 });
  }
}
