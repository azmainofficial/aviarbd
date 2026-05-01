import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AbandonedCheckout from "@/models/AbandonedCheckout";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params): Promise<NextResponse> {
  try {
    const { id } = await params;
    const { status } = await request.json() as { status: string };
    await connectDB();
    const record = await AbandonedCheckout.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    if (!record) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, status: record.status });
  } catch (error) {
    console.error("Abandoned patch error:", error);
    return NextResponse.json({ message: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params): Promise<NextResponse> {
  try {
    const { id } = await params;
    await connectDB();
    const record = await AbandonedCheckout.findByIdAndDelete(id);
    if (!record) return NextResponse.json({ message: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Abandoned delete error:", error);
    return NextResponse.json({ message: "Failed to delete" }, { status: 500 });
  }
}
