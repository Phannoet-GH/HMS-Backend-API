/**
 * 🚨 Centralized Global Error Handling Middleware
 * Catch-all interceptor for all operational and unexpected system rejections.
 */
const error = (error, req, res, next) => {
  // 1. Establish status and message fallbacks
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  // 2. Clear Server Log Audit: Crucial for backend debugging
  console.error(`[SYSTEM ERROR] [${req.method} ${req.url}] Status: ${statusCode}`);
  console.error(error.stack); // Prints full trace file line log to console terminal

  // 3. Environment-Aware Client Response Output
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    // 🔒 Hide detailed stack traces in production to prevent system exposure
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export default error;