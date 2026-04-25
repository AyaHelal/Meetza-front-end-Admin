// UserMainContent.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useUserData } from "./hooks/useUserData";
import { UserHeader } from "./components/UserHeader";
import { UserTable } from "./components/UserTable";
import { SearchBar } from "../shared/SearchBar";
import { ConfirmDeleteModal } from "../shared/ConfirmDeleteModal";
import ModalComponent from "./ModalComponent";
import "./UserMainComponent.css";

const UserMainContent = ({ currentUser }) => {
    const isSuperAdmin = (currentUser?.role || "").toLowerCase() === "super_admin";

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
    const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "member", photo: null });
    const [searchQuery, setSearchQuery] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);



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
        if (!formData.name?.trim()) {
            toast.error("Name is required");
            return;
        }
        try {
            await updateUser(selectedUser.id, formData.name, formData.photo);
            setShowModal(false);
            toast.success("User updated successfully");
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || "Failed to update user";
            toast.error(msg);
        }
    };

    const handleDeleteUser = (id) => {
        if (id === currentUser?.id) {
            toast.error("Cannot delete your own account");
            return;
        }
        setUserToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            const res = await deleteUser(userToDelete);
            setShowDeleteModal(false);
            setUserToDelete(null);
            if (res.success) {
                toast.success("User deleted successfully");
            } else {
                toast.error(res.message || "Failed to delete user");
            }
        } catch (error) {
            toast.error("Error deleting user");
            setShowDeleteModal(false);
            setUserToDelete(null);
        }
    };

    const handleSearchChange = (query) => {
        if (!isSuperAdmin) return; // Prevent search if not super admin
        setSearchQuery(query);
    };

    const filteredUsers = users.filter((u) => {
        const q = searchQuery.toLowerCase();
        return (
            (u.name && u.name.toLowerCase().includes(q)) ||
            (u.email && u.email.toLowerCase().includes(q))
        );
    });


    return (
        <main className="flex-fill">
            <UserHeader currentUser={currentUser} />

            <div className=" rounded-3" >
                <div className="card m-4 shadow-sm rounded-3 border-0 branded-card-bg" style={{ color: 'var(--text-primary)' }}>
                    <div className="card-body p-3 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
                        <div className="d-flex gap-3 align-items-center">
                            <h2 className="h5 mb-0 fw-semibold" style={{ color: 'var(--text-primary)' , fontSize: "24px"}}>User Management</h2>
                        </div>
                        <div className="d-flex align-items-center gap-3 flex-grow-1 justify-content-end">
                            {isSuperAdmin && (
                                <SearchBar
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Search by name..."
                                />
                            )}
                        </div>
                    </div>

                    <UserTable
                        users={filteredUsers}
                        loading={loading}
                        error={error}
                        onEdit={openEditModal}
                        onDelete={handleDeleteUser}
                        isAdmin={isSuperAdmin}
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

            <ConfirmDeleteModal
                show={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setUserToDelete(null); }}
                onConfirm={confirmDeleteUser}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
            />
        </main>
    );
};

export default UserMainContent;