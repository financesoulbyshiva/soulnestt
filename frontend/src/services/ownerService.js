import api, { unwrap } from './api.js';

export const getProfile = () => unwrap(api.get('/owner/profile'));
export const updateProfile = (payload) => unwrap(api.put('/owner/profile', payload));
export const getProperties = () => unwrap(api.get('/owner/properties'));
export const createProperty = (payload) => unwrap(api.post('/owner/properties', payload));
export const getProperty = (id) => unwrap(api.get(`/owner/properties/${id}`));
export const updateProperty = (id, payload) => unwrap(api.put(`/owner/properties/${id}`, payload));
export const deleteProperty = (id) => unwrap(api.delete(`/owner/properties/${id}`));
export const publishProperty = (id) => unwrap(api.post(`/owner/properties/${id}/publish`));
export const pauseProperty = (id) => unwrap(api.post(`/owner/properties/${id}/pause`));
export const getEnquiries = () => unwrap(api.get('/owner/enquiries'));
export const updateEnquiry = (id, payload) => unwrap(api.put(`/owner/enquiries/${id}`, payload));
