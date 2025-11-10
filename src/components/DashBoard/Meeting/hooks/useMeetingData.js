import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "https://meetza-backend.vercel.app/api/meeting";

// Axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
    });

    api.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
    });

    api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
        }
        return Promise.reject(error);
    }
    );

    const formatForAPI = (inputValue) => {
    const d = new Date(inputValue);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
    };

    export default function useMeetingData() {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMeetings = async () => {
        setLoading(true);
        setError(null);
        try {
        const res = await api.get("/");
        if (res.data.success) setMeetings(res.data.data || []);
        else toast.error("Failed to load meetings");
        } catch (err) {
        setError(err);
        toast.error(err.response?.data?.message || "Error loading meetings");
        } finally {
        setLoading(false);
        }
    };

    const addMeeting = async (data) => {
        try {
        const payload = {
            ...data,
            datetime: formatForAPI(data.datetime),
        };
        const res = await api.post("/", payload);
        if (res.data.success) {
            toast.success("Meeting created successfully");
            setMeetings((prev) => [...prev, res.data.data]);
            return res.data.data;
        } else toast.error(res.data.message || "Failed to create meeting");
        } catch (err) {
        toast.error(err.response?.data?.message || "Error creating meeting");
        throw err;
        }
    };

    const updateMeeting = async (id, data) => {
        try {
        const payload = {
            ...data,
            datetime: formatForAPI(data.datetime),
        };
        const res = await api.put(`/${id}`, payload);
        if (res.data.success) {
            toast.success("Meeting updated successfully");
            setMeetings((prev) =>
            prev.map((m) => (m.id === id ? { ...m, ...data } : m))
            );
            return res.data;
        } else toast.error(res.data.message || "Failed to update meeting");
        } catch (err) {
        toast.error(err.response?.data?.message || "Error updating meeting");
        throw err;
        }
    };

    const deleteMeeting = async (id) => {
        if (!window.confirm("Are you sure you want to delete this meeting?")) return;
        try {
        const res = await api.delete(`/${id}`);
        if (res.data.success) {
            setMeetings((prev) => prev.filter((m) => m.id !== id));
            toast.success("Meeting deleted successfully");
            return res.data;
        } else toast.error(res.data.message || "Failed to delete meeting");
        } catch (err) {
        toast.error(err.response?.data?.message || "Error deleting meeting");
        throw err;
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    return { meetings, loading, error, fetchMeetings, addMeeting, updateMeeting, deleteMeeting };
}
