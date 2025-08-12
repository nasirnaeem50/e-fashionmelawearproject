// controllers/roles.js (Complete and Updated File)

const { ALL_PERMISSIONS } = require('../config/permissions');
const Role = require('../models/Role');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { logAction } = require('../services/auditLogService');

exports.getAllPermissions = asyncHandler(async (req, res, next) => {
    res.status(200).json({ success: true, data: ALL_PERMISSIONS });
});

exports.getRoles = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

exports.getRole = asyncHandler(async (req, res, next) => {
    const role = await Role.findById(req.params.id);
    if (!role) {
        return next(new ErrorResponse(`Role not found with id of ${req.params.id}`, 404));
    }
    res.status(200).json({ success: true, data: role });
});

exports.createRole = asyncHandler(async (req, res, next) => {
    const { name, permissions } = req.body;
    const role = await Role.create({ name, permissions });
    await logAction({
        user: req.user,
        action: 'CREATE_ROLE',
        entity: 'Role',
        entityId: role._id,
        details: `Admin created new role: '${role.name}'.`
    });
    res.status(201).json({ success: true, data: role });
});

exports.updateRole = asyncHandler(async (req, res, next) => {
    let role = await Role.findById(req.params.id);
    if (!role) {
        return next(new ErrorResponse(`Role not found with id of ${req.params.id}`, 404));
    }
    if ((role.name === 'admin' || role.name === 'user') && req.body.name && role.name !== req.body.name) {
         return next(new ErrorResponse(`Cannot change the name of the core '${role.name}' role.`, 400));
    }
    const oldPermissionsCount = role.permissions.length;
    const updateData = { $set: req.body };
    role = await Role.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
    });
    if (req.body.permissions) {
        const newPermissionsCount = role.permissions.length;
        await logAction({
            user: req.user,
            action: 'UPDATE_ROLE_PERMISSIONS',
            entity: 'Role',
            entityId: role._id,
            details: `Admin updated permissions for role '${role.name}'. Count changed from ${oldPermissionsCount} to ${newPermissionsCount}.`
        });
    }
    res.status(200).json({ success: true, data: role });
});

exports.deleteRole = asyncHandler(async (req, res, next) => {
    const role = await Role.findById(req.params.id);
    if (!role) {
        return next(new ErrorResponse(`Role not found with id of ${req.params.id}`, 404));
    }
    if (role.name === 'admin' || role.name === 'user') {
        return next(new ErrorResponse(`Cannot delete the core '${role.name}' role.`, 400));
    }
    const userWithRole = await User.findOne({ role: role._id });
    if (userWithRole) {
        return next(new ErrorResponse('Cannot delete this role, it is currently assigned to one or more users.', 400));
    }
    const roleNameForLog = role.name;
    const roleIdForLog = role._id;

    // THIS IS THE ONLY CHANGE IN THIS FUNCTION
    await role.deleteOne();

    await logAction({
        user: req.user,
        action: 'DELETE_ROLE',
        entity: 'Role',
        entityId: roleIdForLog,
        details: `Admin deleted role: '${roleNameForLog}'.`
    });
    res.status(200).json({ success: true, data: {} });
});