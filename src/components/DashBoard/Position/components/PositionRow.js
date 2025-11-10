import { useState, useEffect } from "react";
import { Trash, CheckCircle, PencilSimpleLine } from "phosphor-react";

export const PositionRow = ({
  user,
  position,
  onSave,
  onEdit,
  onDelete,
  isEditing,
}) => {
  const [positionTitle, setPositionTitle] = useState(
    position?.title || ""
  );

  useEffect(() => {
    if (position) {
      setPositionTitle(position.title);
    }
  }, [position]);

  const hasPosition = Boolean(position);
  const showInput = isEditing || !hasPosition;

const handleSave = () => {
  if (positionTitle.trim()) {
    onSave(position?.id, positionTitle.trim(), user.id);
  } else {
    alert("Please enter a position title");
  }
};

  return (
    <tr className="align-middle">
      <td className="px-4">
        <div className="d-flex align-items-center  gap-2">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center"
            style={{
              width: 40,
              height: 40,
              backgroundColor: "#E9ECEF",
              color: "#6C757D",
              fontWeight: 600,
            }}
          >
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="fw-semibold" style={{ fontSize: 16}}>
              {user.name}
            </div>
            <div className="text-muted" style={{ fontSize: 13 }}>
              {user.email}
            </div>
          </div>
        </div>
      </td>
      <td style={{ minWidth: 180 }}>
        <div className="d-flex gap-2 align-items-center">
          {showInput ? (
            <input
              type="text"
              className="form-control rounded-3"
              placeholder="Enter position title..."
              value={positionTitle}
              onChange={(e) => setPositionTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSave()}
              style={{
                fontSize: "16px",
                border: "2px solid #E9ECEF",
                padding: "0.5rem",
                width: "100%",
              }}
            />
          ) : (
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                padding: "8px 0",
                display: "inline-block",
                color:"#6C757D"
              }}
            >
              {positionTitle || "—"}
            </span>
          )}
        </div>
      </td>
      <td>
        <div className="d-flex gap-2">
          {showInput ? (
            <button
              className="btn btn-sm"
              style={{
                backgroundColor: "#00DC85",
                borderRadius: 12,
              }}
              onClick={handleSave}
              title="Save position"
            >
              <span style={{ color: "white" }}>
                <CheckCircle size={18} />
              </span>
            </button>
          ) : hasPosition ? (
            <>
              <button
                className="btn btn-sm"
                style={{
                  backgroundColor: "#00DC85",
                  borderRadius: 12,
                }}
                onClick={() => onEdit(position.id)}
                title="Edit position"
              >
                <span style={{ color: "white" }}>
                  <PencilSimpleLine size={18} />
                </span>
              </button>
              <button
                className="btn btn-sm"
                style={{
                  backgroundColor: "#FF0000",
                  borderRadius: 12,
                }}
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
