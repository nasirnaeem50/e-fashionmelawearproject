// controllers/configuration.js (Complete and Refactored File)

const Configuration = require('../models/Configuration');
const ErrorResponse = require('../utils/errorResponse'); // ✅ ADDED: Import our custom ErrorResponse
const asyncHandler = require('../middleware/async'); // ✅ ADDED: Import our asyncHandler
const { logAction } = require('../services/auditLogService'); // <<<--- 1. IMPORT THE SERVICE

// Default configuration for first-time initialization
const defaultConfiguration = {
    maintenanceMode: false,
    newnessDurationDays: 7,
    storePhone: "0341 9169022",
    storeEmail: "info@fashionmelawear.com",
    shippingZones: [
        { id: 1, name: 'Domestic (Pakistan)', rate: 250, enabled: true },
        { id: 2, name: 'International (Zone A)', rate: 3000, enabled: false },
        { id: 3, name: 'Free Shipping (Promotional)', rate: 0, enabled: false },
    ],
    paymentGateways: {
        cod: { enabled: true },
        bank: { enabled: true },
        easypaisa: { enabled: true },
        stripe: { enabled: false },
    },
    taxRate: 17,
    currencies: [
        { id: 1, name: 'Pakistani Rupee', code: 'PKR', symbol: 'Rs', primary: true },
        { id: 2, name: 'US Dollar', code: 'USD', symbol: '$', primary: false },
    ],
};

// @desc    Get store configuration
// @route   GET /api/configuration
// @access  Public
exports.getConfiguration = asyncHandler(async (req, res, next) => {
    let config = await Configuration.findOne();

    // If no configuration exists, create it for the first time.
    // This is part of the business logic, not an error.
    if (!config) {
        // We wrap this in a try-catch because create() could fail if the DB is down,
        // and we want that to be handled by our central error handler.
        try {
            config = await Configuration.create(defaultConfiguration);
        } catch (err) {
            console.error('Failed to create default configuration:', err);
            return next(new ErrorResponse('Could not initialize store configuration', 500));
        }
    }

    res.status(200).json({ success: true, data: config });
    // Note: Any other database read errors are caught by asyncHandler.
});

// @desc    Update store configuration
// @route   PUT /api/configuration
// @access  Private/Admin
exports.updateConfiguration = asyncHandler(async (req, res, next) => {
    // findOneAndUpdate with upsert:true is perfect for this use case.
    // It will find the single config document and update it, or create it if it doesn't exist.
    const config = await Configuration.findOneAndUpdate({}, req.body, {
        new: true,
        upsert: true,
        runValidators: true,
    });
    
    // --- 2. ADD THIS LOGGING CODE ---
    // Note: Since this is one large settings object, a general message is appropriate.
    await logAction({
        user: req.user,
        action: 'UPDATE_SETTINGS',
        entity: 'Configuration',
        entityId: config._id,
        details: 'Admin updated the main store configuration.'
    });
    // --- END OF LOGGING CODE ---

    res.status(200).json({ success: true, data: config });
    // Note: If the update data fails Mongoose validation, a ValidationError
    // will be thrown and handled automatically by our system.
});