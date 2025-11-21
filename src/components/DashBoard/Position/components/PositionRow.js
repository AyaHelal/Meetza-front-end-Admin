import { Trash, PencilSimpleLine } from "phosphor-react";
import { UserCheck } from "lucide-react";

export const PositionRow = ({
  user,
  position,
  onSave,
  onEdit,
  onDelete,
  isEditing,
  users = [], // Add users prop for dropdown
}) => {
  const displayUser = position?.user || user;
  const positionTitle = position?.title || "";
  const isSuperAdmin = user?.role === 'Super_Admin';

  return (
    <tr className="align-middle">
      {/* User Column: render for Super_Admin or Administrator */}
      {isSuperAdmin && (
        <td className="px-4">
          {position?.user ? (
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  width: 56,
                  height: 56,
                  background: "linear-gradient(135deg, #0076EA, #00DC85)",
                  color: "white",
                  fontWeight: 600,
                  objectFit: "cover"
                }}
              >
                <UserCheck size={28} />
              </div>
              <div>
                <div style={{ fontSize: 18 }}>{displayUser.name}</div>
              </div>
            </div>
          ) : null}
        </td>
      )}

      {/* Position Column */}
      <td className="px-4" style={{ color: "#6C757D" }}>
        <div className="fw-medium">{positionTitle || "—"}</div>
      </td>

      {/* Actions Column */}
      <td className="px-4">
        <div className="d-flex gap-2">
          {position ? (
            <>
              <button
                className="btn btn-sm"
                style={{ backgroundColor: "#00DC85", borderRadius: 12 }}
                onClick={() => onEdit(position.id)}
                title="Edit position"
              >
                <span style={{ color: "white" }}>
                  <PencilSimpleLine size={18} />
                </span>
              </button>
              <button
                className="btn btn-sm"
                style={{ backgroundColor: "#FF0000", borderRadius: 12 }}
                onClick={() => onDelete(position.id, user.id)}
                title="Delete position"
              >
                <span style={{ color: "white" }}>
                  <Trash size={18} />
                </span>
              </button>
            </>
          ) : null}
        </div>
      </td>
    </tr>
  );
};
