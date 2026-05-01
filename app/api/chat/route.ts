import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatConversation from "@/models/ChatConversation";

// GET: fetch existing conversation by sessionId
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

  await connectDB();
  const conv = await ChatConversation.findOne({ sessionId }).lean();
  if (!conv) return NextResponse.json({ conversation: null });
  return NextResponse.json({ conversation: conv });
}

// POST: create or return existing conversation by sessionId
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, customerName, customerEmail } = body;
    if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

    await connectDB();

    let conv = await ChatConversation.findOne({ sessionId }).lean();
    if (!conv) {
      const created = await ChatConversation.create({
        sessionId,
        customerName: customerName || "Guest",
        customerEmail: customerEmail || "",
      });
      conv = created.toObject();
    }

    return NextResponse.json({ conversation: conv });
  } catch (err) {
    console.error("Chat POST error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
