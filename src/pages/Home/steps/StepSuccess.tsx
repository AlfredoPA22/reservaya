import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BookingData } from '../BookingPage';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Button } from '../../../components/ui/Button';
import { format } from 'date-fns';
import { CheckCircle2, Copy, Check, CalendarDays, Clock, Tag } from 'lucide-react';

interface Props {
  appointmentId: string;
  bookingCode: string;
  booking: BookingData;
}

export const StepSuccess = ({ bookingCode, booking }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, fnsLocale } = useLanguage();
  const [copied, setCopied] = useState(false);

  const dateLabel = format(new Date(booking.date + 'T00:00:00'), "EEEE d 'de' MMMM yyyy", { locale: fnsLocale });

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full overflow-hidden shadow-sm">
        <div className="bg-linear-to-br from-green-500 to-emerald-600 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-1">{t('step.success.title')}</h2>
          <p className="text-green-100 text-sm">{t('step.success.subtitle')}</p>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
            <p className="text-xs text-gray-500 text-center mb-2 font-medium uppercase tracking-wide">{t('step.success.bookingCode')}</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl font-mono font-bold text-indigo-600 tracking-widest">{bookingCode}</span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-700"
                title={t('step.success.copyCode')}
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">{t('step.success.savedCode')}</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                <Tag className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <p className="text-gray-400 text-xs">{t('step.success.serviceLabel')}</p>
                <p className="font-semibold text-gray-900 truncate">{booking.service?.name}</p>
              </div>
              <span className="ml-auto font-bold text-gray-900">${booking.service?.price.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">{t('step.success.dateAndProfessional')}</p>
                <p className="font-semibold text-gray-900 capitalize">{dateLabel}</p>
                <p className="text-gray-500 text-xs">{t('step.success.with')} {booking.professional?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">{t('step.success.timeAndDuration')}</p>
                <p className="font-semibold text-indigo-600 text-base">{booking.timeSlot}</p>
              </div>
              <span className="ml-auto text-xs text-gray-400">{booking.service?.duration} min</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => navigate('/')}>{t('step.success.newBooking')}</Button>
            {user && <Button className="flex-1" onClick={() => navigate('/mis-reservas')}>{t('step.success.viewBookings')}</Button>}
          </div>
        </div>
      </div>
    </div>
  );
};
