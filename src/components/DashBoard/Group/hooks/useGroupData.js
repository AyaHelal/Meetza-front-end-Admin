import { useState, useEffect, useCallback } from "react";
import api from "../../../../utils/api";
import { useAuth } from "../../../../context/AuthContext";
import { dedupeById } from "../../../../utils/dedupeById";
import { groupIsManagedByUser } from "../../../../utils/groupIsManagedByUser";

function pickPrimaryAdminFromAdmins(admins) {
  if (!Array.isArray(admins) || admins.length === 0) return null;
  const upper = (r) => String(r || "").toUpperCase();
  const owner = admins.find((a) => upper(a.role) === "OWNER");
  if (owner) return owner;
  const adm = admins.find((a) => upper(a.role) === "ADMIN");
  if (adm) return adm;
  return admins[0];
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
    year: g.year ?? null,
    semester: g.semester ?? null,
    description: g.description || "",
    group_content_id: g.group_content_id || null,
    group_photo: g.group_photo || null,
    memberCount: g.memberCount || g.member_count || 0,
    admin_id: adminUserId,
    admin_name: adminName,
    createdAt: g.createdAt || g.created_at,
    ...(Array.isArray(g.admins) ? { admins: g.admins } : {}),
  };
}

export const useGroupData = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
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
        filteredGroups = payload.filter((g) => groupIsManagedByUser(g, user?.id));
      }

      const normalized = dedupeById(filteredGroups).map((g) => mapApiGroupToRow(g));
      setGroups(normalized);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load groups");
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/user");
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setUsers(dedupeById(payload));
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  }, []);

  const fetchGroupContents = useCallback(async () => {
    try {
      const res = await api.get("/group-contents");
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setContents(dedupeById(payload));
    } catch (err) {
      console.error("Failed to fetch group contents:", err);
    }
  }, []);

  // Accept optional description (string) and posterFile (File object). When posterFile is provided
  // the request will be sent as multipart/form-data with the poster attached under the 'poster' key.
  /**
   * @param {object} params
   * @param {string} params.group_name
   * @param {string|number|undefined} [params.position_id] — omit for non–super-admin create
   * @param {string|number} params.year
   * @param {string} params.semester
   * @param {string} params.group_content_name
   * @param {string} [params.group_content_description]
   * @param {string} [params.description]
   * @param {File} [params.group_photo]
   * @param {number[]} [params.admin_ids] — super admin: sent as `administrator_ids[0]`, `[1]`, … plus `administrator_id` (first)
   */
  const createGroup = async ({
    group_name,
    position_id,
    year,
    semester,
    group_content_name,
    group_content_description,
    description,
    group_photo,
    admin_ids,
  }) => {
    try {
      const isSuperAdmin = user?.role === "Super_Admin";
      const selfId = user?.id ?? user?._id;

      let administrator_id;
      if (isSuperAdmin && Array.isArray(admin_ids) && admin_ids.length > 0) {
        administrator_id = admin_ids[0];
      } else if (selfId != null && selfId !== "") {
        administrator_id = selfId;
      }

      if (administrator_id === undefined || administrator_id === null || administrator_id === "") {
        throw new Error("Missing administrator_id (log in again or select at least one admin)");
      }

      const payload = {
        group_name,
        year,
        semester,
        group_content_name,
        administrator_id,
      };
      if (position_id !== undefined && position_id !== null && position_id !== "") {
        payload.position_id = position_id;
      }
      if (group_content_description !== undefined && group_content_description !== "") {
        payload.group_content_description = group_content_description;
      }
      if (description !== undefined && description !== "") payload.description = description;
      if (isSuperAdmin && Array.isArray(admin_ids) && admin_ids.length > 0) {
        const normAdminIds = admin_ids
          .map((id) => (id != null && String(id).trim() !== "" ? String(id).trim() : null))
          .filter(Boolean);
        normAdminIds.forEach((sid, index) => {
          payload[`administrator_ids[${index}]`] = sid;
        });
      }

      let res;
      if (group_photo) {
        const form = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v === undefined || v === null) return;
          form.append(k, v);
        });
        form.append("group_photo", group_photo);
        res = await api.post("/group", form, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        res = await api.post("/group", payload);
      }

      const newGroup = res.data?.data || res.data;

      await fetchData();
      return newGroup;
    } catch (e) {
      console.error('Create error:', e);
      throw e;
    }
  };

  /**
   * Matches backend `updateGroup`: group_name, description, year, semester, group_photo only.
   */
  const updateGroup = async (id, { group_name, description, year, semester, group_photo } = {}) => {
    try {
      const payload = {};
      if (group_name !== undefined && group_name !== null && group_name !== "") {
        payload.group_name = group_name;
      }
      if (description !== undefined) payload.description = description;
      if (year !== undefined && year !== null && year !== "") payload.year = year;
      if (semester !== undefined && semester !== null && semester !== "") payload.semester = semester;

      let response;
      if (group_photo) {
        const form = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null) form.append(k, v);
        });
        form.append("group_photo", group_photo);
        response = await api.put(`/group/${id}`, form, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        response = await api.put(`/group/${id}`, payload);
      }

      setGroups((prev) =>
        prev.map((g) => {
          if (g.id !== id) return g;
          return {
            ...g,
            ...(payload.group_name !== undefined && { name: payload.group_name, group_name: payload.group_name }),
            ...(payload.description !== undefined && { description: payload.description }),
            ...(payload.year !== undefined && { year: payload.year }),
            ...(payload.semester !== undefined && { semester: payload.semester }),
          };
        })
      );

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
        filteredGroups = payload.filter((g) => groupIsManagedByUser(g, user?.id));
      }

      const normalized = dedupeById(filteredGroups).map((g) => mapApiGroupToRow(g));
      setGroups(normalized);
    } catch (e) {
      console.error("Search error:", e);
      throw e;
    }
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
    fetchGroupContents();
  }, [fetchData, fetchUsers, fetchGroupContents]);

  return {
    groups,
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
