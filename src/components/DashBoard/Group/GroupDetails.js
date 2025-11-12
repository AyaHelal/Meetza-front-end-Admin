// GroupDetails.jsx
import React from "react";
import { X, UsersThree, Calendar, Hash, TextAlignLeft } from "phosphor-react";

const GroupDetails = ({ group, onClose }) => {
    return (
        <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
        >
            <div
                className="modal-dialog modal-dialog-centered modal-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content rounded-4 border-0" style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold" style={{ fontSize: "24px", color: "#010101" }}>
                            Group Details
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
                        {/* Group Icon & Name */}
                        <div className="text-center mb-4">
                            <div
                                className="rounded-4 d-inline-flex align-items-center justify-content-center mb-3"
                                style={{
                                    width: 100,
                                    height: 100,
                                    background: "linear-gradient(135deg, #0076EA, #00DC85)",
                                }}
                            >
                                <UsersThree size={48} weight="bold" style={{ color: "white" }} />
                            </div>
                            <h4 className="fw-bold mb-1" style={{ color: "#010101" }}>
                                {group.name}
                            </h4>
                            <p style={{ color: "#888888", fontSize: "14px" }}>
                                Group Information
                            </p>
                        </div>

                        {/* Details Grid */}
                        <div className="row g-3">
                            {/* Group ID */}
                            <div className="col-12">
                                <div
                                    className="p-3 rounded-3"
                                    style={{ backgroundColor: "#F9F9F9", border: "1px solid #E9ECEF" }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div
                                            className="rounded-3 d-flex align-items-center justify-content-center"
                                            style={{
                                                width: 40,
                                                height: 40,
                                                backgroundColor: "#E9ECEF"
                                            }}
                                        >
                                            <Hash size={20} weight="bold" style={{ color: "#888888" }} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <p className="mb-0" style={{ fontSize: "12px", color: "#888888" }}>
                                                Group ID
                                            </p>
                                            <p className="mb-0 fw-semibold" style={{ fontSize: "16px", color: "#010101" }}>
                                                {group.id}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="col-12">
                                <div
                                    className="p-3 rounded-3"
                                    style={{ backgroundColor: "#F9F9F9", border: "1px solid #E9ECEF" }}
                                >
                                    <div className="d-flex align-items-start gap-3">
                                        <div
                                            className="rounded-3 d-flex align-items-center justify-content-center"
                                            style={{
                                                width: 40,
                                                height: 40,
                                                backgroundColor: "#E9ECEF"
                                            }}
                                        >
                                            <TextAlignLeft size={20} weight="bold" style={{ color: "#888888" }} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <p className="mb-0" style={{ fontSize: "12px", color: "#888888" }}>
                                                Description
                                            </p>
                                            <p className="mb-0 fw-semibold" style={{ fontSize: "16px", color: "#010101" }}>
                                                {group.description || "No description provided"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Member Count */}
                            <div className="col-md-6">
                                <div
                                    className="p-3 rounded-3"
                                    style={{ backgroundColor: "#F9F9F9", border: "1px solid #E9ECEF" }}
                                >
                                    <div className="d-flex align-items-center gap-3">
                                        <div
                                            className="rounded-3 d-flex align-items-center justify-content-center"
                                            style={{
                                                width: 40,
                                                height: 40,
                                                backgroundColor: "#E9ECEF"
                                            }}
                                        >
                                            <UsersThree size={20} weight="bold" style={{ color: "#888888" }} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <p className="mb-0" style={{ fontSize: "12px", color: "#888888" }}>
                                                Members
                                            </p>
                                            <p className="mb-0 fw-semibold" style={{ fontSize: "16px", color: "#010101" }}>
                                                {group.memberCount || 0} members
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Created At */}
                            {group.createdAt && (
                                <div className="col-md-6">
                                    <div
                                        className="p-3 rounded-3"
                                        style={{ backgroundColor: "#F9F9F9", border: "1px solid #E9ECEF" }}
                                    >
                                        <div className="d-flex align-items-center gap-3">
                                            <div
                                                className="rounded-3 d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: 40,
                                                    height: 40,
                                                    backgroundColor: "#E9ECEF"
                                                }}
                                            >
                                                <Calendar size={20} weight="bold" style={{ color: "#888888" }} />
                                            </div>
                                            <div className="flex-grow-1">
                                                <p className="mb-0" style={{ fontSize: "12px", color: "#888888" }}>
                                                    Created At
                                                </p>
                                                <p className="mb-0 fw-semibold" style={{ fontSize: "16px", color: "#010101" }}>
                                                    {new Date(group.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer border-0 pt-3">
                        <button
                            type="button"
                            className="btn rounded-3 px-4 py-2"
                            onClick={onClose}
                            style={{
                                background: "linear-gradient(to right, #0076EA, #00DC85)",
                                color: "white",
                                border: "none",
                                fontSize: "16px",
                                fontWeight: "600"
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupDetails;