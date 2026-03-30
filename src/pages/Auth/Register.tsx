import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export const Register = () => {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error(t('register.errorPasswordMin'));
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || t('register.errorDefault');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">{t('register.title')}</h1>
            <p className="text-gray-500 text-sm mt-1">{t('register.subtitle')}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={t('register.fullName')} placeholder={t('register.namePlaceholder')} value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label={t('register.email')} type="email" placeholder="tu@email.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label={t('register.phone')} type="tel" placeholder={t('register.phonePlaceholder')} value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label={t('register.password')} type="password" placeholder={t('register.passwordPlaceholder')} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <Button type="submit" className="w-full" loading={loading}>{t('register.submit')}</Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            {t('register.alreadyAccount')}{' '}
            <Link to="/login" className="text-indigo-600 hover:underline font-medium">{t('register.loginLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
