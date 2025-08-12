// backend/models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    rating: { type: Number, min: 1, max: 5, required: [true, 'Please add a rating between 1 and 5'], },
    comment: { type: String, required: [true, 'Please add a comment'], },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', },
    product: { type: mongoose.Schema.ObjectId, ref: 'Product', required: true, },
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, },
    createdAt: { type: Date, default: Date.now, },
});

// Static method to get avg rating and save to product
ReviewSchema.statics.getAverageRating = async function(productId) {
    const obj = await this.aggregate([
        { $match: { product: productId, status: 'approved' } },
        { $group: { _id: '$product', rating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } }
    ]);

    try {
        if (obj.length > 0) {
            await this.model('Product').findByIdAndUpdate(productId, {
                rating: obj[0].rating.toFixed(1),
                reviewCount: obj[0].reviewCount
            });
        } else {
            await this.model('Product').findByIdAndUpdate(productId, {
                rating: 0,
                reviewCount: 0
            });
        }
    } catch (err) { console.error(err); }
};

// Call getAverageRating after a review is saved
ReviewSchema.post('save', async function() {
    await this.constructor.getAverageRating(this.product);
});

// Call getAverageRating when a review is deleted
ReviewSchema.pre('deleteOne', { document: true, query: false }, async function() {
    this.productForRemoval = this.product;
});
ReviewSchema.post('deleteOne', { document: true, query: false }, async function() {
    await this.constructor.getAverageRating(this.productForRemoval);
});

// JSON transform to use 'id' instead of '_id' for consistency
ReviewSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('Review', ReviewSchema);