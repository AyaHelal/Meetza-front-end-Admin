import { useState, useEffect, useCallback } from "react";
import api from "../../../../utils/api";

export const useGroupMembershipData = () => {
  const [memberships, setMemberships] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🟩 Fetch memberships
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/group-membership");
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
      console.log("Fetched memberships:", payload);
      const normalized = payload.map((m) => ({
        id: m.id || `${m.group_id}-${m.email}`,
        group_id: m.group_id,
        name: m.name || m.member_name || "N/A",
        email: m.email || m.member_email || "N/A",
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

  // ➕ Create membership
  const createMembership = async (group_id, member_email) => {
    try {
      const res = await api.post("/group-membership", { group_id, email: member_email });
      await fetchData();
      return res.data;
    } catch (err) {
      console.error("Create error:", err);
      throw err;
    }
  };

  // ✏️ Update membership
  const updateMembership = async (id, group_id, member_email) => {
    try {
      const res = await api.put(`/group-membership/${id}`, { group_id, email: member_email });
      await fetchData();
      return res.data;
    } catch (err) {
      console.error("Update error:", err);
      throw err;
    }
  };

  // 🗑️ Delete membership
  const deleteMembership = async (id) => {
    try {
      await api.delete(`/group-membership/${id}`);
      setMemberships((prev) => prev.filter((m) => m.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Delete error:", err);
      return { success: false, message: err.message };
    }
  };

  // 🔍 Search memberships
  const searchMemberships = async (query) => {
    try {
      const res = await api.get(`/group-membership?search=${query}`);
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const normalized = payload.map((m) => ({
        id: m.id || `${m.group_id}-${m.email}`,
        group_id: m.group_id,
        member_name: m.name || m.member_name || "N/A",
        member_email: m.email || m.member_email || "N/A",
      }));
      setMemberships(normalized);
    } catch (err) {
      console.error("Search error:", err);
      throw err;
    }
  };

  useEffect(() => {
    fetchData();
    fetchGroups();
  }, [fetchData, fetchGroups]);

  return {
    memberships,
    groups,
    loading,
    error,
    createMembership,
    updateMembership,
    deleteMembership,
    searchMemberships,
    fetchData,
  };
};