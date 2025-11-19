import React from "react";
import { Trash, PencilSimpleLine } from "phosphor-react";

export const MeetingContentRow = ({ content, onEdit, onDelete, currentUser, isSuperAdmin }) => {
  if (!content) return null;

  // Allow edits for Super_Admin, Administrator, or content owner
  const isAdmin = currentUser?.role === 'Administrator';
  const canEdit = isSuperAdmin || isAdmin || currentUser?.id === content?.user_id;
  const textStyle = {
    fontSize: "16px",
    fontWeight: 600,
    padding: "8px 20px",
    color: "#6C757D",
  };

  return (
    <tr className="align-middle">
      <td>
        <div style={textStyle}>{content.content_name || "—"}</div>
      </td>
      <td>
        <div style={textStyle}>{content.content_description || "—"}</div>
      </td>
      <td className="d-flex gap-2">
        {canEdit ? (
          <>
            <button
              className="btn btn-sm"
              style={{
                backgroundColor: "#00DC85",
                borderRadius: 12,
                color: "#fff",
              }}
              onClick={() => onEdit(content.id)}
            >
              <PencilSimpleLine size={18} />
            </button>
            <button
              className="btn btn-sm"
              style={{
                backgroundColor: "#FF0000",
                borderRadius: 12,
                color: "#fff",
              }}
              onClick={() => onDelete(content.id)}
            >
              <Trash size={18} />
            </button>
          </>
        ) : null}
      </td>
    </tr>
  );
};
