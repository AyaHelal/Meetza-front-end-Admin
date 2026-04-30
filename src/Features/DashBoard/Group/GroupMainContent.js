// GroupMainContent.jsx
import React, { useState, useMemo } from "react";
import { toast } from "react-toastify";
import { useGroupData } from "./hooks/useGroupData";
import useGroupContentData from "../GroupContent/hooks/useGroupContentData";
import { GroupHeader } from "./components/GroupHeader";
import { GroupTable } from "./components/GroupTable";
import { SearchBar } from "../shared/SearchBar";
import GroupModalComponent from "./components/GroupModalComponent";
import GroupDetails from "./components/GroupDetails";
import { ConfirmDeleteModal } from "../shared/ConfirmDeleteModal";
import { PlusCircle, ArrowLeft } from "phosphor-react";
import Select from 'react-select';
import "./CSS/GroupMainComponent.css";
import api from "../../../utils/api";
import AssignGroupAdminModal from "./components/AssignGroupAdminModal";
import RemoveGroupAdminModal from "./components/RemoveGroupAdminModal";
import { parseEmailsInput } from "./parseEmailsInput";

const GroupMainContent = ({ currentUser }) => {
    const isAdmin = (currentUser?.role || "").toLowerCase() === "administrator" || (currentUser?.role || "").toLowerCase() === "super_admin";
    const isSuperAdmin = currentUser?.role === "Super_Admin";

    const {
        groups,
        users,
        loading,
        error,
        createGroup,
        updateGroup,
        deleteGroup,
        searchGroups,
        fetchData,
    } = useGroupData();

    const { contents: allContents = [], fetchContents } = useGroupContentData();

    const adminUserOptions = useMemo(() => {
        const byId = new Map();
        for (const u of users) {
            const r = String(u.role || u.Role || "").trim();
            if (r !== "Administrator" && r.toLowerCase() !== "administrator") continue;
            if (u?.id == null) continue;
            const k = String(u.id);
            if (byId.has(k)) continue;
            byId.set(k, {
                value: u.id,
                label: `${u.name || u.email || "User"}${u.email ? ` (${u.email})` : ""}`,
            });
        }
        return Array.from(byId.values());
    }, [users]);

    const [selectedGroup, setSelectedGroup] = useState(null);
    const [formData, setFormData] = useState({});
    const [showForm, setShowForm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [showGroupDetails, setShowGroupDetails] = useState(false);
    const [groupDetailsData] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [groupToDelete, setGroupToDelete] = useState(null);
    const [showAssignAdminModal, setShowAssignAdminModal] = useState(false);
    const [assignTargetGroup, setAssignTargetGroup] = useState(null);
    const [assignAdminForm, setAssignAdminForm] = useState({ emailsText: "", role: "" });
    const [assigningAdmin, setAssigningAdmin] = useState(false);
    const [showRemoveAdminModal, setShowRemoveAdminModal] = useState(false);
    const [removeTargetGroup, setRemoveTargetGroup] = useState(null);
    const [removeAdminForm, setRemoveAdminForm] = useState({ emailsText: "" });
    const [removingAdmin, setRemovingAdmin] = useState(false);

    const openCreateForm = () => {
        setModalMode("create");
        setFormData({
            group_name: "",
            year: "",
            semester: "",
            group_content_id: null,
            description: "",
            group_photo: null,
            admin_ids: [],
        });
        setSelectedGroup(null);
        setShowForm(true);
    };

    const openEditModal = (group) => {
        setModalMode("edit");
        setFormData({
            name: group.name,
            year: group.year != null && group.year !== "" ? String(group.year) : "",
            semester: group.semester || "",
            description: group.description || "",
            group_photo: null,
        });
        setSelectedGroup({ ...group });
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
        if (!formData.group_name || !formData.year || !formData.semester || !formData.group_content_name) {
            toast.error("Please fill all required fields: group name, year, semester, and content name");
            return;
        }
        if (isSuperAdmin && (!Array.isArray(formData.admin_ids) || formData.admin_ids.length === 0)) {
            toast.error("Please select at least one Leader for the group");
            return;
        }

        try {
            await createGroup({
                group_name: formData.group_name,
                year: formData.year,
                semester: formData.semester,
                group_content_name: formData.group_content_name,
                group_content_description: formData.content_description ?? undefined,
                description: formData.description ?? undefined,
                group_photo: formData.group_photo ?? undefined,
                ...(isSuperAdmin ? { admin_ids: formData.admin_ids } : {}),
            });
            setShowForm(false);
            toast.success("Group created successfully");
            fetchData();
            fetchContents();
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

        try {
            await updateGroup(groupId, {
                group_name: formData.name,
                description: formData.description,
                year: formData.year,
                semester: formData.semester,
                group_photo: formData.group_photo ?? undefined,
            });
            setShowEditModal(false);
            toast.success("Group updated successfully");
            fetchData();

        } catch (error) {
            console.error("Update error:", error);
            const msg = error?.response?.data?.message || error.message || "Failed to update group";
            toast.error(msg);
        }
    };





    const handleDeleteGroup = (id) => {
        setGroupToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDeleteGroup = async () => {
        if (!groupToDelete) return;
        try {
            const res = await deleteGroup(groupToDelete);
            setShowDeleteModal(false);
            setGroupToDelete(null);
            if (res.success) {
                toast.success("Group deleted successfully");
            } else {
                toast.error(res.message || "Failed to delete group");
            }
        } catch (error) {
            toast.error("Error deleting group");
            setShowDeleteModal(false);
            setGroupToDelete(null);
        }
    };

    const handleSearchChange = (query) => {
        setSearchQuery(query);
    };

    const filteredGroups = groups.filter((group) => {
        const q = searchQuery.toLowerCase();
        return (
            (group.name && group.name.toLowerCase().includes(q)) ||
            (group.group_name && group.group_name.toLowerCase().includes(q))
        );
    });

    // Helper function to get admin name by ID
    const getAdminName = (adminId, adminName = null) => {
        if (adminName) return adminName;
        if (!adminId) return "N/A";
        const user = users.find((u) => u.id === adminId || u.id === Number(adminId) || String(u.id) === String(adminId));
        return user?.name || `User ${adminId}`;
    };

    const openAssignAdmin = (group) => {
        setAssignTargetGroup(group);
        setAssignAdminForm({ emailsText: "", role: "ADMIN" });
        setShowAssignAdminModal(true);
    };

    const closeAssignAdmin = () => {
        if (assigningAdmin) return;
        setShowAssignAdminModal(false);
        setAssignTargetGroup(null);
        setAssignAdminForm({ emailsText: "", role: "" });
    };

    const openRemoveAssignAdmin = (group) => {
        setRemoveTargetGroup(group);
        setRemoveAdminForm({ emailsText: "" });
        setShowRemoveAdminModal(true);
    };

    const resetRemoveAdminModal = () => {
        setShowRemoveAdminModal(false);
        setRemoveTargetGroup(null);
        setRemoveAdminForm({ emailsText: "" });
    };

    const closeRemoveAssignAdmin = () => {
        if (removingAdmin) return;
        resetRemoveAdminModal();
    };

    const handleRemoveAssignAdmin = async () => {
        const gid = removeTargetGroup?.id;
        const emails = parseEmailsInput(removeAdminForm.emailsText || "");

        if (!gid) {
            toast.error("Please select a group");
            return;
        }
        if (emails.length === 0) {
            toast.error("Please enter at least one email");
            return;
        }

        const body = emails.length === 1 ? { email: emails[0] } : { emails };

        try {
            setRemovingAdmin(true);
            const { data: resBody } = await api.delete(`/group/${gid}/admins`, { data: body });
            const results = Array.isArray(resBody?.data) ? resBody.data : [];
            const allOk = results.length > 0 && results.every((r) => r.success);
            const someOk = results.some((r) => r.success);

            if (allOk) {
                toast.success(resBody?.message || "Admin assignment removed");
                resetRemoveAdminModal();
                fetchData();
            } else if (someOk) {
                const failed = results.filter((r) => !r.success).map((r) => `${r.email}: ${r.message || "failed"}`).join(" · ");
                toast.warning(`${resBody?.message || "Some removals failed"}. ${failed}`);
                fetchData();
            } else {
                const failed = results.length
                    ? results.map((r) => `${r.email}: ${r.message || "failed"}`).join(" · ")
                    : resBody?.message || "Failed to remove admin";
                toast.error(failed);
            }
        } catch (error) {
            const resData = error?.response?.data;
            const errResults = Array.isArray(resData?.data) ? resData.data : [];
            if (errResults.length) {
                toast.error(errResults.map((r) => `${r.email}: ${r.message || "failed"}`).join(" · "));
            } else {
                toast.error(resData?.message || error?.message || "Failed to remove admin");
            }
        } finally {
            setRemovingAdmin(false);
        }
    };

    const handleAssignAdmin = async () => {
        const gid = assignTargetGroup?.id;
        const emails = parseEmailsInput(assignAdminForm.emailsText || "");
        const role = "ADMIN";

        if (!gid) {
            toast.error("Please select a group");
            return;
        }
        if (emails.length === 0) {
            toast.error("Please enter at least one email");
            return;
        }

        try {
            setAssigningAdmin(true);
            const body = role ? { emails, role } : { emails };
            const { data: resBody } = await api.post(`/group/${gid}/admins`, body);
            const results = Array.isArray(resBody?.data) ? resBody.data : [];
            const allOk = results.length > 0 && results.every((r) => r.success);
            const someOk = results.some((r) => r.success);

            if (allOk) {
                toast.success(resBody?.message || "All group admins added successfully");
                closeAssignAdmin();
                fetchData();
            } else if (someOk) {
                const failed = results.filter((r) => !r.success).map((r) => `${r.email}: ${r.message || "failed"}`).join(" · ");
                toast.warning(`${resBody?.message || "Some admins could not be added"}. ${failed}`);
                fetchData();
            } else {
                const failed = results.length
                    ? results.map((r) => `${r.email}: ${r.message || "failed"}`).join(" · ")
                    : resBody?.message || "Failed to assign admins";
                toast.error(failed);
            }
        } catch (error) {
            const msg = error?.response?.data?.message || error?.message || "Failed to assign admin";
            toast.error(msg);
        } finally {
            setAssigningAdmin(false);
        }
    };





    return (
        <main className="flex-fill">
            <GroupHeader currentUser={currentUser} />

            <div className="rounded-3" >
                <div className="card shadow-sm m-4  rounded-3 border-0 branded-card-bg" style={{ color: 'var(--text-primary)' }}>
                    {!showForm ? (
                        <>
                            <div className="card-body p-3 mb-4 position-header">
                                <h2 className="h4 mb-0 fw-semibold position-header-title">Group Management</h2>
                                <div className="position-header-actions">
                                    <button
                                        type="button"
                                        className="btn rounded-4 d-flex align-items-center gap-2 position-header-btn"
                                        onClick={openCreateForm}
                                        disabled={showForm}
                                    >
                                        <PlusCircle size={20} weight="bold" />
                                        <span className="fw-semibold">Create Group</span>
                                    </button>
                                    <div className="position-header-search">
                                        <SearchBar
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            placeholder="Search by name..."
                                            className="w-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <GroupTable
                                groups={filteredGroups}
                                users={users}
                                loading={loading}
                                error={error}
                                onEdit={openEditModal}
                                onDelete={handleDeleteGroup}
                                onAssignAdmin={openAssignAdmin}
                                onRemoveAssignAdmin={openRemoveAssignAdmin}
                                getAdminName={getAdminName}
                                isAdmin={isAdmin}
                                currentUser={currentUser}
                                contents={allContents}
                            />
                        </>
                    ) : (
                        <>
                            <div className="card-body p-4 form-scroll-container hide-scrollbar" style={{ overflowY: 'auto' }}>
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
                                        <div className="create-group-form border-0 p-4" style={{ backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)', border: "1px solid var(--border-color)" }}>
                                            <div className="mb-4">
                                                <label className="form-label fw-semibold create-group-form__label">
                                                    Group Name <span style={{ color: "#FF0000" }}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control rounded-3 create-group-form__input"
                                                    name="group_name"
                                                    value={formData.group_name || ''}
                                                    onChange={handleContentChange}
                                                    placeholder="Enter group name"
                                                    style={{ border: "1px solid var(--border-color)", fontSize: "16px", backgroundColor: 'var(--bg-light)', color: 'var(--text-primary)' }}
                                                />
                                            </div>

                                            {isSuperAdmin && (
                                                <div className="mb-4">
                                                    <label className="form-label fw-semibold create-group-form__label">
                                                        Group leaders <span style={{ color: "#FF383C" }}>*</span>
                                                    </label>
                                                    <div className="create-group-form__field rounded-3 dashboard-form-modal__select-wrap">
                                                        <Select
                                                            isMulti
                                                            className="rounded-3"
                                                            options={adminUserOptions}
                                                            value={adminUserOptions.filter((opt) =>
                                                                (formData.admin_ids || []).some((id) => String(id) === String(opt.value))
                                                            )}
                                                            onChange={(opts) =>
                                                                setFormData({
                                                                    ...formData,
                                                                    admin_ids: (opts || []).map((o) => o.value),
                                                                })
                                                            }
                                                            placeholder="Select Leaders…"
                                                            menuPortalTarget={document.body}
                                                            styles={{
                                                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                                control: (base) => ({ ...base, backgroundColor: 'transparent', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }),
                                                                menu: (base) => ({ ...base, backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', zIndex: 9999 }),
                                                                option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? 'var(--bg-light)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }),
                                                                singleValue: (base) => ({ ...base, color: 'var(--text-primary)' }),
                                                                multiValue: (base) => ({ ...base, backgroundColor: 'var(--bg-light)' }),
                                                                multiValueLabel: (base) => ({ ...base, color: 'var(--text-primary)' }),
                                                                input: (base) => ({ ...base, color: 'var(--text-primary)' })
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mb-4">
                                                <div className="mb-4 create-group-form__field">
                                                    <label className="form-label fw-semibold create-group-form__label">
                                                        Year <span style={{ color: "#FF0000" }}>*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        className="form-control rounded-3 create-group-form__input"
                                                        name="year"
                                                        min={1}
                                                        value={formData.year || ''}
                                                        onChange={handleContentChange}
                                                        placeholder="Enter year"
                                                        style={{ border: "1px solid var(--border-color)", fontSize: "16px", backgroundColor: 'var(--bg-light)', color: 'var(--text-primary)' }}
                                                    />
                                                </div>

                                                <div className="create-group-form__field">
                                                    <label className="form-label fw-semibold create-group-form__label">
                                                        Semester <span style={{ color: "#FF0000" }}>*</span>
                                                    </label>
                                                    <div className="create-group-form__field rounded-3">
                                                        <Select
                                                            options={[{ value: 'Fall', label: 'Fall' }, { value: 'Spring', label: 'Spring' }, { value: 'Summer', label: 'Summer' }]}
                                                            value={formData.semester ? { value: formData.semester, label: formData.semester } : null}
                                                            onChange={(opt) => setFormData({ ...formData, semester: opt?.value ?? '' })}
                                                            placeholder="Select semester"
                                                            menuPortalTarget={document.body}
                                                            styles={{
                                                                menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                                control: (base) => ({ ...base, backgroundColor: 'transparent', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }),
                                                                menu: (base) => ({ ...base, backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', zIndex: 9999 }),
                                                                option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? 'var(--bg-light)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }),
                                                                singleValue: (base) => ({ ...base, color: 'var(--text-primary)' }),
                                                                input: (base) => ({ ...base, color: 'var(--text-primary)' })
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold create-group-form__label">
                                                    Content Name <span style={{ color: "#FF0000" }}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control rounded-3 create-group-form__input"
                                                    name="group_content_name"
                                                    value={formData.group_content_name || ''}
                                                    onChange={handleContentChange}
                                                    placeholder="Enter content name"
                                                    style={{ border: "1px solid var(--border-color)", fontSize: "16px", backgroundColor: 'var(--bg-light)', color: 'var(--text-primary)' }}
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold create-group-form__label">
                                                    Content Description
                                                </label>
                                                <textarea
                                                    className="form-control rounded-3 create-group-form__input create-group-form__textarea"
                                                    name="content_description"
                                                    value={formData.content_description || ''}
                                                    onChange={handleContentChange}
                                                    placeholder="Enter content description (optional)"
                                                    style={{ border: "1px solid var(--border-color)", fontSize: "16px", minHeight: 90, backgroundColor: 'var(--bg-light)', color: 'var(--text-primary)' }}
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold create-group-form__label">
                                                    Description
                                                </label>
                                                <textarea
                                                    className="form-control rounded-3 create-group-form__input create-group-form__textarea"
                                                    name="description"
                                                    value={formData.description || ''}
                                                    onChange={handleContentChange}
                                                    placeholder="Enter group description (optional)"
                                                    style={{ border: "1px solid var(--border-color)", fontSize: "16px", minHeight: 90, backgroundColor: 'var(--bg-light)', color: 'var(--text-primary)' }}
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold create-group-form__label">
                                                    Poster (upload image)
                                                </label>
                                                <div className="create-group-form__field">
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

                                            <div className="create-group-form__actions">
                                                <button
                                                    type="button"
                                                    className="btn rounded-3 px-5 py-2 create-group-form__submit"
                                                    onClick={handleCreateGroup}
                                                    style={{
                                                        background: "#0076EA",
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

            {showAssignAdminModal && (
                <AssignGroupAdminModal
                    group={assignTargetGroup}
                    formData={assignAdminForm}
                    setFormData={setAssignAdminForm}
                    onSave={handleAssignAdmin}
                    onClose={closeAssignAdmin}
                    saving={assigningAdmin}
                />
            )}

            {showRemoveAdminModal && (
                <RemoveGroupAdminModal
                    group={removeTargetGroup}
                    formData={removeAdminForm}
                    setFormData={setRemoveAdminForm}
                    onConfirm={handleRemoveAssignAdmin}
                    onClose={closeRemoveAssignAdmin}
                    saving={removingAdmin}
                />
            )}

            <ConfirmDeleteModal
                show={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setGroupToDelete(null); }}
                onConfirm={confirmDeleteGroup}
                title="Delete Group"
                message="Are you sure you want to delete this group? This action cannot be undone."
            />
        </main>
    );
};

export default GroupMainContent;
