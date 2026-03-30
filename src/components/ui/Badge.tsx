import type { ReactNode } from 'react';
import type { AppointmentStatus } from '../../types';
import { STATUS_COLORS } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface BadgeProps {
  status: AppointmentStatus;
}

export const StatusBadge = ({ status }: BadgeProps) => {
  const { t } = useLanguage();
  const labelMap: Record<AppointmentStatus, Parameters<typeof t>[0]> = {
    pending: 'status.pending',
    confirmed: 'status.confirmed',
    cancelled: 'status.cancelled',
    completed: 'status.completed',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}>
      {t(labelMap[status])}
    </span>
  );
};

interface ChipProps {
  children: ReactNode;
  color?: string;
}

export const Chip = ({ children, color = 'bg-gray-100 text-gray-700' }: ChipProps) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}>
    {children}
  </span>
);
