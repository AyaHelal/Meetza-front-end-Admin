import React from "react";

const UserDetails = ({ user, onClose }) => (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.45)" }}>
        <div className="card p-3 mx-auto text-center" style={{ maxWidth: 400 }}>
            <div
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,#fb923c,#ec4899)",
                    color: "#fff",
                    fontSize: 28,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "auto",
                }}
            >
                {user.name.charAt(0)}
            </div>
            <h5 className="mt-3 mb-0">{user.name}</h5>
            <p className="text-muted small mb-1">{user.email}</p>
            <span
                className={`badge ${user.role === "administrator" ? "bg-info text-dark" : "bg-secondary"}`}
            >
                {user.role}
            </span>
            <button className="btn btn-info text-white mt-3 w-100" onClick={onClose}>
                Close
            </button>
        </div>
    </div>
);

export default UserDetails;
