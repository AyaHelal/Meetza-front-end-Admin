import React from 'react';

const UserWelcomeHeader = ({ userName, description }) => {
  return (
    <div className="bg-white border-bottom px-4 py-1 mt-5 mx-4 rounded-3" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <div className="d-flex flex-column">
        <h1 className="h4 pt-3 fw-semibold" style={{ color: "#010101" }}>
          Hello, {userName || 'User'}
        </h1>
        <p style={{ color: "#888888", fontSize: "18px" }}>
          {description || 'Welcome back! Manage your team efficiently.'}
        </p>
      </div>
    </div>
  );
};

export default UserWelcomeHeader;
