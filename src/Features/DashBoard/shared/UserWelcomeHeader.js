import React from 'react';
import { useAuth } from '../../../context/AuthContext';

const UserWelcomeHeader = ({ userName, description }) => {
  // Prefer the name coming from the JWT token; do NOT fall back to email/id
  const { user } = useAuth() || {};
  const nameFromToken = user?.name;
  const displayName = nameFromToken || userName || 'User';

  return (
    <div className="bg-white border-bottom px-4 py-1 mt-5 mx-4 rounded-3" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <div className="d-flex flex-column">
        <h1 className="h4 pt-3 fw-semibold" style={{ color: "#010101" }}>
          Hello, {displayName}
        </h1>
        <p style={{ color: "#888888", fontSize: "18px" }}>
          {description || 'Welcome back! Manage your team efficiently.'}
        </p>
      </div>
    </div>
  );
};

export default UserWelcomeHeader;
