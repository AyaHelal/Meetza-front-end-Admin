import React, { useState } from "react";
import { UsersThree, Trash, CaretDown, CaretUp, User } from "phosphor-react";

export const GroupMembershipRow = ({
  membership,
  onDelete,
  getGroupName,
  getMemberName,
  getMemberEmail,
  isAdmin,
}) => {
  // Extract members list - membership.members is an array of member objects
  const members = membership.members || [];
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <tr className="align-middle">
      <td className="px-4 group-name-column">
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-flex align-items-center justify-content-center overflow-hidden"
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
          <span className="group-name-text">
            {getGroupName(membership.group_id, membership.group_name)}
          </span>
        </div>
      </td>
      <td className="fw-semibold" style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
        <div style={{ maxWidth: "400px" }}>
          {members.length > 0 ? (
            <div style={{ width: "600px" }}>
              <button
                onClick={toggleExpand}
                className="btn btn-sm d-flex align-items-center"
                style={{
                  backgroundColor: isExpanded ? "transparent" : "transparent",
                  border: isExpanded ? "none" : "none",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  color: "var(--text-secondary)",
                  fontSize: "14px",
                  width: "100%",
                  justifyContent: "flex-start",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isExpanded) e.target.style.backgroundColor = "transparent";
                }}
                onMouseLeave={(e) => {
                  if (!isExpanded) e.target.style.backgroundColor = "transparent";
                }}
              >
                <span style={{ marginRight: "8px" }}>
                  {members.length} {members.length === 1 ? "Member" : "Members"}
                </span>
                {isExpanded ? <CaretUp size={18} /> : <CaretDown size={18} />}
              </button>
              {isExpanded && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "12px",
                    backgroundColor: "transparent",
                    borderRadius: "12px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    border: "1px solid #E9ECEF",
                  }}
                >
                  <div
                    className="d-flex align-items-center"
                    style={{
                      padding: "4px",
                      marginBottom: "8px",
                      borderBottom: "2px solid #E9ECEF",
                      fontWeight: "bold",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <div style={{ flex: 1 }}>Name</div>
                    <div style={{ flex: 1 }}>Email</div>
                  </div>
                  {members.map((member, index) => (
                    <div
                      key={member.composite_id || index}
                      className="d-flex align-items-center justify-content-between"
                      style={{
                        padding: "4px",
                        margin: "4px 0",
                        borderBottom: index < members.length - 1 ? "1px solid #E9ECEF" : "none",
                        borderRadius: "6px",
                        transition: "background-color 0.2s",
                        position: "relative",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2" style={{ flex: 1 }}>
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
                        <div style={{ flex: 1 }}>
                          <div className="group-member-name">
                            {getMemberName(member.member_id, member.member_name) || "N/A"}
                          </div>
                          <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                            {getMemberEmail(member.member_id, member.member_email) || "N/A"}
                          </div>
                        </div>
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          className="btn btn-sm user-card-btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(member.composite_id || `${membership.group_id}_${member.member_id}`);
                          }}
                          style={{
                            padding: "4px 8px",
                            marginLeft: "8px",
                            borderRadius: 8,
                          }}
                          title={`Delete ${member.member_name || member.member_email}`}
                        >
                          <Trash size={16} weight="regular" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span style={{ color: "#999" }}>No members</span>
          )}
        </div>
      </td>
    </tr>
  );
};


