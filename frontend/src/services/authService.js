import api, { unwrap } from './api.js';

export const registerTenant = (payload) => unwrap(api.post('/auth/register/tenant', payload));
export const registerOwner = (payload) => unwrap(api.post('/auth/register/owner', payload));
export const login = (payload) => unwrap(api.post('/auth/login', payload));
export const loginAdmin = (payload) => unwrap(api.post('/auth/login/admin', payload));
export const me = () => unwrap(api.get('/auth/me'));
export const logout = () => unwrap(api.post('/auth/logout'));
