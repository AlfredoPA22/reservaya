import { Outlet, useNavigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">Administración</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>Ver sitio</Button>
            <Button variant="secondary" size="sm" onClick={() => { logout(); navigate('/login'); }}>Salir</Button>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
