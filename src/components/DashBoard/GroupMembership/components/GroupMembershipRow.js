import React, { useState } from "react";
import { UsersThree, Trash, CaretDown, CaretUp } from "phosphor-react";

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
      <td className="px-4">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center"
            style={{
              width: 56,
              height: 56,
              background: "linear-gradient(135deg, #0076EA, #00DC85)",
              color: "white",
              fontWeight: 600,
            }}
          >
            <UsersThree size={28} weight="bold" />
          </div>
          <span style={{ fontSize: "18px" }}>
            {getGroupName(membership.group_id, membership.group_name)}
          </span>
        </div>
      </td>
      <td className="fw-semibold" style={{ color: "#888888", fontSize: "16px" }}>
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
                  color: "#888888",
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
                      color: "#888888",
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
                      <div className="d-flex" style={{ flex: 1 }}>
                        <div style={{ flex: 1, color: "black", fontWeight: "semi-bold" }}>
                          {getMemberName(member.member_id, member.member_name) || "N/A"}
                        </div>
                        <div style={{ flex: 1, color: "black", wordBreak: "break-word", fontWeight: "semi-bold" }}>
                          {getMemberEmail(member.member_id, member.member_email) || "N/A"}
                        </div>
                      </div>
                      {isAdmin && (
                        <button
                          className="btn btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Remove ${member.member_name || member.member_email} from ${membership.group_name || 'this group'}?`)) {
                              onDelete(member.composite_id || `${membership.group_id}_${member.member_id}`);
                            }

                          }}
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                            padding: "4px",
                            color: "#FF0000",
                            marginLeft: "8px",
                          }}
                          title={`Delete ${member.member_name || member.member_email}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#FF0000";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#FF0000";
                          }}
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


