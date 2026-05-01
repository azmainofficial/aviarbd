import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatMessage from "@/models/ChatMessage";
import ChatConversation from "@/models/ChatConversation";
import mongoose from "mongoose";

type Ctx = { params: Promise<{ conversationId: string }> };

// GET: get conversation + all its messages — protected by middleware
export async function GET(_req: NextRequest, { params }: Ctx) {
  const { conversationId } = await params;
  if (!mongoose.Types.ObjectId.isValid(conversationId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await connectDB();

  const [conversation, messages] = await Promise.all([
    ChatConversation.findByIdAndUpdate(
      conversationId,
      { unreadByAdmin: 0 },
      { new: true }
    ).lean(),
    ChatMessage.find({ conversationId }).sort({ createdAt: 1 }).lean(),
  ]);

  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ conversation, messages });
}

// POST: admin sends a reply — protected by middleware
export async function POST(req: NextRequest, { params }: Ctx) {
  const { conversationId } = await params;
  if (!mongoose.Types.ObjectId.isValid(conversationId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  await connectDB();

  const msg = await ChatMessage.create({
    conversationId,
    content: content.trim(),
    sender: "admin",
  });

  await ChatConversation.findByIdAndUpdate(conversationId, {
    lastMessage: content.trim(),
    lastMessageAt: new Date(),
    $inc: { unreadByCustomer: 1 },
  });

  return NextResponse.json({ message: msg });
}

// PATCH: update conversation status (open/closed) — protected by middleware
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { conversationId } = await params;
  if (!mongoose.Types.ObjectId.isValid(conversationId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const { status } = await req.json();
  if (!["open", "closed"].includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  await connectDB();
  const conv = await ChatConversation.findByIdAndUpdate(
    conversationId,
    { status },
    { new: true }
  ).lean();

  return NextResponse.json({ conversation: conv });
}
