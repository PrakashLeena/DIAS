import mongoose from 'mongoose';
import { LocalizedString } from './shared.js';

export const ORDER_STATUSES = ['pending', 'accepted', 'cancelled', 'completed'];
export const ORDER_TYPES = ['package', 'individual', 'custom', 'mixed'];
// Only accepted orders hold inventory. Pending = request only; completed = items
// returned; cancelled = released.
export const RESERVING_STATUSES = ['accepted'];

const ComponentSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: LocalizedString({ max: 160 }), default: () => ({}) },
    quantity: Number,
  },
  { _id: false }
);

const OrderItemSchema = new mongoose.Schema(
  {
    itemType: { type: String, enum: ['product', 'package'], required: true },
    refId: { type: mongoose.Schema.Types.ObjectId, required: true },
    slug: String,
    name: { type: LocalizedString({ max: 160 }), default: () => ({}) },
    image: String,
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    pricingUnit: String,
    rentalDays: Number,
    lineTotal: { type: Number, required: true, min: 0 },
    components: { type: [ComponentSchema], default: [] }, // package contents snapshot
  },
  { _id: false }
);

const InventoryLineSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const HistorySchema = new mongoose.Schema(
  { status: String, at: { type: Date, default: Date.now }, note: String },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customer: {
      fullName: { type: String, required: true, trim: true, maxlength: 120 },
      phone: { type: String, required: true, trim: true, maxlength: 20 },
      email: { type: String, trim: true, lowercase: true, maxlength: 160, default: '' },
      address: { type: String, required: true, trim: true, maxlength: 500 },
      city: { type: String, required: true, trim: true, maxlength: 120 },
      locationReference: { type: String, required: true, trim: true, maxlength: 300 },
    },
    event: {
      eventType: { type: String, required: true, maxlength: 60 },
      eventDate: { type: Date, required: true },
      rentalStartDate: { type: Date, required: true },
      rentalEndDate: { type: Date, required: true },
      venue: { type: String, required: true, trim: true, maxlength: 500 },
      instructions: { type: String, trim: true, maxlength: 1500, default: '' },
    },
    orderItems: { type: [OrderItemSchema], validate: (v) => Array.isArray(v) && v.length > 0 },
    inventoryLines: { type: [InventoryLineSchema], default: [] },
    orderType: { type: String, enum: ORDER_TYPES, required: true },
    rentalDays: { type: Number, default: 1 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'LKR' },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    statusHistory: { type: [HistorySchema], default: [] },
    adminMessage: { type: String, trim: true, maxlength: 1000, default: '' },
    internalNotes: { type: String, trim: true, maxlength: 4000, default: '' },
    language: { type: String, enum: ['ta', 'en'], default: 'ta' },
  },
  { timestamps: true }
);

OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ 'event.eventDate': 1 });
OrderSchema.index({ status: 1, 'event.rentalStartDate': 1, 'event.rentalEndDate': 1 });
OrderSchema.index({ 'inventoryLines.product': 1, status: 1 });
OrderSchema.index({ 'customer.phone': 1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
