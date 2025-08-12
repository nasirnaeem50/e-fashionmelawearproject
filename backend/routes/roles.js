const express = require('express');
const {
    getRoles,
    getRole,
    createRole,
    updateRole,
    deleteRole,
    getAllPermissions
} = require('../controllers/roles'); 

const router = express.Router();

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { check } = require('express-validator');
const { validate } = require('../middleware/validator');
const advancedResults = require('../middleware/advancedResults');
const Role = require('../models/Role');

// ✅ MODIFIED: Renamed to be specific to creation. 'name' is required here.
const createRoleRules = [
    check('name', 'Role name is required').not().isEmpty().trim().escape(),
    check('permissions', 'Permissions must be an array').optional().isArray(),
    check('permissions.*', 'Each permission must be a non-empty string').optional().not().isEmpty().isString().trim()
];

// ✅ NEW: Added specific rules for updating. 'name' is now optional.
const updateRoleRules = [
    check('name', 'Role name must be a non-empty string').optional().not().isEmpty().trim().escape(),
    check('permissions', 'Permissions must be an array').optional().isArray(),
    check('permissions.*', 'Each permission must be a non-empty string').optional().not().isEmpty().isString().trim()
];


router.use(protect);
router.use(authorize('user_manage'));

router.route('/permissions').get(getAllPermissions);

router.route('/')
    .get(advancedResults(Role), getRoles)
    // ✅ Apply the specific creation rules here
    .post(createRoleRules, validate, createRole);

router.route('/:id')
    .get(getRole)
    // ✅ Apply the new, more flexible update rules here
    .put(updateRoleRules, validate, updateRole)
    .delete(deleteRole);

module.exports = router;