export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  
  // Custom response for Zod errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: err.errors.map(e => ({ path: e.path, message: e.message }))
    });
  }

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
