import React from "react";
import { PencilSimpleLine, Trash } from "phosphor-react";
import { UserCheck } from "lucide-react";

export const UserRowCard = ({ user, onEdit, onDelete, isAdmin }) => {
  return (
    <div className="user-card">
      <div className="user-card-body">
        <div className="user-card-header">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`${user.name} avatar`}
              className="user-card-avatar"
            />
          ) : (
            <div className="user-card-avatar user-card-avatar-placeholder">
              <UserCheck size={28} />
            </div>
          )}
          <div className="user-card-title-wrap">
            <span className="user-card-name">{user.name}</span>
            <span className="user-card-role">{user.role || "member"}</span>
          </div>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Email</span>
          <a href={`mailto:${user.email}`} className="user-card-email">{user.email}</a>
        </div>
        <div className="user-card-actions">
          <button
            type="button"
            className="btn btn-sm user-card-btn user-card-btn-edit"
            onClick={() => onEdit(user)}
            aria-label="Edit user"
          >
            <PencilSimpleLine size={20} />
            <span>Edit</span>
          </button>
          {isAdmin && (
            <button
              type="button"
              className="btn btn-sm user-card-btn user-card-btn-delete"
              onClick={() => onDelete(user.id)}
              aria-label="Delete user"
            >
              <Trash size={20} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
