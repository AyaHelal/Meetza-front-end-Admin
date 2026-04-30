import React from 'react';
import { useAuth } from '../../../context/AuthContext';

const UserWelcomeHeader = ({ userName, description }) => {
  // Prefer the name coming from the JWT token; do NOT fall back to email/id
  const { user } = useAuth() || {};
  const nameFromToken = user?.name;
  const displayName = nameFromToken || userName || 'User';

  return (
    <div 
      className="px-4 py-3 mx-4 rounded-3 branded-card-bg border-bottom" 
      style={{ 
        boxShadow: "var(--shadow-md)",
        marginTop: "var(--dashboard-top-margin)"
      }}
    >
      <div className="d-flex flex-column">
        <h1 className="h4 fw-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          Hello, {displayName}
        </h1>
        <p className="mb-0" style={{ color: "var(--text-secondary)", fontSize: "18px" }}>
          {description || 'Welcome back! Manage your team efficiently.'}
        </p>
      </div>
    </div>
  );
};

export default UserWelcomeHeader;
