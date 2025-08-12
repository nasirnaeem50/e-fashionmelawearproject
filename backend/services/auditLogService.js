const AuditLog = require('../models/AuditLog');

/**
 * Creates an entry in the audit log.
 * This is designed to not throw an error that would interrupt the main request flow.
 * @param {object} options - The options for the log entry.
 * @param {string} options.user - The full user object from the request (req.user).
 * @param {string} options.action - The type of action (must be in the AuditLog schema enum).
 * @param {string} options.entity - The type of entity being changed (e.g., 'Product').
 * @param {mongoose.Types.ObjectId} [options.entityId] - The ID of the entity.
 * @param {string} [options.details] - A human-readable description of the change.
 */
const logAction = async (options) => {
  if (!options.user || !options.action || !options.entity) {
    console.error('Audit log failed: Missing required parameters (user, action, entity).');
    return;
  }
  
  try {
    await AuditLog.create({
      user: options.user.id,
      userName: options.user.name, // Storing the name directly
      action: options.action,
      entity: options.entity,
      entityId: options.entityId,
      details: options.details,
    });
  } catch (error) {
    // Log the error to the console but don't stop the main operation.
    // An audit log failure should not crash the application.
    console.error('Failed to create audit log entry:', error);
  }
};

module.exports = { logAction };