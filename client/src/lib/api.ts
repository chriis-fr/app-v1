import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Fetcher function for SWR
export const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);

export const api = {
  get: (endpoint: string) => axiosInstance.get(endpoint).then((res) => res.data),
  post: (endpoint: string, data: any) => axiosInstance.post(endpoint, data).then((res) => res.data),
  put: (endpoint: string, data: any) => axiosInstance.put(endpoint, data).then((res) => res.data),
  patch: (endpoint: string, data: any) => axiosInstance.patch(endpoint, data).then((res) => res.data),
  delete: (endpoint: string) => axiosInstance.delete(endpoint).then((res) => res.data),
}; 