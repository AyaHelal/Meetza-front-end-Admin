import api from "../../../../utils/api";

/**
 * Uploads a file resource to a meeting content.
 * @param {string|number} meetingContentId 
 * @param {File} file 
 * @returns {Promise<Object>}
 */
export const addResource = async (meetingContentId, file) => {
  const form = new FormData();
  form.append("files", file);

  const res = await api.post(`/group-contents/${meetingContentId}/files`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/**
 * Adds a link resource to a meeting content.
 * @param {string|number} meetingContentId 
 * @param {string} link 
 * @returns {Promise<Object>}
 */
export const addLinkResource = async (meetingContentId, link) => {
  const form = new FormData();
  form.append("links", link);

  const res = await api.post(`/group-contents/${meetingContentId}/files`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/**
 * Deletes a resource from a meeting content.
 * @param {string|number} meetingContentId 
 * @param {string|number} resourceId 
 * @returns {Promise<Object>}
 */
export const deleteResource = async (meetingContentId, resourceId) => {
  const res = await api.delete(`/group-contents/${meetingContentId}/files/${resourceId}`);
  return res.data;
};
