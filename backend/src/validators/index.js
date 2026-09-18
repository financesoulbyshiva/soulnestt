import { ApiError } from '../utils/response.js';

export const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isPhone = (v) => v === undefined || v === null || v === '' || (typeof v === 'string' && /^\+?[0-9\s-]{7,15}$/.test(v));
export const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
export const isInt = (v) => v !== '' && v !== undefined && v !== null && Number.isInteger(Number(v));
export const isPositiveInt = (v) => isInt(v) && Number(v) > 0;

export function validateRegister(body) {
  const { name, email, password, phone } = body;
  if (!isNonEmptyString(name)) throw new ApiError(400, 'Name is required');
  if (!isEmail(email)) throw new ApiError(400, 'Valid email is required');
  if (typeof password !== 'string' || password.length < 8)
    throw new ApiError(400, 'Password must be at least 8 characters');
  if (!isPhone(phone)) throw new ApiError(400, 'Phone number is invalid');
}

export function validateLogin(body) {
  if (!isEmail(body.email)) throw new ApiError(400, 'Valid email is required');
  if (typeof body.password !== 'string' || !body.password)
    throw new ApiError(400, 'Password is required');
}

const PROPERTY_TYPES = ['ROOM', 'FLAT', 'PG', 'SHARED_SPACE'];
const ROOM_TYPES = ['SINGLE', 'SHARED', 'ENTIRE'];

export function validateProperty(body, { partial = false } = {}) {
  if (body.title !== undefined) {
    if (!isNonEmptyString(body.title)) throw new ApiError(400, 'Property title is required');
  } else if (!partial) throw new ApiError(400, 'Property title is required');

  if (body.propertyType !== undefined) {
    if (!PROPERTY_TYPES.includes(body.propertyType))
      throw new ApiError(400, `propertyType must be one of: ${PROPERTY_TYPES.join(', ')}`);
  } else if (!partial) throw new ApiError(400, 'propertyType is required');

  if (body.roomType !== undefined && body.roomType !== null && body.roomType !== '') {
    if (!ROOM_TYPES.includes(body.roomType))
      throw new ApiError(400, `roomType must be one of: ${ROOM_TYPES.join(', ')}`);
  }

  if (body.rent !== undefined) {
    if (!isPositiveInt(body.rent)) throw new ApiError(400, 'rent must be a positive number');
  } else if (!partial) throw new ApiError(400, 'rent is required');

  if (body.deposit !== undefined && body.deposit !== null && body.deposit !== '') {
    if (!isInt(body.deposit) || Number(body.deposit) < 0)
      throw new ApiError(400, 'deposit must be a non-negative number');
  }

  if (body.address !== undefined) {
    if (!isNonEmptyString(body.address)) throw new ApiError(400, 'address is required');
  } else if (!partial) throw new ApiError(400, 'address is required');

  if (body.city !== undefined) {
    if (!isNonEmptyString(body.city)) throw new ApiError(400, 'city is required');
  } else if (!partial) throw new ApiError(400, 'city is required');

  if (body.pincode !== undefined && body.pincode !== null && body.pincode !== '') {
    if (!/^[0-9]{4,10}$/.test(String(body.pincode)))
      throw new ApiError(400, 'pincode must be 4-10 digits');
  }

  if (body.availableFrom !== undefined && body.availableFrom !== null && body.availableFrom !== '') {
    if (isNaN(Date.parse(body.availableFrom)))
      throw new ApiError(400, 'availableFrom must be a valid date');
  }
}
