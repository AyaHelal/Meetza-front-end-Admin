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
        <div className="user-card-header user-card-header--icon-only">
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
        </div>
        <div className="user-card-meta">
          <span className="user-card-label">Group</span>
          <span className="user-card-value group-name-text">{groupName}</span>
        </div>
        <div className="user-card-meta user-card-meta--membership-info">
          <span className="user-card-label">Membership Info</span>
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
          <div className="membership-members-list membership-members-list--mobile">
            {members.map((member, index) => (
              <div
                key={member.composite_id || index}
                className="membership-member-card"
              >
                <div className="membership-member-card-inner">
                  <div
                    className="membership-member-avatar rounded-circle d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0"
                    style={{
                      width: 40,
                      height: 40,
                      background: member.member_photo
                        ? `url(${member.member_photo}) center/cover`
                        : "linear-gradient(135deg, #0076EA, #00DC85)",
                      color: member.member_photo ? "transparent" : "white",
                    }}
                  >
                    {!member.member_photo && <User size={18} weight="bold" />}
                  </div>
                  <div className="membership-member-fields min-w-0 flex-grow-1">
                    <div className="user-card-meta user-card-meta--nested">
                      <span className="user-card-label">Name</span>
                      <span className="user-card-value group-member-name">
                        {getMemberName(member.member_id, member.member_name) || "N/A"}
                      </span>
                    </div>
                    <div className="user-card-meta user-card-meta--nested">
                      <span className="user-card-label">Email</span>
                      <span className="user-card-value text-muted small">
                        {getMemberEmail(member.member_id, member.member_email) || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <div className="membership-member-card-actions">
                    <button
                      type="button"
                      className="btn btn-sm user-card-btn-delete w-100 d-flex align-items-center justify-content-center gap-1"
                      onClick={() =>
                        onDelete(member.composite_id || `${membership.group_id}_${member.member_id}`)
                      }
                      aria-label="Remove member"
                    >
                      <Trash size={16} weight="regular" />
                      <span>Remove</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {isExpanded && members.length === 0 && (
          <p className="small text-muted mb-0 membership-empty-msg">No members</p>
        )}
      </div>
    </div>
  );
};
