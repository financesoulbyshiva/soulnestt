import { prisma } from '../config/prisma.js';
import { ApiError, sendSuccess, asyncHandler } from '../utils/response.js';

const PREFERENCE_FIELDS = [
  'gender', 'age', 'occupation', 'collegeOrCompany', 'budgetMin', 'budgetMax',
  'preferredLocations', 'roomType', 'moveInDate', 'foodPreference',
  'smokingPreference', 'sleepSchedule', 'cleanlinessPreference', 'bio',
];

function pick(source, fields) {
  const out = {};
  for (const f of fields) if (source[f] !== undefined) out[f] = source[f];
  return out;
}

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await prisma.tenantProfile.findUnique({
    where: { userId: req.user.id },
    include: { user: { select: { id: true, name: true, email: true, phone: true, isVerified: true } } },
  });
  return sendSuccess(res, { profile });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userData = pick(req.body, ['name', 'phone']);
  const profileData = pick(req.body, PREFERENCE_FIELDS);

  if (userData.name !== undefined && !String(userData.name).trim())
    throw new ApiError(400, 'name cannot be empty');
  if (profileData.moveInDate) profileData.moveInDate = new Date(profileData.moveInDate);

  const [user, profile] = await prisma.$transaction([
    Object.keys(userData).length
      ? prisma.user.update({ where: { id: req.user.id }, data: userData, select: { id: true, name: true, email: true, phone: true } })
      : prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, name: true, email: true, phone: true } }),
    prisma.tenantProfile.upsert({
      where: { userId: req.user.id },
      update: profileData,
      create: { userId: req.user.id, ...profileData },
    }),
  ]);

  return sendSuccess(res, { user, profile });
});

export const getPreferences = asyncHandler(async (req, res) => {
  const profile = await prisma.tenantProfile.findUnique({ where: { userId: req.user.id } });
  return sendSuccess(res, { preferences: profile ? pick(profile, PREFERENCE_FIELDS) : {} });
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const data = pick(req.body, PREFERENCE_FIELDS);
  if (data.moveInDate) data.moveInDate = new Date(data.moveInDate);
  if (data.budgetMin !== undefined && data.budgetMax !== undefined && Number(data.budgetMin) > Number(data.budgetMax))
    throw new ApiError(400, 'budgetMin cannot exceed budgetMax');

  const profile = await prisma.tenantProfile.upsert({
    where: { userId: req.user.id },
    update: data,
    create: { userId: req.user.id, ...data },
  });
  return sendSuccess(res, { preferences: pick(profile, PREFERENCE_FIELDS) });
});

const propertyPublicSelect = {
  id: true, title: true, propertyType: true, roomType: true, area: true, city: true,
  rent: true, deposit: true, availableFrom: true, genderPreference: true, status: true,
  images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } },
};

export const getSaved = asyncHandler(async (req, res) => {
  const saved = await prisma.savedProperty.findMany({
    where: { tenantId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: { property: { select: propertyPublicSelect } },
  });
  return sendSuccess(res, { saved });
});

export const saveProperty = asyncHandler(async (req, res) => {
  const property = await prisma.property.findUnique({ where: { id: req.params.propertyId } });
  if (!property) throw new ApiError(404, 'Property not found');
  if (property.status !== 'PUBLISHED') throw new ApiError(400, 'Property is not available');

  const existing = await prisma.savedProperty.findUnique({
    where: { tenantId_propertyId: { tenantId: req.user.id, propertyId: property.id } },
  });
  if (existing) throw new ApiError(409, 'Property already saved');

  const saved = await prisma.savedProperty.create({
    data: { tenantId: req.user.id, propertyId: property.id },
    include: { property: { select: propertyPublicSelect } },
  });
  return sendSuccess(res, { saved }, 201);
});

export const unsaveProperty = asyncHandler(async (req, res) => {
  const { count } = await prisma.savedProperty.deleteMany({
    where: { tenantId: req.user.id, propertyId: req.params.propertyId },
  });
  if (!count) throw new ApiError(404, 'Saved property not found');
  return sendSuccess(res, { message: 'Removed from saved' });
});

export const getEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await prisma.enquiry.findMany({
    where: { tenantId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      property: { select: { id: true, title: true, city: true, area: true } },
      owner: { select: { id: true, name: true } },
    },
  });
  return sendSuccess(res, { enquiries });
});

export const createEnquiry = asyncHandler(async (req, res) => {
  const { propertyId, message } = req.body;
  if (!propertyId) throw new ApiError(400, 'propertyId is required');
  if (!message || !String(message).trim()) throw new ApiError(400, 'message is required');
  if (String(message).length > 2000) throw new ApiError(400, 'message is too long (max 2000 characters)');

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) throw new ApiError(404, 'Property not found');
  if (property.status !== 'PUBLISHED') throw new ApiError(400, 'Property is not available');
  if (property.ownerId === req.user.id) throw new ApiError(400, 'You cannot enquire on your own property');

  const enquiry = await prisma.enquiry.create({
    data: { tenantId: req.user.id, ownerId: property.ownerId, propertyId: property.id, message },
    include: { property: { select: { id: true, title: true } } },
  });
  return sendSuccess(res, { enquiry }, 201);
});
