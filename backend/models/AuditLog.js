// backend/models/AuditLog.js

const mongoose = require('mongoose');
// <<<--- 1. IMPORT THE MASTER LIST ---<<<
const { ALL_PERMISSIONS } = require('../config/permissions');

const AuditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Audit log must have a user.'],
  },
  userName: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
    // <<<--- 2. USE THE MASTER LIST AS THE ENUM ---<<<
    // This ensures the model is always in sync with your config file.
    enum: ALL_PERMISSIONS, 
  },
  entity: {
    type: String,
    required: [true, 'Audit log must specify an entity (e.g., Product, Order).'],
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  details: {
    type: String,
    maxlength: [500, 'Details cannot be more than 500 characters'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

AuditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);