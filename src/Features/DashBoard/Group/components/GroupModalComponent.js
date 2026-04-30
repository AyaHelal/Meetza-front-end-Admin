// GroupModalComponent.jsx
import React from "react";
import Select from "react-select";

const GroupModalComponent = ({ mode, formData, setFormData, onSave, onClose }) => {
    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        let newValue;
        if (type === "file") newValue = files && files.length ? files[0] : null;
        else newValue = value;
        setFormData({ ...formData, [name]: newValue });
    };

    return (
        <div
            className="modal show d-block dashboard-form-modal"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-centered dashboard-form-modal__dialog"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content rounded-4 border-0" style={{ backgroundColor: "var(--card-bg)", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold" style={{ fontSize: "24px", color: "var(--text-primary)" }}>
                            {mode === "create" ? "Create New Group" : "Edit Group"}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                            style={{ fontSize: "14px" }}
                        />
                    </div>

                    <div className="modal-body pt-3 dashboard-form-modal__body hide-scrollbar" style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: 10 }}>
                        <form className="dashboard-form-modal__form">
                            {mode === "create" ? (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "var(--text-primary)" }}>
                                            Group Name <span style={{ color: "#FF0000" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3"
                                            name="group_name"
                                            value={formData.group_name || ""}
                                            onChange={handleChange}
                                            placeholder="Enter group name"
                                            style={{
                                                border: "1px solid var(--border-color)",
                                                padding: "0.75rem",
                                                fontSize: "16px",
                                                backgroundColor: "transparent",
                                                color: "var(--text-primary)"
                                            }}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "var(--text-primary)", marginTop: 6 }}>
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description || ""}
                                            onChange={handleChange}
                                            className="form-control rounded-3 mb-3"
                                            placeholder="Group description (optional)"
                                            style={{ border: "1px solid var(--border-color)", minHeight: 80, backgroundColor: "transparent", color: "var(--text-primary)" }}
                                        />
                                        <label className="form-label fw-semibold" style={{ color: "var(--text-primary)" }}>
                                            Poster (image)
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            name="group_photo"
                                            onChange={handleChange}
                                            className="form-control"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "var(--text-primary)" }}>
                                            Name <span style={{ color: "#FF0000" }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control rounded-3"
                                            name="name"
                                            value={formData.name || ""}
                                            onChange={handleChange}
                                            placeholder="Enter group name"
                                            style={{ border: "1px solid var(--border-color)", padding: "0.75rem", fontSize: "16px", backgroundColor: "transparent", color: "var(--text-primary)" }}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "var(--text-primary)" }}>
                                            Year
                                        </label>
                                        <select
                                            className="form-select rounded-3"
                                            name="year"
                                            value={formData.year || ""}
                                            onChange={handleChange}
                                            style={{ border: "1px solid var(--border-color)", fontSize: "16px", backgroundColor: "transparent", color: "var(--text-primary)" }}
                                        >
                                            <option value="">—</option>
                                            {["1", "2", "3", "4"].map((y) => (
                                                <option key={y} value={y}>
                                                    {y}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "var(--text-primary)" }}>
                                            Semester
                                        </label>
                                        <div className="dashboard-form-modal__select-wrap">
                                            <Select
                                                options={[
                                                    { value: "Fall", label: "Fall" },
                                                    { value: "Spring", label: "Spring" },
                                                    { value: "Summer", label: "Summer" },
                                                ]}
                                                value={
                                                    formData.semester
                                                        ? { value: formData.semester, label: formData.semester }
                                                        : null
                                                }
                                                onChange={(opt) => setFormData({ ...formData, semester: opt?.value ?? "" })}
                                                placeholder="Select semester"
                                                isClearable
                                                menuPortalTarget={document.body}
                                                styles={{ 
                                                    menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                    control: (base) => ({ ...base, backgroundColor: 'transparent', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }),
                                                    menu: (base) => ({ ...base, backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', zIndex: 9999 }),
                                                    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? 'var(--bg-light)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }),
                                                    singleValue: (base) => ({ ...base, color: 'var(--text-primary)' }),
                                                    input: (base) => ({ ...base, color: 'var(--text-primary)' })
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "var(--text-primary)", marginTop: 6 }}>
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description || ""}
                                            onChange={handleChange}
                                            className="form-control rounded-3 mb-3"
                                            placeholder="Group description (optional)"
                                            style={{ border: "1px solid var(--border-color)", minHeight: 80, backgroundColor: "transparent", color: "var(--text-primary)" }}
                                        />

                                        <label className="form-label fw-semibold" style={{ color: "var(--text-primary)" }}>
                                            Poster (image)
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            name="group_photo"
                                            onChange={handleChange}
                                            className="form-control"
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
                                background: "#007bff",
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
};

export default GroupModalComponent;
