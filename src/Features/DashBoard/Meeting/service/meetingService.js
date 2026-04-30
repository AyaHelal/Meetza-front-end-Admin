import api from "../../../../utils/api";

/**
 * Formats a date string for the API (YYYY-MM-DD HH:mm:ss).
 * @param {string|Date} inputValue 
 * @returns {string}
 */
export const formatForAPI = (inputValue) => {
  const d = new Date(inputValue);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:00`;
};

/**
 * Fetches meetings, optionally filtered by title search.
 * @param {string} [query] 
 * @returns {Promise<Object>}
 */
export const getMeetings = async (query = "") => {
  const urlSuffix = query ? `?title=${encodeURIComponent(query)}` : "";
  const res = await api.get(`/meeting${urlSuffix}`);
  return res.data;
};

/**
 * Fetches all groups (used for default group selection).
 * @returns {Promise<Array>}
 */
export const getGroups = async () => {
  const res = await api.get("/group");
  return Array.isArray(res.data) ? res.data : res.data?.data || [];
};

/**
 * Creates a new meeting.
 * @param {FormData} formData 
 * @returns {Promise<Object>}
 */
export const createMeeting = async (formData) => {
  const res = await api.post("/meeting", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/**
 * Updates an existing meeting.
 * @param {string|number} id 
 * @param {FormData|Object} payload 
 * @param {boolean} [isFormData]
 * @returns {Promise<Object>}
 */
export const updateMeeting = async (id, payload, isFormData = false) => {
  const config = isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {};
  const res = await api.put(`/meeting/${id}`, payload, config);
  return res.data;
};

/**
 * Deletes a meeting.
 * @param {string|number} id 
 * @param {Object} [config] 
 * @returns {Promise<Object>}
 */
export const deleteMeeting = async (id, config = {}) => {
  const res = await api.delete(`/meeting/${id}`, config);
  return res.data;
};

/**
 * Activates weekly recurrence for a meeting.
 * @param {string|number} id 
 * @returns {Promise<Object>}
 */
export const activateRecurrence = async (id) => {
  const res = await api.post(`/meeting/${id}/activate-recurrence`);
  return res.data;
};

/**
 * Deactivates weekly recurrence for a meeting.
 * @param {string|number} id 
 * @returns {Promise<Object>}
 */
export const deactivateRecurrence = async (id) => {
  const res = await api.patch(`/meeting/${id}/deactivate-recurrence`);
  return res.data;
};
