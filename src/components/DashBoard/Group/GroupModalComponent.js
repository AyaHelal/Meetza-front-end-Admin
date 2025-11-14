// GroupModalComponent.jsx
import React from "react";
import { X } from "phosphor-react";

const GroupModalComponent = ({ mode, formData, setFormData, onSave, onClose }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content rounded-4 border-0" style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold" style={{ fontSize: "24px", color: "#010101" }}>
                            {mode === "create" ? "Create New Group" : "Edit Group"}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                            style={{ fontSize: "14px" }}
                        >
                            <X size={24} weight="bold" />
                        </button>
                    </div>

                    <div className="modal-body pt-3">
                        <form>
                            {/* Group Name */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                    Group Name <span style={{ color: "#FF0000" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control rounded-3"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter group name"
                                    style={{
                                        border: "2px solid #E9ECEF",
                                        padding: "0.75rem",
                                        fontSize: "16px"
                                    }}
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                    Description
                                </label>
                                <textarea
                                    className="form-control rounded-3"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter group description (optional)"
                                    rows="4"
                                    style={{
                                        border: "2px solid #E9ECEF",
                                        padding: "0.75rem",
                                        fontSize: "16px",
                                        resize: "none"
                                    }}
                                />
                            </div>
                        </form>
                    </div>

                    <div className="modal-footer border-0 pt-0">
                        <button
                            type="button"
                            className="btn rounded-3 px-4 py-2"
                            onClick={onClose}
                            style={{
                                backgroundColor: "#F4F4F4",
                                color: "#888888",
                                border: "none",
                                fontSize: "16px",
                                fontWeight: "600"
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn rounded-3 px-4 py-2"
                            onClick={onSave}
                            style={{
                                background: "linear-gradient(to right, #0076EA, #00DC85)",
                                color: "white",
                                border: "none",
                                fontSize: "16px",
                                fontWeight: "600"
                            }}
                        >
                            {mode === "create" ? "Create Group" : "Update Group"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupModalComponent;