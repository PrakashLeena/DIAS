import mongoose from 'mongoose';
import { LocalizedString } from './shared.js';

const L = (max) => ({ type: LocalizedString({ max }), default: () => ({}) });

const GalleryItemSchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: L(160),
  category: { type: String, default: 'stage', maxlength: 40 },
});

const TestimonialSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 80 },
  event: L(120),
  quote: L(600),
  rating: { type: Number, min: 1, max: 5, default: 5 },
});

const WebsiteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    companyName: L(120),
    tagline: L(200),
    logo: { type: String, default: '' },
    phone: { type: String, default: '', maxlength: 30 },
    whatsapp: { type: String, default: '', maxlength: 30 },
    email: { type: String, default: '', maxlength: 160 },
    address: L(400),
    businessHours: L(160),
    mapEmbedUrl: { type: String, default: '', maxlength: 1500 },
    mapLink: { type: String, default: '', maxlength: 600 },
    social: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
      tiktok: { type: String, default: '' },
    },
    currency: { code: { type: String, default: 'LKR' }, symbol: { type: String, default: 'Rs.' } },
    phoneCountryCode: { type: String, default: '94', maxlength: 4 },
    hero: {
      heading: L(200),
      subheading: L(500),
      videoUrl: { type: String, default: '/videos/hero.mp4' },
      posterUrl: { type: String, default: '/images/lighting/lighting-04.webp' },
    },
    about: { title: L(200), body: L(5000), image: { type: String, default: '' } },
    gallery: { type: [GalleryItemSchema], default: [] },
    testimonials: { type: [TestimonialSchema], default: [] },
    // Admin → 3D Design: names, visibility and colour options of the homepage 3D stage (see lib/stage-design.js).
    stageDesign: { type: mongoose.Schema.Types.Mixed, default: undefined },
    seo: {
      siteTitle: L(120),
      metaDescription: L(320),
      keywords: L(1000),
      ogImage: { type: String, default: '' },
      googleVerification: { type: String, default: '', maxlength: 120 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.WebsiteSettings || mongoose.model('WebsiteSettings', WebsiteSettingsSchema);
