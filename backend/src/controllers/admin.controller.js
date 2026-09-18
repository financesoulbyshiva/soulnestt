import { prisma } from '../config/prisma.js';
import { ApiError, sendSuccess, asyncHandler } from '../utils/response.js';

function pagination(req) {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export const getDashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers, tenants, owners, admins,
    totalProperties, published, propertiesByStatus,
    pendingEnquiries, pendingReports, pendingVerifications,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'TENANT' } }),
    prisma.user.count({ where: { role: 'OWNER' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.property.count(),
    prisma.property.count({ where: { status: 'PUBLISHED' } }),
    prisma.property.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.enquiry.count({ where: { status: 'PENDING' } }),
    prisma.report.count({ where: { status: 'PENDING' } }),
    prisma.verification.count({ where: { status: 'PENDING' } }),
  ]);

  return sendSuccess(res, {
    users: { total: totalUsers, tenants, owners, admins },
    properties: {
      total: totalProperties,
      published,
      byStatus: propertiesByStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count._all }), {}),
    },
    pending: { enquiries: pendingEnquiries, reports: pendingReports, verifications: pendingVerifications },
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = pagination(req);
  const where = {};
  if (req.query.role) where.role = req.query.role;
  if (req.query.search) where.name = { contains: req.query.search, mode: 'insensitive' };

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        isActive: true, isVerified: true, createdAt: true,
      },
    }),
  ]);
  return sendSuccess(res, { users, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const getProperties = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = pagination(req);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.city) where.city = { equals: req.query.city, mode: 'insensitive' };

  const [total, properties] = await prisma.$transaction([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { owner: { select: { id: true, name: true, email: true } } },
    }),
  ]);
  return sendSuccess(res, { properties, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const getEnquiries = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = pagination(req);
  const where = {};
  if (req.query.status) where.status = req.query.status;

  const [total, enquiries] = await prisma.$transaction([
    prisma.enquiry.count({ where }),
    prisma.enquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        tenant: { select: { id: true, name: true, email: true } },
        owner: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, title: true } },
      },
    }),
  ]);
  return sendSuccess(res, { enquiries, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const getReports = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = pagination(req);
  const where = {};
  if (req.query.status) where.status = req.query.status;

  const [total, reports] = await prisma.$transaction([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedUser: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, title: true } },
      },
    }),
  ]);
  return sendSuccess(res, { reports, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const getVerifications = asyncHandler(async (req, res) => {
  const { page, limit, skip, take } = pagination(req);
  const where = {};
  if (req.query.status) where.status = req.query.status;

  const [total, verifications] = await prisma.$transaction([
    prisma.verification.count({ where }),
    prisma.verification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        property: { select: { id: true, title: true } },
        reviewedBy: { select: { id: true, name: true } },
      },
    }),
  ]);
  return sendSuccess(res, { verifications, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const updateVerification = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(status))
    throw new ApiError(400, 'status must be APPROVED or REJECTED');

  const verification = await prisma.verification.findUnique({ where: { id: req.params.id } });
  if (!verification) throw new ApiError(404, 'Verification not found');

  const updated = await prisma.verification.update({
    where: { id: verification.id },
    data: { status, reviewedById: req.user.id, reviewedAt: new Date() },
    include: { user: { select: { id: true, name: true, role: true } } },
  });

  if (status === 'APPROVED') {
    if (verification.type === 'USER') {
      await prisma.user.update({ where: { id: verification.userId }, data: { isVerified: true } });
    } else if (verification.type === 'OWNER') {
      await prisma.ownerProfile.updateMany({
        where: { userId: verification.userId },
        data: { verificationStatus: 'APPROVED' },
      });
      await prisma.user.update({ where: { id: verification.userId }, data: { isVerified: true } });
    }
  }

  return sendSuccess(res, { verification: updated });
});

export const updateReport = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['RESOLVED', 'DISMISSED'].includes(status))
    throw new ApiError(400, 'status must be RESOLVED or DISMISSED');

  const report = await prisma.report.findUnique({ where: { id: req.params.id } });
  if (!report) throw new ApiError(404, 'Report not found');

  const updated = await prisma.report.update({
    where: { id: report.id },
    data: { status },
  });
  return sendSuccess(res, { report: updated });
});
