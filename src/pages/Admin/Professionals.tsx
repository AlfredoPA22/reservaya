import { useEffect, useState } from 'react';
import { professionalsApi, servicesApi } from '../../services/api';
import type { Professional, Service, WorkingHours, DaySchedule } from '../../types';
import { DAY_LABELS } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const defaultWorkingHours = (): WorkingHours => ({
  monday: { active: true, start: '09:00', end: '18:00' },
  tuesday: { active: true, start: '09:00', end: '18:00' },
  wednesday: { active: true, start: '09:00', end: '18:00' },
  thursday: { active: true, start: '09:00', end: '18:00' },
  friday: { active: true, start: '09:00', end: '18:00' },
  saturday: { active: false, start: '09:00', end: '14:00' },
  sunday: { active: false, start: '09:00', end: '14:00' },
});

const emptyForm = {
  name: '', specialty: '', phone: '', bio: '',
  workingHours: defaultWorkingHours(),
  selectedServiceIds: [] as string[],
};

export const AdminProfessionals = () => {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Professional | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    professionalsApi.getAllAdmin().then(({ data }) => setProfessionals(data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    servicesApi.getAllAdmin().then(({ data }) => setServices(data));
  }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (p: Professional) => {
    setEditing(p);
    const ids = p.serviceIds.map((s) => (typeof s === 'string' ? s : (s as Service)._id));
    setForm({
      name: p.name,
      specialty: p.specialty,
      phone: p.phone || '',
      bio: p.bio || '',
      workingHours: p.workingHours,
      selectedServiceIds: ids,
    });
    setModal(true);
  };

  const updateDay = (day: keyof WorkingHours, field: keyof DaySchedule, value: boolean | string) => {
    setForm((prev) => ({
      ...prev,
      workingHours: { ...prev.workingHours, [day]: { ...prev.workingHours[day], [field]: value } },
    }));
  };

  const toggleService = (id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedServiceIds: prev.selectedServiceIds.includes(id)
        ? prev.selectedServiceIds.filter((s) => s !== id)
        : [...prev.selectedServiceIds, id],
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.specialty) { toast.error('Nombre y especialidad son requeridos'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        specialty: form.specialty,
        phone: form.phone,
        bio: form.bio,
        workingHours: form.workingHours,
        serviceIds: form.selectedServiceIds,
      };
      if (editing) await professionalsApi.update(editing._id, payload);
      else await professionalsApi.create(payload);
      toast.success(editing ? 'Profesional actualizado' : 'Profesional creado');
      setModal(false);
      load();
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    if (!confirm(`¿${active ? 'Desactivar' : 'Activar'} este profesional?`)) return;
    await professionalsApi.toggle(id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar permanentemente este profesional? Esta acción no se puede deshacer.')) return;
    await professionalsApi.remove(id);
    load();
  };

  const getAssignedServices = (p: Professional): Service[] => {
    return p.serviceIds
      .map((s) => (typeof s === 'string' ? services.find((sv) => sv._id === s) : s as Service))
      .filter(Boolean) as Service[];
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profesionales</h1>
        <Button onClick={openCreate}>+ Nuevo profesional</Button>
      </div>

      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professionals.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400">No hay profesionales registrados.</div>
          ) : professionals.map((p) => {
            const assignedServices = getAssignedServices(p);
            return (
              <div key={p._id} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{p.name}</p>
                      <p className="text-sm text-gray-500">{p.specialty}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {p.phone && <p className="text-sm text-gray-500 mb-2">{p.phone}</p>}
                {assignedServices.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {assignedServices.map((s) => (
                      <span key={s._id} className="text-xs bg-indigo-50 text-indigo-700 rounded-full px-2 py-0.5">
                        {s.name}
                      </span>
                    ))}
                  </div>
                )}
                {assignedServices.length === 0 && (
                  <p className="text-xs text-gray-400 mb-3 italic">Sin servicios asignados</p>
                )}
                <div className="flex gap-2 mt-3">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(p)}>Editar</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleToggle(p._id, p.active)}>
                    {p.active ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(p._id)}>Eliminar</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar profesional' : 'Nuevo profesional'} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="Especialidad" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} required />
          </div>
          <Input label="Teléfono (opcional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Bio (opcional)</label>
            <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" rows={2}
              value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Servicios que realiza</p>
            {services.length === 0 ? (
              <p className="text-xs text-gray-400">No hay servicios disponibles</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {services.filter((s) => s.active).map((s) => (
                  <label key={s._id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    form.selectedServiceIds.includes(s._id) ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="checkbox" checked={form.selectedServiceIds.includes(s._id)}
                      onChange={() => toggleService(s._id)} className="rounded text-indigo-600" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.duration} min · ${s.price.toLocaleString()}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Horarios de trabajo</p>
            <div className="space-y-2">
              {(Object.keys(DAY_LABELS) as (keyof WorkingHours)[]).map((day) => (
                <div key={day} className="flex items-center gap-2 text-sm flex-wrap">
                  <div className="flex items-center gap-2 w-28">
                    <input type="checkbox" id={day} checked={form.workingHours[day].active}
                      onChange={(e) => updateDay(day, 'active', e.target.checked)}
                      className="rounded text-indigo-600 shrink-0" />
                    <label htmlFor={day} className="text-gray-700 select-none">{DAY_LABELS[day]}</label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input type="time" value={form.workingHours[day].start}
                      onChange={(e) => updateDay(day, 'start', e.target.value)}
                      disabled={!form.workingHours[day].active}
                      className="border border-gray-300 rounded px-2 py-1 text-xs disabled:opacity-40 w-24" />
                    <span className="text-gray-400 text-xs">a</span>
                    <input type="time" value={form.workingHours[day].end}
                      onChange={(e) => updateDay(day, 'end', e.target.value)}
                      disabled={!form.workingHours[day].active}
                      className="border border-gray-300 rounded px-2 py-1 text-xs disabled:opacity-40 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModal(false)}>Cancelar</Button>
            <Button loading={saving} onClick={handleSave}>Guardar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
