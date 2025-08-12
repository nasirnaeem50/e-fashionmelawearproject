// controllers/products.js (Complete and Corrected File)

const Product = require('../models/Product');
const Review = require('../models/Review');
const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const colors = require('colors');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { logAction } = require('../services/auditLogService');

// @desc    Get all products (paginated)
exports.getProducts = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Search, filter, sort, and paginate products
exports.searchProducts = asyncHandler(async (req, res, next) => {
    const { 
        keyword, parent, category, child, brands,
        minPrice, maxPrice, sortBy, filter 
    } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;
    let filterQuery = {};
    if (keyword) { filterQuery.$text = { $search: keyword }; }
    if (parent) {
        const lowerParent = parent.toLowerCase();
        if (lowerParent === 'man' || lowerParent === 'men') {
            filterQuery.gender = { $regex: /^(man|men)$/i };
        } else {
            filterQuery.gender = { $regex: new RegExp(`^${parent}$`, 'i') };
        }
    }
    if (category) { filterQuery.category = { $regex: new RegExp(`^${category}$`, 'i') }; }
    if (child) { filterQuery.childCategory = { $regex: new RegExp(`^${child}$`, 'i') }; }
    if (filter === 'special-offers') {
        filterQuery.$expr = { $gt: [ "$originalPrice", "$price" ] };
        filterQuery.originalPrice = { $exists: true, $ne: null };
    }
    if (brands) { filterQuery.brand = { $in: brands.split(',') }; }
    if (minPrice || maxPrice) {
        filterQuery.price = {};
        if (minPrice) filterQuery.price.$gte = parseFloat(minPrice);
        if (maxPrice) filterQuery.price.$lte = parseFloat(maxPrice);
    }
    let sortOptions = {};
    if (sortBy === 'price-asc') { sortOptions.price = 1; } 
    else if (sortBy === 'price-desc') { sortOptions.price = -1; } 
    else if (sortBy === 'latest') { sortOptions.createdAt = -1; } 
    else if (keyword) { sortOptions.score = { $meta: 'textScore' }; } 
    else { sortOptions.createdAt = -1; }
    const products = await Product.find(filterQuery)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);
    const totalProducts = await Product.countDocuments(filterQuery);
    const now = new Date();
    const activeCampaigns = await Campaign.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
    });
    const finalProducts = products.map(product => {
        const originalPrice = product.price;
        let finalPrice = originalPrice;
        let bestDiscount = 0;
        activeCampaigns.forEach(campaign => {
            const { type: scopeType, target: scopeTarget = [] } = campaign.scope;
            let isApplicable = false;
            if (scopeType === 'all') isApplicable = true;
            else if (scopeType === 'product') isApplicable = scopeTarget.includes(product._id.toString());
            else if (scopeType === 'parent-category') isApplicable = scopeTarget.includes(product.gender);
            else if (scopeType === 'category') isApplicable = scopeTarget.includes(product.category);
            else if (scopeType === 'child-category') isApplicable = scopeTarget.includes(product.childCategory);
            if (isApplicable) {
                const discountValue = campaign.discount.type === 'percentage'
                    ? originalPrice * (campaign.discount.value / 100)
                    : campaign.discount.value;
                if (discountValue > bestDiscount) {
                    bestDiscount = discountValue;
                }
            }
        });
        const productObject = product.toObject();
        productObject.id = productObject._id.toString();
        delete productObject._id;
        delete productObject.__v;
        if (bestDiscount > 0) {
            finalPrice = Math.round(originalPrice - bestDiscount);
            return { ...productObject, price: finalPrice, originalPrice: originalPrice };
        }
        return { ...productObject, price: originalPrice, originalPrice: null };
    });
    res.status(200).json({
        success: true,
        count: finalProducts.length,
        totalProducts,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
        },
        data: finalProducts
    });
});

exports.getOnSaleProducts = asyncHandler(async (req, res, next) => {
    const now = new Date();
    const activeCampaigns = await Campaign.find({ isActive: true, startDate: { $lte: now }, endDate: { $gte: now }, }).lean();
    if (activeCampaigns.length === 0) {
        return res.status(200).json({ success: true, count: 0, pagination: {}, total: 0, data: [] });
    }
    const campaignQueries = activeCampaigns.map(campaign => {
        const { type: scopeType, target: scopeTarget = [] } = campaign.scope;
        if (scopeType === 'all') return {};
        if (scopeType === 'product') return { _id: { $in: scopeTarget } };
        if (scopeType === 'parent-category') return { gender: { $in: scopeTarget } };
        if (scopeType === 'category') return { category: { $in: scopeTarget } };
        if (scopeType === 'child-category') return { childCategory: { $in: scopeTarget } };
        return { _id: null };
    });
    const finalFilter = { $or: campaignQueries };
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments(finalFilter);
    const products = await Product.find(finalFilter).sort(req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt').skip(startIndex).limit(limit);
    const pagination = {};
    if (endIndex < total) { pagination.next = { page: page + 1, limit }; }
    if (startIndex > 0) { pagination.prev = { page: page - 1, limit }; }
    const finalProducts = products.map(product => {
        const originalPrice = product.price;
        let finalPrice = originalPrice;
        let bestDiscount = 0;
        activeCampaigns.forEach(campaign => {
            const { type: scopeType, target: scopeTarget = [] } = campaign.scope;
            let isApplicable = false;
            if (scopeType === 'all') isApplicable = true;
            else if (scopeType === 'product') isApplicable = scopeTarget.includes(product._id.toString());
            else if (scopeType === 'parent-category') isApplicable = scopeTarget.includes(product.gender);
            else if (scopeType === 'category') isApplicable = scopeTarget.includes(product.category);
            else if (scopeType === 'child-category') isApplicable = scopeTarget.includes(product.childCategory);
            if (isApplicable) {
                const discountValue = campaign.discount.type === 'percentage' ? originalPrice * (campaign.discount.value / 100) : campaign.discount.value;
                if (discountValue > bestDiscount) bestDiscount = discountValue;
            }
        });
        
        // <<<--- ✅ FIX: Transform the Mongoose object to a plain object with an 'id' field ---<<<
        const productObject = product.toObject();
        productObject.id = product._id.toString();
        delete productObject._id;
        delete productObject.__v;

        if (bestDiscount > 0) {
            finalPrice = Math.round(originalPrice - bestDiscount);
            return { ...productObject, price: finalPrice, originalPrice: originalPrice };
        }
        return { ...productObject, price: originalPrice, originalPrice: null };
    });
    res.status(200).json({ success: true, count: finalProducts.length, pagination, total, data: finalProducts });
});

exports.getStockOutProducts = asyncHandler(async (req, res, next) => {
    const filter = { stock: 0 };
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments(filter);
    const results = await Product.find(filter).sort(req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt').skip(startIndex).limit(limit);
    const pagination = {};
    if (endIndex < total) { pagination.next = { page: page + 1, limit }; }
    if (startIndex > 0) { pagination.prev = { page: page - 1, limit }; }
    res.status(200).json({ success: true, count: results.length, pagination, total, data: results });
});

exports.updateStock = asyncHandler(async (req, res, next) => {
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) { return next(new ErrorResponse('Invalid or empty items array provided for stock update.', 400)); }
    const productIds = items.map(item => item.product);
    const productsFromDB = await Product.find({ '_id': { $in: productIds } });
    const productMap = new Map(productsFromDB.map(p => [p._id.toString(), p]));
    for (const item of items) {
        const product = productMap.get(item.product.toString());
        if (!product) { return next(new ErrorResponse(`Product with ID ${item.product} not found. Stock update aborted.`, 404)); }
        if (product.stock < item.quantity) { return next(new ErrorResponse(`Not enough stock for "${product.name}". Only ${product.stock} available. Update aborted.`, 400)); }
    }
    const bulkOps = items.map(item => ({ updateOne: { filter: { _id: item.product }, update: { $inc: { stock: -item.quantity } } } }));
    if (bulkOps.length > 0) { await Product.bulkWrite(bulkOps); }
    res.status(200).json({ success: true, message: 'Stock updated successfully for all items.' });
});

exports.getProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    // <<<--- ✅ FIX: Apply campaign logic to ensure single product shows correct discount ---<<<
    const now = new Date();
    const activeCampaigns = await Campaign.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
    }).lean();

    let productObject = product.toObject();
    productObject.id = product._id.toString();
    delete productObject._id;
    delete productObject.__v;

    const originalPrice = product.price;
    let bestDiscount = 0;

    activeCampaigns.forEach(campaign => {
        const { type: scopeType, target: scopeTarget = [] } = campaign.scope;
        let isApplicable = false;
        
        if (scopeType === 'all') isApplicable = true;
        else if (scopeType === 'product') isApplicable = scopeTarget.map(String).includes(product._id.toString());
        else if (scopeType === 'parent-category') isApplicable = scopeTarget.includes(product.gender);
        else if (scopeType === 'category') isApplicable = scopeTarget.includes(product.category);
        else if (scopeType === 'child-category') isApplicable = scopeTarget.includes(product.childCategory);
        
        if (isApplicable) {
            const discountValue = campaign.discount.type === 'percentage'
                ? originalPrice * (campaign.discount.value / 100)
                : campaign.discount.value;
            if (discountValue > bestDiscount) {
                bestDiscount = discountValue;
            }
        }
    });

    if (bestDiscount > 0) {
        productObject.price = Math.round(originalPrice - bestDiscount);
        productObject.originalPrice = originalPrice;
    } else {
        productObject.originalPrice = null;
    }

    res.status(200).json({ success: true, data: productObject });
});

exports.createProduct = asyncHandler(async (req, res, next) => {
    req.body.user = req.user.id;
    let product = await Product.create(req.body);

    await logAction({
        user: req.user,
        action: 'CREATE_PRODUCT',
        entity: 'Product',
        entityId: product._id,
        details: `Admin created new product: '${product.name}' (ID: ${product._id})`,
        link: `/admin/products/edit/${product._id}`
    });

    product = await Product.findById(product._id).populate('brand category childCategory');

    res.status(201).json({
        success: true,
        data: product
    });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }
    
    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    await logAction({
        user: req.user,
        action: 'UPDATE_PRODUCT',
        entity: 'Product',
        entityId: product._id,
        details: `Admin updated product: '${product.name}' (ID: ${product._id})`,
        link: `/admin/products/edit/${product._id}`
    });

    product = await Product.findById(product._id).populate('brand category childCategory');

    res.status(200).json({ success: true, data: product });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    await product.deleteOne();

    await logAction({
        user: req.user,
        action: 'DELETE_PRODUCT',
        entity: 'Product',
        entityId: product._id,
        details: `Admin deleted product: '${product.name}' (ID: ${product._id})`,
    });
    res.status(200).json({ success: true, data: {} });
});

exports.getProductReviews = asyncHandler(async (req, res, next) => {
    const filter = { product: req.params.productId, status: 'approved' };
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Review.countDocuments(filter);
    const results = await Review.find(filter).sort(req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt').populate({ path: 'user', select: 'name' }).skip(startIndex).limit(limit);
    const pagination = {};
    if (endIndex < total) { pagination.next = { page: page + 1, limit }; }
    if (startIndex > 0) { pagination.prev = { page: page - 1, limit }; }
    res.status(200).json({ success: true, count: results.length, pagination, total, data: results });
});

exports.createProductReview = asyncHandler(async (req, res, next) => {
    req.body.product = req.params.productId;
    req.body.user = req.user.id;
    const existingReview = await Review.findOne({ product: req.params.productId, user: req.user.id });
    if (existingReview) { return next(new ErrorResponse('You have already submitted a review for this product', 400)); }
    const review = await Review.create(req.body);
    res.status(201).json({ success: true, data: review });
});