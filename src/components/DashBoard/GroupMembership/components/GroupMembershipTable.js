import React from "react";
import { GroupMembershipRow } from "./GroupMembershipRow";
import '../../CSS/Table.css';
export const GroupMembershipTable = ({
  memberships,
  groups,
  users,
  loading,
  error,
  onDelete,
  onEdit,
  getGroupName,
  getMemberName,
  getMemberEmail,
  isAdmin,
}) => {
  return (
    <div className="table-responsive overflow-hidden user-table-container rounded-3">
      <table className="table table-borderless">
        <thead className="table-header-sticky">
          <tr className="mx-5">
            <th style={{ color: "#888888" }} className="fw-semibold px-4">Group</th>
            <th style={{ color: "#888888" }} className="fw-semibold">Member Name</th>
            <th style={{ color: "#888888" }} className="fw-semibold">Member Email</th>
            <th style={{ color: "#888888" }} className="fw-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="3" className="text-center py-4 text-muted">
                Loading...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan="3" className="text-center py-4 text-danger">
                {error}
              </td>
            </tr>
          ) : memberships.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center py-4 text-muted">
                No memberships found
              </td>
            </tr>
          ) : (
            memberships.map((membership) => (
              <GroupMembershipRow
                key={membership.id}
                membership={membership}
                onDelete={onDelete}
                onEdit={onEdit}
                getGroupName={getGroupName}
                getMemberName={getMemberName}
                getMemberEmail={getMemberEmail}
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

