// Filename: backend/routes/notifications.js

const express = require('express');
const router = express.Router();

const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require('../controllers/notifications');

const { protect } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults'); // ✅ ADDED
const Notification = require('../models/Notification'); // ✅ ADDED

// All routes below require a user to be logged in.
router.use(protect);

// ✅ MODIFIED: The GET route now uses advancedResults for pagination.
// We pass it the Notification model. The filtering for the specific user will be handled in the controller.
router.route('/')
    .get(advancedResults(Notification), getNotifications);

router.route('/mark-all-read')
    .put(markAllAsRead);
    
router.route('/:id')
    .put(markAsRead)
    .delete(deleteNotification);

module.exports = router;