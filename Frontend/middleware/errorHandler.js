function errorHandler(error, _req, res, _next) {
  console.error('[ERROR]', error.stack || error.message);

  if (error.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: error.message, errorCode: 'VALIDATION_ERROR' });
  }
  if (error.code === 11000) {
    return res.status(409).json({ success: false, message: 'A record with the same unique value already exists', errorCode: 'DUPLICATE_RECORD' });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid resource identifier', errorCode: 'INVALID_ID' });
  }

  const response = {
    success: false,
    message: error.status ? error.message : 'Internal server error',
    errorCode: error.errorCode || 'INTERNAL_ERROR',
  };
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG_ERRORS === 'true' && error.stack) response.stack = error.stack;
  return res.status(error.status || 500).json(response);
}

module.exports = errorHandler;
