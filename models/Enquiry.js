import mongoose from 'mongoose';

// Consultation requests from the homepage "Book your date" form.
export const ENQUIRY_STATUSES = ['new', 'contacted', 'closed'];

const EnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    eventDate: { type: Date, required: true },
    eventType: { type: String, maxlength: 40, default: 'wedding' },
    venue: { type: String, trim: true, maxlength: 500, default: '' },
    guests: { type: Number, min: 0, max: 100000 },
    notes: { type: String, trim: true, maxlength: 1500, default: '' },
    flora: { type: String, maxlength: 20, default: '' },
    language: { type: String, enum: ['ta', 'en'], default: 'ta' },
    status: { type: String, enum: ENQUIRY_STATUSES, default: 'new' },
  },
  { timestamps: true }
);

EnquirySchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Enquiry || mongoose.model('Enquiry', EnquirySchema);
