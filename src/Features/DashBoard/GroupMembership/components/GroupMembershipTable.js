import React from "react";
import { GroupMembershipRow } from "./GroupMembershipRow";
import { GroupMembershipRowCard } from "./GroupMembershipRowCard";
import "../../CSS/Table.css";

export const GroupMembershipTable = ({
  memberships,
  groups,
  users,
  loading,
  error,
  onDelete,
  getGroupName,
  getMemberName,
  getMemberEmail,
  isAdmin,
}) => {
  return (
    <>
      {/* Desktop: table */}
      <div className="membership-table-desktop table-responsive user-table-container rounded-3">
        <table className="table table-borderless">
          <thead className="table-header-sticky">
            <tr>
              <th className="fw-semibold px-4 membership-th">Group</th>
              <th className="fw-semibold membership-th">Membership Info</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="text-center py-4 text-muted">
                  Loading...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={2} className="text-center py-4 text-danger">
                  {error}
                </td>
              </tr>
            ) : memberships.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center py-4 text-muted">
                  No memberships found
                </td>
              </tr>
            ) : (
              memberships.map((membership) => (
                <GroupMembershipRow
                  key={membership.id}
                  membership={membership}
                  onDelete={onDelete}
                  getGroupName={getGroupName}
                  getMemberName={getMemberName}
                  getMemberEmail={getMemberEmail}
                  isAdmin={isAdmin}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className="membership-table-mobile user-cards-container">
        {loading ? (
          <div className="user-card user-card-placeholder text-center py-4 text-muted">Loading...</div>
        ) : error ? (
          <div className="user-card user-card-placeholder text-center py-4 text-danger">{error}</div>
        ) : memberships.length === 0 ? (
          <div className="user-card user-card-placeholder text-center py-4 text-muted">No memberships found</div>
        ) : (
          memberships.map((membership) => (
            <GroupMembershipRowCard
              key={membership.id}
              membership={membership}
              onDelete={onDelete}
              getGroupName={getGroupName}
              getMemberName={getMemberName}
              getMemberEmail={getMemberEmail}
              isAdmin={isAdmin}
            />
          ))
        )}
      </div>
    </>
  );
};

