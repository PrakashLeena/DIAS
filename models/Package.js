import mongoose from 'mongoose';
import { LocalizedString, SeoSchema } from './shared.js';

export const PACKAGE_CATEGORIES = ['wedding', 'engagement', 'birthday', 'religious', 'corporate', 'other'];

const PackageItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const PackageSchema = new mongoose.Schema(
  {
    name: { type: LocalizedString({ max: 160, requiredTa: true, requiredEn: true }), required: true },
    shortDescription: { type: LocalizedString({ max: 300 }), default: () => ({}) },
    description: { type: LocalizedString({ max: 5000 }), default: () => ({}) },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 140 },
    category: { type: String, enum: PACKAGE_CATEGORIES, default: 'wedding' },
    coverImage: { type: String, default: '' },
    gallery: { type: [String], default: [] },
    items: { type: [PackageItemSchema], default: [] },
    // Configured independently of the individual product prices.
    packagePrice: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true },
    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    seo: { type: SeoSchema, default: () => ({}) },
  },
  { timestamps: true }
);

PackageSchema.index({ isPublished: 1, isFeatured: 1, sortOrder: 1 });
PackageSchema.index({ category: 1 });
PackageSchema.index({ 'items.product': 1 });

export default mongoose.models.Package || mongoose.model('Package', PackageSchema);
