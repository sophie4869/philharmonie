import mongoose, { Model } from 'mongoose';

interface ProgramItem {
  title: string;
  composer?: string;
  details?: string;
  isIntermission?: boolean;
}

interface IConcert {
  id: string;
  title: string;
  description: string;
  location: string;
  image_url: string;
  booking_url: string;
  prices: number[];
  date: Date;
  category: string;
  program: ProgramItem[];
  musicians: { name: string; role?: string }[];
  status: 'available' | 'sold_out' | 'few_remaining';
}

const programItemSchema = new mongoose.Schema({
  title: String,
  composer: String,
  details: String,
  isIntermission: Boolean,
});

const concertSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  location: String,
  image_url: String,
  booking_url: String,
  prices: [Number],
  date: {
    type: Date,
    required: true,
  },
  category: String,
  program: [programItemSchema],
  musicians: [{
    name: String,
    role: String,
  }],
  status: {
    type: String,
    enum: ['available', 'sold_out', 'few_remaining'],
    default: 'available',
  },
});

export const Concert: Model<IConcert> = mongoose.models.Concert || mongoose.model<IConcert>('Concert', concertSchema); 