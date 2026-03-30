import { useEffect, useState } from 'react';
import { servicesApi } from '../../../services/api';
import type { Service } from '../../../types';
import { Spinner } from '../../../components/ui/Spinner';
import { useLanguage } from '../../../context/LanguageContext';

interface Props {
  selected: Service | null;
  onSelect: (s: Service) => void;
}

export const StepServices = ({ selected, onSelect }: Props) => {
  const { t } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    servicesApi.getAll().then(({ data }) => setServices(data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-1">{t('step.services.title')}</h2>
      <p className="text-gray-500 text-sm mb-6">{t('step.services.subtitle')}</p>
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((s) => (
            <button key={s._id} onClick={() => onSelect(s)}
              className={`text-left p-4 rounded-xl border-2 transition-all hover:border-indigo-400 hover:shadow-sm ${
                selected?._id === s._id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
              }`}>
              <p className="font-semibold text-gray-900">{s.name}</p>
              {s.description && <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>}
              <div className="flex items-center gap-3 mt-2">
                <span className="text-indigo-600 font-bold">${s.price.toLocaleString()}</span>
                <span className="text-gray-400 text-sm">·</span>
                <span className="text-gray-500 text-sm">{s.duration} min</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
