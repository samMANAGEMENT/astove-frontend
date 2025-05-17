import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_KEY_BACKEND,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agregar interceptor para incluir el token en todas las solicitudes
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
