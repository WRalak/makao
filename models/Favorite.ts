import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorite extends Document {
  tenantId: mongoose.Types.ObjectId;
  propertyId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

favoriteSchema.index({ tenantId: 1, propertyId: 1 }, { unique: true });
favoriteSchema.index({ tenantId: 1 });

export default mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', favoriteSchema);
