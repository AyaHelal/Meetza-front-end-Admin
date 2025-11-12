import React from "react";
import { GroupMembershipRow } from "./GroupMembershipRow";

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
  isAdmin,
}) => {
  return (
    <div className="table-responsive overflow-hidden">
      <table className="table table-borderless px-5">
        <thead className="" style={{ borderBottom: "5px solid #F4F4F4" }}>
          <tr className="mx-5">
            <th style={{ color: "#888888" }} className="fw-semibold px-4">Group</th>
            <th style={{ color: "#888888" }} className="fw-semibold">Member</th>
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

