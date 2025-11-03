import React from "react";

const GetUserModal = ({ users, getUserId, setGetUserId, onSubmit, onClose }) => (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.45)" }}>
        <div className="card p-3 mx-auto" style={{ maxWidth: 500 }}>
            <h5>Get Single User</h5>
            <input
                type="number"
                className="form-control my-2"
                placeholder="Enter User ID"
                value={getUserId}
                onChange={(e) => setGetUserId(e.target.value)}
            />
            <small className="text-muted">
                Available IDs: {users.map((u) => u.id).join(", ")}
            </small>
            <div className="d-flex gap-2 mt-3">
                <button
                    className="btn btn-info text-white w-50"
                    onClick={() => onSubmit(getUserId)}
                >
                    Get
                </button>
                <button className="btn btn-light w-50" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    </div>
);

export default GetUserModal;
