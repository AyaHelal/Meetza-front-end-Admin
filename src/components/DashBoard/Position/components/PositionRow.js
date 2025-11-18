import { useState, useEffect } from "react";
import { Trash, CheckCircle, PencilSimpleLine } from "phosphor-react";
import { UserCheck } from "lucide-react";
import Select from 'react-select';

export const PositionRow = ({
  user,
  position,
  onSave,
  onEdit,
  onDelete,
  isEditing,
  users = [], // Add users prop for dropdown
}) => {
  const [positionTitle, setPositionTitle] = useState(
    position?.title || ""
  );
  const [selectedUser, setSelectedUser] = useState(
    position?.user ? { value: position.user.id, label: position.user.name } : null
  );

  useEffect(() => {
    if (position) {
      setPositionTitle(position.title);
      if (position.user) {
        setSelectedUser({
          value: position.user.id,
          label: position.user.name
        });
      }
    }
  }, [position]);

  const hasPosition = Boolean(position);
  const showInput = isEditing || !hasPosition;
  const isSuperAdmin = user?.role === 'Super_Admin';

  const handleSave = () => {
    if (!positionTitle.trim()) {
      alert("Please enter a position title");
      return;
    }
    if (isSuperAdmin && !selectedUser) {
      alert("Please select a user");
      return;
    }

    const userId = isSuperAdmin ? selectedUser.value : user.id;
    onSave(position?.id, positionTitle.trim(), userId);
  };

  const handleCancel = () => {
    if (position) {
      setPositionTitle(position.title || '');
      setSelectedUser(position.user ? {
        value: position.user.id,
        label: position.user.name
      } : null);
    } else {
      setPositionTitle('');
      setSelectedUser(null);
    }
    onEdit(position?.id || 'new');
  };

  const displayUser = position?.user || user;

  return (
    <tr className="align-middle">
      {/* User Column */}
      {isSuperAdmin ? (
        <td className="px-4">
          {showInput ? (
            <Select
              options={users.map(u => ({ value: u.id, label: u.name }))}
              value={selectedUser}
              onChange={(selected) => setSelectedUser(selected)}
              placeholder="Select user..."
              className="basic-single"
              classNamePrefix="select"
              menuPortalTarget={document.body}
              menuPosition="fixed"
              menuPlacement="auto"
              menuShouldBlockScroll
              styles={{
                control: (base) => ({
                  ...base,
                  border: '2px solid #E9ECEF',
                  borderRadius: '12px',
                  minHeight: '40px',
                  boxShadow: 'none',
                  '&:hover': { borderColor: '#0076EA' },
                }),
                menu: (base) => ({
                  ...base,
                  zIndex: 9999,
                  marginTop: '5px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }),
                menuList: (base) => ({ ...base, padding: '8px 0' }),
                option: (base, { isFocused }) => ({
                  ...base,
                  backgroundColor: isFocused ? '#f8f9fa' : 'white',
                  color: '#212529',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  '&:active': { backgroundColor: '#e9ecef' },
                }),
                menuPortal: base => ({ ...base, zIndex: '9999' })
              }}
            />
          ) : position?.user ? (
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
                <div style={{ fontSize: 18 }}>
                  {displayUser.name}
                </div>
              </div>
            </div>
          ) : null}
        </td>
      ) : (
        <td className="px-4">
          <div className="fw-medium">{displayUser.name}</div>
        </td>
      )}

      {/* Position Column */}
      <td className="px-4" style={{color: "#6C757D"}}>
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
              color: "#6C757D",
              width: "100%",
            }}
          />
        ) : (
          <div className="fw-medium">{positionTitle || "—"}</div>
        )}
      </td>

      {/* Actions Column */}
      <td className="px-4">
        <div className="d-flex gap-2">
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
                title="Save position"
              >
                <span style={{ color: "white" }}>
                  <CheckCircle size={18} />
                </span>
              </button>
              <button
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
                onClick={handleCancel}
                title="Cancel edit"
              >
                <span style={{ color: "white" }}>
                  ×
                </span>
              </button>
            </div>
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
