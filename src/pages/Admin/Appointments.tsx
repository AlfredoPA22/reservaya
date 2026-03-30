import { useEffect, useState } from 'react';
import { appointmentsApi, professionalsApi } from '../../services/api';
import type { Appointment, AppointmentStatus, Professional } from '../../types';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useLanguage } from '../../context/LanguageContext';
import { format } from 'date-fns';

export const AdminAppointments = () => {
  const { t, fnsLocale } = useLanguage();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterProfessional, setFilterProfessional] = useState('');

  useEffect(() => {
    professionalsApi.getAllAdmin().then(({ data }) => setProfessionals(data));
  }, []);

  const load = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filterStatus) params.status = filterStatus;
    if (filterDate) params.date = filterDate;
    if (filterProfessional) params.professionalId = filterProfessional;
    appointmentsApi.getAll(params)
      .then(({ data }) => setAppointments(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterStatus, filterDate, filterProfessional]);

  const changeStatus = async (id: string, status: AppointmentStatus) => {
    await appointmentsApi.updateStatus(id, status);
    load();
  };

  const statusOptions: { value: AppointmentStatus; label: string }[] = [
    { value: 'pending', label: t('status.pending') },
    { value: 'confirmed', label: t('status.confirmed') },
    { value: 'cancelled', label: t('status.cancelled') },
    { value: 'completed', label: t('status.completed') },
  ];

  const hasFilters = filterDate || filterStatus || filterProfessional;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('appts.title')}</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <select
          value={filterProfessional}
          onChange={(e) => setFilterProfessional(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">{t('appts.allProfessionals')}</option>
          {professionals.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">{t('appts.allStatuses')}</option>
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setFilterDate(''); setFilterStatus(''); setFilterProfessional(''); }}>
            {t('appts.clear')}
          </Button>
        )}

        <span className="ml-auto text-sm text-gray-400">
          {!loading && `${appointments.length} ${appointments.length !== 1 ? t('appts.resultsPlural') : t('appts.results')}`}
        </span>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {appointments.length === 0 ? (
            <div className="py-12 text-center text-gray-400">{t('appts.noResults')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">{t('appts.dateTime')}</th>
                    <th className="px-4 py-3 text-left">{t('appts.client')}</th>
                    <th className="px-4 py-3 text-left">{t('appts.service')}</th>
                    <th className="px-4 py-3 text-left">{t('appts.professional')}</th>
                    <th className="px-4 py-3 text-left">{t('appts.status')}</th>
                    <th className="px-4 py-3 text-right">{t('appts.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {appointments.map((apt) => {
                    const professional = typeof apt.professionalId === 'object' ? apt.professionalId : null;
                    const service = typeof apt.serviceId === 'object' ? apt.serviceId : null;
                    const client = typeof apt.clientId === 'object' ? apt.clientId : null;
                    const dateLabel = format(new Date(apt.date + 'T00:00:00'), 'd MMM yyyy', { locale: fnsLocale });
                    return (
                      <tr key={apt._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{apt.timeSlot}</p>
                          <p className="text-gray-400 text-xs">{dateLabel}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-gray-900">{client?.name || apt.clientName || t('appts.noName')}</p>
                          <p className="text-gray-400 text-xs">{client?.email || apt.clientEmail}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{service?.name}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-800">{professional?.name}</span>
                          {professional?.specialty && <p className="text-xs text-gray-400">{professional.specialty}</p>}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={apt.status} /></td>
                        <td className="px-4 py-3 text-right">
                          {apt.status === 'pending' && (
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" onClick={() => changeStatus(apt._id, 'confirmed')}>{t('appts.confirm')}</Button>
                              <Button variant="danger" size="sm" onClick={() => changeStatus(apt._id, 'cancelled')}>{t('appts.cancel')}</Button>
                            </div>
                          )}
                          {apt.status === 'confirmed' && (
                            <Button size="sm" variant="secondary" onClick={() => changeStatus(apt._id, 'completed')}>{t('appts.complete')}</Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
