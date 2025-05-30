import mongoose, { Model } from 'mongoose';

interface IEmailPreferences {
  email: string;
  subscribedMusicians: { name: string; role?: string }[];
  digestFrequency: 'monthly' | 'quarterly' | 'yearly';
  lastDigestSent: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const emailPreferencesSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  subscribedMusicians: [{
    name: String,
    role: String,
  }],
  digestFrequency: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly',
  },
  lastDigestSent: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
emailPreferencesSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const EmailPreferences: Model<IEmailPreferences> = mongoose.models.EmailPreferences || mongoose.model<IEmailPreferences>('EmailPreferences', emailPreferencesSchema); 