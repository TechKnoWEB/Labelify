import { Routes, Route, useLocation } from 'react-router-dom';
import { TopNavbar } from './components/Layout/TopNavbar';
import { Footer } from './components/Layout/Footer';
import { ProtectedRoute } from './components/Layout/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PricingPage from './pages/PricingPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import ProfilePage from './pages/ProfilePage';
import SupportPage from './pages/SupportPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CookiesPage from './pages/CookiesPage';
import ContactPage from './pages/ContactPage';

// ── Admin (fully isolated) ────────────────────────────────────
import { AdminAuthProvider } from './admin/context/AdminAuthContext';
import AdminLoginPage from './admin/pages/AdminLoginPage';
import AdminDashboardPage from './admin/pages/AdminDashboardPage';

function MainApp() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  // Admin routes render completely standalone — no Navbar, no Footer
  if (isAdmin) {
    return (
      <AdminAuthProvider>
        <Routes>
          <Route path="/admin/login"      element={<AdminLoginPage />} />
          <Route path="/admin/:section"   element={<AdminDashboardPage />} />
          <Route path="/admin"            element={<AdminDashboardPage />} />
        </Routes>
      </AdminAuthProvider>
    );
  }

  return (
    <>
      <TopNavbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <EditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <SupportPage />
            </ProtectedRoute>
          }
        />
        {/* Legal */}
        <Route path="/terms"   element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        {/* Fallback */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return <MainApp />;
}

export default App;
