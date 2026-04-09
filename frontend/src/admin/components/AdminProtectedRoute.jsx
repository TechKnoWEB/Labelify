import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export default function AdminProtectedRoute({ children }) {
  const { adminUser, loading } = useAdminAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-dim)', fontFamily: 'Inter, sans-serif', gap: '0.75rem' }}>
        <div style={{ width: 20, height: 20, border: '2px solid var(--border-color)', borderTopColor: 'var(--acc-prim)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        Verifying access…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!adminUser) return <Navigate to="/admin/login" replace />;
  return children;
}
