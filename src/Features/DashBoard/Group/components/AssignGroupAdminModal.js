import React from "react";
import Select from "react-select";

const ROLE_OPTIONS = [
  { value: "OWNER", label: "OWNER" },
  { value: "ADMIN", label: "ADMIN" },
];

export default function AssignGroupAdminModal({
  group,
  formData,
  setFormData,
  onSave,
  onClose,
  saving = false,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const groupName = group?.name || group?.group_name || `Group ${group?.id ?? ""}`;

  return (
    <div
      className="modal show d-block dashboard-form-modal"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div className="modal-dialog modal-dialog-centered dashboard-form-modal__dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content rounded-4 border-0" style={{ backgroundColor: "var(--card-bg)", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold" style={{ fontSize: "22px", color: "var(--text-primary)" }}>
              Assign Leaders
            </h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" style={{ fontSize: "14px" }} />
          </div>

          <div className="modal-body pt-3 dashboard-form-modal__body">
            <form className="dashboard-form-modal__form" onSubmit={(e) => e.preventDefault()}>
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: "var(--text-primary)" }}>
                  Group
                </label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  value={groupName}
                  disabled
                  style={{ border: "1px solid var(--border-color)", padding: "0.75rem", fontSize: "16px", backgroundColor: "transparent", color: "var(--text-primary)" }}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: "var(--text-primary)" }}>
                  Leaders emails <span style={{ color: "#FF0000" }}>*</span>
                </label>
                <textarea
                  className="form-control rounded-3"
                  name="emailsText"
                  rows={4}
                  value={formData.emailsText || ""}
                  onChange={handleChange}
                  placeholder="One per line, or separated by commas"
                  style={{ border: "1px solid var(--border-color)", padding: "0.75rem", fontSize: "16px", resize: "vertical", backgroundColor: "transparent", color: "var(--text-primary)" }}
                />
                <div className="form-text" style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                  You can paste several Leaders emails at once.
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ color: "var(--text-primary)" }}>
                  Role
                </label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  value="Leader"
                  disabled
                  style={{ border: "1px solid var(--border-color)", padding: "0.75rem", fontSize: "16px", backgroundColor: "transparent", color: "var(--text-primary)" }}
                />
              </div>
            </form>
          </div>

          <div className="modal-footer border-0 pt-0">
            <button
              type="button"
              className="btn rounded-3 px-4 py-2"
              onClick={onSave}
              disabled={saving || !(formData.emailsText || "").trim()}
              style={{
                flex: 1,
                background: "#007bff",
                color: "white",
                borderRadius: 8,
                padding: "10px 12px",
                fontWeight: 600,
                opacity: saving ? 0.85 : 1,
              }}
            >
              {saving ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

