import { Router } from 'express';
import { getDashboardReport } from '../controllers/report.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardReport);

export default router;
