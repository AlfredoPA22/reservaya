import { useEffect, useState } from 'react';
import { servicesApi, professionalsApi } from '../../services/api';
import type { Service, Professional } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const emptyForm = { name: '', description: '', price: 0, duration: 30, selectedProfIds: [] as string[] };

export const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    servicesApi.getAllAdmin().then(({ data }) => setServices(data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    professionalsApi.getAllAdmin().then(({ data }) => setProfessionals(data));
  }, []);

  const getProfIdsForService = (serviceId: string): string[] => {
    return professionals
      .filter((p) => p.serviceIds.some((s) => (typeof s === 'string' ? s : (s as Service)._id) === serviceId))
      .map((p) => p._id);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      name: s.name,
      description: s.description || '',
      price: s.price,
      duration: s.duration,
      selectedProfIds: getProfIdsForService(s._id),
    });
    setModal(true);
  };

  const toggleProf = (id: string) => {
    setForm((prev) => ({
      ...prev,
      selectedProfIds: prev.selectedProfIds.includes(id)
        ? prev.selectedProfIds.filter((p) => p !== id)
        : [...prev.selectedProfIds, id],
    }));
  };

  const handleSave = async () => {
    if (!form.name || form.price < 0 || form.duration < 15) {
      toast.error('Completá todos los campos correctamente');
      return;
    }
    setSaving(true);
    try {
      const { selectedProfIds, ...serviceData } = form;
      let savedId: string;
      if (editing) {
        await servicesApi.update(editing._id, serviceData);
        savedId = editing._id;
      } else {
        const { data } = await servicesApi.create(serviceData);
        savedId = data._id;
      }
      await servicesApi.assignProfessionals(savedId, selectedProfIds);
      toast.success(editing ? 'Servicio actualizado' : 'Servicio creado');
      setModal(false);
      load();
      professionalsApi.getAllAdmin().then(({ data }) => setProfessionals(data));
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    if (!confirm(`¿${active ? 'Desactivar' : 'Activar'} este servicio?`)) return;
    await servicesApi.toggle(id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar permanentemente este servicio? Esta acción no se puede deshacer.')) return;
    await servicesApi.remove(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Servicios</h1>
        <Button onClick={openCreate}>+ Nuevo servicio</Button>
      </div>

      {loading ? <Spinner /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {services.length === 0 ? (
            <div className="py-12 text-center text-gray-400">No hay servicios. Creá el primero.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 text-left">Nombre</th>
                  <th className="px-6 py-3 text-left">Duración</th>
                  <th className="px-6 py-3 text-left">Precio</th>
                  <th className="px-6 py-3 text-left">Profesionales</th>
                  <th className="px-6 py-3 text-left">Estado</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((s) => {
                  const count = getProfIdsForService(s._id).length;
                  return (
                    <tr key={s._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{s.name}</p>
                        {s.description && <p className="text-xs text-gray-400">{s.description}</p>}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{s.duration} min</td>
                      <td className="px-6 py-4 text-gray-600">${s.price.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-600">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${count > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-400'}`}>
                          {count} {count === 1 ? 'profesional' : 'profesionales'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {s.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>Editar</Button>
                          <Button variant="secondary" size="sm" onClick={() => handleToggle(s._id, s.active)}>
                            {s.active ? 'Desactivar' : 'Activar'}
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => handleDelete(s._id)}>Eliminar</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar servicio' : 'Nuevo servicio'} size="lg">
        <div className="space-y-4">
          <Input label="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Descripción (opcional)" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Precio ($)" type="number" min={0} value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            <Input label="Duración (min)" type="number" min={15} step={15} value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Profesionales que realizan este servicio</p>
            {professionals.filter((p) => p.active).length === 0 ? (
              <p className="text-xs text-gray-400">No hay profesionales disponibles</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {professionals.filter((p) => p.active).map((p) => (
                  <label key={p._id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    form.selectedProfIds.includes(p._id) ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input type="checkbox" checked={form.selectedProfIds.includes(p._id)}
                      onChange={() => toggleProf(p._id)} className="rounded text-indigo-600" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.specialty}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
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
