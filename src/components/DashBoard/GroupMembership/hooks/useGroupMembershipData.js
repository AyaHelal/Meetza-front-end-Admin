import { useState, useEffect, useCallback } from "react";
import api from "../../../../utils/api";

export const useGroupMembershipData = () => {
  const [memberships, setMemberships] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🟩 Fetch all memberships
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/group-membership");
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];

      // Handle nested structure: array of groups with members array
      let normalized = [];

      if (payload.length > 0 && payload[0].group_id && payload[0].members) {
        // New nested structure: [{ group_id, group_name, members: [{ member_id, member_name, member_email, member_photo }] }]
        payload.forEach((group) => {
          if (group.members && Array.isArray(group.members)) {
            group.members.forEach((member) => {
              normalized.push({
                // Create a composite ID from group_id and member_id for uniqueness
                id: `${group.group_id}_${member.member_id}`,
                group_id: group.group_id,
                group_name: group.group_name || null,
                member_id: String(member.member_id || ""),
                member_name: member.member_name || null,
                member_email: member.member_email || null,
                member_photo: member.member_photo || null,
                createdAt: member.createdAt || member.created_at || null,
              });
            });
          }
        });
      } else {
        // Legacy flat structure: [{ id, group_id, member_id, ... }]
        normalized = payload.map((m) => ({
          id: m.id || `${m.group_id}_${m.member_id}`,
          group_id: m.group_id || m.groupId,
          member_id: String(m.member_id || m.memberId || m.user_id || m.userId || ""),
          member_name: m.member?.name || m.user?.name || m.member_name || null,
          member_email: m.member?.email || m.user?.email || m.member_email || null,
          member_photo: m.member?.photo || m.user?.photo || m.member_photo || null,
          group_name: m.group?.name || m.group?.group_name || m.group_name || null,
          createdAt: m.createdAt || m.created_at,
        }));
      }

      setMemberships(normalized);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load memberships");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🟩 Fetch groups
  const fetchGroups = useCallback(async () => {
    try {
      const res = await api.get("/group");
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setGroups(payload);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  }, []);

  // 🟩 Fetch members (from member endpoint or user endpoint)
  const fetchUsers = useCallback(async () => {
    try {

      const res = await api.get("/user");
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setUsers(payload);

    } catch (err) {

      console.error("Failed to fetch users:", err);

    }
  }, []);


  // ➕ Create new membership
  const createMembership = async (group_id, member_id) => {
    try {
      const res = await api.post("/group-membership", {
        group_id,
        member_id,
      });

      const newMembership = res.data;
      await fetchData();
      return newMembership;
    } catch (e) {
      console.error("Create error:", e);
      throw e;
    }
  };

  // 🗑️ Delete membership
  const deleteMembership = async (id) => {
    if (!window.confirm("Are you sure you want to delete this member from group?")) return;
    try {
      // If ID is composite (group_id_member_id), we may need to extract parts
      // or the backend might accept the composite ID or require separate params
      // For now, try the ID as-is, but you may need to adjust based on your backend API
      const membership = memberships.find((m) => m.id === id);
      if (!membership) {
        return { success: false, message: "Membership not found" };
      }

      // Try delete by composite ID or use group_id and member_id separately
      // Adjust this based on your actual backend endpoint
      try {
        await api.delete(`/group-membership/${id}`);
      } catch (deleteError) {
        // If composite ID doesn't work, try with query params
        if (deleteError.response?.status === 404 || deleteError.response?.status === 400) {
          await api.delete(`/group-membership`, {
            params: {
              group_id: membership.group_id,
              member_id: membership.member_id,
            },
          });
        } else {
          throw deleteError;
        }
      }

      setMemberships((prev) => prev.filter((m) => m.id !== id));
      return { success: true };
    } catch (e) {
      console.error("Delete error:", e);
      return { success: false, message: e.message };
    }
  };

  // ✏️ Update membership
  const updateMembership = async (id, group_id, member_id) => {
    try {
      const res = await api.patch(`/group-membership/${id}`, {
        group_id,
        member_id,
      });
      // Refresh list
      await fetchData();
      return res.data;
    } catch (e) {
      console.error("Update error:", e);
      throw e;
    }
  };

  // 🔍 Search memberships
  const searchMemberships = async (query) => {
    try {
      const res = await api.get(`/group?name=${query}`, {
        params: { group_id: query },
      });
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const normalized = payload.map((m) => ({
        id: m.id,
        group_id: m.group_id || m.groupId,
        member_id: m.member_id || m.memberId || m.user_id || m.userId || null,
        member_name: m.member?.name || m.user?.name || m.member_name || null,
        group_name: m.group?.name || m.group?.group_name || m.group_name || null,
        createdAt: m.createdAt || m.created_at,
      }));
      setMemberships(normalized);
    } catch (e) {
      console.error("Search error:", e);
      throw e;
    }
  };

  useEffect(() => {
    fetchData();
    fetchGroups();
    fetchUsers();
  }, [fetchData, fetchGroups, fetchUsers]);

  return {
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
  };
};
