import React, { useState } from "react";
import { UsersThree, Trash, CaretDown, CaretUp } from "phosphor-react";

export const GroupMembershipRowCard = ({
  membership,
  onDelete,
  getGroupName,
  getMemberName,
  getMemberEmail,
  isAdmin,
}) => {
  const members = membership.members || [];
  const [isExpanded, setIsExpanded] = useState(false);
  const groupName = getGroupName(membership.group_id, membership.group_name);

  return (
    <div className="user-card group-membership-row-card">
      <div className="user-card-body">
        <div className="user-card-header">
          <div className="user-card-avatar user-card-avatar-placeholder">
            <UsersThree size={28} weight="bold" />
          </div>
          <div className="user-card-title-wrap">
            <span className="user-card-name">{groupName}</span>
          </div>
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Membership</span>
          <button
            type="button"
            className="btn btn-sm p-0 border-0 bg-transparent text-start d-flex align-items-center gap-1 membership-toggle-btn"
            onClick={() => setIsExpanded((e) => !e)}
          >
            <span className="user-card-value">
              {members.length} {members.length === 1 ? "Member" : "Members"}
            </span>
            {isExpanded ? <CaretUp size={18} /> : <CaretDown size={18} />}
          </button>
        </div>
        {isExpanded && members.length > 0 && (
          <div className="membership-members-list">
            <div className="membership-members-list-header">
              <span>Name</span>
              <span>Email</span>
            </div>
            {members.map((member, index) => (
              <div key={member.composite_id || index} className="membership-member-row">
                <div className="membership-member-info">
                  <span>{getMemberName(member.member_id, member.member_name) || "N/A"}</span>
                  <span className="text-muted small">{getMemberEmail(member.member_id, member.member_email) || "N/A"}</span>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    className="btn btn-sm p-1 text-danger membership-delete-btn"
                    onClick={() => onDelete(member.composite_id || `${membership.group_id}_${member.member_id}`)}
                    aria-label="Remove member"
                  >
                    <Trash size={16} weight="regular" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {isExpanded && members.length === 0 && (
          <p className="small text-muted mb-0">No members</p>
        )}
      </div>
    </div>
  );
};
