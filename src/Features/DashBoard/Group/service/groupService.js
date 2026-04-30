import api from "../../../../utils/api";

/**
 * Fetches all groups or searches by name.
 * @param {string} [query] - Optional name query.
 * @returns {Promise<Array>}
 */
export const getGroups = async (query = "") => {
  const url = query ? `/group?name=${query}` : "/group";
  const res = await api.get(url);
  return Array.isArray(res.data) ? res.data : res.data?.data || [];
};

/**
 * Fetches all users.
 * @returns {Promise<Array>}
 */
export const getUsers = async () => {
  const res = await api.get("/user");
  return Array.isArray(res.data) ? res.data : res.data?.data || [];
};

/**
 * Fetches group contents.
 * @returns {Promise<Array>}
 */
export const getGroupContents = async () => {
  const res = await api.get("/group-contents");
  return Array.isArray(res.data) ? res.data : res.data?.data || [];
};

/**
 * Creates a new group.
 * @param {Object} payload 
 * @param {File} [group_photo] 
 * @returns {Promise<Object>}
 */
export const createGroup = async (payload, group_photo) => {
  let res;
  if (group_photo) {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, v);
    });
    form.append("group_photo", group_photo);
    res = await api.post("/group", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else {
    res = await api.post("/group", payload);
  }
  return res.data?.data || res.data;
};

/**
 * Updates an existing group.
 * @param {string|number} id 
 * @param {Object} payload 
 * @param {File} [group_photo] 
 * @returns {Promise<Object>}
 */
export const updateGroup = async (id, payload, group_photo) => {
  let res;
  if (group_photo) {
    const form = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, v);
    });
    form.append("group_photo", group_photo);
    res = await api.put(`/group/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  } else {
    res = await api.put(`/group/${id}`, payload);
  }
  return res.data;
};

/**
 * Deletes a group.
 * @param {string|number} id 
 * @returns {Promise<Object>}
 */
export const deleteGroup = async (id) => {
  await api.delete(`/group/${id}`);
  return { success: true };
};
