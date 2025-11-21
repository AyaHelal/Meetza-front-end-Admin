import React from "react";
import { UsersThree, Trash, PencilSimpleLine } from "phosphor-react";

export const GroupMembershipRow = ({
  membership,
  onDelete,
  onEdit,
  getGroupName,
  getMemberName,
  getMemberEmail,
  isAdmin,
}) => {
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
          <span style={{ fontSize: "18px" }}>
            {getGroupName(membership.group_id, membership.group_name)}
          </span>
        </div>
      </td>
      <td className="fw-semibold" style={{ color: "#888888", fontSize: "16px" }}>
        {getMemberName(membership.member_id, membership.member_name) || "N/A"}
      </td>
      <td className="fw-semibold" style={{ color: "#888888", fontSize: "16px" }}>
        {getMemberEmail(membership.member_id, membership.member_email) || "N/A"}
      </td>
      <td>
        <div className="d-flex gap-2">
          {isAdmin && (
            <>
              <button
                className="btn btn-sm"
                onClick={() => onEdit && onEdit(membership)}
                style={{ backgroundColor: "#00DC85", borderRadius: "12px" }}
              >
                <span style={{ color: "white" }}>
                  <PencilSimpleLine size={20} />
                </span>
              </button>
              <button
                className="btn btn-sm"
                onClick={() => onDelete(membership.id)}
                style={{ backgroundColor: "#FF0000", borderRadius: "12px" }}
              >
                <span style={{ color: "white" }}>
                  <Trash size={24} />
                </span>
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

