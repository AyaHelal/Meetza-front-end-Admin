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
        <div className="user-card-header">
          <div className="user-card-avatar user-card-avatar-placeholder">
            <FileText size={28} />
          </div>
          <div className="user-card-title-wrap">
            <span className="user-card-name">{content.content_name || "—"}</span>
            {content.assigned_group_name && (
              <span className="user-card-role">{content.assigned_group_name}</span>
            )}
          </div>
        </div>
        {(content.content_description && content.content_description !== "—") && (
          <div className="user-card-meta">
            <span className="user-card-label">Description</span>
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
