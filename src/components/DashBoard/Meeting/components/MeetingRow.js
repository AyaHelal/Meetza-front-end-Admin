import { useState, useEffect } from "react";
import { Trash, CheckCircle, PencilSimpleLine } from "phosphor-react";

export const MeetingRow = ({ meeting, isEditing, onSave, onEdit, onDelete, currentUser, contents = [] }) => {
    const [data, setData] = useState({
        title: meeting?.title || "",
        datetime: meeting?.datetime || "",
        status: meeting?.status || "Scheduled",
        meeting_content_id: meeting?.meeting_content_id || "",
        group_id: meeting?.group_id || "",
    });

    useEffect(() => {
        if (meeting) {
        setData({
            title: meeting.title || "",
            datetime: meeting.datetime || "",
            status: meeting.status || "Scheduled",
            meeting_content_id: meeting.meeting_content_id || "",
            group_id: meeting.group_id || "",
        });
        } else {
        setData({
            title: "",
            datetime: "",
            status: "Scheduled",
            meeting_content_id: "",
            group_id: "",
        });
        }
    }, [meeting]);

    const formatForInput = (value) => {
        if (!value) return "";
        const d = new Date(value);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const handleSave = () => {
        if (!data.title || !data.datetime) return alert("Title and datetime required");
        onSave(meeting?.id, data);
    };

    const handleCancel = () => {
        if (meeting) {
        setData({
            title: meeting.title || "",
            datetime: meeting.datetime || "",
            status: meeting.status || "Scheduled",
            meeting_content_id: meeting.meeting_content_id || "",
            group_id: meeting.group_id || "",
        });
        } else {
        setData({ title: "", datetime: "", status: "Scheduled", meeting_content_id: "", group_id: "" });
        }
        onEdit(meeting?.id || "new");
    };

    const showInput = isEditing || !meeting;
    const canEdit = currentUser?.role === "Super_Admin" || currentUser?.role === "Administrator";
    const inputStyle = { fontSize: "16px", fontWeight: 500, border: "2px solid #E9ECEF", borderRadius: "8px", padding: "0.5rem", width: "100%" };
    const textStyle = { fontSize: "16px", fontWeight: 600, padding: "8px 20px", color: "#6C757D" };

    const selectedContent = contents?.find((c) => c.id === data.meeting_content_id);

    return (
        <tr className="align-middle">
        <td>
            {showInput ? (
            <input type="text" value={data.title} placeholder="Enter title" onChange={(e) => setData({ ...data, title: e.target.value })} style={inputStyle} onKeyPress={(e) => e.key === "Enter" && handleSave()} />
            ) : (
            <div style={textStyle}>{data.title}</div>
            )}
        </td>

        <td>
            {showInput ? (
            <input type="datetime-local" value={formatForInput(data.datetime)} onChange={(e) => setData({ ...data, datetime: e.target.value })} style={inputStyle} />
            ) : (
            <div style={textStyle}>{data.datetime ? new Date(data.datetime).toLocaleString() : "No Date"}</div>
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

        <td>
            {showInput ? (
            <select value={data.meeting_content_id} onChange={(e) => setData({ ...data, meeting_content_id: e.target.value })} style={inputStyle}>
                <option value="">Select Content</option>
                {contents.map((c) => (
                <option key={c.id} value={c.id}>{c.content_name}</option>
                ))}
            </select>
            ) : (
            <div style={textStyle}>{selectedContent?.content_name || "No Content"}</div>
            )}
        </td>

        <td className="d-flex gap-2">
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
