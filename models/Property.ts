import mongoose, { Document, Schema } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  description: string;
  agentId: mongoose.Types.ObjectId;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  rent: number;
  securityDeposit: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  images: string[];
  availabilityDate: Date;
  leaseTerm: string;
  amenities: {
    parking: boolean;
    laundry: boolean;
    petsAllowed: boolean;
    utilitiesIncluded: boolean;
    furnished: boolean;
    airConditioning: boolean;
    heating: boolean;
    internet: boolean;
  };
  status: 'available' | 'rented' | 'pending' | 'rejected';
  isApproved: boolean;
  views: number;
  messagesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<IProperty>({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  agentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
  },
  rent: { type: Number, required: true, min: 0 },
  securityDeposit: { type: Number, required: true, min: 0 },
  bedrooms: { type: Number, required: true, min: 0 },
  bathrooms: { type: Number, required: true, min: 0 },
  squareFeet: { type: Number, required: true, min: 0 },
  images: [{ type: String }],
  availabilityDate: { type: Date, required: true },
  leaseTerm: { type: String, required: true },
  amenities: {
    parking: { type: Boolean, default: false },
    laundry: { type: Boolean, default: false },
    petsAllowed: { type: Boolean, default: false },
    utilitiesIncluded: { type: Boolean, default: false },
    furnished: { type: Boolean, default: false },
    airConditioning: { type: Boolean, default: false },
    heating: { type: Boolean, default: false },
    internet: { type: Boolean, default: false },
  },
  status: {
    type: String,
    enum: ['available', 'rented', 'pending', 'rejected'],
    default: 'pending',
  },
  isApproved: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  messagesCount: { type: Number, default: 0 },
}, { timestamps: true });

propertySchema.index({ agentId: 1 });
propertySchema.index({ 'address.city': 1 });
propertySchema.index({ rent: 1 });
propertySchema.index({ bedrooms: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ isApproved: 1 });
propertySchema.index({ 'address.coordinates': '2dsphere' });

export default mongoose.models.Property || mongoose.model<IProperty>('Property', propertySchema);
