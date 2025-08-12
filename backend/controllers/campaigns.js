// backend/controllers/campaigns.js (Complete and Updated File)

const Campaign = require('../models/Campaign');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { logAction } = require('../services/auditLogService'); // <<<--- 1. IMPORT THE SERVICE

// @desc    Get all campaigns
// @route   GET /api/campaigns
// @access  Public
// ✅ MODIFIED: Simplified to use middleware results
exports.getCampaigns = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Create a campaign
// @route   POST /api/campaigns
// @access  Private/Admin
exports.createCampaign = asyncHandler(async (req, res, next) => {
    const campaign = await Campaign.create(req.body);

    // --- 2. ADD THIS LOGGING CODE ---
    await logAction({
        user: req.user,
        action: 'CREATE_CAMPAIGN',
        entity: 'Campaign',
        entityId: campaign._id,
        details: `Admin created campaign: '${campaign.name}'.`
    });
    // --- END OF LOGGING CODE ---

    res.status(201).json({ success: true, data: campaign });
});

// @desc    Update a campaign
// @route   PUT /api/campaigns/:id
// @access  Private/Admin
exports.updateCampaign = asyncHandler(async (req, res, next) => {
    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!campaign) {
        return next(new ErrorResponse(`Campaign not found with id of ${req.params.id}`, 404));
    }
    
    // --- 3. ADD THIS LOGGING CODE ---
    await logAction({
        user: req.user,
        action: 'UPDATE_CAMPAIGN',
        entity: 'Campaign',
        entityId: campaign._id,
        details: `Admin updated campaign: '${campaign.name}'.`
    });
    // --- END OF LOGGING CODE ---

    res.status(200).json({ success: true, data: campaign });
});

// @desc    Delete a campaign
// @route   DELETE /api/campaigns/:id
// @access  Private/Admin
exports.deleteCampaign = asyncHandler(async (req, res, next) => {
    // Find first to get details for logging
    const campaign = await Campaign.findById(req.params.id);
    
    if (!campaign) {
        return next(new ErrorResponse(`Campaign not found with id of ${req.params.id}`, 404));
    }
    
    const campaignName = campaign.name; // Store name before deleting
    await campaign.deleteOne();

    // --- 4. ADD THIS LOGGING CODE ---
    await logAction({
        user: req.user,
        action: 'DELETE_CAMPAIGN',
        entity: 'Campaign',
        entityId: campaign._id,
        details: `Admin deleted campaign: '${campaignName}'.`
    });
    // --- END OF LOGGING CODE ---
    
    res.status(200).json({ success: true, data: {} });
});