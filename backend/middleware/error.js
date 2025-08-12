// middleware/error.js (New File)

const ErrorResponse = require('../utils/errorResponse');

/**
 * A centralized error handling middleware for Express.
 * It catches all errors passed via `next(err)` and sends a structured
 * JSON response to the client. It also handles specific Mongoose errors.
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log to console for the developer
  console.log(err.stack.red);
  console.log(err); // Log the full error object for more details

  // Mongoose Bad ObjectId (CastError)
  // This happens when an ID passed in the URL is not a valid ObjectId format.
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose Duplicate Key Error (code 11000)
  // This happens when a unique field (e.g., email) is duplicated.
  if (err.code === 11000) {
    // Extract the field that caused the error for a better message
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered for '${field}'. Please use another value.`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose Validation Error
  // This happens when required fields are missing or data types are wrong.
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    const message = `Invalid input data. ${messages.join('. ')}`;
    error = new ErrorResponse(message, 400);
  }

  // Send the final response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;