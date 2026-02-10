import React from "react";
import { X } from "phosphor-react";


const MeetingModal = ({ mode, data, groups = [], onChange, onClose, onSubmit }) => {
    const title = mode === 'create' ? 'Create Meeting' : 'Update Meeting';
    console.log('MeetingModal - groups received:', groups);
    const formatForInput = (value) => {
        if (!value) return '';
        const d = new Date(value);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const handleStartTimeChange = (e) => {
        onChange({ ...data, start_time: e.target.value });
    };

    const handleEndTimeChange = (e) => {
        onChange({ ...data, end_time: e.target.value });
    };

    return (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.45)' }}>
            <div className="card p-4 mx-auto" style={{ maxWidth: 560, borderRadius: 12, marginTop: '6rem' }}>
                <div className="d-flex justify-content-between align-items-start">
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{title}</h3>
                    <button type="button" className="btn-close" onClick={onClose} aria-label="Close" style={{ fontSize: "14px" }}>
                    </button>
                </div>

                <div style={{ marginTop: 12 }}>
                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Title</label>
                    <input
                        className="form-control mb-3 rounded-3"
                        placeholder="Enter title"
                        value={data.title || ''}
                        onChange={(e) => onChange({ ...data, title: e.target.value })}
                    />

                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Start Time</label>
                    <input
                        type="datetime-local"
                        className="form-control mb-3 rounded-3"
                        value={formatForInput(data.start_time)}
                        onChange={handleStartTimeChange}
                    />

                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>End Time</label>
                    <input
                        type="datetime-local"
                        className="form-control mb-3 rounded-3"
                        value={formatForInput(data.end_time)}
                        onChange={handleEndTimeChange}
                    />

                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Group</label>
                    <select className="form-select mb-3 rounded-3" value={data.group_id || ''} onChange={(e) => onChange({ ...data, group_id: e.target.value })}>
                        <option value="">Select a group...</option>
                        {groups && groups.length > 0 ? (
                            groups.map((g) => (
                                <option key={g.id || g.group_id} value={g.id || g.group_id}>
                                    {g.name || g.group_name}
                                </option>
                            ))
                        ) : (
                            <option disabled>No groups available</option>
                        )}
                    </select>

                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Status</label>
                    <select className="form-select mb-3 rounded-3" value={data.status || 'Scheduled'} onChange={(e) => onChange({ ...data, status: e.target.value })}>
                        <option>Scheduled</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                    </select>

                    <div className="d-flex gap-2" style={{ marginTop: 12 }}>
                        <button
                            className="btn"
                            onClick={() => {
                                if (mode === 'create' && !data.group_id) {
                                    alert('Please select a group');
                                    return;
                                }
                                onSubmit(data);
                            }}
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

export default MeetingModal;
