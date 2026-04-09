import React from "react";
import { UsersThree, PencilSimpleLine, Trash, UserPlus, UserMinus } from "phosphor-react";

export const GroupRowCard = ({
  group,
  onEdit,
  onDelete,
  onAssignAdmin,
  onRemoveAssignAdmin,
  getPositionName,
  getAdminName,
  isAdmin,
  currentUser,
  contents = [],
}) => {
  const canEditDelete = isAdmin && (
    currentUser?.role === "Super_Admin" ||
    (currentUser?.role === "Administrator" && (
      group.admin_id === currentUser?.id ||
      group.adminId === currentUser?.id ||
      group.administrator_id === currentUser?.id ||
      group.user_id === currentUser?.id ||
      group.admin?.id === currentUser?.id
    ))
  );

  const canAssignAdmins = isAdmin && (
    currentUser?.role === "Super_Admin" ||
    (currentUser?.role === "Administrator" && (
      group.admin_id === currentUser?.id ||
      group.adminId === currentUser?.id ||
      group.administrator_id === currentUser?.id ||
      group.user_id === currentUser?.id ||
      group.admin?.id === currentUser?.id
    ))
  );

  const selectedContent = contents.find((c) => c.id === group.group_content_id);
  const groupContents = selectedContent ? [selectedContent] : contents.filter((c) => c.group_id === group.id);
  const contentNames = groupContents.map((c) => c.content_name).join(", ") || "—";
  const name = group.name || group.group_name;
  const positionName = getPositionName(group.position_id);
  const adminName = getAdminName(group.admin_id, group.admin_name);

  return (
    <div className="user-card group-row-card">
      <div className="user-card-body">
        <div className="user-card-header">
          {group.group_photo ? (
            <img
              src={group.group_photo}
              alt={name}
              className="user-card-avatar"
            />
          ) : (
            <div className="user-card-avatar user-card-avatar-placeholder">
              <UsersThree size={28} weight="bold" />
            </div>
          )}
          <div className="user-card-title-wrap">
            <span className="user-card-name">{name}</span>
          </div>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Position</span>
          <span className="user-card-value">{positionName || "—"}</span>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Admin</span>
          <span className="user-card-value">{adminName || "—"}</span>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Group Content</span>
          <span className="user-card-value user-card-value-wrap">{contentNames}</span>
        </div>
        <div className="user-card-actions">
          {canAssignAdmins && (
            <>
              <button
                type="button"
                className="btn btn-sm user-card-btn"
                onClick={() => onAssignAdmin?.(group)}
                aria-label="Assign admin to group"
                style={{
                  backgroundColor: "#0076EA",
                  borderRadius: 12,
                  color: "white",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <UserPlus size={20} />
                <span>Assign</span>
              </button>
              <button
                type="button"
                className="btn btn-sm user-card-btn"
                onClick={() => onRemoveAssignAdmin?.(group)}
                aria-label="Remove assigned admin"
                style={{
                  backgroundColor: "#fd7e14",
                  borderRadius: 12,
                  color: "white",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <UserMinus size={20} />
                <span>Remove</span>
              </button>
            </>
          )}
          <button
            type="button"
            className="btn btn-sm user-card-btn user-card-btn-edit"
            onClick={() => onEdit(group)}
            aria-label="Edit group"
          >
            <PencilSimpleLine size={20} />
            <span>Edit</span>
          </button>
          {canEditDelete && (
            <button
              type="button"
              className="btn btn-sm user-card-btn user-card-btn-delete"
              onClick={() => onDelete(group.id)}
              aria-label="Delete group"
            >
              <Trash size={20} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
