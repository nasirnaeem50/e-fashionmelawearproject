const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');

dotenv.config();

// --- Import Models ---
const Role = require('../models/Role');
const User = require('../models/User');

// --- ADDED: Import the new centralized permission sets ---
const {
    ADMIN_PERMISSIONS,
    MODERATOR_PERMISSIONS,
    USER_PERMISSIONS
} = require('../config/permissions');


mongoose.connect(process.env.MONGO_URI, {});

// --- REMOVED: The hardcoded ALL_PERMISSIONS array is now in config/permissions.js ---

// --- Define the roles to be created using the imported permission sets ---
const roles = [
  {
    name: 'admin',
    permissions: ADMIN_PERMISSIONS // Using the imported constant
  },
  {
    name: 'moderator',
    permissions: MODERATOR_PERMISSIONS // Using the imported constant
  },
  {
    name: 'user',
    permissions: USER_PERMISSIONS // Using the imported constant
  }
];

const importData = async () => {
  try {
    // --- Clear existing Roles and Users ---
    await Role.deleteMany();
    await User.deleteMany();
    console.log('🗑️  Cleared existing roles and users...'.yellow);

    // --- Create the Role documents in the database ---
    const createdRoles = await Role.create(roles);
    console.log('✅ Created default roles (admin, moderator, user).'.cyan);

    // Get the IDs of the newly created roles
    const adminRole = createdRoles.find(r => r.name === 'admin');
    const moderatorRole = createdRoles.find(r => r.name === 'moderator');
    const userRole = createdRoles.find(r => r.name === 'user');
    
    // --- Prepare user data with the correct Role IDs ---
    const usersToSeed = [
      {
        name: 'Admin User',
        email: 'nasirnaeem66@gmail.com',
        password: 'Khan123@',
        role: adminRole._id
      },
      {
        name: 'Moderator User',
        email: 'nasirnaeem50@gmail.com',
        password: 'Khan123@',
        role: moderatorRole._id
      },
    ];

    await User.create(usersToSeed);
    console.log('✅ Default Admin and Moderator users have been created and assigned roles.'.green.bold);
    process.exit();
  } catch (err) {
    console.error(`${err}`.red.bold);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    // --- Also delete all Roles ---
    await Role.deleteMany();
    await User.deleteMany();
    console.log('🗑️ All user and role data has been destroyed.'.yellow.bold);
    process.exit();
  } catch (err) {
    console.error(`${err}`.red.bold);
    process.exit(1);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Usage: node data/seeder -i (to import data) or -d (to destroy data)'.cyan);
  process.exit();
}