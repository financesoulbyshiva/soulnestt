import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('soulnestt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      (err.code === 'ERR_NETWORK' ? 'Cannot reach the server. Is the backend running?' : err.message);
    return Promise.reject(new Error(message));
  }
);

export const unwrap = (promise) => promise.then((res) => res.data.data);

export default api;
