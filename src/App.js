import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate,useNavigate } from "react-router-dom";
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

// Protected route component - only allows Super_Admin and Administrator roles
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('user');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check user role - only allow Super_Admin and Administrator
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      const userRole = user.role || localStorage.getItem('userRole') || '';
      const normalizedRole = userRole.toLowerCase();
      
      // Block members from accessing dashboard
      if (normalizedRole === 'member') {
        // Clear auth data and redirect to login with error message
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        return <Navigate to="/login?error=access_denied" replace />;
      }
      
      // Allow Super_Admin, Administrator, and Super Admin (case variations)
      const allowedRoles = ['super_admin', 'administrator', 'super admin'];
      if (!allowedRoles.includes(normalizedRole)) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userRole');
        return <Navigate to="/login?error=access_denied" replace />;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }

  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);

  // Handle social login redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const user = urlParams.get('user');

    if (token && user) {
      try {
        const userData = JSON.parse(decodeURIComponent(user));
        const userRole = userData.role || '';
        const normalizedRole = userRole.toLowerCase();
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userRole', userRole);
        if (userData.name) {
          localStorage.setItem('userName', userData.name);
        }
        
        // Clean up URL
        navigate(location.pathname, { replace: true });
        
        // Check role - only allow Super_Admin and Administrator to access dashboard
        if (normalizedRole === 'member') {
          // Clear auth data and redirect to login with error
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
          navigate('/login?error=member_access_denied', { replace: true });
          return;
        }
        
        // Allow Super_Admin, Administrator, and Super Admin
        const allowedRoles = ['super_admin', 'administrator', 'super admin'];
        if (allowedRoles.includes(normalizedRole)) {
          navigate('/dashboard', { replace: true });
        } else {
          // Unknown role - deny access
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userRole');
          navigate('/login?error=access_denied', { replace: true });
        }
      } catch (error) {
        console.error('Error parsing social login data:', error);
        navigate('/login?error=parse_error', { replace: true });
      }
    }
  }, [location.search, navigate]);

  useEffect(() => {
    // Check for remember me token on app load
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');

    if (rememberMe && token && location.pathname === '/login') {
      // Check user role before auto-redirecting
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const userRole = user.role || localStorage.getItem('userRole') || '';
          const normalizedRole = userRole.toLowerCase();
          
          // Only auto-redirect if user has admin role
          const allowedRoles = ['super_admin', 'administrator', 'super admin'];
          if (allowedRoles.includes(normalizedRole)) {
            // Delay slightly to allow state to settle
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 100);
          } else {
            // Clear invalid credentials
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            localStorage.removeItem('userRole');
            localStorage.removeItem('rememberMe');
          }
        } catch (error) {
          console.error('Error parsing user data for auto-login:', error);
        }
      }
    }

    setAutoLoginAttempted(true);
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, [location.pathname]);

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
      <AnimatedRoutes />
    </Router>
  );
}

export default App;