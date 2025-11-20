// GroupModalComponent.jsx
import React from "react";
import { X } from "phosphor-react";

const GroupModalComponent = ({ mode, formData, setFormData, onSave, onClose, positions = [] }) => {
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
                        </button>
                    </div>

                    <div className="modal-body pt-3">
                        <form>
                            {mode === 'create' ? (
                                <>
                                    {/* Group Name */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                            Group Name <span style={{ color: "#FF0000" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3"
                                            name="group_name"
                                            value={formData.group_name || ''}
                                            onChange={handleChange}
                                            placeholder="Enter group name"
                                            style={{
                                                border: "2px solid #E9ECEF",
                                                padding: "0.75rem",
                                                fontSize: "16px"
                                            }}
                                        />
                                    </div>

                                    {/* Position select */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                            Position <span style={{ color: "#FF0000" }}>*</span>
                                        </label>
                                        <select
                                            className="form-select rounded-3"
                                            name="position_id"
                                            value={formData.position_id || ''}
                                            onChange={handleChange}
                                            style={{ border: "2px solid #E9ECEF", padding: "0.75rem", fontSize: "16px" }}
                                        >
                                            <option value="">Select a position</option>
                                            {positions.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name || p.position_name || p.title || `Position ${p.id}`}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Edit mode: only edit name per requirement */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                            Name <span style={{ color: "#FF0000" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3"
                                            name="name"
                                            value={formData.name || ''}
                                            onChange={handleChange}
                                            placeholder="Enter group name"
                                            style={{ border: "2px solid #E9ECEF", padding: "0.75rem", fontSize: "16px" }}
                                        />
                                    </div>
                                </>
                            )}
                        </form>
                    </div>

                    <div className="modal-footer border-0 pt-0">
                        <button
                            type="button"
                            className="btn rounded-3 px-4 py-2"
                            onClick={onSave}
                            style={{
                                flex: 1,
                                background: '#007bff',
                                color: 'white',
                                borderRadius: 8,
                                padding: '10px 12px',
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
};

export default GroupModalComponent;