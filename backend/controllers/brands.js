// backend/controllers/brands.js (Complete and Updated File)

const Brand = require('../models/Brand');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { logAction } = require('../services/auditLogService'); // <<<--- 1. IMPORT THE SERVICE

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
// ✅ MODIFIED: Simplified to use middleware results
exports.getBrands = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Create a brand
// @route   POST /api/brands
// @access  Private/Admin
exports.createBrand = asyncHandler(async (req, res, next) => {
    const brand = await Brand.create(req.body);

    // --- 2. ADD THIS LOGGING CODE ---
    await logAction({
        user: req.user,
        action: 'CREATE_BRAND',
        entity: 'Brand',
        entityId: brand._id,
        details: `Admin created brand: '${brand.name}'.`
    });
    // --- END OF LOGGING CODE ---

    res.status(201).json({ success: true, data: brand });
});

// @desc    Update a brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
exports.updateBrand = asyncHandler(async (req, res, next) => {
    let brand = await Brand.findById(req.params.id);

    if (!brand) {
        return next(new ErrorResponse(`Brand not found with id of ${req.params.id}`, 404));
    }
    
    brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    // --- 3. ADD THIS LOGGING CODE ---
    await logAction({
        user: req.user,
        action: 'UPDATE_BRAND',
        entity: 'Brand',
        entityId: brand._id,
        details: `Admin updated brand: '${brand.name}'.`
    });
    // --- END OF LOGGING CODE ---

    res.status(200).json({ success: true, data: brand });
});


// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
exports.deleteBrand = asyncHandler(async (req, res, next) => {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
        return next(new ErrorResponse(`Brand not found with id of ${req.params.id}`, 404));
    }

    const brandName = brand.name; // Store name for logging before deleting

    await brand.deleteOne();

    // --- 4. ADD THIS LOGGING CODE ---
    await logAction({
        user: req.user,
        action: 'DELETE_BRAND',
        entity: 'Brand',
        entityId: brand._id,
        details: `Admin deleted brand: '${brandName}'.`
    });
    // --- END OF LOGGING CODE ---

    res.status(200).json({ success: true, data: {} });
});