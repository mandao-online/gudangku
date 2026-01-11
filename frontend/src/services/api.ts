import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:8001/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Auth API
export const authApi = {
  login: async (phone: string, password: string): Promise<ApiResponse> => {
    const response = await api.post('/login', { phone, password });
    return response.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    position?: string;
    department?: string;
    phone?: string;
  }): Promise<ApiResponse> => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/logout');
    return response.data;
  },

  me: async (): Promise<ApiResponse> => {
    const response = await api.get('/me');
    return response.data;
  },
};

// Items API
export const itemsApi = {
  getAll: async (params?: {
    search?: string;
    category?: string;
    low_stock?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<any> => {
    const response = await api.get('/items', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  create: async (itemData: FormData | {
    name: string;
    sku: string;
    stock: number;
    unit: string;
    category: string;
    min_stock: number;
    description?: string;
    price?: number;
    supplier?: string;
  }): Promise<ApiResponse> => {
    const config = itemData instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {};
    
    const response = await api.post('/items', itemData, config);
    return response.data;
  },

  update: async (id: string, itemData: FormData | any): Promise<ApiResponse> => {
    const config = itemData instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {};
    
    const response = await api.put(`/items/${id}`, itemData, config);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  },

  // Soft delete operations
  getTrashed: async (params?: {
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<any> => {
    const response = await api.get('/items-trashed', { params });
    return response.data;
  },

  restore: async (id: string): Promise<ApiResponse> => {
    const response = await api.post(`/items/${id}/restore`);
    return response.data;
  },

  forceDelete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/items/${id}/force-delete`);
    return response.data;
  },

  stockIn: async (id: string, data: {
    quantity: number;
    note?: string;
    reference_number?: string;
  }): Promise<ApiResponse> => {
    const response = await api.post(`/items/${id}/stock-in`, data);
    return response.data;
  },

  stockOut: async (id: string, data: {
    quantity: number;
    note?: string;
    reference_number?: string;
  }): Promise<ApiResponse> => {
    const response = await api.post(`/items/${id}/stock-out`, data);
    return response.data;
  },
};

// Stock Movements API
export const stockMovementsApi = {
  getAll: async (params?: {
    item_id?: string;
    type?: 'in' | 'out';
    date_from?: string;
    date_to?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse> => {
    const response = await api.get('/stock-movements', { params });
    return response.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getActivities: async (params?: {
    date_from?: string;
    date_to?: string;
    limit?: number;
  }): Promise<ApiResponse> => {
    const response = await api.get('/dashboard/activities', { params });
    return response.data;
  },
};

// Attendance API
export const attendanceApi = {
  getToday: async (): Promise<ApiResponse> => {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  checkIn: async (data: FormData | {
    latitude?: number;
    longitude?: number;
    notes?: string;
  }): Promise<ApiResponse> => {
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {};
    
    const response = await api.post('/attendance/check-in', data, config);
    return response.data;
  },

  checkOut: async (data: FormData | {
    latitude?: number;
    longitude?: number;
    notes?: string;
  }): Promise<ApiResponse> => {
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {};
    
    const response = await api.post('/attendance/check-out', data, config);
    return response.data;
  },

  getHistory: async (params?: {
    days?: number;
    per_page?: number;
    page?: number;
  }): Promise<ApiResponse & { pagination?: any }> => {
    const response = await api.get('/attendance/history', { params });
    return response.data;
  },

  getAll: async (params?: {
    date_from?: string;
    date_to?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }): Promise<PaginatedResponse> => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  exportExcel: async (params?: {
    date_from?: string;
    date_to?: string;
    search?: string;
  }): Promise<ApiResponse> => {
    const response = await api.get('/attendance/export-excel', { params });
    return response.data;
  },
};

// Profile API
export const profileApi = {
  get: async (): Promise<ApiResponse> => {
    const response = await api.get('/profile');
    return response.data;
  },

  update: async (data: {
    name: string;
    email: string;
    position?: string;
    department?: string;
    phone?: string;
    current_password?: string;
    password?: string;
    password_confirmation?: string;
  }): Promise<ApiResponse> => {
    const response = await api.put('/profile', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Units API
export const unitsApi = {
  getAll: async (params?: {
    search?: string;
    active?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<any> => {
    const response = await api.get('/units', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/units/${id}`);
    return response.data;
  },

  create: async (unitData: {
    name: string;
    symbol?: string;
    description?: string;
    is_active?: boolean;
  }): Promise<ApiResponse> => {
    const response = await api.post('/units', unitData);
    return response.data;
  },

  update: async (id: string, unitData: {
    name: string;
    symbol?: string;
    description?: string;
    is_active?: boolean;
  }): Promise<ApiResponse> => {
    const response = await api.put(`/units/${id}`, unitData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/units/${id}`);
    return response.data;
  },

  getOptions: async (): Promise<ApiResponse> => {
    const response = await api.get('/units-options');
    return response.data;
  },
};

// Categories API
export const categoriesApi = {
  getAll: async (params?: {
    search?: string;
    active?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<any> => {
    const response = await api.get('/categories', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (categoryData: {
    name: string;
    description?: string;
    is_active?: boolean;
  }): Promise<ApiResponse> => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  update: async (id: string, categoryData: {
    name: string;
    description?: string;
    is_active?: boolean;
  }): Promise<ApiResponse> => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  getOptions: async (): Promise<ApiResponse> => {
    const response = await api.get('/categories-options');
    return response.data;
  },
};

// Users API
export const usersApi = {
  getAll: async (params?: {
    search?: string;
    role?: string;
    active?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<any> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    position?: string;
    department?: string;
    role: 'admin' | 'manager' | 'staff';
    is_active?: boolean;
  }): Promise<ApiResponse> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  update: async (id: string, userData: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    position?: string;
    department?: string;
    role: 'admin' | 'manager' | 'staff';
    is_active?: boolean;
  }): Promise<ApiResponse> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  toggleStatus: async (id: string): Promise<ApiResponse> => {
    const response = await api.post(`/users/${id}/toggle-status`);
    return response.data;
  },
};

export default api;