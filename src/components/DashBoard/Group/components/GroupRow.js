import React from "react";
import { UsersThree, PencilSimpleLine, Trash } from "phosphor-react";

export const GroupRow = ({
  group,
  onEdit,
  onDelete,
  getPositionName,
  getAdminName,
  isAdmin,
  currentUser,
  contents = [],
}) => {
  // Check if current user can edit/delete this group
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
              background: "linear-gradient(135deg, #0076EA, #00DC85)",
              color: "white",
              fontWeight: 600,
            }}
          >
            <UsersThree size={28} weight="bold" />
          </div>
          <span style={{ fontSize: "18px" }}>{group.name || group.group_name}</span>
        </div>
      </td>
      <td className="fw-semibold" style={{ color: "#888888" }}>
        {getPositionName(group.position_id)}
      </td>
      <td className="fw-semibold" style={{ color: "#888888", fontSize: "16px" }}>
        {getAdminName(group.admin_id, group.admin_name)}
      </td>
      <td className="fw-semibold" style={{ color: "#888888", fontSize: "16px" }}>
        {contentNames}
      </td>
      <td>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm"
            onClick={() => onEdit(group)}
            style={{ backgroundColor: "#00DC85", borderRadius: "12px" }}
          >
            <span style={{ color: "white" }}>
              <PencilSimpleLine size={24} />
            </span>
          </button>
          {canEditDelete && (
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

