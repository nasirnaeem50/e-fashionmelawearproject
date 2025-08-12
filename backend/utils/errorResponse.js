// utils/errorResponse.js (New File)

/**
 * @class ErrorResponse
 * @extends Error
 * @description A custom error class to handle operational, predictable errors in a structured way.
 * This ensures all errors sent back to the client have a consistent format with a message and a status code.
 *
 * @param {string} message - The error message that will be sent to the client.
 * @param {number} statusCode - The HTTP status code to be sent with the response.
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    // Call the parent constructor (Error) with the message
    super(message);
    
    // Add the statusCode property to this error object
    this.statusCode = statusCode;
    
    // Determine if the error is operational (predictable) vs. a programming bug
    // 4xx status codes are considered operational, 5xx are server errors
    this.isOperational = `${statusCode}`.startsWith('4');

    // Capture the stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse;