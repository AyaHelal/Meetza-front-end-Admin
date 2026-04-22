import React from "react";

const WeeklyDeleteModal = ({ show, onClose, onConfirmThisWeek, onConfirmAllWeeks, confirming }) => {
    if (!show) return null;

    return (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.45)' }}>
            <div className="card p-4 mx-auto" style={{ maxWidth: 500, borderRadius: 12, marginTop: '6rem' }}>
                <div className="d-flex justify-content-between align-items-start">
                    <h5 className="modal-title fw-bold" style={{ fontSize: "24px", color: "#010101" }}>
                        Delete Weekly Meeting
                    </h5>
                    <button type="button" className="btn-close" onClick={onClose} aria-label="Close" style={{ fontSize: "14px" }} disabled={confirming} />
                </div>
                
                <div className="modal-body">
                    <p className="mb-4" style={{ fontSize: "16px", color: "black", lineHeight: "1.5" }}>
                        This is a weekly meeting. What would you like to delete?
                    </p>

                    <div className="d-grid gap-3">
                        <button
                            type="button"
                            className="btn rounded-3 d-flex align-items-center gap-3"
                            onClick={onConfirmThisWeek}
                            disabled={confirming}
                            style={{
                                backgroundColor: "transparent",
                                color: "#010101",
                                border: "1px solid transparent",
                                padding: "12px 20px",
                                fontSize: "16px",
                                fontWeight: "600",
                                textAlign: "left",
                                transition: "all 0.2s ease"
                            }}
                            onMouseOver={(e) => {
                                e.target.style.backgroundColor = "#f8f9fa";
                                e.target.style.transform = "translateY(-1px)";
                                e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                            }}
                        >
                            📅 Delete for this week only
                        </button>
                        <button
                            type="button"
                            className="btn rounded-3 d-flex align-items-center gap-3"
                            onClick={onConfirmAllWeeks}
                            disabled={confirming}
                            style={{
                                backgroundColor: "transparent",
                                color: "#dc2626",
                                border: "1px solid transparent",
                                padding: "12px 20px",
                                fontSize: "16px",
                                fontWeight: "600",
                                textAlign: "left",
                                transition: "all 0.2s ease"
                            }}
                            onMouseOver={(e) => {
                                e.target.style.backgroundColor = "#fef2f2";
                                e.target.style.transform = "translateY(-1px)";
                                e.target.style.boxShadow = "0 2px 8px rgba(220, 38, 38, 0.1)";
                            }}
                            onMouseOut={(e) => {
                                e.target.style.backgroundColor = "transparent";
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                            }}
                        >
                            🗑️ Delete all weekly meetings
                        </button>
                    </div>
                </div>

                <div className="modal-footer border-0 d-flex justify-content-end">
                    <button 
                        type="button" 
                        className="btn" 
                        onClick={onClose} 
                        disabled={confirming}
                        style={{
                            padding: "10px 24px",
                            fontSize: "16px",
                            fontWeight: "600",
                            backgroundColor: "rgb(244, 246, 248)",
                            color: "rgb(1, 1, 1)"
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export { WeeklyDeleteModal };
