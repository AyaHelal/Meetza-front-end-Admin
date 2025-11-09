import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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
        else {
        console.warn("No token found in localStorage");
        }
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

    // -------- GET ALL --------
    const fetchContents = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
        window.location.href = "/login";
        return;
        }

        setLoading(true);
        setError(null);

        try {
        const response = await api.get("/");
        if (response.data.success) {
            setContents(response.data.data || []);
        } else {
            toast.error("Failed to load contents");
        }
        } catch (err) {
        setError(err);
        toast.error(err.response?.data?.message || "Error loading contents");
        } finally {
        setLoading(false);
        }
    };

    // -------- CREATE --------
    const addContent = async (data) => {
        try {
        const response = await api.post("/", data);
        if (response.data.success) {
            toast.success("Meeting content created successfully");
            fetchContents();
        } else {
            toast.error(response.data.message || "Failed to create content");
        }
        return response.data;
        } catch (err) {
        toast.error(err.response?.data?.message || "Error creating content");
        throw err;
        }
    };

    // -------- UPDATE --------
    const updateContent = async (id, updatedData) => {
        try {
        const response = await api.put(`/${id}`, updatedData);
        if (response.data.success) {
            toast.success("Meeting content updated successfully");
            fetchContents();
        } else {
            toast.error(response.data.message || "Failed to update content");
        }
        return response.data;
        } catch (err) {
        toast.error(err.response?.data?.message || "Error updating content");
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
            toast.success("Meeting content deleted successfully");
        } else {
            toast.error(response.data.message || "Failed to delete content");
        }
        return response.data;
        } catch (err) {
        toast.error(err.response?.data?.message || "Error deleting content");
        throw err;
        }
    };

    useEffect(() => {
        fetchContents();
    }, []);

    return { contents, loading, error, addContent, updateContent, deleteContent, fetchData: fetchContents };
}
