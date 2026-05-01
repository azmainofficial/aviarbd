import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatConversation from "@/models/ChatConversation";

// GET: list all conversations — protected by middleware
export async function GET(): Promise<NextResponse> {
  try {
    await connectDB();
    const conversations = await ChatConversation.find()
      .sort({ lastMessageAt: -1 })
      .lean();
    return NextResponse.json({ conversations });
  } catch (err) {
    console.error("Admin chat list error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
