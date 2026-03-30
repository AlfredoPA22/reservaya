import { useEffect, useState, useCallback } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth } from 'date-fns';
import { es as dateFnsEs, enUS as dateFnsEn } from 'date-fns/locale';
import { appointmentsApi } from '../../services/api';
import type { Appointment } from '../../types';
import { STATUS_COLORS } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import { useLanguage } from '../../context/LanguageContext';

const locales = { es: dateFnsEs, en: dateFnsEn };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), getDay, locales });

interface CalEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Appointment;
}

const STATUS_BG: Record<string, string> = {
  pending: '#fef3c7',
  confirmed: '#d1fae5',
  cancelled: '#fee2e2',
  completed: '#dbeafe',
};
const STATUS_FG: Record<string, string> = {
  pending: '#92400e',
  confirmed: '#065f46',
  cancelled: '#991b1b',
  completed: '#1e40af',
};

export const AdminCalendar = () => {
  const { t, lang } = useLanguage();
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const load = useCallback(async (date: Date) => {
    setLoading(true);
    const start = format(startOfMonth(date), 'yyyy-MM-dd');
    const end = format(endOfMonth(date), 'yyyy-MM-dd');
    try {
      const { data } = await appointmentsApi.getByRange(start, end);
      const mapped: CalEvent[] = data.map((apt) => {
        const service = typeof apt.serviceId === 'object' ? apt.serviceId : null;
        const professional = typeof apt.professionalId === 'object' ? apt.professionalId : null;
        const client = typeof apt.clientId === 'object' ? apt.clientId : null;
        const [h, m] = apt.timeSlot.split(':').map(Number);
        const start = new Date(apt.date + 'T00:00:00');
        start.setHours(h, m, 0);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + (service?.duration || 30));
        return {
          id: apt._id,
          title: `${apt.timeSlot} · ${client?.name || apt.clientName || t('calendar.noName')} · ${service?.name || ''}`,
          start,
          end,
          resource: apt,
        };
      });
      setEvents(mapped);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(currentDate); }, [currentDate, load]);

  const eventStyle = (event: CalEvent) => ({
    style: {
      backgroundColor: STATUS_BG[event.resource.status] || '#e0e7ff',
      color: STATUS_FG[event.resource.status] || '#3730a3',
      border: 'none',
      borderRadius: '4px',
      fontSize: '11px',
      padding: '2px 6px',
    },
  });

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('calendar.title')}</h1>
      <div className="bg-white rounded-xl border border-gray-200 p-4" style={{ height: 600 }}>
        <BigCalendar
          localizer={localizer}
          events={events}
          defaultView="month"
          views={['month', 'week', 'day']}
          date={currentDate}
          culture={lang === 'es' ? 'es' : 'en'}
          onNavigate={(d) => setCurrentDate(d)}
          eventPropGetter={eventStyle}
          messages={{
            next: '›',
            previous: '‹',
            today: t('calendar.today'),
            month: t('calendar.month'),
            week: t('calendar.week'),
            day: t('calendar.day'),
            noEventsInRange: t('calendar.noEvents'),
          }}
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {Object.entries(STATUS_COLORS).map(([status, cls]) => (
          <div key={status} className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>
            {status === 'pending' ? t('status.pending') : status === 'confirmed' ? t('status.confirmed') : status === 'cancelled' ? t('status.cancelled') : t('status.completed')}
          </div>
        ))}
      </div>
    </div>
  );
};
