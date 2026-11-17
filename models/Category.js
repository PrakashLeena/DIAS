import mongoose from 'mongoose';
import { LocalizedString } from './shared.js';

const CategorySchema = new mongoose.Schema(
  {
    name: { type: LocalizedString({ max: 120, requiredTa: true, requiredEn: true }), required: true },
    description: { type: LocalizedString({ max: 600 }), default: () => ({}) },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 },
    image: { type: String, default: '' },
    icon: { type: String, default: 'sparkles', maxlength: 40 },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CategorySchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
