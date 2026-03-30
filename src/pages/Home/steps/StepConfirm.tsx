import { useState } from 'react';
import type { BookingData } from '../BookingPage';
import { appointmentsApi } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Props {
  booking: BookingData;
  onSuccess: (id: string, code: string) => void;
  onBack: () => void;
}

// ─── Auth gate inline ─────────────────────────────────────────────────────────
const AuthGate = () => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleLogin = async () => {
    if (!form.email || !form.password) { toast.error('Completá email y contraseña'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch {
      toast.error('Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { toast.error('Nombre, email y contraseña son requeridos'); return; }
    if (form.password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, phone: form.phone || undefined });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al registrarse';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
        <span className="text-amber-500 text-lg mt-0.5">🔒</span>
        <div>
          <p className="text-sm font-medium text-amber-800">Necesitás una cuenta para reservar</p>
          <p className="text-xs text-amber-600 mt-0.5">Así podés ver y gestionar tus turnos en cualquier momento.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border border-gray-200 rounded-lg overflow-hidden mb-4">
        <button
          className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'login' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          onClick={() => setTab('login')}
        >
          Iniciar sesión
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium transition-colors ${tab === 'register' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          onClick={() => setTab('register')}
        >
          Crear cuenta
        </button>
      </div>

      {tab === 'login' ? (
        <div className="space-y-3">
          <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          <Input label="Contraseña" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} />
          <Button loading={loading} onClick={handleLogin} className="w-full">Iniciar sesión</Button>
          <p className="text-xs text-center text-gray-400">
            ¿No tenés cuenta?{' '}
            <button className="text-indigo-600 underline" onClick={() => setTab('register')}>Registrate aquí</button>
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <Input label="Nombre completo *" value={form.name} onChange={(e) => set('name', e.target.value)} />
          <Input label="Email *" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          <Input label="Contraseña * (mínimo 6 caracteres)" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} />
          <Input label="Teléfono (opcional)" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          <Button loading={loading} onClick={handleRegister} className="w-full">Crear cuenta y continuar</Button>
          <p className="text-xs text-center text-gray-400">
            ¿Ya tenés cuenta?{' '}
            <button className="text-indigo-600 underline" onClick={() => setTab('login')}>Iniciá sesión</button>
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Step Confirm ─────────────────────────────────────────────────────────────
export const StepConfirm = ({ booking, onSuccess, onBack }: Props) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const dateLabel = format(new Date(booking.date + 'T00:00:00'), "EEEE d 'de' MMMM yyyy", { locale: es });

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { data } = await appointmentsApi.create({
        professionalId: booking.professional!._id,
        serviceId: booking.service!._id,
        date: booking.date,
        timeSlot: booking.timeSlot,
        notes,
      });
      onSuccess(data._id, data.code);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al confirmar la reserva';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Confirmá tu reserva</h2>
      <p className="text-gray-500 text-sm mb-6">Revisá los datos antes de confirmar</p>

      {/* Resumen */}
      <div className="bg-indigo-50 rounded-xl p-4 mb-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Servicio</span>
          <span className="font-semibold text-gray-900">{booking.service?.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Profesional</span>
          <span className="font-semibold text-gray-900">{booking.professional?.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Fecha</span>
          <span className="font-semibold text-gray-900 capitalize">{dateLabel}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Hora</span>
          <span className="font-semibold text-indigo-600 text-base">{booking.timeSlot}</span>
        </div>
        <div className="border-t border-indigo-200 pt-3 flex justify-between text-sm">
          <span className="text-gray-500">Precio</span>
          <span className="font-bold text-gray-900 text-base">${booking.service?.price.toLocaleString()}</span>
        </div>
      </div>

      {/* Auth gate o info de usuario */}
      {!user ? (
        <AuthGate />
      ) : (
        <>
          <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <p className="text-gray-500">Reservando como <span className="font-medium text-gray-800">{user.name}</span></p>
          </div>

          <div className="mb-4">
            <Input label="Notas adicionales (opcional)" value={notes}
              placeholder="Ej: alguna preferencia especial..."
              onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack}>← Volver</Button>
            <Button loading={loading} onClick={handleConfirm} size="lg">Confirmar reserva</Button>
          </div>
        </>
      )}

      {!user && (
        <div className="flex justify-start mt-2">
          <Button variant="ghost" size="sm" onClick={onBack}>← Volver</Button>
        </div>
      )}
    </div>
  );
};
