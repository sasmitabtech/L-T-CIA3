const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { getOccupancyReport, getRevenueReport, getDashboardStats } = require('../controllers/reportController');

const router = express.Router();

router.use(authenticate, authorize('Admin'));
router.get('/occupancy', getOccupancyReport);
router.get('/revenue', getRevenueReport);
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;
