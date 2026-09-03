import mongoose, { Schema, Document } from 'mongoose';

export interface IPricingRule extends Document {
  roomTypeId: mongoose.Types.ObjectId;
  season: 'normal' | 'weekend' | 'festival' | 'peak';
  seasonLabel: string;
  multiplier: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  description?: string;
}

const PricingRuleSchema = new Schema(
  {
    roomTypeId: { type: Schema.Types.ObjectId, ref: 'RoomType', required: true },
    season: { 
      type: String, 
      enum: ['normal', 'weekend', 'festival', 'peak'], 
      required: true 
    },
    seasonLabel: { type: String, required: true },
    multiplier: { type: Number, required: true },
    startDate: { type: Date },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const PricingRule = mongoose.models.PricingRule || mongoose.model<IPricingRule>('PricingRule', PricingRuleSchema);
