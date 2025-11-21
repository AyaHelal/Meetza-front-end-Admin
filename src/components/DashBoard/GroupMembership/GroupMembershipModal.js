import React from "react";
import { X } from "phosphor-react";

const GroupMembershipModal = ({ mode, formData, setFormData, groups, onSave, onClose }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content rounded-4 border-0" style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold" style={{ fontSize: "24px", color: "#010101" }}>
                            {mode === "create" ? "Create New Membership" : "Edit Membership"}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close" style={{ fontSize: "14px" }}>
                        </button>
                    </div>

                    <div className="modal-body pt-3">
                        <form>
                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                    Group <span style={{ color: "#FF0000" }}>*</span>
                                </label>
                                <select
                                    className="form-select rounded-3"
                                    name="group_id"
                                    value={formData.group_id}
                                    onChange={handleChange}
                                    style={{ border: "2px solid #E9ECEF", padding: "0.75rem", fontSize: "16px" }}
                                >
                                    <option value="">Select a group</option>
                                    {groups.map((group) => (
                                        <option key={group.id} value={group.id}>
                                            {group.name || group.group_name || `Group ${group.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                    Member Email <span style={{ color: "#FF0000" }}>*</span>
                                </label>
                                <input
                                    type="email"
                                    className="form-control rounded-3"
                                    name="member_email"
                                    value={formData.member_email}
                                    onChange={handleChange}
                                    placeholder="Enter member email address"
                                    style={{ border: "2px solid #E9ECEF", padding: "0.75rem", fontSize: "16px" }}
                                />
                            </div>
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
                                fontWeight: 600
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

export default GroupMembershipModal;
