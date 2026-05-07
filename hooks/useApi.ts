import { useAuthStore } from '@/stores';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  requireAuth?: boolean;
}

export const useApi = () => {
  const { token, logout } = useAuthStore();

  const apiCall = async (url: string, options: ApiOptions = {}) => {
    const {
      method = 'GET',
      body,
      headers = {},
      requireAuth = false,
    } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    // Add auth token if required
    if (requireAuth && token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    // Add body for POST/PUT requests
    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);

      // Handle unauthorized responses
      if (response.status === 401 && requireAuth) {
        logout();
        throw new Error('Session expired. Please login again.');
      }

      // Handle other error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  return {
    get: (url: string, requireAuth = false) => apiCall(url, { method: 'GET', requireAuth }),
    post: (url: string, body?: any, requireAuth = false) => 
      apiCall(url, { method: 'POST', body, requireAuth }),
    put: (url: string, body?: any, requireAuth = false) => 
      apiCall(url, { method: 'PUT', body, requireAuth }),
    delete: (url: string, requireAuth = false) => 
      apiCall(url, { method: 'DELETE', requireAuth }),
    patch: (url: string, body?: any, requireAuth = false) => 
      apiCall(url, { method: 'PATCH', body, requireAuth }),
  };
};
