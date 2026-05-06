// API Client for backend integration

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl = '';

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Get auth token
      const token = this.getAuthToken();
      
      const url = `${this.baseUrl}${endpoint}`;
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => null);

      return {
        data: response.ok ? data : undefined,
        error: !response.ok ? (data?.error || `Request failed (${response.status})`) : undefined,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  private getAuthToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1] || null;
  }

  // Dashboard API
  async getDashboardData(timeRange: string = '7d') {
    return this.request('/api/agent/dashboard');
  }

  // Properties API
  async getProperties(filters?: Record<string, any>) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/agent/properties?${params}`);
  }

  async createProperty(propertyData: any) {
    return this.request('/api/agent/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
    });
  }

  async getProperty(id: string) {
    return this.request(`/api/properties/${id}`);
  }

  async updateProperty(id: string, propertyData: any) {
    return this.request(`/api/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
    });
  }

  async deleteProperty(id: string) {
    return this.request(`/api/properties/${id}`, {
      method: 'DELETE',
    });
  }

  // Messages API
  async getConversations() {
    return this.request('/api/messages');
  }

  async getMessages(conversationId: string) {
    return this.request(`/api/messages/${conversationId}`);
  }

  async sendMessage(messageData: {
    conversationId: string;
    content: string;
    receiverId: string;
    propertyId?: string;
    type?: string;
  }) {
    return this.request('/api/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async markMessageAsRead(messageId: string) {
    return this.request('/api/messages', {
      method: 'PUT',
      body: JSON.stringify({ messageId }),
    });
  }

  async deleteMessage(messageId: string) {
    return this.request('/api/messages', {
      method: 'DELETE',
      body: JSON.stringify({ messageId }),
    });
  }

  // Auth API
  async login(credentials: { email: string; password: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // Search API
  async searchProperties(query: string, filters?: Record<string, any>) {
    const params = new URLSearchParams({ query, ...filters });
    return this.request(`/api/search?${params}`);
  }

  // Payments API
  async getPaymentHistory() {
    return this.request('/api/payments/history');
  }

  async initiateMpesaPayment(paymentData: any) {
    return this.request('/api/payments/mpesa/stkpush', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Stats API
  async getPublicStats() {
    return this.request('/api/public-stats');
  }

  async getAgentStats() {
    return this.request('/api/stats');
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// Export convenience functions
export const dashboardApi = {
  getDashboardData: apiClient.getDashboardData.bind(apiClient),
};

export const propertyApi = {
  getProperties: apiClient.getProperties.bind(apiClient),
  createProperty: apiClient.createProperty.bind(apiClient),
  getProperty: apiClient.getProperty.bind(apiClient),
  updateProperty: apiClient.updateProperty.bind(apiClient),
  deleteProperty: apiClient.deleteProperty.bind(apiClient),
};

export const messageApi = {
  getConversations: apiClient.getConversations.bind(apiClient),
  getMessages: apiClient.getMessages.bind(apiClient),
  sendMessage: apiClient.sendMessage.bind(apiClient),
  markAsRead: apiClient.markMessageAsRead.bind(apiClient),
  deleteMessage: apiClient.deleteMessage.bind(apiClient),
};

export const authApi = {
  login: apiClient.login.bind(apiClient),
  logout: apiClient.logout.bind(apiClient),
  getCurrentUser: apiClient.getCurrentUser.bind(apiClient),
};

export const searchApi = {
  searchProperties: apiClient.searchProperties.bind(apiClient),
};

export const paymentApi = {
  getHistory: apiClient.getPaymentHistory.bind(apiClient),
  initiateMpesaPayment: apiClient.initiateMpesaPayment.bind(apiClient),
};

export const statsApi = {
  getPublicStats: apiClient.getPublicStats.bind(apiClient),
  getAgentStats: apiClient.getAgentStats.bind(apiClient),
};

export default apiClient;
