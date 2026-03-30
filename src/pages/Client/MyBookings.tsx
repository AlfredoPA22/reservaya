import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsApi } from '../../services/api';
import type { Appointment } from '../../types';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Navbar } from '../../components/layout/Navbar';
import { useLanguage } from '../../context/LanguageContext';
import { format } from 'date-fns';
import { Tag, CalendarDays, Clock, Hash, X, CalendarCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STYLES: Record<string, { bar: string; badge: string }> = {
  pending:   { bar: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700' },
  confirmed: { bar: 'bg-green-500',  badge: 'bg-green-50 text-green-700' },
  completed: { bar: 'bg-indigo-400', badge: 'bg-indigo-50 text-indigo-700' },
  cancelled: { bar: 'bg-gray-300',   badge: 'bg-gray-100 text-gray-500' },
};

export const MyBookings = () => {
  const { t, fnsLocale } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = () => {
    appointmentsApi.getAll()
      .then(({ data }) => setAppointments(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = (id: string) => {
    toast((toastObj) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-800">{t('myBookings.confirmCancel')}</p>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1 text-xs rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
            onClick={() => toast.dismiss(toastObj.id)}
          >
            {t('myBookings.no')}
          </button>
          <button
            className="px-3 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600"
            onClick={async () => {
              toast.dismiss(toastObj.id);
              await appointmentsApi.cancel(id);
              toast.success(t('myBookings.cancelledToast'));
              load();
            }}
          >
            {t('myBookings.yes')}
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const upcoming = appointments.filter((a) => a.status === 'pending' || a.status === 'confirmed');
  const past = appointments.filter((a) => a.status === 'completed' || a.status === 'cancelled');

  const statusLabel = (status: string) => {
    const map: Record<string, Parameters<typeof t>[0]> = {
      pending: 'status.pending',
      confirmed: 'status.confirmed',
      completed: 'status.completed',
      cancelled: 'status.cancelled',
    };
    return t(map[status] ?? 'status.pending');
  };

  const AppointmentCard = ({ apt }: { apt: Appointment }) => {
    const professional = typeof apt.professionalId === 'object' ? apt.professionalId : null;
    const service = typeof apt.serviceId === 'object' ? apt.serviceId : null;
    const dateLabel = format(new Date(apt.date + 'T00:00:00'), "EEEE d 'de' MMMM yyyy", { locale: fnsLocale });
    const st = STATUS_STYLES[apt.status] ?? STATUS_STYLES.pending;
    const canCancel = apt.status === 'pending' || apt.status === 'confirmed';

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className={`h-1 w-full ${st.bar}`} />
        <div className="p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-indigo-600">{apt.timeSlot}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.badge}`}>
                {statusLabel(apt.status)}
              </span>
            </div>
            {canCancel && (
              <button
                onClick={() => handleCancel(apt._id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                title={t('myBookings.confirmCancel')}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="font-medium text-gray-900">{service?.name}</span>
              {service && (
                <span className="ml-auto text-gray-500 text-xs">
                  ${service.price.toLocaleString()} · {service.duration} min
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="capitalize">{dateLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400 shrink-0" />
              <span>{t('myBookings.with')} {professional?.name}</span>
              {professional?.specialty && (
                <span className="text-gray-400">· {professional.specialty}</span>
              )}
            </div>
          </div>

          {apt.code && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-gray-300" />
              <span className="text-xs font-mono text-gray-400 tracking-wider">{apt.code}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('myBookings.title')}</h1>
          <Button onClick={() => navigate('/')}>{t('myBookings.newBooking')}</Button>
        </div>

        {loading ? <Spinner /> : appointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
            <CalendarCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">{t('myBookings.noBookings')}</p>
            <Button onClick={() => navigate('/')}>{t('myBookings.bookBtn')}</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {t('myBookings.upcoming')}
                </h2>
                <div className="space-y-3">
                  {upcoming.map((apt) => <AppointmentCard key={apt._id} apt={apt} />)}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  {t('myBookings.history')}
                </h2>
                <div className="space-y-3 opacity-80">
                  {past.map((apt) => <AppointmentCard key={apt._id} apt={apt} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
