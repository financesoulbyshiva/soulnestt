import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { ApiError, sendSuccess, asyncHandler } from '../utils/response.js';
import { validateRegister, validateLogin } from '../validators/index.js';

const TOKEN_TTL = '7d';

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function publicUser(user) {
  const { passwordHash, ...rest } = user;
  return rest;
}

async function registerWithRole(role, req, res) {
  validateRegister(req.body);
  const { name, email, phone, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      passwordHash,
      role,
      ...(role === 'TENANT' ? { tenantProfile: { create: {} } } : {}),
      ...(role === 'OWNER' ? { ownerProfile: { create: { phone: phone || null } } } : {}),
    },
  });

  return sendSuccess(res, { user: publicUser(user), token: signToken(user) }, 201);
}

export const registerTenant = asyncHandler((req, res) => registerWithRole('TENANT', req, res));
export const registerOwner = asyncHandler((req, res) => registerWithRole('OWNER', req, res));

export const login = asyncHandler(async (req, res) => {
  validateLogin(req.body);
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    throw new ApiError(401, 'Invalid email or password');
  if (!user.isActive) throw new ApiError(403, 'Account is deactivated');
  if (user.role === 'ADMIN') throw new ApiError(403, 'Admins must use the admin login endpoint');

  return sendSuccess(res, { user: publicUser(user), token: signToken(user) });
});

export const loginAdmin = asyncHandler(async (req, res) => {
  validateLogin(req.body);
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.role !== 'ADMIN' || !(await bcrypt.compare(password, user.passwordHash)))
    throw new ApiError(401, 'Invalid admin credentials');
  if (!user.isActive) throw new ApiError(403, 'Account is deactivated');

  return sendSuccess(res, { user: publicUser(user), token: signToken(user) });
});

export const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { tenantProfile: true, ownerProfile: true },
  });
  return sendSuccess(res, { user: publicUser(user) });
});

export const logout = asyncHandler(async (req, res) => {
  return sendSuccess(res, { message: 'Logged out' });
});
