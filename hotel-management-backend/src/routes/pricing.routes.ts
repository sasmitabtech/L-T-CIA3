import { Router } from 'express';
import { getPricingRules, createPricingRule, updatePricingRule, deletePricingRule } from '../controllers/pricing.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

// All pricing routes require authentication and Admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/', getPricingRules);
router.post('/', createPricingRule);
router.put('/:id', updatePricingRule);
router.delete('/:id', deletePricingRule);

export default router;
