import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AdminSidebar = ({ open, onClose }: Props) => {
  const { t } = useLanguage();

  const links = [
    { to: '/admin', label: t('sidebar.dashboard'), icon: '📊', end: true },
    { to: '/admin/calendario', label: t('sidebar.calendar'), icon: '📅' },
    { to: '/admin/reservas', label: t('sidebar.appointments'), icon: '📋' },
    { to: '/admin/servicios', label: t('sidebar.services'), icon: '🛎️' },
    { to: '/admin/profesionales', label: t('sidebar.professionals'), icon: '👤' },
    { to: '/admin/reportes', label: t('sidebar.reports'), icon: '📈' },
    { to: '/admin/empresa', label: t('sidebar.company'), icon: '🏢' },
  ];

  const navLinks = links.map(({ to, label, icon, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        }`
      }
    >
      <span>{icon}</span>
      {label}
    </NavLink>
  ));

  return (
    <>
      {/* Desktop sidebar — siempre visible, en flujo normal */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 min-h-screen bg-gray-900 text-white">
        <div className="px-6 py-5 border-b border-gray-700">
          <span className="text-lg font-bold text-indigo-400">ReservaYa</span>
          <p className="text-xs text-gray-400 mt-0.5">{t('sidebar.adminPanel')}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks}
        </nav>
      </aside>

      {/* Mobile drawer — overlay, solo visible cuando open=true */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        {/* Panel */}
        <aside
          className={`absolute top-0 left-0 h-full w-64 bg-gray-900 text-white flex flex-col shadow-xl transition-transform duration-300 ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-indigo-400">ReservaYa</span>
              <p className="text-xs text-gray-400 mt-0.5">{t('sidebar.adminPanel')}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navLinks}
          </nav>
        </aside>
      </div>
    </>
  );
};
