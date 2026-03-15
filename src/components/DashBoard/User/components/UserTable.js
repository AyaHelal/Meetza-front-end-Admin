import React from "react";
import { UserRow } from "./UserRow";
import { UserRowCard } from "./UserRowCard";
import '../../CSS/Table.css';

export const UserTable = ({
  users,
  loading,
  error,
  onEdit,
  onDelete,
  isAdmin,
}) => {
  return (
    <>
      {/* Desktop: table */}
      <div className="user-table-desktop table-responsive user-table-container rounded-3">
        <table className="table table-borderless">
          <thead className="table-header-sticky">
            <tr>
              <th className="user-th fw-semibold px-4">Name</th>
              <th className="user-th fw-semibold">Email</th>
              <th className="user-th fw-semibold">Role</th>
              <th className="user-th fw-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-muted">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-danger">{error}</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-muted">No users found</td>
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
      </div>

      {/* Mobile: cards */}
      <div className="user-table-mobile user-cards-container">
        {loading ? (
          <div className="user-card user-card-placeholder text-center py-4 text-muted">Loading...</div>
        ) : error ? (
          <div className="user-card user-card-placeholder text-center py-4 text-danger">{error}</div>
        ) : users.length === 0 ? (
          <div className="user-card user-card-placeholder text-center py-4 text-muted">No users found</div>
        ) : (
          users.map((user) => (
            <UserRowCard
              key={user.id}
              user={user}
              onEdit={onEdit}
              onDelete={onDelete}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>
    </>
  );
};