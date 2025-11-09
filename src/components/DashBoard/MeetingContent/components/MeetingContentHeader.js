export const MeetingContentHeader = () => (
  <div
    className="bg-white border-bottom px-4 py-1 mt-5 mx-4 rounded-3"
    style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
  >
    <div className="d-flex justify-content-between align-items-start">
      <div>
        <h1 className="h4 pt-3 fw-semibold" style={{ color: "#010101" }}>
          Meeting Content Management
        </h1>
        <p style={{ color: "#888888", fontSize: "18px" }}>
          Manage your meeting contents and descriptions.
        </p>
      </div>
    </div>
  </div>
);
