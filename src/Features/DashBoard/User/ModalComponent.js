import React, { useState } from "react";
import { Eye, EyeSlash } from "phosphor-react";

const ModalComponent = ({ mode, formData, setFormData, onSave, onClose }) => {
    const [showPassword, setShowPassword] = useState(false);
    const isEdit = mode === "edit";

    return (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,0.45)" }}>
            <div className="card p-4 mx-auto" style={{ maxWidth: 420, borderRadius: 12, marginTop: "6rem" }}>
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                            {isEdit ? "Update User" : "Create User"}
                        </h3>
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
                        style={{ backgroundColor: "transparent", color: "var(--text-primary)" }}
                        placeholder="John doe"
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />

                    {isEdit ? (
                        <>
                            <label className="form-label" style={{ fontSize: 13, color: "#6c757d" }}>Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="form-control mb-3 rounded-3"
                                style={{ backgroundColor: "transparent", color: "var(--text-primary)" }}
                                onChange={(e) => setFormData({ ...formData, photo: e.target.files?.[0] || null })}
                            />
                            {formData.photo && (
                                <small className="text-muted d-block mb-3">
                                    Selected: {formData.photo.name}
                                </small>
                            )}
                        </>
                    ) : (
                        <>
                            <label className="form-label" style={{ fontSize: 13, color: "#6c757d" }}>Email</label>
                            <input
                                className="form-control mb-3 rounded-3"
                                style={{ backgroundColor: "transparent", color: "var(--text-primary)" }}
                                placeholder="johndoe@gmail.com"
                                value={formData.email || ""}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <label className="form-label" style={{ fontSize: 13, color: "#6c757d" }}>Password</label>
                            <div className="position-relative mb-3">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-control rounded-3"
                                    style={{ backgroundColor: "transparent", color: "var(--text-primary)", paddingRight: "40px" }}
                                    placeholder="••••••••"
                                    value={formData.password || ""}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    className="btn position-absolute top-50 translate-middle-y end-0 border-0"
                                    style={{ background: "transparent", paddingRight: "15px" }}
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeSlash size={20} color="#6c757d" /> : <Eye size={20} color="#6c757d" />}
                                </button>
                            </div>
                            <label className="form-label" style={{ fontSize: 13, color: "#6c757d" }}>Role</label>
                            <select
                                className="form-select mb-3 rounded-3"
                                style={{ backgroundColor: "transparent", color: "var(--text-primary)" }}
                                value={formData.role || ""}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="">Choose</option>
                                <option value="administrator">Leader</option>
                                <option value="Super_Admin">Super Admin</option>
                                <option value="member">Member</option>
                            </select>
                        </>
                    )}

                    <div className="d-flex gap-2" style={{ marginTop: 6 }}>
                        <button
                            className="btn"
                            onClick={onSave}
                            style={{
                                flex: 1,
                                background: "#007bff",
                                color: "white",
                                borderRadius: 8,
                                padding: "10px 12px",
                                fontWeight: 600,
                            }}
                        >
                            {isEdit ? "Save" : "Create"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalComponent;
