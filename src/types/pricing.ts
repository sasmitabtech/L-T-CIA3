export type PricingSeason = 'normal' | 'weekend' | 'festival' | 'peak';

export interface PricingRule {
  _id: string;
  roomTypeId: string;
  roomTypeName?: string;
  hotelId?: string;
  hotelName?: string;
  season: PricingSeason;
  seasonLabel: string;
  multiplier: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePricingRulePayload {
  roomTypeId: string;
  season: PricingSeason;
  seasonLabel: string;
  multiplier: number;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export const SEASON_MULTIPLIERS: Record<PricingSeason, { label: string; defaultMultiplier: number; color: string }> = {
  normal: { label: 'Normal', defaultMultiplier: 1.0, color: 'slate' },
  weekend: { label: 'Weekend', defaultMultiplier: 1.2, color: 'blue' },
  festival: { label: 'Festival', defaultMultiplier: 1.5, color: 'amber' },
  peak: { label: 'Peak Season', defaultMultiplier: 1.8, color: 'rose' },
};

export interface PriceCalculation {
  basePrice: number;
  multiplier: number;
  seasonLabel: string;
  adjustedPrice: number;
  nights: number;
  rooms: number;
  subtotal: number;
  taxRate: number;
  taxes: number;
  total: number;
}
