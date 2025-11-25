// GroupMainContent.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useGroupData } from "./hooks/useGroupData";
import useGroupContentData from "../GroupContent/hooks/useGroupContentData";
import { GroupHeader } from "./components/GroupHeader";
import { GroupTable } from "./components/GroupTable";
import { SearchBar } from "../shared/SearchBar";
import GroupModalComponent from "./GroupModalComponent";
import GroupDetails from "./GroupDetails";
import { PlusCircle, ArrowLeft } from "phosphor-react";
import "./GroupMainComponent.css";

const GroupMainContent = ({ currentUser }) => {
    const isAdmin = (currentUser?.role || "").toLowerCase() === "administrator" || (currentUser?.role || "").toLowerCase() === "super_admin";

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

    const { contents } = useGroupContentData();

    const [selectedGroup, setSelectedGroup] = useState(null);
    const [formData, setFormData] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [showGroupDetails, setShowGroupDetails] = useState(false);
    const [groupDetailsData] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const openCreateForm = () => {
        setModalMode("create");
        setFormData({ group_name: "", position_id: "", group_content_id: null });
        setSelectedGroup(null);
        setShowForm(true);
    };

    const openEditModal = (group) => {
        setModalMode("edit");
        setFormData({ 
            name: group.name,
            group_content_id: group.group_content_id || null 
        });
        setSelectedGroup({
            ...group,
            position_id: group.position_id || group.positionId
        });
        setShowEditModal(true);
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
            await createGroup(formData.group_name, formData.position_id, formData.group_content_id || null);
            setShowForm(false);
            toast.success("Group created successfully");
            fetchData();
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || "Failed to create group";
            toast.error(msg);
        }
    };

    const handleUpdateGroup = async () => {
        if (!selectedGroup) {
            console.error("No group selected for update");
            return;
        }

        const groupId = selectedGroup.id;
        console.log("Selected Group ID:", groupId);
        const payload = {
            group_name: formData.name,
            position_id: selectedGroup.position_id
        };
        console.log("Payload sent:", payload);

        try {
            const res = await updateGroup(groupId, formData.name, selectedGroup.position_id, formData.group_content_id || undefined);
            console.log("Response from backend:", res);
            setShowEditModal(false);
            toast.success("Group updated successfully");
            fetchData();
        } catch (error) {
            console.error("Update error:", error);
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




    return (
        <main className="flex-fill">
            <GroupHeader currentUser={currentUser} />

            <div className="rounded-3" >
                <div className="card shadow-sm m-4  rounded-3 border-0" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
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
                                groups={groups}
                                positions={positions}
                                users={users}
                                loading={loading}
                                error={error}
                                onEdit={openEditModal}
                                onDelete={handleDeleteGroup}
                                getPositionName={getPositionName}
                                getAdminName={getAdminName}
                                isAdmin={isAdmin}
                                contents={contents}
                            />
                        </>
                    ) : (
                        <>
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <button
                                        className="btn btn-sm d-flex align-items-center gap-2"
                                        onClick={() => setShowForm(false)}
                                        style={{
                                            backgroundColor: "#0076EA",
                                            color: "#ffffff",
                                            border: "none",
                                            borderRadius: "12px",
                                        }}
                                    >
                                        <ArrowLeft size={24} />
                                    </button>
                                    <h2 className="h5 mb-0 fw-semibold" style={{ fontSize: "24px" }}>
                                        Create New Group
                                    </h2>
                                </div>

                                <div className="row justify-content-center">
                                    <div className="col-lg-7">
                                        <div className="bg-white ps-5 border-0 p-4 align-items-center justify-content-center" style={{ border: "2px solid #E9ECEF" }}>
                                            <div className="mb-4">
                                                <label className="form-label fw-semibold" style={{ color: "#010101", fontSize: "16px" }}>
                                                    Group Name <span style={{ color: "#FF0000" }}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control rounded-3"
                                                    name="group_name"
                                                    value={formData.group_name || ''}
                                                    onChange={handleFormChange}
                                                    placeholder="Enter group name"
                                                    style={{
                                                        border: "2px solid #E9ECEF",
                                                        fontSize: "16px",
                                                        width: "70%",
                                                    }}
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold" style={{ color: "#010101", fontSize: "16px" }}>
                                                    Position <span style={{ color: "#FF0000" }}>*</span>
                                                </label>
                                                <select
                                                    className="form-select rounded-3"
                                                    name="position_id"
                                                    value={formData.position_id || ''}
                                                    onChange={handleFormChange}
                                                    style={{
                                                        border: "2px solid #E9ECEF",
                                                        fontSize: "16px",
                                                        width: "70%",
                                                    }}
                                                >
                                                    <option value="">Select a position</option>
                                                    {positions.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.name || p.position_name || p.title || `Position ${p.id}`}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold" style={{ color: "#010101", fontSize: "16px" }}>
                                                    Group Content
                                                </label>
                                                <select
                                                    className="form-select rounded-3"
                                                    name="group_content_id"
                                                    value={formData.group_content_id || ''}
                                                    onChange={handleFormChange}
                                                    style={{
                                                        border: "2px solid #E9ECEF",
                                                        fontSize: "16px",
                                                        width: "70%",
                                                    }}
                                                >
                                                    <option value="">Select group content (optional)</option>
                                                    {contents.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.content_name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="align-items-center
                                            justify-content-center">
                                                <button
                                                    type="button"
                                                    className="btn rounded-3 px-5 py-2"
                                                    onClick={handleCreateGroup}
                                                    style={{
                                                        background: " #0076EA",
                                                        marginLeft: "6rem",
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

            {showEditModal && (
                <GroupModalComponent
                    mode={modalMode}
                    formData={formData}
                    setFormData={setFormData}
                    positions={positions}
                    contents={contents}
                    onSave={modalMode === 'create' ? handleCreateGroup : handleUpdateGroup}
                    onClose={() => setShowEditModal(false)}
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
