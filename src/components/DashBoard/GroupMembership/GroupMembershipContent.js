
// GroupMembershipContent.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useGroupMembershipData } from "./hooks/useGroupMembershipData";
import { GroupMembershipHeader } from "./components/GroupMembershipHeader";
import { GroupMembershipTable } from "./components/GroupMembershipTable";
import { SearchBar } from "../shared/SearchBar";
import { PlusCircle } from "phosphor-react";
import Select from 'react-select';
import "../User/UserMainComponent.css";
import { ArrowLeft } from "phosphor-react";
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

    console.log("GroupMembershipContent - currentUser:", currentUser);
    console.log("GroupMembershipContent - currentUser.id:", currentUser?.id);
    console.log("GroupMembershipContent - currentUser keys:", Object.keys(currentUser || {}));
    console.log("GroupMembershipContent - groups from hook:", groups);

    // Filter groups based on user role (same logic as useGroupData.js)
    const isSuperAdmin = (currentUser?.role || "").toLowerCase() === "super_admin";
    const isAdministrator = (currentUser?.role || "").toLowerCase() === "administrator";

    let visibleGroups = groups;

    if (isAdministrator && !isSuperAdmin) {
        // Administrator can only see groups they created (where admin_id matches their user ID)
        visibleGroups = groups.filter(g =>
            g.admin_id === currentUser?.id ||
            g.adminId === currentUser?.id ||
            g.administrator_id === currentUser?.id ||
            g.user_id === currentUser?.id ||
            g.admin?.id === currentUser?.id
        );
    }
    // Super_Admin sees all groups (no filtering)


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
        if (!formData.group_id || !formData.member_email) {
            toast.error("Please select a group and enter a member email");
            return;
        }

        try {
            // Find the member by email to get their user_id from member table
            const selectedMember = users.find((m) =>
                m.email && m.email.trim().toLowerCase() === formData.member_email.trim().toLowerCase()
            );

            if (!selectedMember) {
                toast.error("Member with this email not found. Please check the email address.");
                return;
            }

            // Use user_id from member table (required by foreign key constraint)
            const memberId = selectedMember.user_id || selectedMember.id;

            await createMembership(formData.group_id, memberId);
            toast.success("Group membership created successfully");
            setShowForm(false);
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || "Failed to create group membership";
            toast.error(msg);
        }
    };

    const handleDeleteMembership = async (id) => {
        // Note: Confirm dialog is already shown in the row component
        try {
            const res = await deleteMembership(id);
            if (res.success) {
                toast.success("Group membership deleted successfully");
            } else {
                toast.error(res.message || "Failed to delete group membership");
            }
        } catch (error) {
            console.error("Delete error:", error);
            const errorMsg = error?.response?.data?.message || error.message || "Error deleting membership";
            toast.error(errorMsg);
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
                <div className="card shadow-sm m-4 rounded-3 border-0" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    {!showForm ? (
                        <>
                            <div className="card-body p-3 mb-4 d-flex justify-content-between align-items-center">
                                <h2 className="h5 mb-0 fw-semibold" style={{ fontSize: "24px" }}>Group Membership Management</h2>
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
                                        <span className="fw-semibold">Create Membership</span>
                                    </button>
                                    <SearchBar
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        placeholder="Search by group ID..."
                                    />
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
                                    <h2 className="h5 mb-0 fw-semibold" style={{ fontSize: "24px" }}>
                                        Create New Group Membership
                                    </h2>
                                </div>

                                <div className="row justify-content-center">
                                    <div className="col-lg-7">
                                        <div className="bg-white ps-5 border-0 p-4 align-items-center justify-content-center" style={{ border: "2px solid #E9ECEF", paddingLeft: "3.7rem !important" }}>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold" style={{ color: "#010101", fontSize: "16px" }}>
                                                    Group <span style={{ color: "#FF0000" }}>*</span>
                                                </label>
                                                <div style={{ width: '70%' }}>
                                                    <Select
                                                        options={visibleGroups.map(g => ({ value: g.id, label: g.name || g.group_name || `Group ${g.id}` }))}
                                                        value={formData.group_id ? { value: formData.group_id, label: groups.find(g => g.id === formData.group_id)?.name || groups.find(g => g.id === formData.group_id)?.group_name || `Group ${formData.group_id}` } : null}
                                                        onChange={(opt) => setFormData({ ...formData, group_id: opt?.value ?? '' })}
                                                        placeholder="Select a group"
                                                        menuPortalTarget={document.body}
                                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                        isClearable
                                                    />
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold" style={{ color: "#010101", fontSize: "16px" }}>
                                                    Member Email <span style={{ color: "#FF0000" }}>*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    className="form-control rounded-3"
                                                    name="member_email"
                                                    value={formData.member_email}
                                                    onChange={handleFormChange}
                                                    placeholder="Enter member email address"
                                                    style={{
                                                        border: "2px solid #E9ECEF",
                                                        fontSize: "16px",
                                                        width: "70%",
                                                    }}
                                                />
                                            </div>

                                            <div className=" align-items-center
                                            justify-content-center">

                                                <button
                                                    type="button"
                                                    className="btn rounded-3  px-4 py-2"
                                                    onClick={handleCreateMembership}
                                                    style={{
                                                        background: " #0076EA",
                                                        marginLeft: "6rem",
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
        </main>
    );
};

export default GroupMembershipContent;
