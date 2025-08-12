// backend/routes/auditLog.js
const express = require('express');
const { getAuditLogs, clearAllLogs, deleteSingleLog } = require('../controllers/auditLog');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const advancedResults = require('../middleware/advancedResults');

router.use(protect); // Protect all routes in this file

router
  .route('/')
  .get(
    authorize('auditlog_view'), 
    advancedResults(AuditLog, { path: 'user', select: 'email role' }), 
    getAuditLogs
  );

router
  .route('/clear')
  .delete(
    authorize('auditlog_manage'),
    clearAllLogs
  );

router
  .route('/:id')
  .delete(
    authorize('auditlog_delete_entry'),
    deleteSingleLog
  );

module.exports = router;