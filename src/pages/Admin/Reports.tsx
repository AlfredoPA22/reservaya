import { useEffect, useState } from 'react';
import { reportsApi } from '../../services/api';
import { Spinner } from '../../components/ui/Spinner';
import { Button } from '../../components/ui/Button';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

interface ProfessionalStat {
  professional: { _id: string; name: string; specialty: string; active: boolean };
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  revenue: number;
  topService: { name: string; count: number } | null;
}

const PRESETS = [
  { label: 'Este mes', start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end: format(endOfMonth(new Date()), 'yyyy-MM-dd') },
  { label: 'Mes anterior', start: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'), end: format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd') },
  { label: 'Todo', start: '', end: '' },
];

export const AdminReports = () => {
  const [stats, setStats] = useState<ProfessionalStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState(PRESETS[0].start);
  const [end, setEnd] = useState(PRESETS[0].end);
  const [activePreset, setActivePreset] = useState(0);

  const load = () => {
    setLoading(true);
    reportsApi.getProfessionals(start || undefined, end || undefined)
      .then(({ data }) => setStats(data as ProfessionalStat[]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [start, end]);

  const applyPreset = (idx: number) => {
    setActivePreset(idx);
    setStart(PRESETS[idx].start);
    setEnd(PRESETS[idx].end);
  };

  const totals = stats.reduce(
    (acc, s) => ({
      total: acc.total + s.total,
      completed: acc.completed + s.completed,
      cancelled: acc.cancelled + s.cancelled,
      revenue: acc.revenue + s.revenue,
    }),
    { total: 0, completed: 0, cancelled: 0, revenue: 0 }
  );

  const dateRangeLabel = start && end
    ? `${format(new Date(start + 'T00:00:00'), "d MMM", { locale: es })} – ${format(new Date(end + 'T00:00:00'), "d MMM yyyy", { locale: es })}`
    : 'Todos los períodos';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{dateRangeLabel}</p>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p, i) => (
            <Button
              key={p.label}
              variant={activePreset === i ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => applyPreset(i)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Personalizado:</span>
          <input
            type="date"
            value={start}
            onChange={(e) => { setStart(e.target.value); setActivePreset(-1); }}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-gray-400">–</span>
          <input
            type="date"
            value={end}
            onChange={(e) => { setEnd(e.target.value); setActivePreset(-1); }}
            className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {loading ? <Spinner /> : (
        <>
          {/* Totales generales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total reservas', value: totals.total, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Completadas', value: totals.completed, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Canceladas', value: totals.cancelled, color: 'text-red-500', bg: 'bg-red-50' },
              { label: 'Ingresos est.', value: `$${totals.revenue.toLocaleString()}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-4`}>
                <p className="text-sm text-gray-500">{label}</p>
                <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Tabla por profesional */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Detalle por profesional</h2>
              <span className="text-sm text-gray-400">{stats.length} profesionale{stats.length !== 1 ? 's' : ''}</span>
            </div>
            {stats.length === 0 ? (
              <div className="py-12 text-center text-gray-400">No hay datos para este período</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3 text-left">Profesional</th>
                      <th className="px-4 py-3 text-center">Total</th>
                      <th className="px-4 py-3 text-center">Completadas</th>
                      <th className="px-4 py-3 text-center">Pendientes</th>
                      <th className="px-4 py-3 text-center">Canceladas</th>
                      <th className="px-4 py-3 text-left">Servicio top</th>
                      <th className="px-4 py-3 text-right">Ingresos est.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.map((s) => {
                      const completionRate = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
                      return (
                        <tr key={s.professional._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                                {s.professional.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{s.professional.name}</p>
                                <p className="text-xs text-gray-400">{s.professional.specialty}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="font-bold text-gray-900 text-base">{s.total}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-medium text-green-600">{s.completed}</span>
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-green-500 h-1.5 rounded-full"
                                  style={{ width: `${completionRate}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-400">{completionRate}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center text-yellow-600 font-medium">{s.pending + s.confirmed}</td>
                          <td className="px-4 py-4 text-center text-red-500 font-medium">{s.cancelled}</td>
                          <td className="px-4 py-4">
                            {s.topService ? (
                              <div>
                                <p className="text-gray-800">{s.topService.name}</p>
                                <p className="text-xs text-gray-400">{s.topService.count} vez{s.topService.count !== 1 ? 'es' : ''}</p>
                              </div>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <span className="font-bold text-emerald-600 text-base">
                              ${s.revenue.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {stats.length > 1 && (
                    <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                      <tr>
                        <td className="px-6 py-3 font-semibold text-gray-700">Total general</td>
                        <td className="px-4 py-3 text-center font-bold text-gray-900">{totals.total}</td>
                        <td className="px-4 py-3 text-center font-bold text-green-600">{totals.completed}</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-center font-bold text-red-500">{totals.cancelled}</td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600">${totals.revenue.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
