const mongoose = require('mongoose');
const colors = require('colors');
// ✅ FIX 1: Correctly require the dotenv package
const dotenv = require('dotenv');

// ✅ FIX 2: Correct the path to the .env file.
// Since this script is in `data/`, the .env file is in the parent directory (`../`).
dotenv.config({ path: __dirname + '/../.env' });


// Load models
const Role = require('../models/Role');

// --- Import the new, complete permission lists ---
const {
    ADMIN_PERMISSIONS,
    MODERATOR_PERMISSIONS,
    USER_PERMISSIONS
} = require('../config/permissions');

// Connect to DB
// Now, process.env.MONGO_URI will have the correct value from your .env file
mongoose.connect(process.env.MONGO_URI, {});

/**
 * This is a SAFE update script. It will NOT delete any data.
 * It finds the existing roles and updates their 'permissions' array.
 */
const updateRoles = async () => {
    try {
        console.log('Connecting to the database...'.cyan);
        
        // --- Update the 'admin' role ---
        const adminRole = await Role.findOne({ name: 'admin' });
        if (adminRole) {
            adminRole.permissions = ADMIN_PERMISSIONS;
            await adminRole.save();
            console.log('✅ Admin role permissions have been updated.'.green);
        } else {
            console.log('⚠️  Admin role not found. Skipping...'.yellow);
        }

        // --- Update the 'moderator' role ---
        const moderatorRole = await Role.findOne({ name: 'moderator' });
        if (moderatorRole) {
            moderatorRole.permissions = MODERATOR_PERMISSIONS;
            await moderatorRole.save();
            console.log('✅ Moderator role permissions have been updated.'.green);
        } else {
            console.log('⚠️  Moderator role not found. Skipping...'.yellow);
        }
        
        // --- Update the 'user' role (to ensure it's empty) ---
        const userRole = await Role.findOne({ name: 'user' });
        if (userRole) {
            userRole.permissions = USER_PERMISSIONS;
            await userRole.save();
            console.log('✅ User role permissions have been updated.'.green);
        } else {
            console.log('⚠️  User role not found. Skipping...'.yellow);
        }

        console.log('\nRole permission update process finished successfully!'.bold.cyan);
        process.exit();
    } catch (err) {
        console.error(`${err}`.red.bold);
        process.exit(1);
    }
};

// Run the update function
updateRoles();