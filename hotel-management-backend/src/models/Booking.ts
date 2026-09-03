import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  bookingNumber: string;
  guestId: mongoose.Types.ObjectId;
  guestName?: string;
  guestEmail?: string;
  hotelId: mongoose.Types.ObjectId;
  hotelName?: string;
  hotelCity?: string;
  roomTypeId: mongoose.Types.ObjectId;
  roomTypeName?: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  rooms: number;
  nights: number;
  basePrice: number;
  adjustedPrice: number;
  multiplier: number;
  seasonName: string;
  subtotal: number;
  taxes: number;
  totalAmount: number;
  status: 'reserved' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  checkinTime?: Date;
  checkoutTime?: Date;
  specialRequests?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundStatus: 'processed' | 'pending' | 'none';
}

const BookingSchema = new Schema(
  {
    bookingNumber: { type: String, required: true, unique: true },
    guestId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    guestName: { type: String },
    guestEmail: { type: String },
    hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    hotelName: { type: String },
    hotelCity: { type: String },
    roomTypeId: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
    roomTypeName: { type: String },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true },
    rooms: { type: Number, required: true },
    nights: { type: Number, required: true },
    basePrice: { type: Number, required: true },
    adjustedPrice: { type: Number, required: true },
    multiplier: { type: Number, required: true },
    seasonName: { type: String, required: true },
    subtotal: { type: Number, required: true },
    taxes: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['reserved', 'confirmed', 'checked-in', 'checked-out', 'cancelled'], 
      default: 'reserved' 
    },
    checkinTime: { type: Date },
    checkoutTime: { type: Date },
    specialRequests: { type: String },
    cancellationReason: { type: String },
    refundAmount: { type: Number },
    refundStatus: { 
      type: String, 
      enum: ['processed', 'pending', 'none'], 
      default: 'none' 
    },
  },
  { timestamps: true }
);

BookingSchema.index({ hotelId: 1 });
BookingSchema.index({ checkIn: 1 });
BookingSchema.index({ checkOut: 1 });

export const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
