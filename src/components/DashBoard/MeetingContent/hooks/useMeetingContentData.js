import { useState, useEffect } from "react";
import axios from "axios";
import { smartToast } from "../../../../utils/toastManager";

const API_URL = "https://meetza-backend.vercel.app/api/meeting-contents";

// Axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
    });

    // Interceptors
    api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
    );

    api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
        }
        return Promise.reject(error);
    }
    );

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
        const url = query ? `/?name=${encodeURIComponent(query)}` : "/";
        const response = await api.get(url);

        if (response.data.success) {
            const user = JSON.parse(localStorage.getItem("user"));
            setCurrentUser(user);
            // Show all contents only for Super_Admin role; others see only their own
            const isSuperAdmin = user?.role === "Super_Admin";

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
        const response = await api.post("/", data);
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
        const response = await api.put(`/${id}`, updatedData);
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
        const response = await api.delete(`/${id}`);
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
