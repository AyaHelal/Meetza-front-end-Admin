// GroupMembershipContent.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useGroupMembershipData } from "./hooks/useGroupMembershipData";
import { GroupMembershipHeader } from "./components/GroupMembershipHeader";
import { GroupMembershipTable } from "./components/GroupMembershipTable";
import { SearchBar } from "../Position/components/SearchBar";
import { PlusCircle, ArrowLeft } from "phosphor-react";
import "../User/UserMainComponent.css";

const GroupMembershipContent = ({ currentUser }) => {
    const isAdmin = (currentUser?.role || "").toLowerCase() === "administrator";

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
    } = useGroupMembershipData();

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ group_id: "", member_email: "" });
    const [searchQuery, setSearchQuery] = useState("");

    const openCreateForm = () => {
        setFormData({ group_id: "", member_email: "" });
        setShowForm(true);
    };

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

            await createMembership(formData.group_id, memberId);
            setShowForm(false);
            toast.success("Group membership created successfully");
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

    // Helper function to get member name by ID
    const getMemberName = (memberId, memberName = null) => {
        if (memberName) return memberName;
        if (!memberId) return "N/A";
        const user = users.find((u) =>
            u.user_id === memberId ||
            String(u.user_id) === String(memberId) ||
            u.id === memberId ||
            u.id === Number(memberId) ||
            String(u.id) === String(memberId)
        );
        return user?.name || `User ${memberId}`;
    };

    // Helper function to get group name by ID
    const getGroupName = (groupId, groupName = null) => {
        if (groupName) return groupName;
        if (!groupId) return "N/A";
        const group = groups.find((g) => g.id === groupId || g.id === String(groupId));
        return group?.name || group?.group_name || `Group ${groupId}`;
    };

    const filteredMemberships = memberships.filter((m) =>
        getGroupName(m.group_id, m.group_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getMemberName(m.member_id, m.member_name).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <main className="flex-fill">
            <GroupMembershipHeader currentUser={currentUser} />

            <div className="m-4 rounded-3" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)", height: "804px" }}>
                <div className="card shadow-sm rounded-3 border-0" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
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
                                memberships={filteredMemberships}
                                groups={groups}
                                users={users}
                                loading={loading}
                                error={error}
                                onDelete={handleDeleteMembership}
                                getGroupName={getGroupName}
                                getMemberName={getMemberName}
                                isAdmin={isAdmin}
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
                                            backgroundColor: "#F4F4F4",
                                            color: "#888888",
                                            border: "none",
                                            padding: "0.5rem 1rem",
                                            borderRadius: "12px",
                                        }}
                                    >
                                        <ArrowLeft size={20} weight="bold" />
                                        Back
                                    </button>
                                    <h2 className="h5 mb-0 fw-semibold" style={{ fontSize: "24px" }}>
                                        Create New Group Membership
                                    </h2>
                                </div>

                                <div className="row justify-content-center">
                                    <div className="col-lg-8">
                                        <div className="bg-white rounded-3 p-4" style={{ border: "2px solid #E9ECEF" }}>
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
                                                        padding: "0.75rem",
                                                        fontSize: "16px",
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
                                                        padding: "0.75rem",
                                                        fontSize: "16px",
                                                    }}
                                                />
                                            </div>

                                            <div className="d-flex gap-3 justify-content-end">
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
                                                    onClick={handleCreateMembership}
                                                    style={{
                                                        background: "linear-gradient(to right, #0076EA, #00DC85)",
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
