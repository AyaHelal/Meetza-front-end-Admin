import React from "react";
import { UserRow } from "./UserRow";

export const UserTable = ({
  users,
  loading,
  error,
  onEdit,
  onDelete,
  isAdmin,
}) => {
  return (
    <div className="table-responsive overflow-hidden">
      <table className="table table-borderless px-5">
        <thead className="" style={{ borderBottom: "5px solid #F4F4F4" }}>
          <tr className="mx-5">
            <th style={{ color: "#888888" }} className="fw-semibold px-4">Name</th>
            <th style={{ color: "#888888" }} className="fw-semibold">Email</th>
            <th style={{ color: "#888888" }} className="fw-semibold">Role</th>
            <th style={{ color: "#888888" }} className="fw-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" className="text-center py-4 text-muted">
                Loading...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="4" className="text-center py-4 text-danger">
                {error}
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-4 text-muted">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onEdit={onEdit}
                onDelete={onDelete}
                isAdmin={isAdmin}
              />
            ))
          )}
        </tbody>
      </table>
      <style jsx>{`
        tbody tr {
          border-bottom: none !important;
        }
        tbody td {
          border-bottom: none !important;
        }
      `}</style>
    </div>
  );
};

