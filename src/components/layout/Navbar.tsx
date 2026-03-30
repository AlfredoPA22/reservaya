import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';
import { useLanguage } from '../../context/LanguageContext';
import { CalendarCheck, Menu, X, CalendarDays, LogOut, LayoutDashboard } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { profile } = useCompany();
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setOpen(false);
  };

  const navTo = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  const LangToggle = ({ mobile }: { mobile?: boolean }) => (
    <button
      onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
      className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors ${mobile ? 'w-full text-left' : ''}`}
    >
      {t('nav.langToggle')}
    </button>
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            {profile?.image ? (
              <img src={profile.image} alt="logo" className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <CalendarCheck className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="text-lg font-bold text-gray-900 max-w-[180px] truncate">
              {profile?.name || <><span className="text-indigo-600">Reserva</span>Ya</>}
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            <LangToggle />
            {user ? (
              <>
                <div className="flex items-center gap-2 mr-1">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-600">{user.name.split(' ')[0]}</span>
                </div>
                {isAdmin ? (
                  <button onClick={() => navTo('/admin')}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                    <LayoutDashboard className="w-4 h-4" />{t('nav.adminPanel')}
                  </button>
                ) : (
                  <button onClick={() => navTo('/mis-reservas')}
                    className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                    <CalendarDays className="w-4 h-4" />{t('nav.myBookings')}
                  </button>
                )}
                <button onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" />{t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navTo('/login')}
                  className="text-sm px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium">
                  {t('nav.login')}
                </button>
                <button onClick={() => navTo('/register')}
                  className="text-sm px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors font-medium">
                  {t('nav.register')}
                </button>
              </>
            )}
          </div>

          <button className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setOpen((v) => !v)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {user ? (
            <>
              <div className="flex items-center gap-3 py-2 px-2 mb-1">
                <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              {isAdmin ? (
                <button onClick={() => navTo('/admin')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                  <LayoutDashboard className="w-4 h-4 text-indigo-500" />{t('nav.adminPanel')}
                </button>
              ) : (
                <button onClick={() => navTo('/mis-reservas')}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                  <CalendarDays className="w-4 h-4 text-indigo-500" />{t('nav.myBookings')}
                </button>
              )}
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 text-sm">
                <LogOut className="w-4 h-4" />{t('nav.signOut')}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navTo('/login')}
                className="w-full px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 text-sm text-left font-medium">
                {t('nav.login')}
              </button>
              <button onClick={() => navTo('/register')}
                className="w-full px-3 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700">
                {t('nav.register')}
              </button>
            </>
          )}
          <div className="pt-1 border-t border-gray-100">
            <LangToggle mobile />
          </div>
        </div>
      )}
    </nav>
  );
};
