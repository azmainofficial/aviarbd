import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAbandonedItem {
  id?: string;
  name: string;
  price: number;
  qty: number;
  size?: string;
  color?: string;
  image?: string;
  category?: string;
}

export interface IAbandonedCheckout extends Document {
  sessionId: string;
  customer: {
    name?: string;
    email: string;
    address?: string;
    city?: string;
    country?: string;
    zip?: string;
  };
  items: IAbandonedItem[];
  total: number;
  source: "checkout" | "buy-now";
  status: "abandoned" | "contacted" | "recovered";
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IAbandonedItem>({
  id: String,
  name: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, default: 1 },
  size: String,
  color: String,
  image: String,
  category: String,
}, { _id: false });

const AbandonedCheckoutSchema = new Schema<IAbandonedCheckout>(
  {
    sessionId: { type: String, required: true, index: true },
    customer: {
      name: String,
      email: { type: String, required: true, index: true },
      address: String,
      city: String,
      country: String,
      zip: String,
    },
    items: [ItemSchema],
    total: { type: Number, default: 0 },
    source: { type: String, enum: ["checkout", "buy-now"], default: "checkout" },
    status: { type: String, enum: ["abandoned", "contacted", "recovered"], default: "abandoned" },
  },
  { timestamps: true }
);

const AbandonedCheckout: Model<IAbandonedCheckout> =
  (mongoose.models.AbandonedCheckout as Model<IAbandonedCheckout>) ||
  mongoose.model<IAbandonedCheckout>("AbandonedCheckout", AbandonedCheckoutSchema);

export default AbandonedCheckout;
