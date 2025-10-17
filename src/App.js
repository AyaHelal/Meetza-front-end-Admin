import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/Login/Login";
import Signup from "./pages/SignUp/SignUp"; // الصفحة النهائية للتسجيل
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import VerifyResetCode from "./pages/VerifyResetCode/VerifyResetCode";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import { AnimatePresence } from 'framer-motion';
import { Navigate } from "react-router-dom";


function AnimatedRoutes() {
  const location = useLocation();

  return (
    // <AnimatePresence mode="wait">
    //   <Routes location={location} key={location.pathname}>
    //     <Route path="/" element={<Navigate to="/login" replace />} />
    //     <Route path="/login" element={<Login />} />
    //     <Route path="/signup" element={<Signup />} />
    //     <Route path="/verify-email" element={<VerifyEmail />} />
    //     <Route path="/forgot-password" element={<ForgotPassword />} />
    //     <Route path="/verify-reset-code" element={<VerifyResetCode />} />
    //     <Route path="/reset-password" element={<ResetPassword />} />
    //   </Routes>
    // </AnimatePresence>
    <VerifyResetCode />
    // <ResetPassword />

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