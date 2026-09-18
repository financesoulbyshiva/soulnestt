import { ApiError, sendError } from '../utils/response.js';

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.code === 'P2002') return sendError(res, 'A record with this value already exists', 409);
  if (err.code === 'P2025') return sendError(res, 'Record not found', 404);
  if (err instanceof ApiError) return sendError(res, err.message, err.status);

  console.error(err);
  return sendError(res, 'Internal server error', 500);
}
