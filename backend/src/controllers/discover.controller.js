import { prisma } from '../config/prisma.js';
import { ApiError, sendSuccess, asyncHandler } from '../utils/response.js';

const PROPERTY_TYPES = ['ROOM', 'FLAT', 'PG', 'SHARED_SPACE'];
const GENDER_PREFERENCES = ['MALE', 'FEMALE', 'ANY'];

export const getProperties = asyncHandler(async (req, res) => {
  const {
    city, area, propertyType, roomType, rentMin, rentMax,
    genderPreference, availableFrom, amenities,
  } = req.query;

  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));

  const where = { status: 'PUBLISHED' };

  if (city) where.city = { equals: city, mode: 'insensitive' };
  if (area) where.area = { contains: area, mode: 'insensitive' };

  if (propertyType) {
    if (!PROPERTY_TYPES.includes(propertyType))
      throw new ApiError(400, `propertyType must be one of: ${PROPERTY_TYPES.join(', ')}`);
    where.propertyType = propertyType;
  }
  if (roomType) where.roomType = roomType.toUpperCase();

  if (rentMin !== undefined || rentMax !== undefined) {
    where.rent = {};
    if (rentMin !== undefined) {
      if (isNaN(Number(rentMin))) throw new ApiError(400, 'rentMin must be a number');
      where.rent.gte = Number(rentMin);
    }
    if (rentMax !== undefined) {
      if (isNaN(Number(rentMax))) throw new ApiError(400, 'rentMax must be a number');
      where.rent.lte = Number(rentMax);
    }
  }

  if (genderPreference) {
    if (!GENDER_PREFERENCES.includes(genderPreference))
      throw new ApiError(400, `genderPreference must be one of: ${GENDER_PREFERENCES.join(', ')}`);
    where.genderPreference = { in: genderPreference === 'ANY' ? ['ANY'] : ['ANY', genderPreference] };
  }

  if (availableFrom) {
    const d = new Date(availableFrom);
    if (isNaN(d)) throw new ApiError(400, 'availableFrom must be a valid date');
    where.OR = [{ availableFrom: { lte: d } }, { availableFrom: null }];
  }

  if (amenities) {
    const names = String(amenities).split(',').map((s) => s.trim()).filter(Boolean);
    if (names.length) {
      where.AND = names.map((name) => ({
        amenities: { some: { amenity: { name: { equals: name, mode: 'insensitive' } } } },
      }));
    }
  }

  const [total, properties] = await prisma.$transaction([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true, title: true, description: true, propertyType: true, roomType: true,
        address: true, area: true, city: true, state: true, pincode: true,
        rent: true, deposit: true, availableFrom: true, genderPreference: true,
        status: true, createdAt: true,
        images: { orderBy: { sortOrder: 'asc' }, select: { url: true, sortOrder: true } },
        amenities: { select: { amenity: { select: { id: true, name: true, icon: true } } } },
        owner: { select: { name: true } },
        _count: { select: { savedBy: true } },
      },
    }),
  ]);

  return sendSuccess(res, {
    properties: properties.map(({ owner, ...p }) => ({ ...p, ownerName: owner.name })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});
