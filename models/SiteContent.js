import mongoose from 'mongoose';

// One document (key "main") holding everything the Admin Panel edits:
// site name, contact numbers and the whole category -> items tree.
// The tree is validated with Zod (lib/content-schema.js) before it is stored.
const SiteContentSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    site: { type: mongoose.Schema.Types.Mixed, default: {} },
    contact: { type: mongoose.Schema.Types.Mixed, default: {} },
    categories: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.models.SiteContent || mongoose.model('SiteContent', SiteContentSchema);
