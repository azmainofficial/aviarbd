import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatMessage from "@/models/ChatMessage";
import ChatConversation from "@/models/ChatConversation";
import mongoose from "mongoose";

// GET: poll for messages in a conversation (customer side)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  if (!mongoose.Types.ObjectId.isValid(conversationId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  await connectDB();

  // Reset unread count for customer
  await ChatConversation.findByIdAndUpdate(conversationId, { unreadByCustomer: 0 });

  const messages = await ChatMessage.find({ conversationId })
    .sort({ createdAt: 1 })
    .lean();

  return NextResponse.json({ messages });
}

// POST: customer sends a message
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  const { conversationId } = await params;
  if (!mongoose.Types.ObjectId.isValid(conversationId))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 });

  await connectDB();

  const msg = await ChatMessage.create({
    conversationId,
    content: content.trim(),
    sender: "customer",
  });

  await ChatConversation.findByIdAndUpdate(conversationId, {
    lastMessage: content.trim(),
    lastMessageAt: new Date(),
    $inc: { unreadByAdmin: 1 },
    status: "open",
  });

  return NextResponse.json({ message: msg });
}
