import React, { useState } from "react";

const ResourcesLinksModal = ({ isOpen, onClose, onSubmit, loading }) => {
    const [link, setLink] = useState("");

    const handleSubmit = () => {
        if (!link.trim()) {
            alert("Please enter a valid link.");
            return;
        }
        onSubmit(link.trim());
        setLink("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.45)' }} onClick={onClose}>
            <div className="card p-4 mx-auto" style={{ maxWidth: 560, borderRadius: 12, marginTop: '6rem' }} onClick={(e) => e.stopPropagation()}>
                <div className="d-flex justify-content-between align-items-start">
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Add Link</h3>
                    <button type="button" className="btn-close" onClick={onClose} aria-label="Close" style={{ fontSize: "14px" }}>
                    </button>
                </div>

                <div style={{ marginTop: 12 }}>
                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Link URL</label>
                    <input
                        className="form-control mb-3 rounded-3"
                        placeholder="Enter link URL"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        type="url"
                    />

                    <div className="d-flex gap-2" style={{ marginTop: 12 }}>
                        <button
                            className="btn"
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                flex: 1,
                                background: '#007bff',
                                color: 'white',
                                borderRadius: 8,
                                padding: '10px 12px',
                                fontWeight: 600,
                            }}
                        >
                            {loading ? "Adding..." : "Add Link"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResourcesLinksModal;
