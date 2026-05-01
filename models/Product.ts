// models/Product.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import type { ProductBadge, ProductSection } from "@/lib/types";

export interface IProduct extends Document {
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  category: string;
  section?: ProductSection;
  badge?: ProductBadge;
  description?: string;
  sizes: string[];
  colors: string[];
  image?: string;
  images: string[];
  icon?: string;
  inStock: boolean;
  stockCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: { type: String, required: true },
    section: { type: String, enum: ["collection", "new_arrival", "sale"] },
    badge: { type: String, enum: ["new", "sale"] },
    description: { type: String },
    sizes: [{ type: String }],
    colors: [{ type: String }],
    image: { type: String },
    images: [{ type: String }],
    icon: { type: String },
    inStock: { type: Boolean, default: true },
    stockCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product: Model<IProduct> =
  (mongoose.models.Product as Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
