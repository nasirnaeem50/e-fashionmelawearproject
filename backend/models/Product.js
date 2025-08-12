// backend/models/Product.js

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
    },
    brand: {
        type: String,
        required: [true, 'Please add a brand name']
    },
    gender: { // Parent Category
        type: String,
        required: [true, 'Please specify gender/parent category'],
    },
    category: { // Sub-Category
        type: String,
        required: [true, 'Please specify a category'],
    },
    childCategory: { // Optional Child-Category
        type: String,
    },
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        default: 0,
    },
    image: {
        type: String,
        required: [true, 'Please add an image URL'],
    },
    images: {
        type: [String]
    },
    // ✅ This field is crucial for the "Featured Products" logic.
    // An admin will add the word "featured" to this array to make a product appear.
    tags: {
        type: [String],
    },
    sizes: {
        type: [String],
    },
    rating: {
        type: Number,
        default: 0,
    },
    reviewCount: {
        type: Number,
        default: 0,
    },
    sold: {
        type: Number,
        default: 0,
    },
    // The user field can be added if you want to track who created the product
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    // ✅ This is the automated part. Mongoose will automatically add
    // a `createdAt` and `updatedAt` field to every new product.
    // The `createdAt` field is what we will use to determine if a product is "new".
    timestamps: true 
});

ProductSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

ProductSchema.index({
    name: 'text',
    description: 'text',
    brand: 'text',
    category: 'text',
    tags: 'text'
});

ProductSchema.index({ gender: 1, category: 1, childCategory: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ sold: -1 });

module.exports = mongoose.model('Product', ProductSchema);