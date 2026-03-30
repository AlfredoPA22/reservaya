import { useState, useEffect } from 'react';
import { availabilityApi } from '../../../services/api';
import type { Service, Professional } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { useLanguage } from '../../../context/LanguageContext';
import { format, addDays, isBefore, startOfDay } from 'date-fns';

interface Props {
  service: Service;
  professional: Professional;
  date: string;
  timeSlot: string;
  onChange: (date: string, slot: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const generateDates = () => {
  const dates: Date[] = [];
  const today = startOfDay(new Date());
  for (let i = 0; i < 30; i++) dates.push(addDays(today, i));
  return dates;
};

export const StepDateTime = ({ service, professional, date, timeSlot, onChange, onNext, onBack }: Props) => {
  const { t, fnsLocale } = useLanguage();
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState(date || format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState(timeSlot);
  const dates = generateDates();

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedSlot('');
    availabilityApi.getSlots(professional._id, selectedDate, service._id)
      .then(({ data }) => setSlots(data.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, professional._id, service._id]);

  const handleNext = () => {
    if (!selectedDate || !selectedSlot) return;
    onChange(selectedDate, selectedSlot);
    onNext();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-1">{t('step.datetime.title')}</h2>
      <p className="text-gray-500 text-sm mb-6">{t('step.datetime.subtitle')}</p>

      {/* Date selector */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">{t('step.datetime.day')}</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((d) => {
            const val = format(d, 'yyyy-MM-dd');
            const past = isBefore(d, startOfDay(new Date()));
            return (
              <button key={val} disabled={past}
                onClick={() => setSelectedDate(val)}
                className={`flex-shrink-0 flex flex-col items-center w-14 py-2 rounded-xl border-2 transition-all text-xs ${
                  past ? 'opacity-30 cursor-not-allowed border-gray-100' :
                  selectedDate === val ? 'border-indigo-600 bg-indigo-50 text-indigo-700' :
                  'border-gray-200 hover:border-indigo-300 text-gray-600'
                }`}>
                <span className="uppercase font-medium">{format(d, 'EEE', { locale: fnsLocale })}</span>
                <span className="text-lg font-bold">{format(d, 'd')}</span>
                <span className="text-gray-400">{format(d, 'MMM', { locale: fnsLocale })}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-3">{t('step.datetime.availableTime')}</p>
        {loadingSlots ? <Spinner size="sm" /> : slots.length === 0 ? (
          <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-xl">
            {t('step.datetime.noSlots')}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {slots.map((slot) => (
              <button key={slot} onClick={() => setSelectedSlot(slot)}
                className={`py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedSlot === slot ? 'border-indigo-600 bg-indigo-600 text-white' :
                  'border-gray-200 hover:border-indigo-400 text-gray-700'
                }`}>
                {slot}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>{t('step.datetime.back')}</Button>
        <Button onClick={handleNext} disabled={!selectedDate || !selectedSlot}>
          {t('step.datetime.continue')}
        </Button>
      </div>
    </div>
  );
};
