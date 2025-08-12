// middleware/advancedResults.js (New File)

/**
 * A reusable middleware for advanced query results including pagination, sorting,
 * field selection, and filtering for any Mongoose model.
 *
 * @param {object} model - The Mongoose model to query (e.g., Product, Order).
 * @param {string|object} populate - Optional. The field(s) to populate for the query.
 */
const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // Copy req.query to a mutable object
  const reqQuery = { ...req.query };

  // Fields to exclude from filtering because they are special query keywords, not fields in the model
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from the reqQuery object
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string from the remaining parameters
  let queryStr = JSON.stringify(reqQuery);

  // Create operators like $gt, $gte, etc., for filtering (e.g., ?price[lte]=500)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource using the filtered query
  query = model.find(JSON.parse(queryStr));

  // --- Field Selection (e.g., ?select=name,price) ---
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // --- Sorting (e.g., ?sort=-price) ---
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    // Default sort: newest first
    query = query.sort('-createdAt');
  }

  // --- Pagination (e.g., ?page=2&limit=10) ---
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25; // Default limit: 25 per page
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments(JSON.parse(queryStr)); // Get total document count for pagination info

  query = query.skip(startIndex).limit(limit);

  // --- Populate related data (optional) ---
  if (populate) {
    query = query.populate(populate);
  }

  // Executing the final query
  const results = await query;

  // --- Constructing the pagination result object ---
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  // Attach the results and pagination info to the response object
  // This makes it available to the next middleware in the chain (the controller)
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    total,
    data: results
  };

  next();
};

module.exports = advancedResults;