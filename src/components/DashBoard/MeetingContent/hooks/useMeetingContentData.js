import { useState, useEffect } from "react";
import { smartToast } from "../../../../utils/toastManager";
import apiCommon from "../../../../utils/api";

export default function useMeetingContentData() {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // -------- GET ALL / SEARCH --------
    const fetchContents = async (query = "") => {
        setLoading(true);
        setError(null);

        try {
        const urlSuffix = query ? `?name=${encodeURIComponent(query)}` : '';
        const response = await apiCommon.get(`/meeting-contents${urlSuffix}`);

        if (response.data.success) {
            const user = JSON.parse(localStorage.getItem("user"));
            setCurrentUser(user);
            // Show all contents for Super_Admin or Administrator; others see only their own
            const isSuperAdmin = user?.role === "Super_Admin" || user?.role === "Administrator";

            const filteredContents = response.data.data.filter(
            (c) => isSuperAdmin || c.user_id === user?.id
            );

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

    // -------- CREATE --------
    const addContent = async (data) => {
        try {
        const response = await apiCommon.post(`/meeting-contents`, data);
        if (response.data.success) {
            smartToast.success("Meeting content created successfully");
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

    // -------- UPDATE --------
    const updateContent = async (id, updatedData) => {
        try {
        const response = await apiCommon.put(`/meeting-contents/${id}`, updatedData);
        if (response.data.success) {
            smartToast.success("Meeting content updated successfully");
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

    // -------- DELETE --------
    const deleteContent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this content?")) return;
        try {
        const response = await apiCommon.delete(`/meeting-contents/${id}`);
        if (response.data.success) {
            setContents((prev) => prev.filter((c) => c.id !== id));
            smartToast.success("Meeting content deleted successfully");
        } else {
            smartToast.error(response.data.message || "Failed to delete content");
        }
        return response.data;
        } catch (err) {
        smartToast.error(err.response?.data?.message || "Error deleting content");
        throw err;
        }
    };

    // -------- SEARCH WRAPPER --------
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
