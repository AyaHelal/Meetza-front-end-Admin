// UserMainContent.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useUserData } from "./hooks/useUserData";
import { UserHeader } from "./components/UserHeader";
import { UserTable } from "./components/UserTable";
import { SearchBar } from "../shared/SearchBar";
import ModalComponent from "./ModalComponent";
import "./UserMainComponent.css";

const UserMainContent = ({ currentUser }) => {
    const isAdmin = (currentUser?.role || "").toLowerCase() === "administrator" || (currentUser?.role || "").toLowerCase() === "super_admin";

    const {
        users,
        loading,
        error,
        createUser,
        updateUser,
        deleteUser,
        searchUsers,
        fetchData,
    } = useUserData();

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "member" });
    const [searchQuery, setSearchQuery] = useState("");



    const openEditModal = (user) => {
        setModalMode("edit");
        setFormData({ name: user.name, email: user.email, password: "", role: user.role });
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleCreateUser = async () => {
        if (!formData.name || !formData.email || !formData.password) {
            toast.error("Please fill all fields");
            return;
        }
        try {
            await createUser(formData.name, formData.email, formData.password, formData.role);
            setShowModal(false);
            toast.success("User created successfully");
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || "Failed to create user";
            toast.error(msg);
        }
    };

    const handleUpdateUser = async () => {
        try {
            await updateUser(selectedUser.id, formData.name, formData.email, formData.password, formData.role);
            setShowModal(false);
            toast.success("User updated successfully");
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || "Failed to update user";
            toast.error(msg);
        }
    };

    const handleDeleteUser = async (id) => {
        if (id === currentUser?.id) {
            toast.error("Cannot delete your own account");
            return;
        }
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await deleteUser(id);
            if (res.success) {
                toast.success("User deleted successfully");
            } else {
                toast.error(res.message || "Failed to delete user");
            }
        } catch (error) {
            toast.error("Error deleting user");
        }
    };

    const handleSearchChange = (query) => {
        console.log("query", query);
        setSearchQuery(query);
        if (query.trim() === "") {
            fetchData();
        } else {
            if (query.trim().length > 2)
                searchUsers(query).catch((err) => {
                    toast.error(err?.response?.data?.message || "Failed to search users");
                });
        }
    };


    return (
        <main className="flex-fill">
            <UserHeader currentUser={currentUser} />

            <div className=" rounded-3" >
                <div className="card m-4 shadow-sm rounded-3 border-0" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    <div className="card-body p-3 mb-4 d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-3 align-items-center">
                            <h2 className="h5 mb-0 fw-semibold" style={{ fontSize: "24px" }}>User Management</h2>

                        </div>
                        <SearchBar
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search by name..."
                        />
                    </div>

                    <UserTable
                        users={users}
                        loading={loading}
                        error={error}
                        onEdit={openEditModal}
                        onDelete={handleDeleteUser}
                        isAdmin={isAdmin}
                    />
                </div>
            </div>

            {showModal && (
                <ModalComponent
                    mode={modalMode}
                    formData={formData}
                    setFormData={setFormData}
                    onSave={modalMode === "create" ? handleCreateUser : handleUpdateUser}
                    onClose={() => setShowModal(false)}
                />
            )}
        </main>
    );
};

export default UserMainContent;