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

// Protected route component
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/login" replace />;
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
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        // Clean up URL
        navigate(location.pathname, { replace: true });
        // Navigate to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error parsing social login data:', error);
      }
    }
  }, [location.search, navigate]);

  useEffect(() => {
    // Check for remember me token on app load
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    const token = localStorage.getItem('authToken');

    if (rememberMe && token && location.pathname === '/login') {
      // Auto-redirect to dashboard if remember me is enabled and token exists
      // Delay slightly to allow state to settle
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 100);
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