// controllers/coupons.js (Complete and Updated File)

const Coupon = require('../models/Coupon');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { logAction } = require('../services/auditLogService'); // <<<--- 1. IMPORT THE SERVICE

// @desc    Get all active and valid coupons for public display
// @route   GET /api/coupons/active
// @access  Public
// ✅ MODIFIED: This function is now paginated and uses a secure, non-overridable filter.
exports.getActivePublicCoupons = asyncHandler(async (req, res, next) => {
    const now = new Date();

    // Define the base filter that CANNOT be changed by the user
    const filter = {
        status: 'Active',
        startDate: { $lte: now },
        endDate: { $gte: now }
    };

    // Rebuild the pagination logic with our secure filter
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const total = await Coupon.countDocuments(filter);
    const results = await Coupon.find(filter)
        .sort(req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt')
        .skip(startIndex)
        .limit(limit)
        .lean();

    const pagination = {};
    if (endIndex < total) {
        pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
        pagination.prev = { page: page - 1, limit };
    }

    const processedCoupons = results.map(coupon => ({
        ...coupon,
        id: coupon._id.toString(),
    }));

    res.status(200).json({
        success: true,
        count: processedCoupons.length,
        pagination,
        total,
        data: processedCoupons
    });
});


// @desc    Get all coupons (For Admin Panel)
exports.getCoupons = asyncHandler(async (req, res, next) => {
    const now = new Date();
    const paginatedResults = res.advancedResults;
    const processedCoupons = paginatedResults.data.map(coupon => {
        const couponObject = coupon.toObject ? coupon.toObject() : { ...coupon };
        let effectiveStatus;
        if (now > couponObject.endDate) {
            effectiveStatus = 'Expired';
        } else if (couponObject.status === 'Inactive') {
            effectiveStatus = 'Inactive';
        } else if (now < couponObject.startDate) {
            effectiveStatus = 'Scheduled';
        } else {
            effectiveStatus = 'Active';
        }
        return { 
            ...couponObject, 
            id: couponObject._id.toString(),
            status: effectiveStatus 
        };
    });
    paginatedResults.data = processedCoupons;
    res.status(200).json(paginatedResults);
});

// @desc    Create a coupon
exports.createCoupon = asyncHandler(async (req, res, next) => {
    const coupon = await Coupon.create(req.body);

    // --- 2. ADD THIS LOGGING CODE ---
    await logAction({
        user: req.user,
        action: 'CREATE_COUPON',
        entity: 'Coupon',
        entityId: coupon._id,
        details: `Admin created coupon code: '${coupon.code}'.`
    });
    // --- END OF LOGGING CODE ---

    res.status(201).json({ success: true, data: coupon });
});

// @desc    Update a coupon
exports.updateCoupon = asyncHandler(async (req, res, next) => {
    let coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        return next(new ErrorResponse(`Coupon not found with id of ${req.params.id}`, 404));
    }
    
    // Set new values and save to get the updated document
    coupon.set(req.body);
    const updatedCoupon = await coupon.save();

    // --- 3. ADD THIS LOGGING CODE ---
    await logAction({
        user: req.user,
        action: 'UPDATE_COUPON',
        entity: 'Coupon',
        entityId: coupon._id,
        details: `Admin updated coupon code: '${coupon.code}'.`
    });
    // --- END OF LOGGING CODE ---

    res.status(200).json({ success: true, data: updatedCoupon });
});


// @desc    Delete a coupon
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
    // Find first to get details for logging
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
        return next(new ErrorResponse(`Coupon not found with id of ${req.params.id}`, 404));
    }

    const couponCode = coupon.code; // Store code for logging
    await coupon.deleteOne();

    // --- 4. ADD THIS LOGGING CODE ---
    await logAction({
        user: req.user,
        action: 'DELETE_COUPON',
        entity: 'Coupon',
        entityId: coupon._id,
        details: `Admin deleted coupon code: '${couponCode}'.`
    });
    // --- END OF LOGGING CODE ---

    res.status(200).json({ success: true, data: {} });
});