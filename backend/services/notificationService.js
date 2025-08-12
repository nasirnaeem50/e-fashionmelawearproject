// Filename: backend/services/notificationService.js

const Notification = require('../models/Notification');
const User = require('../models/User');
const Role = require('../models/Role');

/**
 * Creates a notification for all users who have a specific role (e.g., 'admin').
 * This is the primary function we will use throughout the backend.
 *
 * @param {string} roleName - The name of the role to target (e.g., 'admin', 'moderator').
 * @param {object} notificationData - An object containing the notification details.
 * @param {string} notificationData.title - The title of the notification.
 * @param {string} notificationData.message - The main content of the notification.
 * @param {string} [notificationData.link] - An optional URL link for the notification.
 */
const createNotificationForRole = async (roleName, notificationData) => {
    try {
        // 1. Find the database ID for the role based on its name.
        const targetRole = await Role.findOne({ name: roleName });

        // If the role doesn't exist in the database, we can't proceed.
        if (!targetRole) {
            console.error(`NOTIFICATION SERVICE ERROR: Role "${roleName}" not found. Cannot create notification.`);
            return;
        }

        // 2. Find all users who have been assigned this role.
        const usersToNotify = await User.find({ role: targetRole._id }).select('_id');

        // If no users have this role, there's nothing more to do.
        if (usersToNotify.length === 0) {
            return;
        }

        // 3. Prepare a list of notification documents to be created, one for each user.
        const notifications = usersToNotify.map(user => ({
            user: user._id, // Assign the notification to this specific user
            title: notificationData.title,
            message: notificationData.message,
            link: notificationData.link,
        }));

        // 4. Use insertMany for efficiency, creating all notifications in a single database operation.
        await Notification.insertMany(notifications);

        console.log(`NOTIFICATION SERVICE: Successfully created notifications for ${usersToNotify.length} user(s) with role "${roleName}".`);
    } catch (error) {
        // Log any errors that occur during the process.
        console.error('NOTIFICATION SERVICE ERROR: Failed to create notifications for role.', error);
    }
};

module.exports = {
    createNotificationForRole
};