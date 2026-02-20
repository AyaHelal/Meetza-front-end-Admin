import { useState, useEffect } from "react";
import { Trash, CheckCircle, PencilSimpleLine } from "phosphor-react";

export const MeetingRow = ({ meeting, groups = [], isEditing, onSave, onEdit, onDelete, currentUser}) => {
    const [data, setData] = useState({
        title: meeting?.title || "",
        start_time: meeting?.start_time || "",
        end_time: meeting?.end_time || "",
        status: meeting?.status || "Scheduled",
        group_id: meeting?.group_id || "",
    });

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
        if (!data.title || !data.start_time || !data.end_time) return alert("Title, start time, and end time are required");
        onSave(meeting?.id, data);
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
        setData({ title: "", start_time: "", end_time: "", status: "Scheduled",  group_id: "" });
        }
        onEdit(meeting?.id || "new");
    };

    const showInput = isEditing || !meeting;
    const canEdit = currentUser?.role === "Super_Admin" || currentUser?.role === "Administrator";
    const inputStyle = { fontSize: "16px", fontWeight: 500, border: "2px solid #E9ECEF", borderRadius: "8px", padding: "0.5rem", width: "100%" };
    const textStyle = { fontSize: "16px", fontWeight: 600, padding: "8px 20px", color: "#6C757D" };

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
                {meeting && (meeting.record_meeting === true || meeting.record_meeting === 1 || meeting.record_meeting === '1' || meeting.recordMeeting === 'Recording') ? 'Yes' : meeting ? 'No' : '—'}
            </div>
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
                <button className="btn btn-sm" style={{ backgroundColor: "#00DC85", borderRadius: 12, color: "#fff" }} onClick={handleSave}><CheckCircle size={20} /></button>
                <button className="btn btn-sm" style={{ backgroundColor: "#6c757d", borderRadius: 12, color: "white" }} onClick={handleCancel}>×</button>
            </div>
            ) : canEdit ? (
            <>
                <button className="btn btn-sm" style={{ backgroundColor: "#00DC85", borderRadius: 12, color: "#fff" }} onClick={() => onEdit(meeting.id)}><PencilSimpleLine size={18} /></button>
                <button className="btn btn-sm" style={{ backgroundColor: "#FF0000", borderRadius: 12, color: "#fff" }} onClick={() => onDelete(meeting.id)}> <Trash size={18} /> </button>
            </>
            ) : null}
        </td>
        </tr>
    );
    };
