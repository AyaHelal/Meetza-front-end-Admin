import { useState, useCallback } from "react";
//import api from "../../../../utils/api";
import axios from "axios";
import { smartToast } from "../../../../utils/toastManager";

export const api = axios.create({
    baseURL: "https://courteous-uncomplimenting-aleena.ngrok-free.dev/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

api.interceptors.request.use((config) => {
    try {
        const token = localStorage.getItem("authToken");
        const locale = localStorage.getItem("locale") || navigator.language?.slice(0, 2) || "en";

        // If data is FormData and Content-Type is not explicitly set, remove default JSON Content-Type
        // to let axios set it automatically with boundary
        if (config.data instanceof FormData) {
            if (config.headers && config.headers['Content-Type'] === 'application/json') {
                delete config.headers['Content-Type'];
            }
        }

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (locale) {
            config.headers = config.headers || {};
            config.headers["X-localization"] = locale;
        }
    } catch (_) {
        // ignore
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized - token expired or invalid
        if (error.response?.status === 401) {
            console.error("Authentication error:", error.response);
            // Optionally clear token and redirect to login
            try {
                localStorage.removeItem("authToken");
                localStorage.removeItem("user");
                localStorage.removeItem("userRole");
            } catch (_) {
                // ignore
            }
        }
        // Handle 403 Forbidden - insufficient permissions
        if (error.response?.status === 403) {
            console.error("Permission denied:", error.response);
        }
        // Log other errors for debugging
        if (error.response) {
            console.error("API Error:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                url: error.config?.url,
            });
        } else if (error.request) {
            console.error("Network Error:", error.request);
        } else {
            console.error("Error:", error.message);
        }
        return Promise.reject(error);
    }
);

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

  const addLinkResource = useCallback(async (meetingContentId, link) => {
    try {
      setLoading(true);
      const form = new FormData();
      // Append link as text with 'files' field name (backend expects this, but we'll send text)
      form.append("links", link); // Assuming backend can handle text as file

      // POST /group-contents/:id/files
      const res = await api.post(`/group-contents/${meetingContentId}/files`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        smartToast.success(res.data.message || "Link added");
        if (typeof fetchContents === "function") await fetchContents();
        return res.data;
      }
      smartToast.error(res.data?.message || "Failed to add link");
      return res.data;
    } catch (err) {
      setError(err);
      smartToast.error(err.response?.data?.message || err.message || "Error adding link");
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
    addLinkResource,
    deleteResource,
  };
}
