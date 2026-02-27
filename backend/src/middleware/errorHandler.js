import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, _, res, next) => {
  console.error('Error:', err);

  // Handle ApiError instances
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || []
    });
  }

  // Handle validation errors (e.g., from mongoose)
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Handle cast errors (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // Default error handler
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === "production" && statusCode === 500
    ? "Something went wrong"
    : (err.message || "Internal Server Error");

  res.status(statusCode).json({
    success: false,
    message
  });
}