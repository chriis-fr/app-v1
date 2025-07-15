import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to check if token is about to expire (within 5 minutes)
const isTokenExpiringSoon = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    
    return (expirationTime - currentTime) < fiveMinutes;
  } catch (error) {
    return false;
  }
};

// Function to refresh token proactively
const refreshTokenIfNeeded = async (): Promise<string | null> => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  if (isTokenExpiringSoon(token)) {
    try {
      const response = await axios.post('/api/auth/refresh', {}, {
        withCredentials: true
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        return response.data.token;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      localStorage.removeItem('token');
      return null;
    }
  }
  
  return token;
};

// Add a request interceptor to include the auth token and refresh if needed
axiosInstance.interceptors.request.use(async (config) => {
  const token = await refreshTokenIfNeeded();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Check if it's a token expiration error
      if (error.response?.data?.error === 'TokenExpiredError' || 
          error.response?.data?.message?.includes('expired') ||
          error.response?.data?.error === 'Invalid token') {
        
        try {
          // Try to refresh the token
          const refreshResponse = await axios.post('/api/auth/refresh', {}, {
            withCredentials: true
          });
          
          if (refreshResponse.data.token) {
            // Update the token in localStorage
            localStorage.setItem('token', refreshResponse.data.token);
            
            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            return axiosInstance(originalRequest);
          }
        } catch (refreshError) {
          // If refresh fails, clear token and redirect
          localStorage.removeItem('token');
          window.location.href = '/auth';
          return Promise.reject(refreshError);
        }
      }
      
      // For other 401 errors, clear token and redirect
      localStorage.removeItem('token');
      window.location.href = '/auth';
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

export { axiosInstance }; 