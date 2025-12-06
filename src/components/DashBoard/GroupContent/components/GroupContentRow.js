// In GroupContentRow.js
import React from "react";
import { Trash, PencilSimpleLine } from "phosphor-react";

export const GroupContentRow = ({ content, onEdit, onDelete, currentUser, isSuperAdmin }) => {
    if (!content) return null;

    const canEdit = isSuperAdmin || currentUser?.id === content?.user_id;

    const textStyle = {
        fontSize: "16px",
        fontWeight: 600,
        padding: "8px 20px",
        color: "#6C757D",
    };

    const actionsStyle = {
        ...textStyle,
        display: 'flex',
        justifyContent: 'center',
        gap: '8px'
    };

    return (
        <tr className="align-middle">
            <td>
                <div style={textStyle}>{content.content_name || "—"}</div>
            </td>
            <td>
                <div style={textStyle}>{content.content_description || "—"}</div>
            </td>
            <td>
                <div style={textStyle}>{content.assigned_group_name || "Not Assigned"}</div>
            </td>
            <td>
                <div style={actionsStyle}>
                    {canEdit && (
                        <>
                            <button
                                className="btn btn-sm"
                                style={{
                                    backgroundColor: "#00DC85",
                                    borderRadius: 12,
                                    color: "#fff",
                                    padding: '4px 8px'
                                }}
                                onClick={() => onEdit(content.id)}
                            >
                                <PencilSimpleLine size={18} />
                            </button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default GroupContentRow;