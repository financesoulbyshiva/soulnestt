import api, { unwrap } from './api.js';

export const getProfile = () => unwrap(api.get('/tenant/profile'));
export const updateProfile = (payload) => unwrap(api.put('/tenant/profile', payload));
export const getPreferences = () => unwrap(api.get('/tenant/preferences'));
export const updatePreferences = (payload) => unwrap(api.put('/tenant/preferences', payload));
export const getSaved = () => unwrap(api.get('/tenant/saved'));
export const saveProperty = (propertyId) => unwrap(api.post(`/tenant/saved/${propertyId}`));
export const unsaveProperty = (propertyId) => unwrap(api.delete(`/tenant/saved/${propertyId}`));
export const getEnquiries = () => unwrap(api.get('/tenant/enquiries'));
export const createEnquiry = (payload) => unwrap(api.post('/tenant/enquiries', payload));
