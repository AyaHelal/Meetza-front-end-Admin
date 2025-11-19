import React from "react";

const ModalComponent = ({ mode, formData, setFormData, onSave, onClose }) => (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.45)" }}>
        <div className="card p-4 mx-auto" style={{ maxWidth: 420, borderRadius: 12 , marginTop:'6rem'}}>
            <div className="d-flex justify-content-between align-items-start">
                <div>
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{mode === "create" ? "Create User" : "Update User"}</h3>
                </div>
                <button
                    onClick={onClose}
                    aria-label="Close"
                    style={{ background: "transparent", border: "none", fontSize: 20, lineHeight: 1 }}
                >
                    ×
                </button>
            </div>

            <div style={{ marginTop: 12 }}>
                <label className="form-label" style={{ fontSize: 13, color: "#6c757d" }}>Name</label>
                <input
                    className="form-control mb-3 rounded-3"
                    placeholder="Farida Emad"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <label className="form-label" style={{ fontSize: 13, color: "#6c757d" }}>Email</label>
                <input
                    className="form-control mb-3 rounded-3"
                    placeholder="Faridaemad@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <label className="form-label" style={{ fontSize: 13, color: "#6c757d" }}>Password</label>
                <input
                    type="password"
                    className="form-control mb-3 rounded-3"
                    placeholder="***********"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />

                <label className="form-label" style={{ fontSize: 13, color: "#6c757d" }}>Role</label>
                <select
                    className="form-select mb-3 rounded-3"
                    value={formData.role || ""}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                    <option value="">Choose</option>
                    <option value="administrator">Administrator</option>
                    <option value="member">Member</option>
                </select>

                <div className="d-flex gap-2" style={{ marginTop: 6 }}>
                    <button
                        className="btn"
                        onClick={onSave}
                        style={{
                            flex: 1,
                            background: mode === "create" ? "#007bff" : "#007bff",
                            color: "white",
                            borderRadius: 8,
                            padding: "10px 12px",
                            fontWeight: 600,
                        }}
                    >
                        {mode === "create" ? "Create" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export default ModalComponent;
