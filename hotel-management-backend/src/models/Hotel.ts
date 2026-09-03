import mongoose, { Schema, Document } from 'mongoose';

export interface IHotel extends Document {
  name: string;
  city: string;
  address: string;
  rating?: number;
  amenities?: string[];
  phone?: string;
  email?: string;
  description?: string;
}

const HotelSchema = new Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    amenities: [{ type: String }],
    phone: { type: String },
    email: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

HotelSchema.index({ city: 1 });

export const Hotel = mongoose.models.Hotel || mongoose.model<IHotel>('Hotel', HotelSchema);
