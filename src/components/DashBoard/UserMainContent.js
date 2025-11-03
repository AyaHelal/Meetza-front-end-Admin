// UserMainContent.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import ModalComponent from "./ModalComponent";
import GetUserModal from "./GetUserModal";
import UserDetails from "./UserDetails";
import { UsersThree, PlusCircle, PencilSimpleLine, Trash } from "phosphor-react";
import { UserCheck } from "lucide-react";
import "./UserMainComponent.css";
const UserMainContent = ({ currentUser, users, setUsers }) => {
    console.log("Current User in UserMainContent:", currentUser);
    const isAdmin = (currentUser?.role || "").toLowerCase() === "administrator";

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "member" });

    const [showUserDetails, setShowUserDetails] = useState(false);
    const [userDetailsData, setUserDetailsData] = useState(null);
    const [showGetUserModal, setShowGetUserModal] = useState(false);
    const [getUserId, setGetUserId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const openCreateModal = () => {
        setModalMode("create");
        setFormData({ name: "", email: "", password: "", role: "member" });
        setSelectedUser(null);
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setModalMode("edit");
        setFormData({ name: user.name, email: user.email, password: "", role: user.role });
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleCreateUser = async () => {
        if (!formData.name || !formData.email || !formData.password) {
            alert("Please fill all fields");
            return;
        }
        try {
            const API_BASE = "https://meetza-backend.vercel.app/api/register";
            const token = localStorage.getItem("authToken");
            const locale = localStorage.getItem("locale") || navigator.language?.slice(0, 2) || "en";

            const payload = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role === "administrator" ? "Administrator" : "Member",
            };
            const res = await axios.post(`${API_BASE}`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-localization": locale,
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const created = res?.data || {};
            const createdUser = {
                id: created.id ?? users.length + 1,
                name: created.name ?? formData.name,
                email: created.email ?? formData.email,
                role: (created.role || payload.role) === "Administrator" ? "administrator" : "member",
            };
            setUsers([...users, createdUser]);
            setShowModal(false);
            alert("User created successfully");
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || "Failed to create user";
            alert(msg);
        }
    };

    const handleUpdateUser = async () => {
        try {
            const API_BASE = `https://meetza-backend.vercel.app/api/user/`;
            const token = localStorage.getItem("authToken");
            const locale = localStorage.getItem("locale") || navigator.language?.slice(0, 2) || "en";

            const payload = {
                name: formData.name,
                email: formData.email,
                role: formData.role === "administrator" ? "Administrator" : "Member",
            };
            if (formData.password) {
                payload.password = formData.password;
            }

            const res = await axios.patch(`${API_BASE}${selectedUser.id}`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-localization": locale,
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            const updated = res?.data || {};
            const nextUsers = users.map((u) =>
                u.id === selectedUser.id
                    ? {
                        ...u,
                        name: updated.name ?? payload.name,
                        email: updated.email ?? payload.email,
                        role: (updated.role || payload.role) === "Administrator" ? "administrator" : "member",
                    }
                    : u
            );
            setUsers(nextUsers);
            setShowModal(false);
            alert("User updated successfully");
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || "Failed to update user";
            alert(msg);
        }
    };

    const handleDeleteUser = async (id) => {
        if (id === currentUser.id) {
            alert("Cannot delete your own account");
            return;
        }
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const API_BASE = "https://meetza-backend.vercel.app/api/user/";
            const token = localStorage.getItem("authToken");
            const locale = localStorage.getItem("locale") || navigator.language?.slice(0, 2) || "en";

            await axios.delete(`${API_BASE}${id}`, {
                headers: {
                    Accept: "application/json",
                    "X-localization": locale,
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            setUsers(users.filter((u) => u.id !== id));
            alert("User deleted successfully");
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || "Failed to delete user";
            alert(msg);
        }
    };

    const mapUserFromApi = (u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role:
            u.role === "Administrator"
                ? "administrator"
                : u.role === "Member"
                    ? "member"
                    : (u.role || "").toString().toLowerCase(),
        avatarUrl: u.avatarUrl || u.avatar_url,
    });

    const handleSearchUsers = async (query) => {
        try {
            const API_BASE = process.env.REACT_APP_API_BASE || "{{url1}}";
            const SEARCH_URL = `https://meetza-backend.vercel.app/api/user/search`;
            const token = localStorage.getItem("authToken");
            const locale = localStorage.getItem("locale") || navigator.language?.slice(0, 2) || "en";

            const res = await axios.get(SEARCH_URL, {
                params: { name: query },
                headers: {
                    Accept: "application/json",
                    "X-localization": locale,
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
            const normalized = payload.map(mapUserFromApi);
            setUsers(normalized);
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || "Failed to search users";
            alert(msg);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim() === "") {
            handleGetAllUsers();
        } else {
            handleSearchUsers(query);
        }
    };

    const handleGetAllUsers = async () => {
        try {
            const API_BASE = process.env.REACT_APP_API_BASE || "{{url1}}";
            const USERS_URL = process.env.REACT_APP_USERS_URL || "https://meetza-backend.vercel.app/api/user";
            const token = localStorage.getItem("authToken");
            const locale = localStorage.getItem("locale") || navigator.language?.slice(0, 2) || "en";
            console.log("token", token);

            const res = await axios.get(USERS_URL || `${API_BASE}user/`, {
                headers: {
                    Accept: "application/json",
                    "X-localization": locale,
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
            const normalized = payload.map(mapUserFromApi);
            setUsers(normalized);
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || "Failed to fetch users";
            alert(msg);
        }
    };

    useEffect(() => {
        handleGetAllUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getSingleUser = async (userId) => {
        try {
            const API_BASE = process.env.REACT_APP_API_BASE || "{{url1}}";
            const token = localStorage.getItem("authToken");
            const locale = localStorage.getItem("locale") || navigator.language?.slice(0, 2) || "en";
            const res = await axios.get(`${API_BASE}user/${userId}`, {
                headers: {
                    Accept: "application/json",
                    "X-localization": locale,
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });
            const u = res?.data?.data || res?.data || null;
            if (!u) {
                alert("User not found!");
                return;
            }
            const normalized = mapUserFromApi(u);
            setUserDetailsData(normalized);
            setShowUserDetails(true);
            setShowGetUserModal(false);
            setGetUserId("");
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || "Failed to get user";
            alert(msg);
        }
    };

    return (
        <main className="flex-fill">
            {/* HEADER */}
            <div className="bg-white border-bottom px-4 py-1 mt-5 mx-4 rounded-3" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h1 className="h4 pt-3 fw-semibold" style={{ color: "#010101" }}>Hello, {currentUser.name}</h1>
                        <p style={{ color: "#888888", fontSize: "18px" }}>
                            Welcome back! Manage your team efficiently.
                        </p>
                    </div>
                </div>
            </div>

            {/* USER TABLE */}
            <div className="m-4 rounded-3 " style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)", height: "804px" }}>
                <div className="card shadow-sm rounded-3 border-0" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    <div className="card-body p-3 mb-4 d-flex justify-content-between align-items-center">
                        <h2 className="h5 mb-0 fw-semibold" style={{ fontSize: "24px" }}>User Management</h2>
                        {/* Search Input */}
                        <div className="position-relative" style={{ width: "250px" }}>
                            <input
                                type="text"
                                className="form-control rounded-4 ps-5 search-input"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                style={{

                                    fontSize: "16px",
                                    border: "2px solid #E9ECEF",
                                    paddingTop: "0.75rem",
                                    paddingBottom: "0.75rem"
                                    , background: "linear-gradient(to right, #0076EA, #00DC85)",
                                }}
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="white"
                                className="position-absolute"
                                style={{ left: "15px", top: "50%", transform: "translateY(-50%)" }}
                                viewBox="0 0 16 16"
                            >
                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="table-responsive overflow-hidden">
                        <table className="table table-borderless px-5">
                            <thead className="" style={{ borderBottom: "5px solid #F4F4F4" }}>
                                <tr className="mx-5">
                                    <th style={{ color: "#888888" }} className="fw-semibold px-4">Name</th>
                                    <th style={{ color: "#888888" }} className="fw-semibold">Email</th>
                                    <th style={{ color: "#888888" }} className="fw-semibold">Role</th>
                                    <th style={{ color: "#888888" }} className="fw-semibold">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="align-middle ">
                                        <td className="px-4">
                                            <div className="d-flex align-items-center gap-2">
                                                {user.avatarUrl ? (
                                                    <img
                                                        src={user.avatarUrl}
                                                        alt={`${user.name} avatar`}
                                                        className="rounded-3"
                                                        style={{ width: 56, height: 56, objectFit: "cover" }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="rounded-3 d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: 56,
                                                            height: 56,
                                                            backgroundColor: "#E9ECEF",
                                                            color: "#6C757D",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        {user.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                )}
                                                <span style={{ fontSize: "18px" }}>{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="fw-semibold" style={{ color: "#888888" }}>{user.email}</td>
                                        <td className="fw-semibold" style={{ color: "#888888", fontSize: "16px" }}>
                                            {user.role === "administrator" ? "Administrator" : "Member"}
                                        </td>

                                        <td>
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-sm"
                                                    onClick={() => openEditModal(user)}
                                                    style={{ backgroundColor: "#00DC85", borderRadius: "12px" }}
                                                >
                                                    <span className="" style={{ color: "white" }}>
                                                        <PencilSimpleLine size={24} />
                                                    </span>
                                                </button>
                                                {isAdmin && user.id !== currentUser.id && (
                                                    <button
                                                        className="btn btn-sm"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        style={{ backgroundColor: "#FF0000", borderRadius: "12px" }}
                                                    >
                                                        <span className="" style={{ color: "white" }}>
                                                            <Trash size={24} />
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-muted">
                                            No users found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showModal && (
                <ModalComponent
                    mode={modalMode}
                    formData={formData}
                    setFormData={setFormData}
                    onSave={modalMode === "create" ? handleCreateUser : handleUpdateUser}
                    onClose={() => setShowModal(false)}
                />
            )}

            {showGetUserModal && (
                <GetUserModal
                    users={users}
                    getUserId={getUserId}
                    setGetUserId={setGetUserId}
                    onSubmit={getSingleUser}
                    onClose={() => setShowGetUserModal(false)}
                />
            )}

            {showUserDetails && userDetailsData && (
                <UserDetails
                    user={userDetailsData}
                    onClose={() => setShowUserDetails(false)}
                />
            )}
        </main>
    );
};

export default UserMainContent;