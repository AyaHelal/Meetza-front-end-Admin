import React from "react";
import { UsersThree, PencilSimpleLine, Trash, UserPlus, UserMinus } from "phosphor-react";
import { groupIsManagedByUser } from "../../../../utils/groupIsManagedByUser";

export const GroupRowCard = ({
  group,
  onEdit,
  onDelete,
  onAssignAdmin,
  onRemoveAssignAdmin,
  getAdminName,
  isAdmin,
  currentUser,
  contents = [],
}) => {
  const roleNorm = String(currentUser?.role || "").trim().toLowerCase();
  const isSuper = roleNorm === "super_admin" || currentUser?.role === "Super_Admin";
  const isAdministrator = roleNorm === "administrator" || currentUser?.role === "Administrator";
  const canManageGroup =
    isAdmin && (isSuper || (isAdministrator && groupIsManagedByUser(group, currentUser?.id)));

  const selectedContent = contents.find((c) => c.id === group.group_content_id);
  const groupContents = selectedContent ? [selectedContent] : contents.filter((c) => c.group_id === group.id);
  const contentNames = groupContents.map((c) => c.content_name).join(", ") || "—";
  const name = group.group_name || group.name;
  const displayAdmins =
    group.admins && group.admins.length > 0
      ? group.admins.map((a) => a.name || a.email || "N/A").join(", ")
      : getAdminName(group.admin_id, group.admin_name);

  return (
    <div className="user-card group-row-card">
      <div className="user-card-body">
        <div className="user-card-header user-card-header--icon-only">
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
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Name</span>
          <span className="user-card-value">{name || "—"}</span>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Leader</span>
          <span className="user-card-value">{displayAdmins || "—"}</span>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Group Content</span>
          <span className="user-card-value user-card-value-wrap">{contentNames}</span>
        </div>
        <div className="user-card-actions">
          {canManageGroup && (
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
          {canManageGroup && (
            <button
              type="button"
              className="btn btn-sm user-card-btn user-card-btn-edit"
              onClick={() => onEdit(group)}
              aria-label="Edit group"
            >
              <PencilSimpleLine size={20} />
              <span>Edit</span>
            </button>
          )}
          {canManageGroup && (
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
