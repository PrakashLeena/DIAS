import mongoose from 'mongoose';

// Bilingual text field stored as { ta, en }.
export const LocalizedString = (opts = {}) =>
  new mongoose.Schema(
    {
      ta: { type: String, trim: true, default: '', maxlength: opts.max || 5000, required: !!opts.requiredTa },
      en: { type: String, trim: true, default: '', maxlength: opts.max || 5000, required: !!opts.requiredEn },
    },
    { _id: false }
  );

export const SeoSchema = new mongoose.Schema(
  {
    title: { type: LocalizedString({ max: 120 }), default: () => ({}) },
    description: { type: LocalizedString({ max: 320 }), default: () => ({}) },
  },
  { _id: false }
);
