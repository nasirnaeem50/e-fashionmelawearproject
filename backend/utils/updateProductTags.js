const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const Product = require('../models/Product');

// NOTE: This script no longer needs the Campaign model, simplifying it.

// Load env vars
dotenv.config({ path: './.env' });

// Connect to DB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log('MongoDB Connected for tag update job...'.cyan);
    } catch (err) {
        console.error(`Error connecting to DB: ${err.message}`.red);
        process.exit(1);
    }
};

const updateProductTags = async () => {
    await connectDB();
    console.log('🚀 Starting automated product tag update process...'.cyan);

    try {
        // --- Step 1: Update Bestseller Tags ---
        console.log('Updating bestseller tags...');
        // Find products that have sold at least, for example, 5 units.
        // You can adjust this threshold as you see fit.
        const bestsellers = await Product.find({ sold: { $gte: 5 } }).select('_id');
        const bestsellerIds = bestsellers.map(p => p._id);
        
        // Add the 'bestseller' tag to these products.
        // $addToSet is great because it only adds the tag if it's not already there.
        await Product.updateMany(
            { _id: { $in: bestsellerIds } }, 
            { $addToSet: { tags: 'bestseller' } }
        );

        // Remove the 'bestseller' tag from all other products.
        await Product.updateMany(
            { _id: { $nin: bestsellerIds } }, 
            { $pull: { tags: 'bestseller' } }
        );

        console.log(`✅  Updated bestseller tags for ${bestsellerIds.length} products.`.green);


        // --- Step 2: Update Top Rated Tags ---
        console.log('Updating top-rated tags...');
        // Find products with an average rating of 4.5 or higher.
        // This is more flexible than just looking for a perfect 5.
        const topRatedProducts = await Product.find({ rating: { $gte: 4.5 } }).select('_id');
        const topRatedIds = topRatedProducts.map(p => p._id);

        // Add the 'top-rated' tag to these products.
        await Product.updateMany(
            { _id: { $in: topRatedIds } }, 
            { $addToSet: { tags: 'top-rated' } }
        );
        
        // Remove the 'top-rated' tag from all other products.
        await Product.updateMany(
            { _id: { $nin: topRatedIds } }, 
            { $pull: { tags: 'top-rated' } }
        );
        console.log(`✅  Updated top-rated tags for ${topRatedIds.length} products.`.green);


        console.log('🎉 Automated tag update process finished successfully!'.cyan.bold);

    } catch (error) {
        console.error('❌ Error during automated tag update process:'.red.bold, error);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB Disconnected.');
    }
};

// This line allows you to run the script directly from the command line: `node utils/updateProductTags.js`
updateProductTags();