import api, { unwrap } from './api.js';

export const getDashboard = () => unwrap(api.get('/admin/dashboard'));
export const getUsers = (params) => unwrap(api.get('/admin/users', { params }));
export const getProperties = (params) => unwrap(api.get('/admin/properties', { params }));
export const getEnquiries = (params) => unwrap(api.get('/admin/enquiries', { params }));
export const getReports = (params) => unwrap(api.get('/admin/reports', { params }));
export const getVerifications = (params) => unwrap(api.get('/admin/verifications', { params }));
export const updateVerification = (id, payload) => unwrap(api.put(`/admin/verifications/${id}`, payload));
export const updateReport = (id, payload) => unwrap(api.put(`/admin/reports/${id}`, payload));
