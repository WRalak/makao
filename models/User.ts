import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'agent' | 'tenant';
  avatar?: string;
  phone?: string;
  isActive: boolean;
  isBanned: boolean;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLoginAt?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  provider: 'email' | 'google' | 'facebook' | 'apple';
  providerId?: string;
  rememberMeToken?: string;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  stripeCustomerId?: string;
  subscription?: {
    plan: 'basic' | 'pro';
    status: 'active' | 'cancelled' | 'past_due';
    currentPeriodEnd: Date;
    propertyLimit: number;
    propertyCount: number;
    trialEndsAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'agent', 'tenant'], default: 'tenant' },
  avatar: String,
  phone: String,
  isActive: { type: Boolean, default: true },
  isBanned: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLoginAt: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  provider: { type: String, enum: ['email', 'google', 'facebook', 'apple'], default: 'email' },
  providerId: String,
  rememberMeToken: String,
  twoFactorSecret: String,
  twoFactorEnabled: { type: Boolean, default: false },
  stripeCustomerId: String,
  subscription: {
    plan: { type: String, enum: ['basic', 'pro'] },
    status: { type: String, enum: ['active', 'cancelled', 'past_due'] },
    currentPeriodEnd: Date,
    propertyLimit: Number,
    propertyCount: { type: Number, default: 0 },
    trialEndsAt: Date,
  },
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ provider: 1 });
userSchema.index({ providerId: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
