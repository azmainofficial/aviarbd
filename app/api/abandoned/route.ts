import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AbandonedCheckout from "@/models/AbandonedCheckout";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json() as {
      sessionId?: string;
      customer?: { name?: string; email?: string; address?: string; city?: string; country?: string; zip?: string };
      items?: { id?: string; name: string; price: number; qty: number; size?: string; color?: string; image?: string; category?: string }[];
      total?: number;
      source?: "checkout" | "buy-now";
    };

    const email = body.customer?.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Valid email required" }, { status: 400 });
    }

    const sessionId = body.sessionId ?? email;

    await connectDB();

    // Upsert — update if session already exists, otherwise create
    await AbandonedCheckout.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          sessionId,
          customer: { ...body.customer, email },
          items: body.items ?? [],
          total: body.total ?? 0,
          source: body.source ?? "checkout",
          status: "abandoned",
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Abandoned checkout save error:", error);
    return NextResponse.json({ message: "Failed to save" }, { status: 500 });
  }
}
