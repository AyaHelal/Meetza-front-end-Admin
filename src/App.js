import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Signup from "./pages/SignUp/SignUp";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerifyResetCode from "./pages/VerifyResetCode/VerifyResetCode";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import Home from "./pages/Home/Home";
import { AnimatePresence } from 'framer-motion';
import Dashboard from './pages/Dashboard/Dashboard';
import PageLoader from './components/PageLoader/PageLoader';
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { extractUserFromToken } from "./utils/token";

// Protected route: only Super_Admin and Administrator (role from token via useAuth)
function ProtectedRoute({ children }) {
  const { token, user, initializing } = useAuth();

  if (initializing) return <PageLoader />;
  if (!token) return <Navigate to="/login" replace />;

  const userRole = (user?.role || "").toString().trim().toLowerCase();
  const allowedRoles = ['super_admin', 'administrator', 'super admin'];
  if (userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login?error=access_denied" replace />;
  }

  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const { loginUser, user } = useAuth();

  // Handle social login redirect (token + user in URL)
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tokenParam = urlParams.get('token');
    const userParam = urlParams.get('user');

    if (tokenParam && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        loginUser(userData, tokenParam, true);
        navigate(location.pathname, { replace: true });
        const role = (userData?.role || "").toString().trim().toLowerCase();
        const allowedRoles = ['super_admin', 'administrator', 'super admin'];
        if (role && allowedRoles.includes(role)) {
          navigate('/dashboard', { replace: true });
        } else if (role === 'member') {
          navigate('/login?error=member_access_denied', { replace: true });
        } else {
          navigate('/login?error=access_denied', { replace: true });
        }
      } catch (error) {
        console.error('Error parsing social login data:', error);
        navigate('/login?error=parse_error', { replace: true });
      }
    }
  }, [location.search, navigate, loginUser]);

  // Auto-redirect when remember me and valid token (role from token)
  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token && location.pathname === '/login') {
      const userFromToken = extractUserFromToken();
      const role = (userFromToken?.role || "").toString().trim().toLowerCase();
      const allowedRoles = ['super_admin', 'administrator', 'super admin'];
      if (allowedRoles.includes(role)) {
        setTimeout(() => navigate('/dashboard', { replace: true }), 100);
      }
    }
    setAutoLoginAttempted(true);
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, [location.pathname, navigate]);

  if (loading && !autoLoginAttempted) return <PageLoader />;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-code" element={<VerifyResetCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
