import React, { useState } from "react";
import { UsersThree, Trash, CaretDown, CaretUp, User } from "phosphor-react";

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
          <div 
            className="user-card-avatar user-card-avatar-placeholder d-flex align-items-center justify-content-center overflow-hidden"
            style={{
              width: 56,
              height: 56,
              background: membership.group_photo ? "transparent" : "linear-gradient(135deg, #0076EA, #00DC85)",
              color: "white",
              fontWeight: 600,
              border: "none",
              borderRadius: "8px",
            }}
          >
            {membership.group_photo ? (
              <img
                src={membership.group_photo}
                alt={membership.group_name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <UsersThree size={28} weight="bold" />
            )}
          </div>
          <div className="user-card-title-wrap">
            <span className="user-card-name" style={{ color: "black" }}>{groupName}</span>
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
              <div key={member.composite_id || index} className="membership-member-row d-flex align-items-center gap-2">
                {/* Group Photo */}
                <div
                  className="d-flex align-items-center justify-content-center overflow-hidden"
                  style={{
                    width: 24,
                    height: 24,
                    background: membership.group_photo ? "transparent" : "linear-gradient(135deg, #0076EA, #00DC85)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "10px",
                    border: "none",
                    borderRadius: "4px",
                  }}
                >
                  {membership.group_photo ? (
                    <img
                      src={membership.group_photo}
                      alt={membership.group_name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <UsersThree size={12} weight="bold" />
                  )}
                </div>
                {/* Member Avatar */}
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden"
                  style={{
                    width: 32,
                    height: 32,
                    background: member.member_photo 
                      ? `url(${member.member_photo}) center/cover` 
                      : "linear-gradient(135deg, #0076EA, #00DC85)",
                    color: member.member_photo ? "transparent" : "white",
                    fontWeight: 600,
                    fontSize: "12px",
                  }}
                >
                  {!member.member_photo && <User size={16} weight="bold" />}
                </div>
                <div className="membership-member-info flex-grow-1">
                  <span style={{ color: "white" }}>{getMemberName(member.member_id, member.member_name) || "N/A"}</span>
                  <span className="text-muted small d-block">{getMemberEmail(member.member_id, member.member_email) || "N/A"}</span>
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
