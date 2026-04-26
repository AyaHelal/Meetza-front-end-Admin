import { Trash, PencilSimpleLine } from "phosphor-react";
import { UserCheck } from "lucide-react";

export const PositionRowCard = ({ user, position, onEdit, onDelete }) => {
  const positionTitle = position?.title || "—";
  const displayUser = position?.user || user;
  const isSuperAdmin = user?.role === "Super_Admin";

  return (
    <div className="user-card position-row-card">
      <div className="user-card-body">
        <div className="user-card-header user-card-header--icon-only">
          {(displayUser?.user_photo || displayUser?.avatarUrl || displayUser?.avatar_url) ? (
            <img
              src={displayUser.user_photo || displayUser.avatarUrl || displayUser.avatar_url}
              alt={`${displayUser.name} avatar`}
              className="user-card-avatar"
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="user-card-avatar user-card-avatar-placeholder">
              <UserCheck size={28} />
            </div>
          )}
        </div>
        {isSuperAdmin && displayUser?.name && (
          <div className="user-card-meta">
            <span className="user-card-label">User</span>
            <span className="user-card-value">{displayUser.name}</span>
          </div>
        )}
        <div className="user-card-meta">
          <span className="user-card-label">Position</span>
          <span className="user-card-value">{positionTitle}</span>
        </div>
        <div className="user-card-actions">
          <button
            type="button"
            className="btn btn-sm user-card-btn user-card-btn-edit"
            onClick={() => onEdit(position.id)}
            aria-label="Edit position"
          >
            <PencilSimpleLine size={20} />
            <span>Edit</span>
          </button>
          <button
            type="button"
            className="btn btn-sm user-card-btn user-card-btn-delete"
            onClick={() => onDelete(position.id)}
            aria-label="Delete position"
          >
            <Trash size={20} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
