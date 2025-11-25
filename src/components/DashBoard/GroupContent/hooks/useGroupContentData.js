import { useState, useEffect } from "react";
import { smartToast } from "../../../../utils/toastManager";
import apiCommon from "../../../../utils/api";

export default function useGroupContentData() {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    const fetchContents = async (query = "") => {
        setLoading(true);
        setError(null);

        try {
        const urlSuffix = query ? `?name=${encodeURIComponent(query)}` : '';
        const response = await apiCommon.get(`/group-contents${urlSuffix}`);

        if (response.data.success) {
            const user = JSON.parse(localStorage.getItem("user"));
            setCurrentUser(user);
            const isSuperAdmin = user?.role === "Super_Admin";

            // Super_Admin sees all, Administrator sees only their own (by administrator_id)
            const filteredContents = isSuperAdmin 
              ? response.data.data 
              : response.data.data.filter((c) => c.administrator_id === user?.id);

            setContents(filteredContents || []);
        } else {
            smartToast.error("Failed to load contents");
            setContents([]);
        }
        } catch (err) {
        setError(err);
        smartToast.error(err.response?.data?.message || "Error loading contents");
        setContents([]);
        } finally {
        setLoading(false);
        }
    };

    const addContent = async (data) => {
        try {
        const response = await apiCommon.post(`/group-contents`, data);
        if (response.data.success) {
            smartToast.success("Group content created successfully");
            fetchContents();
        } else {
            smartToast.error(response.data.message || "Failed to create content");
        }
        return response.data;
        } catch (err) {
        smartToast.error(err.response?.data?.message || "Error creating content");
        throw err;
        }
    };

    const updateContent = async (id, updatedData) => {
        try {
        const response = await apiCommon.put(`/group-contents/${id}`, updatedData);
        if (response.data.success) {
            smartToast.success("Group content updated successfully");
            fetchContents();
        } else {
            smartToast.error(response.data.message || "Failed to update content");
        }
        return response.data;
        } catch (err) {
        smartToast.error(err.response?.data?.message || "Error updating content");
        throw err;
        }
    };

    const deleteContent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this content?")) return;
        try {
        const response = await apiCommon.delete(`/group-contents/${id}`);
        if (response.data.success) {
            setContents((prev) => prev.filter((c) => c.id !== id));
            smartToast.success("Group content deleted successfully");
        } else {
            smartToast.error(response.data.message || "Failed to delete content");
        }
        return response.data;
        } catch (err) {
        smartToast.error(err.response?.data?.message || "Error deleting content");
        throw err;
        }
    };

    const searchContents = async (query) => {
        if (query.trim() === "") {
        await fetchContents();
        return;
        }
        if (query.trim().length > 2) {
        await fetchContents(query).catch((err) => {
            smartToast.error(err?.response?.data?.message || "Failed to search contents");
        });
        }
    };

    useEffect(() => {
        fetchContents();
    }, []);

    return {
        contents,
        loading,
        error,
        currentUser,
        fetchContents,
        searchContents,
        addContent,
        updateContent,
        deleteContent,
    };
}
