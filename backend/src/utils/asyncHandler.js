const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      // Enhanced error handling for payment operations
      if (err.statusCode) {
        return res.status(err.statusCode).json({
          success: false,
          message: err.message,
          errors: err.errors || [],
          data: null
        });
      }
      
      // Generic error handling
      console.error('Unhandled error:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        errors: [],
        data: null
      });
    });
  };
};

export { asyncHandler };