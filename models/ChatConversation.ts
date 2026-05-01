import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatConversation extends Document {
  sessionId: string;
  customerName: string;
  customerEmail: string;
  status: "open" | "closed";
  unreadByAdmin: number;
  unreadByCustomer: number;
  lastMessage: string;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatConversationSchema = new Schema<IChatConversation>(
  {
    sessionId: { type: String, required: true, unique: true },
    customerName: { type: String, default: "Guest" },
    customerEmail: { type: String, default: "" },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    unreadByAdmin: { type: Number, default: 0 },
    unreadByCustomer: { type: Number, default: 0 },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ChatConversation: Model<IChatConversation> =
  (mongoose.models.ChatConversation as Model<IChatConversation>) ||
  mongoose.model<IChatConversation>("ChatConversation", ChatConversationSchema);

export default ChatConversation;
