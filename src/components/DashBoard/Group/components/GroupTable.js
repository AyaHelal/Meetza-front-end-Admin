import React from "react";
import GroupRow from "./GroupRow";
import { GroupRowCard } from "./GroupRowCard";
import "../../CSS/Table.css";

export const GroupTable = ({
  groups,
  positions,
  users,
  loading,
  error,
  onEdit,
  onDelete,
  getPositionName,
  getAdminName,
  isAdmin,
  currentUser = null,
  contents = [],
}) => {
  return (
    <>
      {/* Desktop: table */}
      <div className="group-table-desktop table-responsive user-table-container rounded-3">
        <table className="table table-borderless">
          <thead className="table-header-sticky">
            <tr>
              <th className="fw-semibold px-4 group-th">Name</th>
              <th className="fw-semibold group-th">Position</th>
              <th className="fw-semibold group-th">Admin</th>
              <th className="fw-semibold group-th">Group Content</th>
              <th className="fw-semibold group-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-muted">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-danger">
                  {error}
                </td>
              </tr>
            ) : groups.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-muted">
                  No groups found
                </td>
              </tr>
            ) : (
              groups.map((group) => (
                <GroupRow
                  key={group.id}
                  group={group}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  getPositionName={getPositionName}
                  getAdminName={getAdminName}
                  isAdmin={isAdmin}
                  currentUser={currentUser}
                  contents={contents}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="group-table-mobile user-cards-container">
        {loading ? (
          <div className="user-card user-card-placeholder text-center py-4 text-muted">Loading...</div>
        ) : error ? (
          <div className="user-card user-card-placeholder text-center py-4 text-danger">{error}</div>
        ) : groups.length === 0 ? (
          <div className="user-card user-card-placeholder text-center py-4 text-muted">No groups found</div>
        ) : (
          groups.map((group) => (
            <GroupRowCard
              key={group.id}
              group={group}
              onEdit={onEdit}
              onDelete={onDelete}
              getPositionName={getPositionName}
              getAdminName={getAdminName}
              isAdmin={isAdmin}
              currentUser={currentUser}
              contents={contents}
            />
          ))
        )}
      </div>
    </>
  );
};