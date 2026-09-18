export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const sendSuccess = (res, data = {}, status = 200) =>
  res.status(status).json({ success: true, data });

export const sendError = (res, message, status = 400) =>
  res.status(status).json({ success: false, message });

export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
