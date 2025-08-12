const express = require('express');
const router = express.Router();
// UPDATED: Import the new getReport function
const { getWishlistInsights, getReport } = require('../controllers/reports');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// NEW: Main, flexible route for all reports. This is the primary route now.
router.route('/')
    .get(protect, authorize('report_view', 'report_manage'), getReport);

// PRESERVED: Your original route is kept for backwards compatibility or specific use cases.
router.route('/wishlist-insights')
    .get(protect, authorize('report_view', 'report_manage'), getWishlistInsights);

module.exports = router;