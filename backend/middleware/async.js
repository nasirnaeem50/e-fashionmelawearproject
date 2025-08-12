// Filename: backend/middleware/async.js

/**
 * An async handler utility to wrap around Express route controller functions.
 * It catches any errors that occur within an async function and passes
 * them to the next error-handling middleware, preventing the server from crashing.
 *
 * @param {function} fn - The asynchronous controller function to execute.
 * @returns {function} A new function that Express can run.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise
        .resolve(fn(req, res, next))
        .catch(next); // Pass any caught errors to the next middleware
};

module.exports = asyncHandler;