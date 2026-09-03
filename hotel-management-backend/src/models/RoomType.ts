import mongoose, { Schema, Document } from 'mongoose';

export interface IRoomType extends Document {
  hotelId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  basePrice: number;
  totalRooms: number;
  capacity: number;
  amenities?: string[];
}

const RoomTypeSchema = new Schema(
  {
    hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    basePrice: { type: Number, required: true },
    totalRooms: { type: Number, required: true },
    capacity: { type: Number, required: true },
    amenities: [{ type: String }],
  },
  { timestamps: true }
);

export const RoomType = mongoose.models.RoomType || mongoose.model<IRoomType>('RoomType', RoomTypeSchema);
