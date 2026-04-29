import React from 'react';

const DeleteConfirmationModal = ({ show, onClose, onConfirm, deleteType }) => {
    if (!show) return null;

    return (
        <div
            className="modal show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={onClose}
        >
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content rounded-4 border-0" style={{ backgroundColor: "var(--card-bg)", boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold" style={{ fontSize: "24px", color: "var(--text-primary)" }}>
                            {deleteType === 'company' ? 'Delete Company' : 'Delete Domain'}
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={onClose} 
                            aria-label="Close" 
                            style={{ fontSize: "14px" }} 
                        />
                    </div>
                    <div className="modal-body pt-3">
                        <p style={{ fontSize: "16px", color: "var(--text-primary)" }}>
                            {deleteType === 'company' 
                                ? 'Are you sure you want to delete this company? This action cannot be undone and will permanently remove all company data.'
                                : 'Are you sure you want to delete this domain? This action cannot be undone.'
                            }
                        </p>
                    </div>
                    <div className="modal-footer border-0 pt-0">
                        <button
                            type="button"
                            className="btn rounded-3"
                            onClick={onClose}
                            style={{
                                backgroundColor: "var(--bg-light)",
                                color: "var(--text-primary)",
                                border: "none",
                                padding: "10px 24px",
                                fontSize: "16px",
                                fontWeight: "600",
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn rounded-3 btn-dashboard-confirm-delete"
                            onClick={onConfirm}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
