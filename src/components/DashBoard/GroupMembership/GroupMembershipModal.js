import React from "react";
import Select from 'react-select';

const GroupMembershipModal = ({ currentUser, mode, formData, setFormData, groups, onSave, onClose }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const visibleGroups = groups.filter(g => {
        if (currentUser.role.toLowerCase() === 'super_admin') return true;
        if (currentUser.role.toLowerCase() === 'administrator') return g.adminId === currentUser.id;
        return false;
    });

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

                    <div className="modal-body pt-3" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 10 }}>
                        <form>
                            <div className="mb-3">
                                <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                    Group <span style={{ color: "#FF0000" }}>*</span>
                                </label>
                                <div>
                                    <Select
                                        options={visibleGroups.filter(g => currentUser.role.toLowerCase() === 'super_admin' || g.adminId === currentUser.id).map(g => ({ value: g.id, label: g.name || g.group_name || `Group ${g.id}` }))}
                                        value={formData.group_id ? { value: formData.group_id, label: groups.find(g => g.id === formData.group_id)?.name || groups.find(g => g.id === formData.group_id)?.group_name || `Group ${formData.group_id}` } : null}
                                        onChange={(opt) => setFormData({ ...formData, group_id: opt?.value ?? '' })}
                                        placeholder="Select a group"
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        isClearable
                                    />
                                </div>
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
