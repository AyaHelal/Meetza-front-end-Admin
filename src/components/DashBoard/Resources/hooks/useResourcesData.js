import { useState, useCallback } from "react";
import api from "../../../../utils/api";
import { smartToast } from "../../../../utils/toastManager";

export default function useResourcesData(fetchContents) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addResource = useCallback(async (meetingContentId, file) => {
    try {
      setLoading(true);
      const form = new FormData();
      // Append file with 'files' field name (backend expects this)
      if (file instanceof File) form.append("files", file);
      else if (file?.file instanceof File) form.append("files", file.file);
      else throw new Error("Invalid file");

      // POST /group-contents/:id/files
      const res = await api.post(`/group-contents/${meetingContentId}/files`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        smartToast.success(res.data.message || "Resource uploaded");
        if (typeof fetchContents === "function") await fetchContents();
        return res.data;
      }
      smartToast.error(res.data?.message || "Failed to upload resource");
      return res.data;
    } catch (err) {
      setError(err);
      smartToast.error(err.response?.data?.message || err.message || "Error uploading resource");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchContents]);

  const deleteResource = useCallback(async (meetingContentId, resourceId) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      setLoading(true);
      const res = await api.delete(`/group-contents/${meetingContentId}/files/${resourceId}`);
      if (res.data?.success) {
        smartToast.success(res.data.message || "Resource deleted");
        if (typeof fetchContents === "function") await fetchContents();
        return res.data;
      }
      smartToast.error(res.data?.message || "Failed to delete resource");
      return res.data;
    } catch (err) {
      setError(err);
      smartToast.error(err.response?.data?.message || err.message || "Error deleting resource");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchContents]);

  return {
    loading,
    error,
    addResource,
    deleteResource,
  };
}
