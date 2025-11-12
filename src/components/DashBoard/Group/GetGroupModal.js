// GetGroupModal.jsx
import React from "react";
import { X, MagnifyingGlass } from "phosphor-react";

const GetGroupModal = ({ groups, getGroupId, setGetGroupId, onSubmit, onClose }) => {
    const handleSubmit = () => {
        if (!getGroupId) {
            alert("Please enter a group ID");
            return;
        }
        onSubmit(getGroupId);
    };

    return (
        <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content rounded-4 border-0" style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold" style={{ fontSize: "24px", color: "#010101" }}>
                            Get Group by ID
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <X size={24} weight="bold" />
                        </button>
                    </div>

                    <div className="modal-body pt-3">
                        <div className="mb-3">
                            <label className="form-label fw-semibold" style={{ color: "#010101" }}>
                                Group ID <span style={{ color: "#FF0000" }}>*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control rounded-3"
                                value={getGroupId}
                                onChange={(e) => setGetGroupId(e.target.value)}
                                placeholder="Enter group ID"
                                style={{
                                    border: "2px solid #E9ECEF",
                                    padding: "0.75rem",
                                    fontSize: "16px"
                                }}
                            />
                        </div>

                        {/* Available Groups List */}
                        {groups.length > 0 && (
                            <div className="mt-4">
                                <p className="fw-semibold mb-2" style={{ color: "#888888", fontSize: "14px" }}>
                                    Available Groups:
                                </p>
                                <div
                                    className="border rounded-3 p-3"
                                    style={{
                                        maxHeight: "200px",
                                        overflowY: "auto",
                                        backgroundColor: "#F9F9F9"
                                    }}
                                >
                                    {groups.map((group) => (
                                        <div
                                            key={group.id}
                                            className="d-flex justify-content-between align-items-center mb-2 p-2 rounded-3"
                                            style={{
                                                backgroundColor: "white",
                                                cursor: "pointer",
                                                border: getGroupId === group.id.toString() ? "2px solid #0076EA" : "1px solid #E9ECEF"
                                            }}
                                            onClick={() => setGetGroupId(group.id.toString())}
                                        >
                                            <div>
                                                <div className="fw-semibold" style={{ fontSize: "14px" }}>
                                                    {group.name}
                                                </div>
                                                <div style={{ fontSize: "12px", color: "#888888" }}>
                                                    ID: {group.id}
                                                </div>
                                            </div>
                                            {group.memberCount !== undefined && (
                                                <span
                                                    className="badge rounded-pill"
                                                    style={{
                                                        backgroundColor: "#E9ECEF",
                                                        color: "#888888",
                                                        fontSize: "12px",
                                                        padding: "0.4rem 0.8rem"
                                                    }}
                                                >
                                                    {group.memberCount} members
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="modal-footer border-0 pt-0">
                        <button
                            type="button"
                            className="btn rounded-3 px-4 py-2"
                            onClick={onClose}
                            style={{
                                backgroundColor: "#F4F4F4",
                                color: "#888888",
                                border: "none",
                                fontSize: "16px",
                                fontWeight: "600"
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn rounded-3 px-4 py-2 d-flex align-items-center gap-2"
                            onClick={handleSubmit}
                            style={{
                                background: "linear-gradient(to right, #0076EA, #00DC85)",
                                color: "white",
                                border: "none",
                                fontSize: "16px",
                                fontWeight: "600"
                            }}
                        >
                            <MagnifyingGlass size={20} weight="bold" />
                            Get Group
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GetGroupModal;