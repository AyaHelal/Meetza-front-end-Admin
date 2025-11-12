// GroupMainContent.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useGroupData } from "./hooks/useGroupData";
import { GroupHeader } from "./components/GroupHeader";
import { GroupTable } from "./components/GroupTable";
import { SearchBar } from "../Position/components/SearchBar";
import GroupModalComponent from "./GroupModalComponent";
import GroupDetails from "./GroupDetails";
import { PlusCircle, ArrowLeft } from "phosphor-react";
import "./GroupMainComponent.css";

const GroupMainContent = ({ currentUser }) => {
    const isAdmin = (currentUser?.role || "").toLowerCase() === "administrator";

    const {
        groups,
        positions,
        users,
        loading,
        error,
        createGroup,
        updateGroup,
        deleteGroup,
        searchGroups,
        fetchData,
    } = useGroupData();

    const [showForm, setShowForm] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [formData, setFormData] = useState({ group_name: "", position_id: "" });
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [showGroupDetails, setShowGroupDetails] = useState(false);
    const [groupDetailsData] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const openCreateForm = () => {
        setFormData({ group_name: "", position_id: "" });
        setSelectedGroup(null);
        setShowForm(true);
    };

    const openEditModal = (group) => {
        setModalMode("edit");
        setFormData({ name: group.name, description: group.description || "" });
        setSelectedGroup(group);
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCreateGroup = async () => {
        if (!formData.group_name || !formData.position_id) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            await createGroup(formData.group_name, formData.position_id);
            setShowForm(false);
            toast.success("Group created successfully");
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || "Failed to create group";
            toast.error(msg);
        }
    };

    const handleUpdateGroup = async () => {
        try {
            await updateGroup(selectedGroup.id, formData.name, formData.description);
            setShowModal(false);
            toast.success("Group updated successfully");
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || "Failed to update group";
            toast.error(msg);
        }
    };

    const handleDeleteGroup = async (id) => {
        if (!window.confirm("Are you sure you want to delete this group?")) return;
        try {
            const res = await deleteGroup(id);
            if (res.success) {
                toast.success("Group deleted successfully");
            } else {
                toast.error(res.message || "Failed to delete group");
            }
        } catch (error) {
            toast.error("Error deleting group");
        }
    };

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        if (query.trim() === "") {
            fetchData();
        } else {
            searchGroups(query).catch((err) => {
                toast.error(err?.response?.data?.message || "Failed to search groups");
            });
        }
    };

    // Helper function to get position name by ID
    const getPositionName = (positionId) => {
        if (!positionId) return "N/A";
        const position = positions.find((p) => p.id === positionId);
        return position?.name || position?.position_name || position?.title || `Position ${positionId}`;
    };

    // Helper function to get admin name by ID
    const getAdminName = (adminId, adminName = null) => {
        if (adminName) return adminName;
        if (!adminId) return "N/A";
        const user = users.find((u) => u.id === adminId || u.id === Number(adminId) || String(u.id) === String(adminId));
        return user?.name || `User ${adminId}`;
    };

    const filteredGroups = groups.filter((g) =>
        (g.name || g.group_name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="flex-fill">
            <GroupHeader currentUser={currentUser} />

            <div className="m-4 rounded-3" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)", height: "804px" }}>
                <div className="card shadow-sm rounded-3 border-0" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    {!showForm ? (
                        <>
                            <div className="card-body p-3 mb-4 d-flex justify-content-between align-items-center">
                                <h2 className="h5 mb-0 fw-semibold" style={{ fontSize: "24px" }}>Group Management</h2>
                                <div className="d-flex gap-3 align-items-center">
                                    <button
                                        className="btn rounded-4 d-flex align-items-center gap-2"
                                        onClick={openCreateForm}
                                        style={{
                                            background: "linear-gradient(to right, #0076EA, #00DC85)",
                                            color: "white",
                                            fontSize: "16px",
                                            paddingTop: "0.75rem",
                                            paddingBottom: "0.75rem",
                                            paddingLeft: "1.5rem",
                                            paddingRight: "1.5rem",
                                            border: "none",
                                        }}
                                    >
                                        <PlusCircle size={20} weight="bold" />
                                        <span className="fw-semibold">Create Group</span>
                                    </button>
                                    <SearchBar
                                        className="ss"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        placeholder="Search by name..."
                                    />
                                </div>
                            </div>

                            <GroupTable
                                groups={filteredGroups}
                                positions={positions}
                                users={users}
                                loading={loading}
                                error={error}
                                onEdit={openEditModal}
                                onDelete={handleDeleteGroup}
                                getPositionName={getPositionName}
                                getAdminName={getAdminName}
                                isAdmin={isAdmin}
                            />
                        </>
                    ) : (
                        <>
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <button
                                        className="btn btn-sm align-items-center px-2 py-1"
                                        onClick={() => setShowForm(false)}
                                        style={{
                                            backgroundColor: "#0076EA",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "12px",
                                        }}
                                    >
                                        <ArrowLeft size={16} weight="bold" />

                                    </button>
                                    <h2 className="h5 mb-0 fw-semibold" style={{ fontSize: "24px" }}>
                                        Create New Group
                                    </h2>
                                </div>

                                <div className="row justify-content-center">
                                    <div className="col-lg-8">
                                        <div className="bg-white rounded-3 p-4" style={{ border: "2px solid #E9ECEF" }}>
                                            <div className="mb-4">
                                                <label className="form-label fw-semibold" style={{ color: "#010101", fontSize: "16px" }}>
                                                    Group Name <span style={{ color: "#FF0000" }}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control ff rounded-3"
                                                    name="group_name"
                                                    value={formData.group_name}
                                                    onChange={handleFormChange}
                                                    placeholder="Enter group name"
                                                    style={{
                                                        border: "2px solid #E9ECEF",
                                                        padding: "0.75rem",
                                                        fontSize: "16px",
                                                    }}
                                                />
                                            </div>

                                            <div className="mb-5">
                                                <label className="form-label fw-semibold" style={{ color: "#010101", fontSize: "16px" }}>
                                                    Position <span style={{ color: "#FF0000" }}>*</span>
                                                </label>
                                                <select
                                                    className="form-select custom-select rounded-3"
                                                    name="position_id"
                                                    value={formData.position_id}
                                                    onChange={handleFormChange}
                                                    style={{
                                                        border: "2px solid #E9ECEF",
                                                        padding: "0.75rem",
                                                        fontSize: "16px",
                                                        color: formData.position_id === "" ? "#888888" : "#000000",
                                                    }}
                                                >
                                                    <option value="" style={{ color: "#888888" }}>Select a position</option>
                                                    {positions.map((position) => (
                                                        <option key={position.id} value={position.id} style={{ color: "#888888" }}>
                                                            {position.name || position.position_name || `Position ${position.id}`}
                                                        </option>
                                                    ))}
                                                </select>


                                            </div>

                                            <div className="d-flex gap-3 justify-content-center">
                                                <button
                                                    type="button"
                                                    className="btn rounded-3 px-4 py-2"
                                                    onClick={() => setShowForm(false)}
                                                    style={{
                                                        backgroundColor: "#F4F4F4",
                                                        color: "#888888",
                                                        border: "none",
                                                        fontSize: "16px",
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn rounded-3 px-4 py-2"
                                                    onClick={handleCreateGroup}
                                                    style={{
                                                        background: "linear-gradient(to right, #0076EA, #00DC85)",
                                                        color: "white",
                                                        border: "none",
                                                        fontSize: "16px",
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    Create Group
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {showModal && (
                <GroupModalComponent
                    mode={modalMode}
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleUpdateGroup}
                    onClose={() => setShowModal(false)}
                />
            )}

            {showGroupDetails && groupDetailsData && (
                <GroupDetails
                    group={groupDetailsData}
                    onClose={() => setShowGroupDetails(false)}
                />
            )}
        </main>
    );
};

export default GroupMainContent;
