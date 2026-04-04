import { useEffect, useState } from 'react';
import axios from 'axios';
import { appointmentsApi } from '../../services/api';
import type { Appointment } from '../../types';
import { StatusBadge } from '../../components/ui/Badge';
import { Spinner } from '../../components/ui/Spinner';
import { useLanguage } from '../../context/LanguageContext';
import { format } from 'date-fns';
import { QRCodeCanvas } from 'qrcode.react';
import { Copy, Check, QrCode, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { t, fnsLocale } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [companySlug, setCompanySlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  const companyParam = companySlug || user?.companyId || null;
  const bookingUrl = companyParam
    ? `${window.location.origin}/?company=${companyParam}`
    : null;

  useEffect(() => {
    appointmentsApi.getAll({ date: today })
      .then(({ data }) => setAppointments(data))
      .finally(() => setLoading(false));

    if (user?.companyId) {
      axios.get(`${import.meta.env.VITE_LANDING_URL}/company/info/${user.companyId}`)
        .then(({ data }) => { if (data?.slug) setCompanySlug(data.slug); })
        .catch(() => {});
    }
  }, [today, user?.companyId]);

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
  };

  const handleCopy = () => {
    if (!bookingUrl) return;
    navigator.clipboard.writeText(bookingUrl).then(() => {
      setCopied(true);
      toast.success(t('dashboard.copied'));
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadQR = () => {
    const canvas = document.querySelector<HTMLCanvasElement>('#booking-qr canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'reservas-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('dashboard.title')}</h1>
      <p className="text-gray-500 text-sm mb-6">
        {format(new Date(), "EEEE d 'de' MMMM yyyy", { locale: fnsLocale })}
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('dashboard.totalToday'), value: stats.total, color: 'text-indigo-700' },
          { label: t('dashboard.confirmed'), value: stats.confirmed, color: 'text-green-700' },
          { label: t('dashboard.pending'), value: stats.pending, color: 'text-yellow-700' },
          { label: t('dashboard.completed'), value: stats.completed, color: 'text-blue-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {bookingUrl && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-gray-900">{t('dashboard.bookingLink')}</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
            <div id="booking-qr" className="shrink-0 flex flex-col items-center gap-2">
              <div className="p-3 border-2 border-indigo-100 rounded-xl bg-white">
                <QRCodeCanvas value={bookingUrl} size={130} fgColor="#4338ca" bgColor="#ffffff" level="M" />
              </div>
              <button onClick={handleDownloadQR} className="text-xs text-indigo-600 hover:underline">
                {t('dashboard.downloadQR')}
              </button>
            </div>
            <div className="w-full min-w-0 flex-1">
              <p className="text-sm text-gray-500 mb-2">{t('dashboard.shareLink')}</p>
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 overflow-hidden">
                <span className="text-sm text-gray-700 truncate min-w-0 flex-1 font-mono">{bookingUrl}</span>
                <button onClick={handleCopy} className="shrink-0 p-1 rounded hover:bg-gray-200 transition-colors" title="Copiar">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                </button>
                <a href={bookingUrl} target="_blank" rel="noopener noreferrer"
                  className="shrink-0 p-1 rounded hover:bg-gray-200 transition-colors">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{t('dashboard.todayAppointments')}</h2>
        </div>
        {loading ? <Spinner /> : appointments.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400">{t('dashboard.noAppointmentsToday')}</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointments.map((apt) => {
              const professional = typeof apt.professionalId === 'object' ? apt.professionalId : null;
              const service = typeof apt.serviceId === 'object' ? apt.serviceId : null;
              const client = typeof apt.clientId === 'object' ? apt.clientId : null;
              return (
                <div key={apt._id} className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="bg-indigo-100 text-indigo-700 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-bold min-w-[52px] text-center shrink-0">
                      {apt.timeSlot}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {client?.name || apt.clientName || t('dashboard.noName')}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{service?.name} · {professional?.name}</p>
                    </div>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
