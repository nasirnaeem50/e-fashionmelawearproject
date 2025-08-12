// controllers/categories.js (Complete and Corrected File)

const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { logAction } = require('../services/auditLogService');

exports.getCategories = asyncHandler(async (req, res, next) => {
    const categories = await Category.find();
    
    const structuredCategories = {};
    categories.forEach(cat => {
        if (!structuredCategories[cat.parentCategory]) {
            structuredCategories[cat.parentCategory] = [];
        }
        structuredCategories[cat.parentCategory].push(cat.toJSON());
    });

    res.status(200).json({ success: true, data: structuredCategories });
});

exports.createCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.create(req.body);
    await logAction({
        user: req.user,
        action: 'CREATE_CATEGORY',
        entity: 'Category',
        entityId: category._id,
        details: `Admin created category '${category.name}' under parent '${category.parentCategory}'.`
    });
    res.status(201).json({ success: true, data: category });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
    const updatePayload = { $set: req.body };
    const category = await Category.findByIdAndUpdate(req.params.id, updatePayload, {
        new: true,
        runValidators: true
    });

    if (!category) {
        return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
    }
    await logAction({
        user: req.user,
        action: 'UPDATE_CATEGORY',
        entity: 'Category',
        entityId: category._id,
        details: `Admin updated category '${category.name}'.`
    });
    res.status(200).json({ success: true, data: category });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
    }
    const categoryName = category.name;
    const parentName = category.parentCategory;
    
    // THIS IS THE ONLY CHANGE IN THIS FUNCTION
    await category.deleteOne();

    await logAction({
        user: req.user,
        action: 'DELETE_CATEGORY',
        entity: 'Category',
        entityId: category._id,
        details: `Admin deleted category '${categoryName}' from parent '${parentName}'.`
    });
    res.status(200).json({ success: true, data: {} });
});

exports.deleteParentCategories = asyncHandler(async (req, res, next) => {
    const { parentName } = req.params;
    const result = await Category.deleteMany({ parentCategory: parentName });

    if (result.deletedCount === 0) {
        console.log(`Attempted to delete categories for parent "${parentName}", but none were found.`);
    }

    res.status(200).json({ success: true, data: {} });
});