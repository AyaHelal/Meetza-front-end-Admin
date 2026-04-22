import React from "react";
import { PencilSimpleLine, Trash } from "phosphor-react";
import { UserCheck } from "lucide-react";

export const UserRow = ({ user, onEdit, onDelete, isAdmin }) => {
  return (
    <tr className="align-middle">
      <td className="px-4">
        <div className="d-flex align-items-center gap-2">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={`${user.name} avatar`}
              className="rounded-3"
              style={{ width: 56, height: 56, objectFit: "cover" }}
            />
          ) : (
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
              <UserCheck size={28} />
            </div>
          )}
          <span style={{ fontSize: "18px" }}>{user.name}</span>
        </div>
      </td>
      <td className="fw-semibold" style={{ color: "#888888" }}>
        {user.email}
      </td>
      <td>
        <span
          className="badge"
          style={{
            color: "#888888",
            fontSize: "14px",
            paddingLeft: "0%"
          }}
        >
          {user.role || "member"}
        </span>
      </td>
      <td>
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm"
            onClick={() => onEdit(user)}
            style={{ backgroundColor: "#00DC85", borderRadius: "12px" }}
          >
            <span style={{ color: "white" }}>
              <PencilSimpleLine size={24} />
            </span>
          </button>
          {isAdmin && (
            <button
              className="btn btn-sm"
              onClick={() => onDelete(user.id)}
              style={{ backgroundColor: "#FF0000", borderRadius: "12px" }}
            >
              <span style={{ color: "white" }}>
                <Trash size={24} />
              </span>
            </button>
          )}
        </div>
      </td>
    </tr >
  );
};

