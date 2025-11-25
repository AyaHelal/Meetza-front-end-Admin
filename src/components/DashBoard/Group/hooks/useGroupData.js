import { useState, useEffect, useCallback } from "react";
import api from "../../../../utils/api";

export const useGroupData = () => {
  const [groups, setGroups] = useState([]);
  const [positions, setPositions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🟩 Fetch all groups
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/group");
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];

      // Get saved group content map from localStorage
      const savedGroupContentMap = JSON.parse(localStorage.getItem('groupContentMap') || '{}');

      const normalized = payload.map((g) => ({
        id: g.id,
        name: g.name || g.group_name,
        group_name: g.group_name,
        position_id: g.position_id,
        description: g.description || "",
        // Use API value if available, otherwise use saved value from localStorage
        group_content_id: g.group_content_id || savedGroupContentMap[g.id] || null,
        memberCount: g.memberCount || g.member_count || 0,
        admin_id: g.admin_id || g.adminId || g.administrator_id || g.user_id || g.admin?.id || null,
        admin_name: g.admin?.name || g.admin_name || g.administrator_name || null,
        createdAt: g.createdAt || g.created_at,
      }));

      setGroups(normalized);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🟩 Fetch positions
  const fetchPositions = useCallback(async () => {
    try {
      const res = await api.get("/position");
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setPositions(payload);
    } catch (err) {
      console.error("Failed to fetch positions:", err);
    }
  }, []);

  // 🟩 Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/user");
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setUsers(payload);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }, []);

  // ➕ Create new group
  const createGroup = async (group_name, position_id, group_content_id = null) => {
    try {
      const payload = {
        group_name,
        position_id,
      };
      if (group_content_id) {
        payload.group_content_id = group_content_id;
      }
      const res = await api.post("/group", payload);

      const newGroup = res.data;

      // Save the group_content_id mapping locally
      if (group_content_id && newGroup?.id) {
        const savedMap = JSON.parse(localStorage.getItem('groupContentMap') || '{}');
        savedMap[newGroup.id] = group_content_id;
        localStorage.setItem('groupContentMap', JSON.stringify(savedMap));
      }

      await fetchData();
      return newGroup;
    } catch (e) {
      console.error("Create error:", e);
      throw e;
    }
  };

  // ✏️ Update existing group
  const updateGroup = async (id, name, position_id = undefined, group_content_id = undefined) => {
  try {
    const payload = { group_name: name };
    if (position_id !== undefined && position_id !== null && position_id !== "") payload.position_id = position_id;
    if (group_content_id !== undefined) payload.group_content_id = group_content_id;
    console.log(`[updateGroup] ID: ${id}, Payload:`, payload);
    const res = await api.put(`/group/${id}`, payload);
    console.log(`[updateGroup] Success response:`, res.data);

    // Save the group_content_id mapping locally
    if (group_content_id !== undefined) {
      const savedMap = JSON.parse(localStorage.getItem('groupContentMap') || '{}');
      if (group_content_id === null) {
        delete savedMap[id];
      } else {
        savedMap[id] = group_content_id;
      }
      localStorage.setItem('groupContentMap', JSON.stringify(savedMap));
    }

    const updatedGroup = res.data;
    await fetchData();
    return updatedGroup;
  } catch (e) {
    console.error("Update error:", e.response?.data || e.message);
    console.error("Full error:", e);
    throw e;
  }
};


  // 🗑️ Delete group
  const deleteGroup = async (id) => {
    try {
      await api.delete(`/group/${id}`);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      return { success: true };
    } catch (e) {
      console.error("Delete error:", e);
      return { success: false, message: e.message };
    }
  };

  // 🔍 Search groups
  const searchGroups = async (query) => {
    try {
      const res = await api.get(`/group?name=${query}`, {
      });
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];

      // Get saved group content map from localStorage
      const savedGroupContentMap = JSON.parse(localStorage.getItem('groupContentMap') || '{}');

      const normalized = payload.map((g) => ({
        id: g.id,
        name: g.name || g.group_name,
        group_name: g.group_name,
        position_id: g.position_id,
        description: g.description || "",
        // Use API value if available, otherwise use saved value from localStorage
        group_content_id: g.group_content_id || savedGroupContentMap[g.id] || null,
        memberCount: g.memberCount || g.member_count || 0,
        admin_id: g.admin_id || g.adminId || g.administrator_id || g.user_id || g.admin?.id || null,
        admin_name: g.admin?.name || g.admin_name || g.administrator_name || null,
        createdAt: g.createdAt || g.created_at,
      }));
      setGroups(normalized);
    } catch (e) {
      console.error("Search error:", e);
      throw e;
    }
  };

  useEffect(() => {
    fetchData();
    fetchPositions();
    fetchUsers();
  }, [fetchData, fetchPositions, fetchUsers]);

  return {
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
  };
};

