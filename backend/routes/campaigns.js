const express = require('express');
const router = express.Router();
const { getCampaigns, createCampaign, updateCampaign, deleteCampaign } = require('../controllers/campaigns');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { check, body } = require('express-validator');
const { validate } = require('../middleware/validator');
const advancedResults = require('../middleware/advancedResults');
const Campaign = require('../models/Campaign');

// ✅ CORRECTED: Validation rules now match your form data and schema.
const campaignRules = [
    check('name', 'Campaign name is required').not().isEmpty().trim().escape(),
    check('startDate', 'Start date must be a valid date').isISO8601().toDate(),
    check('endDate', 'End date must be a valid date').isISO8601().toDate()
        .custom((endDate, { req }) => {
            if (new Date(endDate) <= new Date(req.body.startDate)) { throw new Error('End date must be after start date.'); }
            return true;
        }),
    // ✅ FIX: Changed from 'Percentage'/'Fixed' to 'percentage'/'fixed' to match schema/form
    check('discount.type', 'Discount type must be either percentage or fixed').isIn(['percentage', 'fixed']),
    check('discount.value', 'Discount value must be a positive number').isFloat({ gt: 0 }),
    check('scope.type', 'Scope type is required').not().isEmpty(),
    check('scope.target', 'Scope target must be an array').optional().isArray(),
    body('scope').custom((scope) => {
        if (scope && scope.type !== 'all' && (!scope.target || scope.target.length === 0)) {
            throw new Error('Scope target is required for this scope type.');
        }
        return true;
    })
];

// Public Route
router.route('/').get(advancedResults(Campaign), getCampaigns);

// Protected & Authorized Routes
router.route('/')
    .post(protect, authorize('campaign_create', 'campaign_manage'), campaignRules, validate, createCampaign);

router.route('/:id')
    .put(protect, authorize('campaign_edit', 'campaign_manage'), campaignRules, validate, updateCampaign)
    .delete(protect, authorize('campaign_delete', 'campaign_manage'), deleteCampaign);

module.exports = router;