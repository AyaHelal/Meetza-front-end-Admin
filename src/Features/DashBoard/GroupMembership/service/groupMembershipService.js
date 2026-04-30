import api from "../../../../utils/api";

/**
 * Fetches all group memberships, optionally filtered by search.
 * @param {string} [search]
 * @returns {Promise<Object>}
 */
export const getMemberships = async (search = "") => {
  const params = search ? { search } : {};
  const res = await api.get("/group-membership", { params });
  return res.data;
};

/**
 * Fetches all groups.
 * @returns {Promise<Object>}
 */
export const getGroups = async () => {
  const res = await api.get("/group");
  return res.data;
};

/**
 * Fetches all users.
 * @returns {Promise<Object>}
 */
export const getUsers = async () => {
  const res = await api.get("/user");
  return res.data;
};

/**
 * Creates a new group membership.
 * @param {string|number} group_id
 * @param {string|number} member_id
 * @returns {Promise<Object>}
 */
export const createMembership = async (group_id, member_id) => {
  const res = await api.post("/group-membership", { group_id, member_id });
  return res.data;
};

/**
 * Deletes a membership by its ID.
 * @param {string|number} id
 * @returns {Promise<Object>}
 */
export const deleteMembershipById = async (id) => {
  const res = await api.delete(`/group-membership/${id}`);
  return res.data;
};

/**
 * Deletes a membership using group_id and member_id in the request body.
 * @param {string|number} group_id
 * @param {string|number} member_id
 * @returns {Promise<Object>}
 */
export const deleteMembershipByBody = async (group_id, member_id) => {
  const res = await api.delete("/group-membership", {
    data: { group_id, member_id },
  });
  return res.data;
};

/**
 * Deletes a membership using group_id and member_id in query parameters.
 * @param {string|number} group_id
 * @param {string|number} member_id
 * @returns {Promise<Object>}
 */
export const deleteMembershipByQuery = async (group_id, member_id) => {
  const res = await api.delete(`/group-membership?group_id=${group_id}&member_id=${member_id}`);
  return res.data;
};

/**
 * Updates a membership.
 * @param {string|number} id
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export const updateMembership = async (id, payload) => {
  const res = await api.patch(`/group-membership/${id}`, payload);
  return res.data;
};

/**
 * Fetches a user by their email address.
 * @param {string} email
 * @returns {Promise<Object>}
 */
export const getUserByEmail = async (email) => {
  const res = await api.get(`/user/email/${encodeURIComponent(email)}`);
  return res.data;
};
