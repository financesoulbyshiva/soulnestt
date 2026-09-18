import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/response.js';

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new ApiError(401, 'Not authenticated');

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new ApiError(401, 'Invalid or expired token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, isVerified: true },
    });
    if (!user || !user.isActive) throw new ApiError(401, 'Account not found or inactive');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Not authenticated'));
  if (!roles.includes(req.user.role)) return next(new ApiError(403, 'Forbidden: insufficient role'));
  next();
};

export const requireTenant = requireRole('TENANT');
export const requireOwner = requireRole('OWNER');
export const requireAdmin = requireRole('ADMIN');
