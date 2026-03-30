import axios from 'axios';
import type { AuthResponse, Service, Professional, Appointment, AvailabilityResponse } from '../types';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // Sin sesión: adjuntar companyId para que el servidor filtre correctamente
    const companyId = localStorage.getItem('reservaya_company');
    if (companyId) {
      config.params = { ...config.params, companyId };
    }
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    // Only redirect to login on 401 if the user had an active session (token expired).
    // If there's no token, the 401 comes from a login attempt — let the component handle it.
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (identifier: string, password: string) => {
    const isEmail = identifier.includes('@');
    return api.post<AuthResponse>('/auth/login', isEmail
      ? { email: identifier, password }
      : { user_name: identifier, password });
  },
  register: (data: { name: string; email: string; password: string; phone?: string; companyId?: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  createAdmin: (data: { name: string; email: string; password: string; phone?: string }) =>
    api.post<AuthResponse>('/auth/create-admin', data),
  me: () => api.get('/auth/me'),
};

// Services
export const servicesApi = {
  getAll: () => api.get<Service[]>('/services'),
  getAllAdmin: () => api.get<Service[]>('/services/all'),
  create: (data: Partial<Service>) => api.post<Service>('/services', data),
  update: (id: string, data: Partial<Service>) => api.put<Service>(`/services/${id}`, data),
  toggle: (id: string) => api.patch<Service>(`/services/${id}/toggle`),
  remove: (id: string) => api.delete(`/services/${id}`),
  assignProfessionals: (id: string, professionalIds: string[]) =>
    api.put(`/services/${id}/professionals`, { professionalIds }),
};

// Professionals
export const professionalsApi = {
  getAll: (serviceId?: string) => api.get<Professional[]>('/professionals', { params: serviceId ? { serviceId } : undefined }),
  getAllAdmin: () => api.get<Professional[]>('/professionals/all'),
  getById: (id: string) => api.get<Professional>(`/professionals/${id}`),
  create: (data: Partial<Professional>) => api.post<Professional>('/professionals', data),
  update: (id: string, data: Partial<Professional>) =>
    api.put<Professional>(`/professionals/${id}`, data),
  toggle: (id: string) => api.patch<Professional>(`/professionals/${id}/toggle`),
  remove: (id: string) => api.delete(`/professionals/${id}`),
};

// Appointments
export const appointmentsApi = {
  create: (data: Partial<Appointment> & { clientName?: string; clientPhone?: string; clientEmail?: string }) =>
    api.post<Appointment>('/appointments', data),
  getAll: (params?: Record<string, string>) =>
    api.get<Appointment[]>('/appointments', { params }),
  getByRange: (start: string, end: string) =>
    api.get<Appointment[]>('/appointments/range', { params: { start, end } }),
  getById: (id: string) => api.get<Appointment>(`/appointments/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch<Appointment>(`/appointments/${id}/status`, { status }),
  cancel: (id: string) => api.patch<Appointment>(`/appointments/${id}/cancel`),
};

// Reports
export const reportsApi = {
  getProfessionals: (start?: string, end?: string) =>
    api.get('/reports/professionals', { params: { start, end } }),
};

// Business Profile
export const businessProfileApi = {
  getMyProfile: () => api.get('/business-profile'),
  updateMyProfile: (data: Record<string, string>) => api.put('/business-profile', data),
  getPublicProfile: (companyId: string) => api.get('/business-profile/public', { params: { companyId } }),
};

// Availability
export const availabilityApi = {
  getSlots: (professionalId: string, date: string, serviceId: string) =>
    api.get<AvailabilityResponse>('/availability', {
      params: { professionalId, date, serviceId },
    }),
};

export default api;
