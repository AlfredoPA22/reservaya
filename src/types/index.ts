export interface User {
  id: string;
  name: string;
  email?: string;
  user_name?: string;
  phone?: string;
  role: 'admin' | 'client';
  companyId?: string;
}

export interface Service {
  _id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  active: boolean;
}

export interface DaySchedule {
  active: boolean;
  start: string;
  end: string;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface Professional {
  _id: string;
  name: string;
  specialty: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  serviceIds: Service[] | string[];
  workingHours: WorkingHours;
  active: boolean;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  _id: string;
  code: string;
  clientId?: User | string;
  professionalId: Professional | string;
  serviceId: Service | string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  notes?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AvailabilityResponse {
  slots: string[];
  date: string;
  professionalId: string;
  serviceId: string;
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  completed: 'Completado',
};

export const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
};

export const DAY_LABELS: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miercoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sabado',
  sunday: 'Domingo',
};
