const mongoose = require('mongoose');

// Validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      error: 'Invalid ID format',
      message: 'The provided ID is not a valid MongoDB ObjectId'
    });
  }
  
  next();
};

// Validate student data for creation
const validateStudentCreation = (req, res, next) => {
  const { rollNumber, imageUrl, gender, instagramId } = req.body;
  const errors = [];

  // Required fields validation
  if (!rollNumber || typeof rollNumber !== 'string' || rollNumber.trim().length === 0) {
    errors.push('Roll number is required and must be a non-empty string');
  }

  if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
    errors.push('Image URL is required and must be a non-empty string');
  } else {
    // Validate image URL format
    const imageUrlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
    if (!imageUrlRegex.test(imageUrl.trim())) {
      errors.push('Image URL must be a valid HTTP/HTTPS URL ending with .jpg, .jpeg, .png, .gif, or .webp');
    }
  }

  if (!gender || typeof gender !== 'string' || !['male', 'female', 'other'].includes(gender.toLowerCase().trim())) {
    errors.push('Gender is required and must be one of: male, female, other');
  }

  // Optional Instagram ID validation
  if (instagramId && typeof instagramId === 'string' && instagramId.trim().length > 0) {
    const instagramRegex = /^[a-zA-Z0-9_.]{1,30}$/;
    if (!instagramRegex.test(instagramId.trim())) {
      errors.push('Instagram ID must contain only letters, numbers, dots, and underscores (max 30 characters)');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please check the following errors:',
      details: errors
    });
  }

  next();
};

// Validate vote data
const validateVote = (req, res, next) => {
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({
      error: 'Missing student ID',
      message: 'Student ID is required to record a vote'
    });
  }

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({
      error: 'Invalid student ID format',
      message: 'The provided student ID is not a valid MongoDB ObjectId'
    });
  }

  next();
};

// Validate query parameters for student listing
const validateStudentQuery = (req, res, next) => {
  const { page, limit, gender, sortBy, sortOrder } = req.query;
  const errors = [];

  // Validate page parameter
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    errors.push('Page must be a positive integer');
  }

  // Validate limit parameter
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    errors.push('Limit must be a positive integer between 1 and 100');
  }

  // Validate gender parameter
  if (gender && !['male', 'female', 'other'].includes(gender.toLowerCase())) {
    errors.push('Gender must be one of: male, female, other');
  }

  // Validate sortBy parameter
  const allowedSortFields = ['rollNumber', 'upvotes', 'gender', 'createdAt', 'updatedAt'];
  if (sortBy && !allowedSortFields.includes(sortBy)) {
    errors.push(`Sort field must be one of: ${allowedSortFields.join(', ')}`);
  }

  // Validate sortOrder parameter
  if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
    errors.push('Sort order must be either "asc" or "desc"');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Query validation failed',
      message: 'Please check the following errors:',
      details: errors
    });
  }

  // Normalize parameters
  if (gender) req.query.gender = gender.toLowerCase();
  if (sortOrder) req.query.sortOrder = sortOrder.toLowerCase();

  next();
};

// Rate limiting middleware (simple implementation)
const createRateLimit = (windowMs, maxRequests) => {
  const requests = new Map();

  return (req, res, next) => {
    const clientIp = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [ip, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter(time => time > windowStart);
      if (validTimestamps.length === 0) {
        requests.delete(ip);
      } else {
        requests.set(ip, validTimestamps);
      }
    }

    // Check current client
    const clientRequests = requests.get(clientIp) || [];
    const recentRequests = clientRequests.filter(time => time > windowStart);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Maximum ${maxRequests} requests per ${windowMs / 1000} seconds exceeded`,
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      });
    }

    // Add current request
    recentRequests.push(now);
    requests.set(clientIp, recentRequests);

    next();
  };
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  validateObjectId,
  validateStudentCreation,
  validateVote,
  validateStudentQuery,
  createRateLimit,
  asyncHandler
};