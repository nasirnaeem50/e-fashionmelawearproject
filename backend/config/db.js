const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // The connection logic remains the same
        await mongoose.connect(process.env.MONGO_URI);

        // --- THIS IS THE MODIFIED LINE ---
        // We now log a simple, clean success message instead of the connection host.
        console.log(`MongoDB Connected Successfully.`.cyan.bold);

    } catch (err) {
        console.error(`Error connecting to MongoDB: ${err.message}`.red.bold);
        process.exit(1);
    }
};

module.exports = connectDB;