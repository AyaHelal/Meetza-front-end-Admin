export const GroupHeader = ({ currentUser }) => (
  <div
    className="branded-card-bg border-bottom px-4 py-1 mt-5 mx-4 rounded-3"
    style={{ boxShadow: "var(--shadow-sm)" }}
  >
    <div className="d-flex justify-content-between align-items-start">
      <div>
        <h1 className="h4 pt-3 fw-semibold" style={{ color: "var(--text-primary)" }}>
          Hello, {currentUser?.name || "User"}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "18px" }}>
          Welcome back! Manage your groups efficiently.
        </p>
      </div>
    </div>
  </div>
);

