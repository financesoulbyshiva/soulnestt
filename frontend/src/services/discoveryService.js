import api, { unwrap } from './api.js';

export const getProperties = (params) => unwrap(api.get('/discover/properties', { params }));
