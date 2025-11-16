import { useState, useEffect } from "react";
import { Trash, CheckCircle, PencilSimpleLine } from "phosphor-react";

export const MeetingContentRow = ({
  content,
  onSave,
  onEdit,
  onDelete,
  isEditing,
  currentUser,
  isSuperAdmin,
}) => {
  const canEdit = isSuperAdmin || currentUser?.id === content?.user_id;
  const [contentData, setContentData] = useState({
    content_name: content?.content_name || "",
    content_description: content?.content_description || "",
  });

  useEffect(() => {
    if (content) {
      setContentData({
        content_name: content.content_name || "",
        content_description: content.content_description || "",
      });
    }
  }, [content]);

  const hasContent = Boolean(content);
  const showInput = isEditing || !hasContent;

  const handleSave = () => {
    if (contentData.content_name.trim() && contentData.content_description.trim()) {
      onSave(content?.id, contentData);
    } else {
      alert("Please enter both content name and description");
    }
  };

  const handleCancel = () => {
    if (content) {
      setContentData({
        content_name: content.content_name || "",
        content_description: content.content_description || "",
      });
    } else {
      setContentData({
        content_name: "",
        content_description: "",
      });
    }
    onEdit(content?.id || 'new');
  };

  const inputStyle = {
    fontSize: "16px",
    border: "2px solid #E9ECEF",
    borderRadius: "8px",
    padding: "0.5rem",
    width: "100%",
  };

  const textStyle = {
    fontSize: "16px",
    fontWeight: 600,
    padding: "8px 20px",
    color:"#6C757D"
  };

  return (
    <tr className="align-middle">
      {/* Content Name */}
      <td>
        {showInput ? (
          <input
            type="text"
            value={contentData.content_name}
            onChange={(e) =>
              setContentData({ ...contentData, content_name: e.target.value })
            }
            placeholder="Enter content name..."
            style={inputStyle}
            onKeyPress={(e) => e.key === "Enter" && handleSave()}
          />
        ) : (
          <div style={textStyle}>{contentData.content_name || "—"}</div>
        )}
      </td>

      {/* Content Description */}
      <td>
        {showInput ? (
          <input
            type="text"
            value={contentData.content_description}
            onChange={(e) =>
              setContentData({
                ...contentData,
                content_description: e.target.value,
              })
            }
            placeholder="Enter description..."
            style={inputStyle}
            onKeyPress={(e) => e.key === "Enter" && handleSave()}
          />
        ) : (
          <div style={textStyle}>{contentData.content_description || "—"}</div>
        )}
      </td>

      {/* Actions */}
      <td className="d-flex gap-2">
          {showInput ? (
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm"
                style={{
                  backgroundColor: "#00DC85",
                  borderRadius: 12,
                  minWidth: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
                onClick={handleSave}
                title="Save content"
              >
                <span style={{ color: "white" }}>
                  <CheckCircle size={18} />
                </span>
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-sm"
                style={{
                  backgroundColor: "#6c757d",
                  borderRadius: 12,
                  minWidth: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
                title="Cancel edit"
              >
                <span style={{ color: "white" }}>
                  ×
                </span>
              </button>
            </div>
          ) : (
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
          )}
      </td>
    </tr>
  );
};
