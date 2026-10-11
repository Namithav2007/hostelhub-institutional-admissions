export const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('hostel_token');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMsg = data?.error || (typeof data === 'string' ? data : `Request failed with status ${response.status}`);
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('hostel_token');
      localStorage.removeItem('hostel_user');
      window.dispatchEvent(new Event('auth_token_expired'));
    }
    throw new ApiError(errorMsg, response.status, data);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request<any>('/auth/me'),
  updateProfile: (data: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getDemoUsers: () => request<any[]>('/auth/demo-users'),

  // Hostels
  getHostels: () => request<any[]>('/hostels'),
  getHostel: (id: string) => request<any>(`/hostels/${id}`),
  createHostel: (data: any) => request<any>('/hostels', { method: 'POST', body: JSON.stringify(data) }),

  // Rooms
  getRooms: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return request<any[]>(`/rooms${query}`);
  },
  getRoom: (id: string) => request<any>(`/rooms/${id}`),
  createRoom: (data: any) => request<any>('/rooms', { method: 'POST', body: JSON.stringify(data) }),

  // Admissions
  getAdmissions: () => request<any[]>('/admissions'),
  getMyApplication: () => request<any>('/admissions/my-application'),
  applyAdmission: (data: any) => request<any>('/admissions/apply', { method: 'POST', body: JSON.stringify(data) }),
  updateAdmissionStatus: (id: string, data: any) =>
    request<any>(`/admissions/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Allocations
  getAllocations: () => request<any[]>('/allocations'),
  getMyAllocation: () => request<any>('/allocations/my-allocation'),
  allocateBed: (data: any) => request<any>('/allocations/allocate', { method: 'POST', body: JSON.stringify(data) }),
  transferBed: (id: string, data: any) => request<any>(`/allocations/${id}/transfer`, { method: 'POST', body: JSON.stringify(data) }),
  vacateBed: (id: string, data: any) => request<any>(`/allocations/${id}/vacate`, { method: 'POST', body: JSON.stringify(data) }),

  // Fees & Transactions
  getFees: () => request<any[]>('/fees'),
  getMyFees: () => request<any>('/fees/my-fees'),
  createFeeInvoice: (data: any) => request<any>('/fees', { method: 'POST', body: JSON.stringify(data) }),
  payFee: (id: string, data: any) => request<any>(`/fees/${id}/pay`, { method: 'POST', body: JSON.stringify(data) }),
  getReceipt: (receiptNumber: string) => request<any>(`/fees/receipt/${receiptNumber}`),

  // Maintenance
  getMaintenance: () => request<any[]>('/maintenance'),
  createMaintenance: (data: any) => request<any>('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
  updateMaintenanceStatus: (id: string, data: any) =>
    request<any>(`/maintenance/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Visitors
  getVisitors: () => request<any[]>('/visitors'),
  checkInVisitor: (data: any) => request<any>('/visitors/check-in', { method: 'POST', body: JSON.stringify(data) }),
  checkOutVisitor: (id: string) => request<any>(`/visitors/${id}/check-out`, { method: 'PUT' }),
  getVisitorQrPass: (token: string) => request<any>(`/visitors/qr-code/${token}`),

  // Occupancy Stats
  getOccupancyStats: () => request<any>('/occupancy/stats'),

  // Notifications
  getNotifications: () => request<any[]>('/notifications'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'PUT' }),

  // Audit Logs
  getAuditLogs: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return request<any[]>(`/audit-logs${query}`);
  },

  // Users Management
  getUsers: () => request<any[]>('/users'),
  updateUserRole: (id: string, data: any) => request<any>(`/users/${id}/role`, { method: 'PUT', body: JSON.stringify(data) }),
};
