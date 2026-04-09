import { useState, useEffect, useCallback } from "react";
import api from "../../../../utils/api";
import { useAuth } from "../../../../context/AuthContext";

function pickPrimaryAdminFromAdmins(admins) {
  if (!Array.isArray(admins) || admins.length === 0) return null;
  const upper = (r) => String(r || "").toUpperCase();
  const owner = admins.find((a) => upper(a.role) === "OWNER");
  if (owner) return owner;
  const adm = admins.find((a) => upper(a.role) === "ADMIN");
  if (adm) return adm;
  return admins[0];
}

function isGroupManagedByUser(g, userId) {
  if (userId == null) return false;
  const uid = String(userId);
  const candidates = [
    g.admin_id,
    g.adminId,
    g.administrator_id,
    g.user_id,
    g.admin?.id,
  ];
  if (candidates.some((id) => id != null && String(id) === uid)) return true;
  if (Array.isArray(g.admins)) {
    return g.admins.some((a) => a?.user_id != null && String(a.user_id) === uid);
  }
  return false;
}

function mapApiGroupToRow(g) {
  const primary = pickPrimaryAdminFromAdmins(g.admins);
  const adminUserId =
    g.admin_id ||
    g.adminId ||
    g.administrator_id ||
    g.user_id ||
    g.admin?.id ||
    primary?.user_id ||
    primary?.userId ||
    null;
  const adminName =
    g.admin?.name ||
    g.admin_name ||
    g.administrator_name ||
    primary?.name ||
    null;
  return {
    id: g.id,
    name: g.name || g.group_name,
    group_name: g.group_name,
    position_id: g.position_id,
    description: g.description || "",
    group_content_id: g.group_content_id || null,
    group_photo: g.group_photo || null,
    memberCount: g.memberCount || g.member_count || 0,
    admin_id: adminUserId,
    admin_name: adminName,
    createdAt: g.createdAt || g.created_at,
  };
}

export const useGroupData = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [positions, setPositions] = useState([]);
  const [users, setUsers] = useState([]);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/group");
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];

      const isSuperAdmin = user?.role === "Super_Admin";
      const isAdministrator = user?.role === "Administrator";

      let filteredGroups = payload;

      if (isAdministrator && !isSuperAdmin) {
        filteredGroups = payload.filter((g) => isGroupManagedByUser(g, user?.id));
      }
      // Super_Admin sees all groups (no filtering)

      const normalized = filteredGroups.map((g) => mapApiGroupToRow(g));
      setGroups(normalized);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  const fetchPositions = useCallback(async () => {
    try {
      const res = await api.get("/position");
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setPositions(payload);
    } catch (err) {
      console.error("Failed to fetch positions:", err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/user");
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setUsers(payload);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }, []);

  const fetchGroupContents = useCallback(async () => {
    try {
      const res = await api.get("/group-contents");
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setContents(payload);
    } catch (err) {
      console.error("Failed to fetch group contents:", err);
    }
  }, []);

  // Accept optional description (string) and posterFile (File object). When posterFile is provided
  // the request will be sent as multipart/form-data with the poster attached under the 'poster' key.
  const createGroup = async (group_name, position_id, year, semester, group_content_name, content_description = undefined, description = undefined, group_photo = undefined) => {
    try {
      const payload = { group_name, position_id, year, semester, group_content_name };
      if (content_description !== undefined && content_description !== '') payload.group_content_description = content_description;
      if (description !== undefined && description !== '') payload.description = description;

      let res;
      if (group_photo) {
        const form = new FormData();
        // append payload fields
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null) form.append(k, v);
        });
        form.append('group_photo', group_photo);
        res = await api.post('/group', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        res = await api.post('/group', payload);
      }

      const newGroup = res.data?.data || res.data;

      await fetchData();
      return newGroup;
    } catch (e) {
      console.error('Create error:', e);
      throw e;
    }
  };

  const updateGroup = async (id, group_name, position_id, group_content_id, description = undefined, group_photo = undefined) => {
    try {
      // Update group in DB with group_content_id directly
      const payload = {
        ...(group_name !== undefined && { group_name }),
        ...(position_id !== undefined && { position_id }),
        group_content_id: group_content_id ?? null,
        ...(description !== undefined && { description })
      };

      let response;
      if (group_photo) {
        const form = new FormData();
        Object.entries(payload).forEach(([k, v]) => { if (v !== undefined && v !== null) form.append(k, v); });
        form.append('group_photo', group_photo);
        response = await api.put(`/group/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        response = await api.put(`/group/${id}`, payload);
      }

      // Update local state
      setGroups(prev => prev.map(g => g.id === id ? { ...g, ...payload } : g));

      return response.data;
    } catch (err) {
      console.error("Update group error:", err);
      throw err;
    }
  };





  const deleteGroup = async (id) => {
    try {
      // Delete the group
      await api.delete(`/group/${id}`);
      setGroups(prev => prev.filter(g => g.id !== id));
      return { success: true };
    } catch (e) {
      console.error("Delete error:", e);
      return { success: false, message: e.message };
    }
  };

  const searchGroups = async (query) => {
    try {
      const res = await api.get(`/group?name=${query}`);
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];

      const isSuperAdmin = user?.role === "Super_Admin";
      const isAdministrator = user?.role === "Administrator";

      let filteredGroups = payload;

      if (isAdministrator && !isSuperAdmin) {
        filteredGroups = payload.filter((g) => isGroupManagedByUser(g, user?.id));
      }
      // Super_Admin sees all groups (no filtering)

      const normalized = filteredGroups.map((g) => mapApiGroupToRow(g));
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
    fetchGroupContents();
  }, [fetchData, fetchPositions, fetchUsers, fetchGroupContents]);

  return {
    groups,
    positions,
    users,
    contents,
    loading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    searchGroups,
    fetchData,
    fetchGroupContents,
  };
};
