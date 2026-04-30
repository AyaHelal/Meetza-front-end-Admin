export const GroupMembershipHeader = ({ currentUser }) => (
  <div
    className="branded-card-bg border-bottom px-4 py-3 mx-4 rounded-3"
    style={{ 
      boxShadow: "var(--shadow-sm)",
      marginTop: "var(--dashboard-top-margin)"
    }}
  >
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <h1 className="h4 fw-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          Hello, {currentUser?.name || "User"}
        </h1>
        <p className="mb-0" style={{ color: "var(--text-secondary)", fontSize: "18px" }}>
          Welcome back, Track your team progress...
        </p>
      </div>
    </div>
  </div>
);

