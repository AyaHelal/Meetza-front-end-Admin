import React from "react";
import { UsersThree, PencilSimpleLine, Trash, UserPlus, UserMinus } from "phosphor-react";
import { groupIsManagedByUser } from "../../../../utils/groupIsManagedByUser";

export const GroupRow = ({
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
  // Co-admins in `group.admins` (from API) must see assign / remove / delete / edit like meetza
  const roleNorm = String(currentUser?.role || "").trim().toLowerCase();
  const isSuper = roleNorm === "super_admin" || currentUser?.role === "Super_Admin";
  const isAdministrator = roleNorm === "administrator" || currentUser?.role === "Administrator";
  const canManageGroup =
    isAdmin && (isSuper || (isAdministrator && groupIsManagedByUser(group, currentUser?.id)));
  // If group has a linked group_content_id use that, otherwise fall back to any contents that reference this group
  const selectedContent = contents.find(c => c.id === group.group_content_id);
  const groupContents = selectedContent ? [selectedContent] : contents.filter(c => c.group_id === group.id);
  const contentNames = groupContents.map(c => c.content_name).join(", ") || "—";
  return (
    <tr className="align-middle">
      <td className="px-4">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center"
            style={{
              width: 56,
              height: 56,
              background: group.group_photo ? "transparent" : "linear-gradient(135deg, #0076EA, #00DC85)",
              color: "white",
              fontWeight: 600,
              overflow: "hidden",
            }}
          >
            {group.group_photo ? (
        <img
          src={group.group_photo}
          alt={group.group_name}
          style={{ width: "100%", height: "100%", objectFit: "cover" ,display: 'block',border:'1px solid #ddd' }}
        />
      ) : (
        <UsersThree size={28} weight="bold" />
      )}
    </div>
          <span style={{ fontSize: "18px" }}>{group.name || group.group_name}</span>
        </div>
      </td>
      <td className="fw-semibold" style={{ color: "#888888", fontSize: "16px" }}>
        {getAdminName(group.admin_id, group.admin_name)}
      </td>
      <td className="fw-semibold" style={{ color: "#888888", fontSize: "16px" }}>
        {contentNames}
      </td>
      <td>
        <div className="d-flex gap-2">
          {canManageGroup && (
            <>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => onAssignAdmin?.(group)}
                title="Assign admin to group"
                style={{ backgroundColor: "#0076EA", borderRadius: "12px" }}
              >
                <span style={{ color: "white" }}>
                  <UserPlus size={24} />
                </span>
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => onRemoveAssignAdmin?.(group)}
                title="Remove assigned admin"
                style={{ backgroundColor: "#fd7e14", borderRadius: "12px" }}
              >
                <span style={{ color: "white" }}>
                  <UserMinus size={24} />
                </span>
              </button>
            </>
          )}
          {canManageGroup && (
            <button
              className="btn btn-sm"
              onClick={() => onEdit(group)}
              style={{ backgroundColor: "#00DC85", borderRadius: "12px" }}
            >
              <span style={{ color: "white" }}>
                <PencilSimpleLine size={24} />
              </span>
            </button>
          )}
          {canManageGroup && (
            <button
              className="btn btn-sm"
              onClick={() => onDelete(group.id)}
              style={{ backgroundColor: "#FF0000", borderRadius: "12px" }}
            >
              <span style={{ color: "white" }}>
                <Trash size={24} />
              </span>
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default GroupRow;

