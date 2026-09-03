import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomTypeId: mongoose.Types.ObjectId;
  hotelId: mongoose.Types.ObjectId;
  roomNumber: string;
  floor: number;
  housekeepingStatus: 'clean' | 'dirty' | 'cleaning' | 'maintenance';
  lastCleaned?: Date;
  notes?: string;
}

const RoomSchema = new Schema(
  {
    roomTypeId: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
    hotelId: { type: Schema.Types.ObjectId, ref: 'Hotel', required: true },
    roomNumber: { type: String, required: true },
    floor: { type: Number, required: true },
    housekeepingStatus: { 
      type: String, 
      enum: ['clean', 'dirty', 'cleaning', 'maintenance'], 
      default: 'clean' 
    },
    lastCleaned: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

RoomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

export const Room = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);
