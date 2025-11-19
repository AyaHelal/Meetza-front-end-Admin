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

      const normalized = payload.map((m) => ({
      id: m.id,
      group_id: m.group_id || m.groupId,
      member_id: String(m.member_id || m.memberId || m.user_id || m.userId || ""),
      member_name: m.member?.name || m.user?.name || m.member_name || null,
      group_name: m.group?.name || m.group?.group_name || m.group_name || null,
      createdAt: m.createdAt || m.created_at,
    }));


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
  const fetchMembers = useCallback(async () => {
    try {
      let payload = [];

      // Try member endpoint first
      try {
        const memberRes = await api.get("/member");
        payload = Array.isArray(memberRes.data) ? memberRes.data : memberRes.data?.data || [];
      } catch (memberError) {
        // Fallback to user endpoint
        const userRes = await api.get("/user");
        payload = Array.isArray(userRes.data) ? userRes.data : userRes.data?.data || [];
      }
      // i want to show the email

      const normalized = payload.map((u) => {
      const uid = u.user_id ?? u.id ?? u.userId ?? null;

      return {
        id: uid,
        user_id: String(uid),
        name: u.name ?? u.fullName ?? u.full_name ?? u.member_name ?? u.email?.split('@')[0] ?? "",
        email: u.email ?? u.user_email ?? u.email_address ?? "",
        avatarUrl: u.avatarUrl || u.avatar_url || null,
        raw: u,
      };
    });


      setUsers(normalized);
    } catch (err) {
      console.error("Failed to fetch members:", err);
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
      await api.delete(`/group-membership/${id}`);
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
    fetchMembers();
  }, [fetchData, fetchGroups, fetchMembers]);

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

