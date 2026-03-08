import React from "react";
import { X } from "phosphor-react";
import { smartToast } from "../../../../utils/toastManager";


const MeetingModal = ({ mode, data, groups = [], onChange, onClose, onSubmit }) => {
    const title = mode === 'create' ? 'Create Meeting' : 'Update Meeting';
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
                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Title <span style={{ color: "#FF0000" }}>*</span></label>
                    <input
                        className="form-control mb-3 rounded-3"
                        placeholder="Enter title"
                        value={data.title || ''}
                        onChange={(e) => onChange({ ...data, title: e.target.value })}
                    />

                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Start Time <span style={{ color: "#FF0000" }}>*</span></label>
                    <input
                        type="datetime-local"
                        className="form-control mb-3 rounded-3"
                        value={formatForInput(data.start_time)}
                        onChange={handleStartTimeChange}
                    />

                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>End Time <span style={{ color: "#FF0000" }}>*</span></label>
                    <input
                        type="datetime-local"
                        className="form-control mb-3 rounded-3"
                        value={formatForInput(data.end_time)}
                        onChange={handleEndTimeChange}
                    />

                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Group <span style={{ color: "#FF0000" }}>*</span></label>
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

                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Description (optional)</label>
                    <textarea
                        className="form-control mb-3 rounded-3"
                        rows={3}
                        placeholder="Enter a short description for this meeting"
                        value={data.description || ''}
                        onChange={(e) => onChange({ ...data, description: e.target.value })}
                    />

                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Poster image <span style={{ color: "#FF0000" }}>*</span></label>
                    <input
                        type="file"
                        accept="image/*"
                        className="form-control mb-3 rounded-3"
                        onChange={(e) => {
                            const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                            onChange({ ...data, poster_file: file });
                        }}
                    />

                    {mode === 'create' && (
                        <>
                            <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Resources files (optional)</label>
                            <input
                                type="file"
                                multiple
                                className="form-control mb-3 rounded-3"
                                onChange={(e) => {
                                    const incoming = e.target.files ? Array.from(e.target.files) : [];
                                    // Append to any existing selected files so the user can pick
                                    // multiple batches without losing previous ones.
                                    const existing = Array.isArray(data.files) ? data.files : [];
                                    onChange({ ...data, files: [...existing, ...incoming] });
                                }}
                            />
                            {Array.isArray(data.files) && data.files.length > 0 && (
                                <div className="mb-3" style={{ fontSize: 12, color: '#6c757d' }}>
                                    <strong>Selected resources:</strong>
                                    <ul style={{ marginBottom: 0, paddingLeft: '1.25rem' }}>
                                        {data.files.map((file, idx) => (
                                            <li key={idx}>{file.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}

                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Record Meeting</label>
                    <div className="d-flex gap-3 mb-3">
                        <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: 14 }}>
                            <input
                                type="radio"
                                name="recordMeeting"
                                checked={data.recordMeeting === 'Recording' || data.record_meeting === true || data.record_meeting === 1 || data.record_meeting === '1'}
                                onChange={() => onChange({ ...data, recordMeeting: 'Recording' })}
                            />
                            Recording
                        </label>
                        <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer', fontSize: 14 }}>
                            <input
                                type="radio"
                                name="recordMeeting"
                                checked={data.recordMeeting === 'Not Recording' || data.record_meeting === false || data.record_meeting === 0 || data.record_meeting === '0'}
                                onChange={() => onChange({ ...data, recordMeeting: 'Not Recording' })}
                            />
                            Not Recording
                        </label>
                    </div>

                    <label className="form-label" style={{ fontSize: 13, color: '#6c757d' }}>Status <span style={{ color: "#FF0000" }}>*</span></label>
                    <select className="form-select mb-3 rounded-3" value={data.status || 'Scheduled'} onChange={(e) => onChange({ ...data, status: e.target.value })}>
                        <option>Scheduled</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                    </select>

                    <div className="d-flex gap-2" style={{ marginTop: 12 }}>
                        <button
                            className="btn"
                            onClick={() => {
                                if (mode === 'create') {
                                    if (!data.group_id) {
                                        smartToast.error('Please select a group');
                                        return;
                                    }
                                    if (!data.poster_file) {
                                        smartToast.error('Please select a poster image for the meeting');
                                        return;
                                    }
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
