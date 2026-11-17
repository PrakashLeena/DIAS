import mongoose from 'mongoose';
import { LocalizedString, SeoSchema } from './shared.js';

export const PRICING_UNITS = ['per_item', 'per_day', 'per_event'];

const SpecSchema = new mongoose.Schema(
  {
    label: { type: LocalizedString({ max: 80 }), default: () => ({}) },
    value: { type: LocalizedString({ max: 200 }), default: () => ({}) },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: LocalizedString({ max: 160, requiredTa: true, requiredEn: true }), required: true },
    description: { type: LocalizedString({ max: 4000 }), default: () => ({}) },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 140 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: { type: [String], default: [] },
    rentalPrice: { type: Number, required: true, min: 0 },
    pricingUnit: { type: String, enum: PRICING_UNITS, default: 'per_item' },
    // Inventory
    totalQuantity: { type: Number, required: true, min: 0, default: 0 },
    blockedQuantity: { type: Number, min: 0, default: 0 }, // under repair / not rentable
    minOrderQuantity: { type: Number, min: 1, default: 1 },
    specifications: { type: [SpecSchema], default: [] },
    isAvailable: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true }
);

ProductSchema.index({ category: 1, isPublished: 1 });
ProductSchema.index({ isPublished: 1, isFeatured: 1 });
ProductSchema.index({ rentalPrice: 1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
