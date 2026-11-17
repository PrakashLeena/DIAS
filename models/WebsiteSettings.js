import mongoose from 'mongoose';

// Customer reviews live in the existing `websitesettings` document (key "main").
const ReviewSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 80 },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  // Reviews written through the site form use `message`; older seeded reviews use the bilingual `quote`.
  message: { type: String, default: '', maxlength: 600 },
  quote: { ta: { type: String, default: '' }, en: { type: String, default: '' } },
  event: { ta: { type: String, default: '' }, en: { type: String, default: '' } },
  createdAt: { type: Date, default: Date.now },
});

const WebsiteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    testimonials: { type: [ReviewSchema], default: [] },
  },
  { timestamps: true, strict: false }
);

export default mongoose.models.WebsiteSettings || mongoose.model('WebsiteSettings', WebsiteSettingsSchema);
