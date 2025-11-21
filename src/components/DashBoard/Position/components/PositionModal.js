// PositionModal.js
import React from "react";
import Select from 'react-select';
import { smartToast } from "../../../../utils/toastManager";
import { X } from "phosphor-react";


const PositionModal = ({ mode, data, users = [], onChange, onClose, onSubmit }) => {
    const title = mode === 'create' ? 'Create Position' : 'Update Position';

    const handleSubmit = () => {
        if (!data.title.trim()) {
            smartToast.error("Position title is required");
            return;
        }

        if (data.showUserSelect && !data.selectedUser) {
            smartToast.error("Please select a user for this position");
            return;
        }

        onSubmit(data);
    };

    return (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.45)' }}>
            <div className="card p-4 mx-auto" style={{ maxWidth: 420, borderRadius: 12, marginTop: '8rem' }}>
                <div className="d-flex justify-content-between align-items-start">
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{title}</h3>
                    <button type="button" className="btn-close" onClick={onClose} aria-label="Close" style={{ fontSize: "14px" }}>
                    </button>
                </div>

                <div style={{ marginTop: 12 }}>
                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Position</label>
                    <input
                        className="form-control mb-3 rounded-3"
                        placeholder="Position title"
                        value={data.title || ''}
                        onChange={(e) => onChange({ ...data, title: e.target.value })}
                    />

                    {data.showUserSelect && (
                        <>
                            <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>User</label>
                            <Select
                                options={users.map(u => ({ value: u.id, label: u.name }))}
                                value={data.selectedUser ? { value: data.selectedUser, label: users.find(u => u.id === data.selectedUser)?.name } : null}
                                onChange={(s) => onChange({ ...data, selectedUser: s?.value || null })}
                                placeholder="Select a user..."
                                menuPortalTarget={document.body}
                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                        </>
                    )}

                    <div className="d-flex gap-2" style={{ marginTop: 12 }}>
                        <button
                            className="btn"
                            onClick={handleSubmit}
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

export default PositionModal;
