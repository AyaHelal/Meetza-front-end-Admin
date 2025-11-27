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
  const [hoveredMemberIndex, setHoveredMemberIndex] = useState(null);

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
            <div>
              <button
                onClick={toggleExpand}
                className="btn btn-sm d-flex align-items-center gap-2"
                style={{
                  backgroundColor: isExpanded ? "#E9ECEF" : "transparent",
                  border: "1px solid #E9ECEF",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  color: "#888888",
                  fontSize: "14px",
                  width: "100%",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isExpanded) e.target.style.backgroundColor = "#F8F9FA";
                }}
                onMouseLeave={(e) => {
                  if (!isExpanded) e.target.style.backgroundColor = "transparent";
                }}
              >
                <span>
                  {members.length} {members.length === 1 ? "Member" : "Members"}
                </span>
                {isExpanded ? <CaretUp size={18} /> : <CaretDown size={18} />}
              </button>
              {isExpanded && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "12px",
                    backgroundColor: "#F8F9FA",
                    borderRadius: "8px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    border: "1px solid #E9ECEF",
                  }}
                >
                  {members.map((member, index) => (
                    <div
                      key={member.composite_id || index}
                      className="d-flex align-items-center justify-content-between"
                      style={{
                        padding: "8px 12px",
                        margin: "4px 0",
                        borderBottom: index < members.length - 1 ? "1px solid #E9ECEF" : "none",
                        borderRadius: "6px",
                        transition: "background-color 0.2s",
                        position: "relative",
                      }}
                      onMouseEnter={() => {
                        setHoveredMemberIndex(`name-${index}`);
                      }}
                      onMouseLeave={() => {
                        setHoveredMemberIndex(null);
                      }}
                    >
                      <span style={{ color: "#888888", cursor: "pointer", flex: 1 }}>
                        {getMemberName(member.member_id, member.member_name) || "N/A"}
                      </span>
                      {isAdmin && (
                        <div 
                          className="d-flex gap-1 align-items-center"
                          style={{ 
                            opacity: hoveredMemberIndex === `name-${index}` ? 1 : 0, 
                            transition: "opacity 0.2s",
                          }}
                          onMouseEnter={() => {
                            setHoveredMemberIndex(`name-${index}`);
                          }}
                          onMouseLeave={() => {
                            setHoveredMemberIndex(null);
                          }}
                        >
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
                              color: "#888888",
                            }}
                            title={`Delete ${member.member_name || member.member_email}`}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "#FF0000";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "#888888";
                            }}
                          >
                            <Trash size={16} weight="regular" />
                          </button>
                        </div>
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
      <td className="fw-semibold" style={{ color: "#888888", fontSize: "16px" }}>
        <div style={{ maxWidth: "400px" }}>
          {members.length > 0 ? (
            <div>
              <button
                onClick={toggleExpand}
                className="btn btn-sm d-flex align-items-center gap-2"
                style={{
                  backgroundColor: isExpanded ? "#E9ECEF" : "transparent",
                  border: "1px solid #E9ECEF",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  color: "#888888",
                  fontSize: "14px",
                  width: "100%",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isExpanded) e.target.style.backgroundColor = "#F8F9FA";
                }}
                onMouseLeave={(e) => {
                  if (!isExpanded) e.target.style.backgroundColor = "transparent";
                }}
              >
                <span>
                  {members.length} {members.length === 1 ? "Email" : "Emails"}
                </span>
                {isExpanded ? <CaretUp size={18} /> : <CaretDown size={18} />}
              </button>
              {isExpanded && (
                <div
                  style={{
                    marginTop: "8px",
                    padding: "12px",
                    backgroundColor: "#F8F9FA",
                    borderRadius: "8px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    border: "1px solid #E9ECEF",
                  }}

                >
                  {members.map((member, index) => (
                    <div
                      key={member.composite_id || index}
                      className="d-flex align-items-center justify-content-between"
                      style={{
                        padding: "8px 12px",
                        margin: "4px 0",
                        borderBottom: index < members.length - 1 ? "1px solid #E9ECEF" : "none",
                        borderRadius: "6px",
                        transition: "background-color 0.2s",
                        wordBreak: "break-word",
                        position: "relative",
                      }}
                      onMouseEnter={() => {
                        setHoveredMemberIndex(`email-${index}`);
                      }}
                      onMouseLeave={() => {
                        setHoveredMemberIndex(null);
                      }}
                    >
                      <span style={{ color: "#888888", cursor: "pointer", flex: 1 }}>
                        {getMemberEmail(member.member_id, member.member_email) || "N/A"}
                      </span>
                      {isAdmin && (
                        <div 
                          className="d-flex gap-1 align-items-center"
                          style={{ 
                            opacity: hoveredMemberIndex === `email-${index}` ? 1 : 0, 
                            transition: "opacity 0.2s",
                            marginLeft: "8px",
                          }}
                          onMouseEnter={() => {
                            setHoveredMemberIndex(`email-${index}`);
                          }}
                          onMouseLeave={() => {
                            setHoveredMemberIndex(null);
                          }}
                        >
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
                              color: "#888888",
                            }}
                            title={`Delete ${member.member_name || member.member_email}`}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "#FF0000";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "#888888";
                            }}
                          >
                            <Trash size={16} weight="regular" />
                          </button>
                        </div>
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


