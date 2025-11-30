import React from "react";
import GroupRow from "./GroupRow";
import '../../CSS/Table.css';
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
    <div className="table-responsive  user-table-container rounded-3">
      { !GroupRow && console.error('GroupRow component is undefined. Check export/import in GroupRow.js') }
      <table className="table table-borderless">
        <thead className="table-header-sticky">
          <tr className="mx-5">
            <th style={{ color: "#888888" }} className="fw-semibold px-4">Name</th>
            <th style={{ color: "#888888" }} className="fw-semibold">Position</th>
            <th style={{ color: "#888888" }} className="fw-semibold">Admin</th>
            <th style={{ color: "#888888" }} className="fw-semibold">Group Content</th>
            <th style={{ color: "#888888" }} className="fw-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr style={{ borderBottom: "none" }}>
              <td colSpan="5" className="text-center py-4 text-muted" style={{ borderBottom: "none" }}>
                Loading...
              </td>
            </tr>
          ) : error ? (
            <tr style={{ borderBottom: "none" }}>
              <td colSpan="5" className="text-center py-4 text-danger" style={{ borderBottom: "none" }}>
                {error}
              </td>
            </tr>
          ) : groups.length === 0 ? (
            <tr style={{ borderBottom: "none" }}>
              <td colSpan="5" className="text-center py-4 text-muted" style={{ borderBottom: "none" }}>
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