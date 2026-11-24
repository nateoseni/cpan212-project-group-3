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
      error: { message: err.message, details: err.details }
    });
  }

  //request body not valid JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: {message: 'Request body is not valid JSON', details: null}
    });
  }

  //Mongoose schema validation fail
  //err.errors has one entry per failed field, turn it into the same details list the rost of the API uses
  if (err.name === 'ValidationError' && err.errors) {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ error: { message: 'Validation failed', details }});
  }

  //value that cant be converted to the right type (CastError)
  if (err.name === 'CastError') {
    if (err.path === '_id') {
      return res.status(404).json({ error: { message: 'Resource not found', details: null }})
    }
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        details: [{ field: err.path, message: 'is not valid' }],
      },
    });
  }


  console.error(err); //log it on the server only
  res.status(500).json({
    error: { message: 'Internal server error', details: null },
  });
}