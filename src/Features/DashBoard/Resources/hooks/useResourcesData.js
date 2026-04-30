import { useState, useCallback } from "react";
import { smartToast } from "../../../../utils/toastManager";
import * as resourceService from "../service/resourceService";

export default function useResourcesData(fetchContents) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  /** While a file is uploading: show a pending row in the table until the request finishes. */
  const [fileUploadPending, setFileUploadPending] = useState(null);

  const addResource = useCallback(async (meetingContentId, file) => {
    const rawFile = file instanceof File ? file : file?.file;
    if (!(rawFile instanceof File)) {
      smartToast.error("Invalid file");
      return;
    }

    const fileName = rawFile.name || "File";
    try {
      setFileUploadPending({ fileName });
      setLoading(true);

      const data = await resourceService.addResource(meetingContentId, rawFile);

      if (data?.success) {
        smartToast.success(data.message || "Resource uploaded");
        if (typeof fetchContents === "function") await fetchContents();
        return data;
      }
      smartToast.error(data?.message || "Failed to upload resource");
      return data;
    } catch (err) {
      setError(err);
      smartToast.error(err.response?.data?.message || err.message || "Error uploading resource");
      throw err;
    } finally {
      setLoading(false);
      setFileUploadPending(null);
    }
  }, [fetchContents]);

  const addLinkResource = useCallback(async (meetingContentId, link) => {
    try {
      setLoading(true);
      const data = await resourceService.addLinkResource(meetingContentId, link);

      if (data?.success) {
        smartToast.success(data.message || "Link added");
        if (typeof fetchContents === "function") await fetchContents();
        return data;
      }
      smartToast.error(data?.message || "Failed to add link");
      return data;
    } catch (err) {
      setError(err);
      smartToast.error(err.response?.data?.message || err.message || "Error adding link");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchContents]);

  const deleteResource = useCallback(async (meetingContentId, resourceId) => {
    try {
      setLoading(true);
      const data = await resourceService.deleteResource(meetingContentId, resourceId);

      if (data?.success) {
        smartToast.success(data.message || "Resource deleted");
        if (typeof fetchContents === "function") await fetchContents();
        return data;
      }
      smartToast.error(data?.message || "Failed to delete resource");
      return data;
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
    fileUploadPending,
    addResource,
    addLinkResource,
    deleteResource,
  };
}
