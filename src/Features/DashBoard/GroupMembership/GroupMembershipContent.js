
// GroupMembershipContent.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useGroupMembershipData } from "./hooks/useGroupMembershipData";
import { GroupMembershipHeader } from "./components/GroupMembershipHeader";
import { GroupMembershipTable } from "./components/GroupMembershipTable";
import { SearchBar } from "../shared/SearchBar";
import { ConfirmDeleteModal } from "../shared/ConfirmDeleteModal";
import { PlusCircle } from "phosphor-react";
import Select from 'react-select';
import "../User/UserMainComponent.css";
import { ArrowLeft } from "phosphor-react";
import api from "../../../utils/api";

const GroupMembershipContent = ({ currentUser }) => {
    const isAdmin = (currentUser?.role || "").toLowerCase() === "administrator" || (currentUser?.role || "").toLowerCase() === "super_admin";

    const {
        memberships,
        groups,
        users,
        loading,
        error,
        createMembership,
        deleteMembership,
        searchMemberships,
        fetchData,
    } = useGroupMembershipData(currentUser);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ group_id: "", member_email: "" });
    const [searchQuery, setSearchQuery] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [membershipToDelete, setMembershipToDelete] = useState(null);

    // Filter groups based on user role (same logic as useGroupData.js)
    const openCreateForm = () => {
        setFormData({ group_id: "", member_email: "" });
        setShowForm(true);
    };

    // form changes are handled directly by modal via setFormData
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCreateMembership = async () => {
        if (!formData.group_id || !formData.member_email?.trim()) {
            toast.error("Please select a group and enter a member email");
            return;
        }

        try {
            const email = formData.member_email.trim();
            const response = await api.get(`/user/email/${encodeURIComponent(email)}`);
            const raw = response?.data;
            const userData = raw?.data ?? raw;

            if (!userData?.id) {
                toast.error("User with this email not found. Please check the email address.");
                return;
            }

            if ((userData.role || "").toLowerCase() !== "member") {
                toast.error("This user is not a Member. Only users with role Member can be added to groups.");
                return;
            }

            await createMembership(formData.group_id, userData.id);
            toast.success("Group membership created successfully");
            setShowForm(false);
            setFormData({ group_id: "", member_email: "" });
        } catch (error) {
            if (error?.response?.status === 404) {
                toast.error("User with this email not found. Please check the email address.");
            } else {
                const msg = error?.response?.data?.message || error.message || "Failed to create group membership";
                toast.error(msg);
            }
        }
    };

    const handleDeleteMembership = (id) => {
        setMembershipToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDeleteMembership = async () => {
        if (!membershipToDelete) return;
        try {
            const res = await deleteMembership(membershipToDelete);
            setShowDeleteModal(false);
            setMembershipToDelete(null);
            if (res.success) {
                toast.success("Group membership deleted successfully");
            } else {
                toast.error(res.message || "Failed to delete group membership");
            }
        } catch (error) {
            console.error("Delete error:", error);
            const errorMsg = error?.response?.data?.message || error.message || "Error deleting membership";
            toast.error(errorMsg);
            setShowDeleteModal(false);
            setMembershipToDelete(null);
        }
    };

    const handleSearchChange = (query) => {
        setSearchQuery(query);
        if (query.trim() === "") {
            fetchData();
        } else {
            searchMemberships(query).catch((err) => {
                toast.error(err?.response?.data?.message || "Failed to search memberships");
            });
        }
    };
    const getMemberName = (memberId, memberName = null) => {
        // If member_name is already provided from the API response, use it
        if (memberName) return memberName;

        // Otherwise, try to find in users array
        const user = users.find(u => u.user_id === memberId || u.id === memberId);
        return user?.name || user?.email || `User ${memberId}`;
    };

    const getMemberEmail = (memberId, memberEmail = null) => {
        // If member_email is already provided from the API response, use it
        if (memberEmail) return memberEmail;

        // Otherwise, try to find in users array
        const user = users.find(u => u.user_id === memberId || u.id === memberId);
        return user?.email || "N/A";
    };


    // Helper function to get group name by ID
    const getGroupName = (groupId, groupName = null) => {
        if (groupName) return groupName;
        if (!groupId) return "N/A";
        const group = groups.find((g) => g.id === groupId || g.id === String(groupId));
        return group?.name || group?.group_name || `Group ${groupId}`;
    };



    return (
        <main className="flex-fill">
            <GroupMembershipHeader currentUser={currentUser} />

            <div className=" rounded-3" >
                <div className="card shadow-sm m-4 rounded-3 border-0 branded-card-bg" style={{ color: 'var(--text-primary)' }}>
                    {!showForm ? (
                        <>
                            <div className="card-body p-3 mb-4 position-header">
                                <h2 className="h4 mb-0 fw-semibold position-header-title">Group Membership Management</h2>
                                <div className="position-header-actions">
                                    <button
                                        type="button"
                                        className="btn rounded-4 d-flex align-items-center gap-2 position-header-btn"
                                        onClick={openCreateForm}
                                    >
                                        <PlusCircle size={20} weight="bold" />
                                        <span className="fw-semibold">Create Membership</span>
                                    </button>
                                    <div className="position-header-search">
                                        <SearchBar
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            placeholder="Search by group..."
                                            className="w-100"
                                        />
                                    </div>
                                </div>
                            </div>

                            <GroupMembershipTable
                                memberships={memberships}
                                groups={groups}
                                users={users}
                                loading={loading}
                                error={error}
                                onDelete={handleDeleteMembership}
                                getGroupName={getGroupName}
                                getMemberName={getMemberName}
                                getMemberEmail={getMemberEmail}
                                isAdmin={isAdmin}
                            />
                        </>
                    ) : (
                        <>
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center gap-3 mb-4">
                                    <button
                                        type="button"
                                        className="btn btn-sm d-flex align-items-center gap-2 p-2"
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
                                    <h2 className="h5 mb-0 fw-semibold create-membership-form__title" style={{ fontSize: "24px" }}>
                                        Create New Group Membership
                                    </h2>
                                </div>

                                <div className="row justify-content-center">
                                    <div className="col-lg-7">
                                        <div className="create-membership-form border-0 p-4" style={{ backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)', border: "1px solid var(--border-color)" }}>
                                            <div className="mb-4">
                                                <label className="form-label fw-semibold create-membership-form__label">
                                                    Group <span style={{ color: "#FF0000" }}>*</span>
                                                </label>
                                                <div className="create-membership-form__field">
                                                    <Select
                                                        options={groups.map((g) => ({
                                                            value: g.id,
                                                            label: g.name || g.group_name || `Group ${g.id}`,
                                                        }))}
                                                        value={
                                                            formData.group_id
                                                                ? (() => {
                                                                      const g = groups.find(
                                                                          (x) =>
                                                                              String(x.id) ===
                                                                              String(formData.group_id)
                                                                      );
                                                                      return g
                                                                          ? {
                                                                                value: g.id,
                                                                                label:
                                                                                    g.name ||
                                                                                    g.group_name ||
                                                                                    `Group ${g.id}`,
                                                                            }
                                                                          : null;
                                                                  })()
                                                                : null
                                                        }
                                                        onChange={(opt) => setFormData({ ...formData, group_id: opt?.value ?? '' })}
                                                        placeholder="Select a group"
                                                        menuPortalTarget={document.body}
                                                        styles={{ 
                                                            menuPortal: base => ({ ...base, zIndex: 9999 }),
                                                            control: (base) => ({ ...base, backgroundColor: 'transparent', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }),
                                                            menu: (base) => ({ ...base, backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)', zIndex: 9999 }),
                                                            option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? 'var(--bg-light)' : 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }),
                                                            singleValue: (base) => ({ ...base, color: 'var(--text-primary)' }),
                                                            input: (base) => ({ ...base, color: 'var(--text-primary)' })
                                                        }}
                                                        isClearable
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold create-membership-form__label">
                                                    Member Email <span style={{ color: "#FF0000" }}>*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    className="form-control rounded-3 create-membership-form__input"
                                                    name="member_email"
                                                    value={formData.member_email}
                                                    onChange={handleFormChange}
                                                    placeholder="Enter member email address"
                                                    style={{ border: "1px solid var(--border-color)", padding: "0.75rem", fontSize: "16px", backgroundColor: 'transparent', color: 'var(--text-primary)' }}
                                                />
                                            </div>

                                            <div className="create-membership-form__actions">
                                                <button
                                                    type="button"
                                                    className="btn rounded-3 px-4 py-2 create-membership-form__submit"
                                                    onClick={handleCreateMembership}
                                                    style={{
                                                        background: "#0076EA",
                                                        color: "white",
                                                        border: "none",
                                                        fontSize: "16px",
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    Create Membership
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

            <ConfirmDeleteModal
                show={showDeleteModal}
                onClose={() => { setShowDeleteModal(false); setMembershipToDelete(null); }}
                onConfirm={confirmDeleteMembership}
                title="Delete Group Membership"
                message="Are you sure you want to remove this member from the group? This action cannot be undone."
            />
        </main>
    );
};

export default GroupMembershipContent;
