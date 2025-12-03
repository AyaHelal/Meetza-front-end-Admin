// GroupModalComponent.jsx
import React from "react";
import Select from "react-select";
import { X } from "phosphor-react";

const GroupModalComponent = ({ mode, formData, setFormData, onSave, onClose, positions = [], contents = [] }) => {
    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        let newValue;
        if (type === 'file') newValue = files && files.length ? files[0] : null;
        else newValue = value;
        setFormData({ ...formData, [name]: newValue });
    };

    // Only include contents that are not assigned to any group, or include the currently selected content for this group
    const contentOptions = contents
        .filter(c => !c.assigned_group_id || c.id === formData.group_content_id)
        .map(content => ({ value: content.id, label: content.content_name }));

    const selectedContent = formData.group_content_id ? contentOptions.find(opt => opt.value === formData.group_content_id) : null;

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

                    <div className="modal-body pt-3" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: 10 }}>
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
                                        <div>
                                            <Select
                                                options={positions.map(p => ({ value: p.id, label: p.name || p.position_name || p.title || `Position ${p.id}` }))}
                                                value={formData.position_id ? { value: formData.position_id, label: positions.find(p => p.id === formData.position_id)?.name || positions.find(p => p.id === formData.position_id)?.title || `Position ${formData.position_id}` } : null}
                                                onChange={(opt) => setFormData({ ...formData, position_id: opt?.value ?? '' })}
                                                placeholder="Select a position"
                                                menuPortalTarget={document.body}
                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                            />
                                        </div>
                                    </div>

                                    {/* Group Content select */}
                                    <div className="mb-3">
                                        {/* Description */}
                                        <label className="form-label fw-semibold" style={{ color: "#010101", marginTop: 6 }}>
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description || ''}
                                            onChange={handleChange}
                                            className="form-control rounded-3 mb-3"
                                            placeholder="Group description (optional)"
                                            style={{ border: '2px solid #E9ECEF', minHeight: 80 }}
                                        />

                                        {/* Poster upload */}
                                        <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                            Poster (image)
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            name="group_photo"
                                            onChange={handleChange}
                                            className="form-control mb-3"
                                        />
                                        <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                            Group Content
                                        </label>
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ flex: 1 }}>
                                                <Select
                                                    options={contentOptions}
                                                    value={selectedContent}
                                                    onChange={(option) => setFormData({ ...formData, group_content_id: option?.value ?? null })}
                                                    placeholder="Select group content (optional)"
                                                    isClearable
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            borderRadius: 12,
                                                            border: '2px solid #E9ECEF',
                                                            boxShadow: 'none'
                                                        })
                                                    }}
                                                />
                                            </div>
                                            {/* explicit clear button to ensure null is set when user clicks X */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({
                                                    ...prev,
                                                    group_content_id: null
                                                    }));
                                                }}
                                                className="btn btn-outline-secondary"
                                                style={{ borderRadius: 12, padding: '6px 8px' }}
                                                aria-label="Clear group content"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Edit mode: edit name and group content */}
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

                                    {/* Group Content select in edit mode */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "#010101", marginTop: 6 }}>
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description || ''}
                                            onChange={handleChange}
                                            className="form-control rounded-3 mb-3"
                                            placeholder="Group description (optional)"
                                            style={{ border: '2px solid #E9ECEF', minHeight: 80 }}
                                        />

                                        <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                            Poster (image)
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            name="group_photo"
                                            onChange={handleChange}
                                            className="form-control mb-3"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                            Group Content
                                        </label>
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ flex: 1 }}>
                                                <Select
                                                    options={contentOptions}
                                                    value={selectedContent}
                                                    onChange={(option) => setFormData({ ...formData, group_content_id: option?.value ?? null })}
                                                    placeholder="Select group content (optional)"
                                                    isClearable
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            borderRadius: 12,
                                                            border: '2px solid #E9ECEF',
                                                            boxShadow: 'none'
                                                        })
                                                    }}
                                                />
                                            </div>
                                        </div>
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