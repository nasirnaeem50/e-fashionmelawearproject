// backend/controllers/auditLog.js
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../middleware/async');
const { logAction } = require('../services/auditLogService');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all audit logs with pagination and filtering
// @route   GET /api/v1/auditlog
// @access  Private/Admin
exports.getAuditLogs = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Clear all audit logs
// @route   DELETE /api/v1/auditlog/clear
// @access  Private (Requires 'auditlog_manage' permission)
exports.clearAllLogs = asyncHandler(async (req, res, next) => {
    await logAction({
        user: req.user,
        action: 'AUDITLOG_CLEAR',
        entity: 'AuditLog',
        details: `Admin cleared the entire audit log.`
    });
    
    const lastLog = await AuditLog.findOne().sort({ timestamp: -1 });
    if (lastLog) {
        await AuditLog.deleteMany({ _id: { $ne: lastLog._id } });
    } else {
        await AuditLog.deleteMany({});
    }

    res.status(200).json({ success: true, message: 'Audit log cleared successfully.' });
});

// @desc    Delete a single log entry
// @route   DELETE /api/v1/auditlog/:id
// @access  Private (Requires 'auditlog_delete_entry' permission)
exports.deleteSingleLog = asyncHandler(async (req, res, next) => {
    const logToDelete = await AuditLog.findById(req.params.id);

    if (!logToDelete) {
        return next(new ErrorResponse(`Log entry not found with id of ${req.params.id}`, 404));
    }

    // Log the deletion of the log entry BEFORE actually deleting it.
    await logAction({
        user: req.user,
        action: 'AUDITLOG_ENTRY_DELETE',
        entity: 'AuditLog',
        details: `Admin deleted a single log entry: "${logToDelete.details}" (ID: ${logToDelete._id})`
    });

    await logToDelete.deleteOne();

    res.status(200).json({ success: true, data: {} });
});