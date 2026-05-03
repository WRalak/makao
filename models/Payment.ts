import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  agentId: mongoose.Types.ObjectId;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  subscriptionId?: string;
  plan: 'basic' | 'pro';
  commissionAmount: number;
  commissionRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  agentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  stripePaymentIntentId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending',
  },
  subscriptionId: String,
  plan: { type: String, enum: ['basic', 'pro'], required: true },
  commissionAmount: { type: Number, required: true },
  commissionRate: { type: Number, default: 0.2 },
}, { timestamps: true });

paymentSchema.index({ agentId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', paymentSchema);
