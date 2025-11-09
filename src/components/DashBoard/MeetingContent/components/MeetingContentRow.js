import { useState, useEffect } from "react";
import { Trash, CheckCircle, PencilSimpleLine } from "phosphor-react";

export const MeetingContentRow = ({
  content,
  onSave,
  onEdit,
  onDelete,
  isEditing,
}) => {
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

  return (
    <tr className="align-middle">
      <td className="px-4">
        {showInput ? (
          <input
            type="text"
            className="form-control rounded-3"
            placeholder="Enter content name..."
            value={contentData.content_name}
            onChange={(e) =>
              setContentData({ ...contentData, content_name: e.target.value })
            }
            onKeyPress={(e) => e.key === "Enter" && handleSave()}
            style={{
              fontSize: "16px",
              border: "2px solid #E9ECEF",
              padding: "0.5rem",
              width: "100%",
            }}
          />
        ) : (
          <div className="d-flex align-items-center">
            <span style={{ fontSize: 16, fontWeight: 500 }}>
              {contentData.content_name || "—"}
            </span>
          </div>
        )}
      </td>
      <td>
        {showInput ? (
          <input
            type="text"
            className="form-control rounded-3"
            placeholder="Enter description..."
            value={contentData.content_description}
            onChange={(e) =>
              setContentData({
                ...contentData,
                content_description: e.target.value,
              })
            }
            onKeyPress={(e) => e.key === "Enter" && handleSave()}
            style={{
              fontSize: "16px",
              border: "2px solid #E9ECEF",
              padding: "0.5rem",
              width: "100%",
            }}
          />
        ) : (
          <div
            style={{
              fontSize: 16,
              padding: "8px 0",
              display: "inline-block",
            }}
          >
            {contentData.content_description || "—"}
          </div>
        )}
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
              title="Save content"
            >
              <span style={{ color: "white" }}>
                <CheckCircle size={20} />
              </span>
            </button>
          ) : null}

          {hasContent && !showInput && onDelete && (
            <>
              <button
                className="btn btn-sm"
                title="Edit content"
                onClick={() => onEdit(content.id)}
                style={{
                  backgroundColor: "#00DC85",
                  borderRadius: 12,
                }}
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
                onClick={() => onDelete(content.id)}
                title="Delete content"
              >
                <span style={{ color: "white" }}>
                  <Trash size={18} />
                </span>
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};
