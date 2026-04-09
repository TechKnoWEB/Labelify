import { useAdminAuth } from '../context/AdminAuthContext';
import AdminProtectedRoute from '../components/AdminProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import '../Admin.css';

export default function AdminDashboardPage() {
  return (
    <AdminProtectedRoute>
      <div className="adm-root">
        <AdminLayout />
      </div>
    </AdminProtectedRoute>
  );
}
