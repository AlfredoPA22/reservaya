import { useEffect, useState } from 'react';
import { professionalsApi } from '../../../services/api';
import type { Professional } from '../../../types';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { useLanguage } from '../../../context/LanguageContext';

interface Props {
  selected: Professional | null;
  onSelect: (p: Professional) => void;
  onBack: () => void;
  serviceId?: string;
}

export const StepProfessionals = ({ selected, onSelect, onBack, serviceId }: Props) => {
  const { t } = useLanguage();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    professionalsApi.getAll(serviceId).then(({ data }) => setProfessionals(data)).finally(() => setLoading(false));
  }, [serviceId]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-1">{t('step.professionals.title')}</h2>
      <p className="text-gray-500 text-sm mb-6">{t('step.professionals.subtitle')}</p>
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {professionals.map((p) => (
            <button key={p._id} onClick={() => onSelect(p)}
              className={`text-left p-4 rounded-xl border-2 transition-all hover:border-indigo-400 hover:shadow-sm ${
                selected?._id === p._id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
              }`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg flex-shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-sm text-indigo-600">{p.specialty}</p>
                  {p.bio && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{p.bio}</p>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      <Button variant="ghost" size="sm" onClick={onBack}>{t('step.professionals.back')}</Button>
    </div>
  );
};
