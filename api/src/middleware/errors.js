export class HttpError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFound(req, res, next) {
    next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: { message: err.message, details: err.details },
    });
  }
  console.error(err);   //log it on the server only
  res.status(500).json({
    error: { message: 'Internal server error', details: null },
  });
}