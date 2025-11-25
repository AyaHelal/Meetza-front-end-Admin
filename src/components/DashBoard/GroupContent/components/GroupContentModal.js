import React from "react";
import { X } from "phosphor-react";


const GroupContentModal = ({ mode = 'create', data = {}, onChange, onClose, onSubmit }) => {
    const title = mode === 'create' ? 'Create Content' : 'Update Content';

    return (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.45)' }}>
            <div className="card p-4 mx-auto" style={{ maxWidth: 560, borderRadius: 12, marginTop: '6rem' }}>
                <div className="d-flex justify-content-between align-items-start">
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{title}</h3>
                    <button type="button" className="btn-close" onClick={onClose} aria-label="Close" style={{ fontSize: "14px" }}>
                    </button>
                </div>

                <div style={{ marginTop: 12 }}>
                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Content Name</label>
                    <input
                        className="form-control mb-3 rounded-3"
                        placeholder="Enter content name"
                        value={data.content_name || ''}
                        onChange={(e) => onChange({ ...data, content_name: e.target.value })}
                    />

                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Description</label>
                    <input
                        className="form-control mb-3 rounded-3"
                        placeholder="Enter description"
                        value={data.content_description || ''}
                        onChange={(e) => onChange({ ...data, content_description: e.target.value })}
                    />

                    <div className="d-flex gap-2" style={{ marginTop: 12 }}>
                        <button
                            className="btn"
                            onClick={() => onSubmit(data)}
                            style={{
                                flex: 1,
                                background: '#007bff',
                                color: 'white',
                                borderRadius: 8,
                                padding: '10px 12px',
                                fontWeight: 600,
                            }}
                        >
                            {mode === 'create' ? 'Create' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupContentModal;
