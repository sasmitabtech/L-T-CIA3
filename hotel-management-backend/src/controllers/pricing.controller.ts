import { Request, Response, NextFunction } from 'express';
import { PricingRule } from '../models/PricingRule';

export const getPricingRules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rules = await PricingRule.find().populate('roomTypeId');
    res.status(200).json(rules);
  } catch (error) {
    next(error);
  }
};

export const createPricingRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newRule = new PricingRule(req.body);
    const savedRule = await newRule.save();
    res.status(201).json(savedRule);
  } catch (error) {
    next(error);
  }
};

export const updatePricingRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updatedRule = await PricingRule.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedRule) {
      return res.status(404).json({ message: 'Pricing rule not found' });
    }
    res.status(200).json(updatedRule);
  } catch (error) {
    next(error);
  }
};

export const deletePricingRule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deletedRule = await PricingRule.findByIdAndDelete(id);
    if (!deletedRule) {
      return res.status(404).json({ message: 'Pricing rule not found' });
    }
    res.status(200).json({ message: 'Pricing rule deleted successfully' });
  } catch (error) {
    next(error);
  }
};

