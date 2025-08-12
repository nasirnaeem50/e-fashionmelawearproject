// middleware/validator.js (New File)

const { validationResult } = require('express-validator');

/**
 * A middleware that checks for validation errors collected by express-validator.
 * If errors are found, it sends a 400 response with a list of the errors.
 * If no errors are found, it passes control to the next middleware in the stack.
 * 
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
const validate = (req, res, next) => {
  // Gathers any validation errors that were found on the request
  const errors = validationResult(req);

  // If the errors object is not empty, it means validation failed
  if (!errors.isEmpty()) {
    // We can format the errors to be more readable for the client
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

    // Send a 400 Bad Request response with the detailed errors
    return res.status(400).json({
      success: false,
      error: 'Validation failed', // Generic error message
      errors: extractedErrors,    // Specific field errors
    });
  }

  // If there are no validation errors, proceed to the next middleware (usually the controller)
  next();
};

module.exports = {
  validate,
};