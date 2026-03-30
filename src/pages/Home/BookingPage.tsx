import { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { useCompany } from '../../context/CompanyContext';
import { useLanguage } from '../../context/LanguageContext';
import { StepServices } from './steps/StepServices';
import { StepProfessionals } from './steps/StepProfessionals';
import { StepDateTime } from './steps/StepDateTime';
import { StepConfirm } from './steps/StepConfirm';
import { StepSuccess } from './steps/StepSuccess';
import { CheckCircle2 } from 'lucide-react';
import type { Service, Professional } from '../../types';

export interface BookingData {
  service: Service | null;
  professional: Professional | null;
  date: string;
  timeSlot: string;
}

export const BookingPage = () => {
  const { companyId, profile } = useCompany();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState<BookingData>({ service: null, professional: null, date: '', timeSlot: '' });
  const [appointmentId, setAppointmentId] = useState('');
  const [bookingCode, setBookingCode] = useState('');

  const STEPS = [t('booking.step1'), t('booking.step2'), t('booking.step3'), t('booking.step4')];

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => s - 1);

  if (!companyId) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-sm">
        <span className="text-5xl">🔗</span>
        <h2 className="text-xl font-bold text-gray-800 mt-4">{t('booking.invalidLink')}</h2>
        <p className="text-gray-500 text-sm mt-2">{t('booking.invalidLinkDesc')}</p>
      </div>
    </div>
  );

  if (step === 4) return <StepSuccess appointmentId={appointmentId} bookingCode={bookingCode} booking={booking} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Company Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-10 px-4 text-center">
        {profile?.image && (
          <img
            src={profile.image}
            alt="logo"
            className="w-20 h-20 rounded-2xl object-cover mx-auto mb-3 shadow-lg border-2 border-white/30"
          />
        )}
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
          {profile?.name || t('booking.heroDefault')}
        </h1>
        <p className="text-indigo-200 text-sm">
          {profile?.tagline || t('booking.heroTagline')}
        </p>
        {(profile?.address || profile?.phone) && (
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-indigo-200 flex-wrap">
            {profile?.address && <span>📍 {profile.address}</span>}
            {profile?.phone && <span>📞 {profile.phone}</span>}
          </div>
        )}
      </div>

      {/* Stepper */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step ? 'bg-indigo-600 text-white' :
                  i === step ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1 hidden sm:block font-medium ${i === step ? 'text-indigo-600' : i < step ? 'text-gray-500' : 'text-gray-300'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 sm:mx-2 transition-colors ${i < step ? 'bg-indigo-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        <p className="sm:hidden text-center text-xs text-indigo-600 font-medium mt-2">
          {t('booking.step')} {step + 1}: {STEPS[step]}
        </p>
      </div>

      {/* Step content */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {step === 0 && (
            <StepServices selected={booking.service}
              onSelect={(s) => { setBooking({ ...booking, service: s }); next(); }} />
          )}
          {step === 1 && (
            <StepProfessionals selected={booking.professional}
              onSelect={(p) => { setBooking({ ...booking, professional: p }); next(); }}
              onBack={back}
              serviceId={booking.service?._id} />
          )}
          {step === 2 && booking.service && booking.professional && (
            <StepDateTime service={booking.service} professional={booking.professional}
              date={booking.date} timeSlot={booking.timeSlot}
              onChange={(date, slot) => setBooking({ ...booking, date, timeSlot: slot })}
              onNext={next} onBack={back} />
          )}
          {step === 3 && booking.service && booking.professional && (
            <StepConfirm booking={booking}
              onSuccess={(id, code) => { setAppointmentId(id); setBookingCode(code); next(); }}
              onBack={back} />
          )}
        </div>
      </div>
    </div>
  );
};
