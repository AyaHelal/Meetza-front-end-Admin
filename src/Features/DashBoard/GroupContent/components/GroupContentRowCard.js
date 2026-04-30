import React from "react";
import { PencilSimpleLine } from "phosphor-react";
import { FileText } from "lucide-react";

export const GroupContentRowCard = ({
  content,
  onEdit,
  currentUser,
  isSuperAdmin,
}) => {
  if (!content) return null;

  const canEdit = isSuperAdmin || currentUser?.id === content?.user_id;

  return (
    <div className="user-card group-content-row-card">
      <div className="user-card-body">
        <div className="user-card-header user-card-header--icon-only">
          <div className="user-card-avatar user-card-avatar-placeholder">
            <FileText size={28} />
          </div>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Content Name</span>
          <span className="user-card-value">{content.content_name || "—"}</span>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Group Name</span>
          <span className="user-card-value">{content.assigned_group_name || "—"}</span>
        </div>
        {content.content_description && content.content_description !== "—" && (
          <div className="user-card-meta">
            <span className="user-card-label">Content Description</span>
            <span className="user-card-value user-card-value-wrap">
              {content.content_description}
            </span>
          </div>
        )}
        {canEdit && (
          <div className="user-card-actions">
            <button
              type="button"
              className="btn btn-sm user-card-btn user-card-btn-edit"
              onClick={() => onEdit(content.id)}
              aria-label="Edit content"
            >
              <PencilSimpleLine size={20} />
              <span>Edit</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
