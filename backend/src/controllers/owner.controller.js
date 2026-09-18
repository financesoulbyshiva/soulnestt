import { prisma } from '../config/prisma.js';
import { ApiError, sendSuccess, asyncHandler } from '../utils/response.js';
import { validateProperty } from '../validators/index.js';

const PROPERTY_FIELDS = [
  'title', 'description', 'propertyType', 'roomType', 'address', 'area', 'city',
  'state', 'pincode', 'latitude', 'longitude', 'rent', 'deposit',
  'availableFrom', 'genderPreference',
];

function pick(source, fields) {
  const out = {};
  for (const f of fields) if (source[f] !== undefined) out[f] = source[f];
  return out;
}

async function getOwnedProperty(id, ownerId) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      amenities: { include: { amenity: true } },
    },
  });
  if (!property) throw new ApiError(404, 'Property not found');
  if (property.ownerId !== ownerId) throw new ApiError(403, 'You do not own this property');
  return property;
}

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await prisma.ownerProfile.findUnique({
    where: { userId: req.user.id },
    include: { user: { select: { id: true, name: true, email: true, phone: true, isVerified: true } } },
  });
  return sendSuccess(res, { profile });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const userData = pick(req.body, ['name']);
  const profileData = pick(req.body, ['ownerType', 'organizationName', 'phone']);

  if (userData.name !== undefined && !String(userData.name).trim())
    throw new ApiError(400, 'name cannot be empty');
  if (profileData.ownerType !== undefined && !['INDIVIDUAL', 'ORGANIZATION'].includes(profileData.ownerType))
    throw new ApiError(400, 'ownerType must be INDIVIDUAL or ORGANIZATION');

  const [user, profile] = await prisma.$transaction([
    Object.keys(userData).length
      ? prisma.user.update({ where: { id: req.user.id }, data: userData, select: { id: true, name: true, email: true, phone: true } })
      : prisma.user.findUnique({ where: { id: req.user.id }, select: { id: true, name: true, email: true, phone: true } }),
    prisma.ownerProfile.upsert({
      where: { userId: req.user.id },
      update: profileData,
      create: { userId: req.user.id, ...profileData },
    }),
  ]);

  return sendSuccess(res, { user, profile });
});

export const getProperties = asyncHandler(async (req, res) => {
  const properties = await prisma.property.findMany({
    where: { ownerId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      _count: { select: { enquiries: true, savedBy: true } },
    },
  });
  return sendSuccess(res, { properties });
});

export const createProperty = asyncHandler(async (req, res) => {
  validateProperty(req.body);
  const data = pick(req.body, PROPERTY_FIELDS);
  if (data.availableFrom) data.availableFrom = new Date(data.availableFrom);
  if (data.rent !== undefined) data.rent = Number(data.rent);
  if (data.deposit !== undefined && data.deposit !== null && data.deposit !== '') data.deposit = Number(data.deposit);

  const property = await prisma.property.create({
    data: { ...data, ownerId: req.user.id },
    include: { images: true },
  });
  return sendSuccess(res, { property }, 201);
});

export const getProperty = asyncHandler(async (req, res) => {
  const property = await getOwnedProperty(req.params.id, req.user.id);
  return sendSuccess(res, { property });
});

export const updateProperty = asyncHandler(async (req, res) => {
  await getOwnedProperty(req.params.id, req.user.id);
  validateProperty(req.body, { partial: true });

  const data = pick(req.body, PROPERTY_FIELDS);
  if (data.availableFrom) data.availableFrom = new Date(data.availableFrom);
  if (data.rent !== undefined) data.rent = Number(data.rent);
  if (data.deposit !== undefined && data.deposit !== null && data.deposit !== '') data.deposit = Number(data.deposit);

  const property = await prisma.property.update({
    where: { id: req.params.id },
    data,
    include: { images: { orderBy: { sortOrder: 'asc' } }, amenities: { include: { amenity: true } } },
  });
  return sendSuccess(res, { property });
});

export const deleteProperty = asyncHandler(async (req, res) => {
  await getOwnedProperty(req.params.id, req.user.id);
  await prisma.property.delete({ where: { id: req.params.id } });
  return sendSuccess(res, { message: 'Property deleted' });
});

export const publishProperty = asyncHandler(async (req, res) => {
  const property = await getOwnedProperty(req.params.id, req.user.id);
  if (!property.title || !property.address || !property.city || !property.rent)
    throw new ApiError(400, 'Complete title, address, city and rent before publishing');

  const updated = await prisma.property.update({
    where: { id: property.id },
    data: { status: 'PUBLISHED' },
  });
  return sendSuccess(res, { property: updated });
});

export const pauseProperty = asyncHandler(async (req, res) => {
  const property = await getOwnedProperty(req.params.id, req.user.id);
  const updated = await prisma.property.update({
    where: { id: property.id },
    data: { status: 'PAUSED' },
  });
  return sendSuccess(res, { property: updated });
});

export const getEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await prisma.enquiry.findMany({
    where: { ownerId: req.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      property: { select: { id: true, title: true } },
      tenant: { select: { id: true, name: true } },
    },
  });
  return sendSuccess(res, { enquiries });
});

export const updateEnquiry = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['ACCEPTED', 'DECLINED', 'CLOSED'].includes(status))
    throw new ApiError(400, 'status must be ACCEPTED, DECLINED or CLOSED');

  const enquiry = await prisma.enquiry.findUnique({ where: { id: req.params.id } });
  if (!enquiry) throw new ApiError(404, 'Enquiry not found');
  if (enquiry.ownerId !== req.user.id) throw new ApiError(403, 'This enquiry is not for you');

  const updated = await prisma.enquiry.update({ where: { id: enquiry.id }, data: { status } });
  return sendSuccess(res, { enquiry: updated });
});
