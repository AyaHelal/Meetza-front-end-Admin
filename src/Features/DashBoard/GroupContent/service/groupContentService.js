import api from "../../../../utils/api";

/**
 * Fetches group contents, optionally filtered by search.
 * @param {string} [search] 
 * @returns {Promise<Object>}
 */
export const getGroupContents = async (search = "") => {
  const url = search ? `/group-contents?search=${search}` : "/group-contents";
  const res = await api.get(url);
  return res.data;
};

/**
 * Fetches raw groups data (used for association mapping).
 * @returns {Promise<Array>}
 */
export const getGroupsRaw = async () => {
  const res = await api.get("/group");
  return res.data?.data ?? res.data;
};

/**
 * Creates a new group content.
 * @param {Object} payload 
 * @returns {Promise<Object>}
 */
export const createGroupContent = async (payload) => {
  const res = await api.post(`/group-contents`, payload);
  return res.data;
};

/**
 * Updates group content.
 * @param {string|number} id 
 * @param {Object} payload 
 * @returns {Promise<Object>}
 */
export const updateGroupContent = async (id, payload) => {
  const res = await api.put(`/group-contents/${id}`, payload);
  return res.data;
};

/**
 * Deletes group content.
 * @param {string|number} id 
 * @returns {Promise<Object>}
 */
export const deleteGroupContent = async (id) => {
  const res = await api.delete(`/group-contents/${id}`);
  return res.data;
};
