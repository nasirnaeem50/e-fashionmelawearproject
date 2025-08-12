// backend/models/Category.js
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        trim: true,
    },
    parentCategory: {
        type: String,
        required: [true, 'Please specify the parent category (e.g., Men, Women)'],
        trim: true,
    },
    image: {
        type: String,
        required: [true, 'Please add an image URL'],
    },
    children: [{
        // --- THIS IS THE FIX ---
        // By default, Mongoose subdocuments in an array don't get an _id.
        // We explicitly tell it to create one.
        _id: { 
            type: mongoose.Schema.Types.ObjectId, 
            default: () => new mongoose.Types.ObjectId() 
        },
        // --- END OF FIX ---
        name: {
            type: String,
            required: true,
            trim: true
        },
        image: {
            type: String,
            required: [true, 'Please provide an image for the child category']
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// To ensure a sub-category name is unique within its parent
CategorySchema.index({ name: 1, parentCategory: 1 }, { unique: true });

// JSON transform to use 'id' instead of '_id'
CategorySchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        // Manually transform children subdocuments
        if (returnedObject.children) {
            returnedObject.children = returnedObject.children.map(child => {
                // Check if the child is a Mongoose document before transforming
                if (child._id) {
                    child.id = child._id.toString();
                    delete child._id;
                }
                return child;
            });
        }
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});


module.exports = mongoose.model('Category', CategorySchema);