// frontend/src/api.js
import axios from 'axios';
import { toast } from 'react-toastify';

// Create a new axios instance
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Use an interceptor to add the auth token to every request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: Add a response interceptor to handle expired tokens globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // If we get a 401, the token is invalid or expired
            localStorage.removeItem('token');
            // Redirect to login page, preventing infinite loops
            if (window.location.pathname !== '/login') {
                toast.error("Your session has expired. Please log in again.");
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;