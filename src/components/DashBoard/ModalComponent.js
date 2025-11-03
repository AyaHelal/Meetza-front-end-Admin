import React from "react";

const ModalComponent = ({ mode, formData, setFormData, onSave, onClose }) => (
    <div className="modal d-block" style={{ background: "rgba(0,0,0,0.45)" }}>
        <div className="card p-3 mx-auto" style={{ maxWidth: 500 }}>
            <h5>{mode === "create" ? "Create User" : "Update User"}</h5>
            <input
                className="form-control my-2"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
                className="form-control my-2"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
                type="password"
                className="form-control my-2"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <div className="my-2">
                <label className="form-label">Role</label>
                <div className="d-flex gap-4">
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="role"
                            id="roleMember"
                            value="member"
                            checked={formData.role === "member"}
                            onChange={() => setFormData({ ...formData, role: "member" })}
                        />
                        <label className="form-check-label" htmlFor="roleMember">
                            Member
                        </label>
                    </div>
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="radio"
                            name="role"
                            id="roleAdmin"
                            value="administrator"
                            checked={formData.role === "administrator"}
                            onChange={() => setFormData({ ...formData, role: "administrator" })}
                        />
                        <label className="form-check-label" htmlFor="roleAdmin">
                            Administrator
                        </label>
                    </div>
                </div>
            </div>
            <div className="d-flex gap-2">
                <button className="btn btn-success w-50" onClick={onSave}>
                    Save
                </button>
                <button className="btn btn-light w-50" onClick={onClose}>
                    Cancel
                </button>
            </div>
        </div>
    </div>
);

export default ModalComponent;
