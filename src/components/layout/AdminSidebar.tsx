import { NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const AdminSidebar = () => {
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

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-gray-700">
        <span className="text-lg font-bold text-indigo-400">ReservaYa</span>
        <p className="text-xs text-gray-400 mt-0.5">{t('sidebar.adminPanel')}</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
