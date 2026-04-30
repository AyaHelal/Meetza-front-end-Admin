import { useState, useEffect } from "react";
import { Trash, CheckCircle, PencilSimpleLine, CaretDown, CalendarPlus, CalendarX } from "phosphor-react";
import { smartToast } from "../../../../utils/toastManager";

export const MeetingRow = ({ meeting, groups = [], isEditing, onSave, onEdit, onDelete, currentUser }) => {
    const [data, setData] = useState({
        title: meeting?.title || "",
        start_time: meeting?.start_time || "",
        end_time: meeting?.end_time || "",
        status: meeting?.status || "Scheduled",
        group_id: meeting?.group_id || "",
    });
    const [weeklyDropdownOpen, setWeeklyDropdownOpen] = useState(null);

    useEffect(() => {
        if (meeting) {
            setData({
                title: meeting.title || "",
                start_time: meeting.start_time || "",
                end_time: meeting.end_time || "",
                status: meeting.status || "Scheduled",
                group_id: meeting.group_id || "",
            });
        } else {
            setData({
                title: "",
                start_time: "",
                end_time: "",
                status: "Scheduled",
                group_id: "",
            });
        }
    }, [meeting]);

    const getGroupName = () => {
        if (!meeting?.group_id) return 'No Group';
        const group = groups.find(g => (g.id === meeting.group_id || g.group_id === meeting.group_id));
        return group?.name || group?.group_name || 'Unknown';
    };

    const formatForInput = (value) => {
        if (!value) return "";
        const d = new Date(value);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const handleSave = () => {
        if (!data.title || !data.start_time || !data.end_time) {
            smartToast.error("Title, start time, and end time are required");
            return;
        }
        onSave(meeting?.id, data);
    };

    const handleWeeklyStatusChange = async (meetingId, newStatus) => {
        if (!meetingId) return;
        try {
            const apiCommon = require("../../../../utils/api").default;
            if (newStatus === 'active') {
                await apiCommon.post(`/meeting/${meetingId}/activate-recurrence`);
                smartToast.success("Weekly recurrence activated successfully");
            } else {
                await apiCommon.patch(`/meeting/${meetingId}/deactivate-recurrence`);
                smartToast.success("Weekly recurrence deactivated successfully");
            }
            // Trigger a re-fetch instead of full page reload
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (err) {
            smartToast.error(`Failed to ${newStatus} weekly recurrence: ${err.response?.data?.message || err.message}`);
        }
        setWeeklyDropdownOpen(null);
    };

    const handleCancel = () => {
        if (meeting) {
            setData({
                title: meeting.title || "",
                start_time: meeting.start_time || "",
                end_time: meeting.end_time || "",
                status: meeting.status || "Scheduled",
                group_id: meeting.group_id || "",
            });
        } else {
            setData({ title: "", start_time: "", end_time: "", status: "Scheduled", group_id: "" });
        }
        onEdit(meeting?.id || "new");
    };

    const showInput = isEditing || !meeting;
    const canEdit = currentUser?.role === "Super_Admin" || currentUser?.role === "Administrator";
    const inputStyle = { fontSize: "16px", fontWeight: 500, border: "2px solid #E9ECEF", borderRadius: "8px", padding: "0.5rem", width: "100%" };
    const textStyle = { fontSize: "16px", fontWeight: 600, padding: "8px 20px", color: "var(--text-secondary)", whiteSpace: "nowrap" };

    // Try to find content in the contents array, but also fallback to meeting.content_name if available

    return (
        <tr className="align-middle">
            <td>
                {showInput ? (
                    <input
                        type="text"
                        value={data.title}
                        placeholder="Enter title"
                        onChange={(e) => setData({ ...data, title: e.target.value })}
                        style={inputStyle}
                        onKeyPress={(e) => e.key === "Enter" && handleSave()}
                    />
                ) : (
                    <div className="d-flex align-items-center gap-2" style={{ padding: "8px 20px" }}>
                        {meeting?.poster_url ? (
                            <img
                                src={meeting.poster_url}
                                alt={data.title || "Meeting poster"}
                                style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 8,
                                    objectFit: "cover",
                                    flexShrink: 0,
                                }}
                            />
                        ) : null}
                        <span style={textStyle}>{data.title}</span>
                    </div>
                )}
            </td>

            <td>
                {showInput ? (
                    <div style={textStyle}>{getGroupName()}</div>
                ) : (
                    <div style={textStyle}>{getGroupName()}</div>
                )}
            </td>

            <td>
                {showInput ? (
                    <input type="datetime-local" value={formatForInput(data.start_time)} onChange={(e) => setData({ ...data, start_time: e.target.value })} style={inputStyle} />
                ) : (
                    <div style={textStyle}>{data.start_time ? new Date(data.start_time).toLocaleString() : "No Date"}</div>
                )}
            </td>

            <td>
                {showInput ? (
                    <input type="datetime-local" value={formatForInput(data.end_time)} onChange={(e) => setData({ ...data, end_time: e.target.value })} style={inputStyle} />
                ) : (
                    <div style={textStyle}>{data.end_time ? new Date(data.end_time).toLocaleString() : "No Date"}</div>
                )}
            </td>

            <td>
                <div style={textStyle}>
                    {meeting && (() => {
                        const r = meeting.recording ?? meeting.record_meeting ?? meeting.recordMeeting;
                        const isRecording = r === true || r === 1 || r === '1' || String(r).trim() === '1' || r === 'Recording';
                        return isRecording ? 'Yes' : 'No';
                    })()}
                </div>
            </td>

            <td>
                {showInput ? (
                    <div style={textStyle}>Active/Inactive</div>
                ) : (
                    <div className="weekly-meeting-dropdown" style={{ position: 'relative' }}>
                        <button
                            type="button"
                            className="btn btn-sm d-flex align-items-center gap-2"
                            style={{
                                padding: '4px 8px',
                                fontSize: '12px',
                                fontWeight: '500',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                background: 'var(--surface-color)'
                            }}
                            onClick={() => setWeeklyDropdownOpen(weeklyDropdownOpen === meeting?.id ? null : meeting?.id)}
                        >
                            {(() => {
                                const w = meeting?.weekly ?? meeting?.weekly_option ?? meeting?.is_weekly;
                                const isActive = w === true || w === 1 || w === '1' || String(w).trim() === '1' || w === 'Active';
                                return isActive ? (
                                    <>
                                        <CalendarPlus size={14} weight="fill" style={{ color: '#10b981' }} />
                                        <span style={{ color: '#10b981' }}>Active</span>
                                    </>
                                ) : (
                                    <>
                                        <CalendarX size={14} weight="fill" style={{ color: '#ef4444' }} />
                                        <span style={{ color: '#ef4444' }}>Inactive</span>
                                    </>
                                );
                            })()}
                            <CaretDown size={10} weight="bold" />
                        </button>

                        {weeklyDropdownOpen === meeting?.id && (
                            <div className="dropdown-menu show" style={{
                                position: 'absolute',
                                top: '100%',
                                left: '0',
                                right: '0',
                                margin: '4px 0 0',
                                background: '#1e293b',
                                border: '1px solid #374151',
                                borderRadius: '4px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                zIndex: 1000,
                                overflow: 'hidden'
                            }}>
                                <button
                                    type="button"
                                    className="dropdown-item d-flex align-items-center gap-2"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: 'none',
                                        background: '#1e293b',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        color: '#f3f4f6',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => handleWeeklyStatusChange(meeting?.id, 'active')}
                                    onMouseOver={(e) => {
                                        e.target.style.background = '#0076EA';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.background = '#1e293b';
                                        e.target.style.color = '#f3f4f6';
                                    }}
                                >
                                    <CalendarPlus size={14} weight="fill" />
                                    Active Weekly
                                </button>
                                <button
                                    type="button"
                                    className="dropdown-item d-flex align-items-center gap-2"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: 'none',
                                        background: '#1e293b',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        fontWeight: '500',
                                        color: '#f3f4f6',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onClick={() => handleWeeklyStatusChange(meeting?.id, 'Inactive')}
                                    onMouseOver={(e) => {
                                        e.target.style.background = '#ef4444';
                                        e.target.style.color = 'white';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.background = '#1e293b';
                                        e.target.style.color = '#f3f4f6';
                                    }}
                                >
                                    <CalendarX size={14} weight="fill" />
                                    Inactive Weekly
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </td>

            <td>
                {showInput ? (
                    <select value={data.status} onChange={(e) => setData({ ...data, status: e.target.value })} style={inputStyle}>
                        <option>Scheduled</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                    </select>
                ) : (
                    <div style={textStyle}>{data.status}</div>
                )}
            </td>

            <td className="d-flex gap-2 mt-3">
                {showInput ? (
                    <div className="d-flex gap-2">
                        <button type="button" className="btn btn-sm user-card-btn-edit" style={{ borderRadius: 12 }} onClick={handleSave}><CheckCircle size={20} /></button>
                        <button className="btn btn-sm" style={{ backgroundColor: "#6c757d", borderRadius: 12, color: "white" }} onClick={handleCancel}>×</button>
                    </div>
                ) : canEdit ? (
                    <>
                        <button type="button" className="btn btn-sm user-card-btn-edit" style={{ borderRadius: 12 }} onClick={() => onEdit(meeting.id)}><PencilSimpleLine size={18} /></button>
                        <button type="button" className="btn btn-sm user-card-btn-delete" style={{ borderRadius: 12 }} onClick={() => onDelete(meeting.id)}><Trash size={18} /></button>
                    </>
                ) : null}
            </td>
        </tr>
    );
};
