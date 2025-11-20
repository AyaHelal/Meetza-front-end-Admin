
// GroupMembershipContent.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useGroupMembershipData } from "./hooks/useGroupMembershipData";
import { GroupMembershipHeader } from "./components/GroupMembershipHeader";
import { GroupMembershipTable } from "./components/GroupMembershipTable";
import { SearchBar } from "../shared/SearchBar";
import { PlusCircle } from "phosphor-react";
import GroupMembershipModal from "./GroupMembershipModal";
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
        updateMembership,
        searchMemberships,
        fetchData,
    } = useGroupMembershipData();

    const [showForm, setShowForm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({ group_id: "", member_email: "" });
    const [editingMembership, setEditingMembership] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const openCreateForm = () => {
        setFormData({ group_id: "", member_email: "" });
        setShowForm(true);
    };

    const openEditForm = (membership) => {
        setEditingMembership(membership);
        const memberEmail = getMemberEmail(membership.member_id) || "";
        setFormData({
            group_id: membership.group_id || membership.groupId || "",
            member_email: memberEmail,
        });
        setShowEditModal(true);
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
                m.email && m.email.toLowerCase() === formData.member_email.toLowerCase()
            );

            if (!selectedMember) {
                toast.error("Member with this email not found. Please check the email address.");
                return;
            }

            // Use user_id from member table (required by foreign key constraint)
            const memberId = selectedMember.user_id || selectedMember.id;

            if (editingMembership) {
                // update existing membership
                await updateMembership(editingMembership.id, formData.group_id, memberId);
                toast.success("Group membership updated successfully");
                setEditingMembership(null);
                setShowEditModal(false);
            } else {
                await createMembership(formData.group_id, memberId);
                toast.success("Group membership created successfully");
            }
            setShowForm(false);
        } catch (error) {
            const msg = error?.response?.data?.message || error.message || "Failed to create group membership";
            toast.error(msg);
        }
    };

    const handleDeleteMembership = async (id) => {
        if (!window.confirm("Are you sure you want to delete this membership?")) return;
        try {
            const res = await deleteMembership(id);
            if (res.success) {
                toast.success("Group membership deleted successfully");
            } else {
                toast.error(res.message || "Failed to delete group membership");
            }
        } catch (error) {
            toast.error("Error deleting membership");
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
    const getMemberName = (membership) => membership?.name || "N/A";
    const getMemberEmail = (membership) => membership?.email || "N/A";


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
                                onEdit={openEditForm}
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
                                                <select
                                                    className="form-select rounded-3"
                                                    name="group_id"
                                                    value={formData.group_id}
                                                    onChange={handleFormChange}
                                                    style={{
                                                        border: "2px solid #E9ECEF",
                                                        fontSize: "16px",
                                                        width: "70%",
                                                    }}
                                                >
                                                    <option value="">Select a group</option>
                                                    {groups.map((group) => (
                                                        <option key={group.id} value={group.id}>
                                                            {group.name || group.group_name || `Group ${group.id}`}
                                                        </option>
                                                    ))}
                                                </select>
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

                {showEditModal && editingMembership && (
                    <GroupMembershipModal
                        mode="edit"
                        formData={formData}
                        setFormData={setFormData}
                        groups={groups}
                        onSave={handleCreateMembership}
                        onClose={() => { setShowEditModal(false); setEditingMembership(null); }}
                    />
                )}
            </div>
        </main>
    );
};

export default GroupMembershipContent;
