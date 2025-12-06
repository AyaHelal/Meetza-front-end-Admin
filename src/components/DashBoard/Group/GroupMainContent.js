// GroupMainContent.jsx
import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { useGroupData } from "./hooks/useGroupData";
import useGroupContentData from "../GroupContent/hooks/useGroupContentData";
import { GroupHeader } from "./components/GroupHeader";
import { GroupTable } from "./components/GroupTable";
import { SearchBar } from "../shared/SearchBar";
import GroupModalComponent from "./GroupModalComponent";
import GroupDetails from "./GroupDetails";
import { PlusCircle, ArrowLeft } from "phosphor-react";
import Select from 'react-select';
import "./GroupMainComponent.css";
import api from "../../../utils/api";

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

    const { contents: allContents = [] } = useGroupContentData();

    const positionOptions = positions.map(p => ({
        value: p.id,
        label: p.name || p.position_name || p.title || `Position ${p.id}`
    }));

    // Filter contents to only show unassigned ones (group_id is null) or the one already assigned to the current group
    // In GroupMainContent.js
    const getAvailableContents = useMemo(() => {
        return (currentGroupId) => {
            const assignedContentIds = new Set(
                groups
                    .filter(g => g.group_content_id && g.id !== currentGroupId) // exclude current group
                    .map(g => g.group_content_id)
            );

            const currentGroup = groups.find(g => g.id === currentGroupId);
            const currentContentId = currentGroup?.group_content_id;

            return allContents.filter(content =>
                (!assignedContentIds.has(content.id)) &&
                (content.group_id === null || content.id === currentContentId)
            );
        };
    }, [groups, allContents]);


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
        setFormData({ group_name: "", position_id: "", year: "", semester: "", group_content_id: null, description: "", group_photo: null });
        setSelectedGroup(null);
        setShowForm(true);
    };

    const openEditModal = (group) => {
        setModalMode("edit");
        setFormData({
            name: group.name,
            group_content_id: group.group_content_id ?? null,
            description: group.description || '',
            group_photo: null
        });
        setSelectedGroup({
            ...group,
            position_id: group.position_id || group.positionId
        });
        setShowEditModal(true);
    };


    // Handle content change - just update formData (actual save happens on Save button)
    const handleContentChange = (e) => {
        const { name, value, type, files } = e.target;

        let newValue;
        if (type === 'file') {
            newValue = (files && files.length > 0) ? files[0] : null;
        } else {
            newValue = value === "" ? null : type === "number" ? Number(value) : value;
        }

        setFormData({
            ...formData,
            [name]: newValue
        });
    };

    const handleCreateGroup = async () => {
        if (!formData.group_name || !formData.position_id || !formData.year || !formData.semester || !formData.group_content_name) {
            toast.error("Please fill all required fields: group name, position, year, semester and content name");
            return;
        }

        try {
            await createGroup(
                formData.group_name,
                formData.position_id,
                formData.year,
                formData.semester,
                formData.group_content_name,
                formData.content_description ?? undefined,
                // description (may be undefined or empty string)
                formData.description ?? undefined,
                // poster file (File object or undefined/null)
                formData.group_photo ?? undefined
            );
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
    console.log("Form Data:", formData);
    console.log("Selected Group:", selectedGroup);

    const payload = {
            group_name: formData.name,
            position_id: selectedGroup.position_id
        };
        console.log("Payload sent:", payload);

        try {
            // ensure we send explicit null when the user cleared the group content
            const contentIdToSend = formData.group_content_id === undefined ? undefined : formData.group_content_id === null ? null : formData.group_content_id;
            console.log("Content ID to send:", contentIdToSend);
            console.log("Calling updateGroup with:", {
                id: groupId,
                group_name: formData.name,
                position_id: selectedGroup.position_id,
                group_content_id: contentIdToSend
            });

            const res = await updateGroup(groupId, formData.name, selectedGroup.position_id, contentIdToSend, formData.description ?? undefined, formData.group_photo ?? undefined);
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
                                        disabled={showForm}
                                        style={{
                                            background: "linear-gradient(to right, #0076EA, #00DC85)",
                                            color: "white",
                                            fontSize: "16px",
                                            padding: "0.75rem 1.5rem",
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
                                currentUser={currentUser}
                                contents={allContents}
                            />
                        </>
                    ) : (
                        <>
                            <div className="card-body p-4 form-scroll-container" style={{ overflowY: 'auto' }}>
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
                                        <div className="bg-white ps-5 border-0 p-4 align-items-center justify-content-center " style={{ border: "2px solid #E9ECEF" }}>
                                            <div className="mb-4">
                                                <label className="form-label fw-semibold" style={{ color: "#010101", fontSize: "16px" }}>
                                                    Group Name <span style={{ color: "#FF0000" }}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control rounded-3"
                                                    name="group_name"
                                                    value={formData.group_name || ''}
                                                    onChange={handleContentChange}
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
                                                <div style={{ width: '70%' }} className="rounded-3">

                                                    <Select
                                                        className="rounded-3"
                                                        options={positionOptions}
                                                        value={positionOptions.find(opt => String(opt.value) === String(formData.position_id)) || null}
                                                        onChange={(opt) => setFormData({ ...formData, position_id: opt?.value ?? '' })}
                                                        placeholder="Select a position"
                                                        menuPortalTarget={document.body}
                                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <div style={{ minWidth: 200 }} className="mb-4">
                                                    <label className="form-label fw-semibold" style={{ color: "#010101", fontSize: "16px" }}>
                                                        Year <span style={{ color: "#FF0000" }}>*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="form-control rounded-3"
                                                        name="year"
                                                        min={1}
                                                        value={formData.year || ''}
                                                        onChange={handleContentChange}
                                                        placeholder="Enter year"
                                                        style={{
                                                            border: "2px solid #E9ECEF",
                                                            fontSize: "16px",
                                                            width: "70%",
                                                        }}
                                                    />
                                                </div>

                                                <div style={{ minWidth: 200 }}>
                                                    <label className="form-label fw-semibold" style={{ color: "#010101", fontSize: "16px" }}>
                                                        Semester <span style={{ color: "#FF0000" }}>*</span>
                                                    </label>
                                                    <div style={{ width: '70%' }}>
                                                        <Select
                                                            options={[{ value: 'Fall', label: 'Fall' }, { value: 'Spring', label: 'Spring' }, { value: 'Summer', label: 'Summer' }]}
                                                            value={formData.semester ? { value: formData.semester, label: formData.semester } : null}
                                                            onChange={(opt) => setFormData({ ...formData, semester: opt?.value ?? '' })}
                                                            placeholder="Select semester"
                                                            menuPortalTarget={document.body}
                                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold" style={{ color: "#010101", fontSize: "16px" }}>
                                                    Content Name <span style={{ color: "#FF0000" }}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control rounded-3"
                                                    name="group_content_name"
                                                    value={formData.group_content_name || ''}
                                                    onChange={handleContentChange}
                                                    placeholder="Enter content name"
                                                    style={{
                                                        border: "2px solid #E9ECEF",
                                                        fontSize: "16px",
                                                        width: "70%",
                                                    }}
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold" style={{ color: "#010101", fontSize: "16px" }}>
                                                    Content Description
                                                </label>
                                                <textarea
                                                    className="form-control rounded-3"
                                                    name="content_description"
                                                    value={formData.content_description || ''}
                                                    onChange={handleContentChange}
                                                    placeholder="Enter content description (optional)"
                                                    style={{
                                                        border: "2px solid #E9ECEF",
                                                        fontSize: "16px",
                                                        width: "70%",
                                                        minHeight: 90,
                                                    }}
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold" style={{ color: "#010101", fontSize: "16px" }}>
                                                    Description
                                                </label>
                                                <textarea
                                                    className="form-control rounded-3"
                                                    name="description"
                                                    value={formData.description || ''}
                                                    onChange={handleContentChange}
                                                    placeholder="Enter group description (optional)"
                                                    style={{
                                                        border: "2px solid #E9ECEF",
                                                        fontSize: "16px",
                                                        width: "70%",
                                                        minHeight: 90,
                                                    }}
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold" style={{ color: "#010101", fontSize: "16px" }}>
                                                    Poster (upload image)
                                                </label>
                                                <div style={{ width: '70%' }}>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="form-control"
                                                        name="group_photo"
                                                        onChange={handleContentChange}
                                                    />
                                                    {formData.group_photo && (
                                                        <div style={{ marginTop: 8 }}>
                                                            <small>Selected file: {formData.group_photo.name}</small>
                                                        </div>
                                                    )}
                                                </div>
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
                    contents={getAvailableContents(selectedGroup?.id)}
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
