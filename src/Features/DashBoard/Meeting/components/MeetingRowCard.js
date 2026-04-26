import React from "react";
import { Trash, PencilSimpleLine, CalendarBlank } from "phosphor-react";

export const MeetingRowCard = ({
  meeting,
  groups = [],
  onEdit,
  onDelete,
  currentUser,
}) => {
  if (!meeting) return null;

  const canEdit =
    currentUser?.role === "Super_Admin" || currentUser?.role === "Administrator";

  const getGroupName = () => {
    if (!meeting?.group_id) return "No Group";
    const group = groups.find(
      (g) => g.id === meeting.group_id || g.group_id === meeting.group_id
    );
    return group?.name || group?.group_name || "Unknown";
  };

  const recording =
    meeting.recording ??
    meeting.record_meeting ??
    meeting.recordMeeting;
  const isRecording =
    recording === true ||
    recording === 1 ||
    recording === "1" ||
    String(recording).trim() === "1" ||
    recording === "Recording";

  const w = meeting?.weekly ?? meeting?.weekly_option ?? meeting?.is_weekly;
  const isWeeklyActive =
    w === true || w === 1 || w === "1" || String(w).trim() === "1" || w === "Active";

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleString();
  };

  return (
    <div className="user-card meeting-row-card">
      <div className="user-card-body">
        <div className="user-card-header user-card-header--icon-only">
          {meeting.poster_url ? (
            <img
              src={meeting.poster_url}
              alt={meeting.title || "Meeting"}
              className="user-card-avatar"
            />
          ) : (
            <div className="user-card-avatar user-card-avatar-placeholder">
              <CalendarBlank size={28} weight="bold" />
            </div>
          )}
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Title</span>
          <span className="user-card-value">{meeting.title || "—"}</span>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Group</span>
          <span className="user-card-value">{getGroupName()}</span>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Start_Time</span>
          <span className="user-card-value">{formatDate(meeting.start_time)}</span>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">End_Time</span>
          <span className="user-card-value">{formatDate(meeting.end_time)}</span>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Recording</span>
          <span className="user-card-value">{isRecording ? "Yes" : "No"}</span>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Weekly</span>
          <span className="user-card-value">{isWeeklyActive ? "Active" : "Inactive"}</span>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Status</span>
          <span className="user-card-value">{meeting.status || "Scheduled"}</span>
        </div>
        {canEdit && (
          <div className="user-card-actions">
            <button
              type="button"
              className="btn btn-sm user-card-btn user-card-btn-edit"
              onClick={() => onEdit(meeting.id)}
              aria-label="Edit meeting"
            >
              <PencilSimpleLine size={20} />
              <span>Edit</span>
            </button>
            <button
              type="button"
              className="btn btn-sm user-card-btn user-card-btn-delete"
              onClick={() => onDelete(meeting.id)}
              aria-label="Delete meeting"
            >
              <Trash size={20} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
