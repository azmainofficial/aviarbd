import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  content: string;
  sender: "customer" | "admin";
  createdAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "ChatConversation", required: true, index: true },
    content: { type: String, required: true },
    sender: { type: String, enum: ["customer", "admin"], required: true },
  },
  { timestamps: true }
);

const ChatMessage: Model<IChatMessage> =
  (mongoose.models.ChatMessage as Model<IChatMessage>) ||
  mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);

export default ChatMessage;
