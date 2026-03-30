import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { LanguageProvider } from './context/LanguageContext';
import { PrivateRoute } from './components/layout/PrivateRoute';
import { AdminLayout } from './components/layout/AdminLayout';

// Pages
import { BookingPage } from './pages/Home/BookingPage';
import { Login } from './pages/Auth/Login';
import { Register } from './pages/Auth/Register';
import { AdminDashboard } from './pages/Admin/Dashboard';
import { AdminCalendar } from './pages/Admin/Calendar';
import { AdminServices } from './pages/Admin/Services';
import { AdminProfessionals } from './pages/Admin/Professionals';
import { AdminAppointments } from './pages/Admin/Appointments';
import { AdminReports } from './pages/Admin/Reports';
import { AdminCompanyProfile } from './pages/Admin/CompanyProfile';
import { MyBookings } from './pages/Client/MyBookings';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
      <AuthProvider>
      <CompanyProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { borderRadius: '10px', fontSize: '14px' },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<BookingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Client protected */}
          <Route element={<PrivateRoute />}>
            <Route path="/mis-reservas" element={<MyBookings />} />
          </Route>

          {/* Admin protected */}
          <Route element={<PrivateRoute requireAdmin />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/calendario" element={<AdminCalendar />} />
              <Route path="/admin/reservas" element={<AdminAppointments />} />
              <Route path="/admin/servicios" element={<AdminServices />} />
              <Route path="/admin/profesionales" element={<AdminProfessionals />} />
              <Route path="/admin/reportes" element={<AdminReports />} />
              <Route path="/admin/empresa" element={<AdminCompanyProfile />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CompanyProvider>
      </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
