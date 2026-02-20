import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { smartToast } from "../../../../utils/toastManager";
import apiCommon from "../../../../utils/api";

    const formatForAPI = (inputValue) => {
    const d = new Date(inputValue);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
        d.getHours()
    )}:${pad(d.getMinutes())}:00`;
    };

    export default function useMeetingData() {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMeetings = async (query = '') => {
        setLoading(true);
        setError(null);
        try {
        const urlSuffix = query ? `?title=${encodeURIComponent(query)}` : '';
        const res = await apiCommon.get(`/meeting${urlSuffix}`);

        if (res.data.success) {
            const currentUser = JSON.parse(localStorage.getItem('user'));
            const isSuperAdmin = currentUser?.role === 'Super_Admin' || currentUser?.role === 'Administrator';

            const filteredMeetings = res.data.data.filter(meeting => {
            if (isSuperAdmin) return true;
            return meeting.administrator_id === currentUser?.id;
            });

            setMeetings(prev => {
                const list = filteredMeetings || [];
                return list.map(m => {
                    const existing = prev.find(p => p.id === m.id);
                    const recordMeeting = (m.record_meeting !== undefined && m.record_meeting !== null)
                        ? m.record_meeting
                        : (existing && (existing.record_meeting !== undefined && existing.record_meeting !== null))
                            ? existing.record_meeting
                            : undefined;
                    return { ...m, record_meeting: recordMeeting };
                });
            });
        } else {
            smartToast.error("Failed to load meetings");
            setMeetings([]);
        }
        } catch (err) {
        setError(err);
        toast.error(err.response?.data?.message || "Error loading meetings");
        setMeetings([]);
        } finally {
        setLoading(false);
        }
    };

    const searchMeetings = async (query) => {
        if (query.trim() === '') {
        await fetchMeetings();
        return;
        }
        if (query.trim().length > 2) {
        await fetchMeetings(query).catch((err) => {
            smartToast.error(err?.response?.data?.message || "Failed to search meetings");
        });
        }
    };

    const addMeeting = async (data) => {
        try {
        const currentUser = JSON.parse(localStorage.getItem('user'));

        let groupId = data.group_id || (meetings.length > 0 ? meetings[0].group_id : null);

        if (!groupId) {
            try {
                const groupsRes = await apiCommon.get('/group');
                const allGroups = Array.isArray(groupsRes.data) ? groupsRes.data : groupsRes.data?.data || [];
                groupId = allGroups[0]?.id || null;
            } catch (e) {
                // ignore, will handle below
            }
        }

        if (!groupId) {
            smartToast.error("Cannot create meeting: no group_id available");
            return;
        }

        // Build multipart form data to support poster_file + resources files
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("start_time", formatForAPI(data.start_time));
        formData.append("end_time", formatForAPI(data.end_time));
        formData.append("group_id", groupId);
        formData.append("status", data.status);
        formData.append("record_meeting", (data.recordMeeting || data.record_meeting) === "Recording" ? "1" : "0");
        // description is optional and not displayed, but sent to backend
        if (data.description) {
            formData.append("description", data.description);
        }
        // Poster image (optional)
        if (data.poster_file instanceof File) {
            formData.append("poster_file", data.poster_file);
        }
        // Resources files[] (optional, can be multiple)
        if (Array.isArray(data.files)) {
            data.files.forEach((file) => {
            if (file instanceof File) {
                formData.append("files", file);
            }
            });
        }

        const res = await apiCommon.post("/meeting", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data.success) {
            smartToast.success("Meeting created successfully");
            const recordValue = (data.recordMeeting || data.record_meeting) === "Recording" ? 1 : 0;
            setMeetings((prev) => [...prev, { ...res.data.data, record_meeting: recordValue }]);
            return res.data.data;
        } else smartToast.error(res.data.message || "Failed to create meeting");
        } catch (err) {
        smartToast.error(err.response?.data?.message || "Error creating meeting");
        throw err;
        }
    };

    const updateMeeting = async (id, data) => {
    try {
        const originalMeeting = meetings.find(m => m.id === id);

        const hasPoster = data.poster_file instanceof File;
        const hasDescription = data.description != null;

        let res;
        if (hasPoster || hasDescription) {
            const formData = new FormData();
            if (data.title != null) formData.append("title", data.title);
            if (data.start_time != null) formData.append("start_time", formatForAPI(data.start_time));
            if (data.end_time != null) formData.append("end_time", formatForAPI(data.end_time));
            if (data.status != null) formData.append("status", data.status);
            formData.append("group_id", data.group_id || originalMeeting?.group_id);
            if (data.description != null) formData.append("description", data.description);
            formData.append("record_meeting", (data.recordMeeting || data.record_meeting) === "Recording" ? "1" : "0");

            if (hasPoster) {
                formData.append("poster_file", data.poster_file);
            }

            res = await apiCommon.put(`/meeting/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        } else {
            const payload = {
                title: data.title,
                start_time: formatForAPI(data.start_time),
                end_time: formatForAPI(data.end_time),
                status: data.status,
                group_id: data.group_id || originalMeeting?.group_id,
                record_meeting: (data.recordMeeting || data.record_meeting) === "Recording" ? 1 : 0,
            };
            res = await apiCommon.put(`/meeting/${id}`, payload);
        }

        if (res.data.success) {
            smartToast.success("Meeting updated successfully");
            const recordValue = (data.recordMeeting || data.record_meeting) === "Recording" ? 1 : 0;
            setMeetings(prev =>
                prev.map(m => (m.id === id ? { ...m, ...data, record_meeting: recordValue } : m))
            );
            return res.data;
        } else {
            smartToast.error(res.data.message || "Failed to update meeting");
        }
    } catch (err) {
        smartToast.error(err.response?.data?.message || "Error updating meeting");
        throw err;
    }
};


    const deleteMeeting = async (id) => {
        if (!window.confirm("Are you sure you want to delete this meeting?")) return;
        try {
        const res = await apiCommon.delete(`/meeting/${id}`);
        if (res.data.success) {
            setMeetings((prev) => prev.filter((m) => m.id !== id));
            smartToast.success("Meeting deleted successfully");
            return res.data;
        } else smartToast.error(res.data.message || "Failed to delete meeting");
        } catch (err) {
        smartToast.error(err.response?.data?.message || "Error deleting meeting");
        throw err;
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    return {
        meetings,
        loading,
        error,
        fetchMeetings,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        searchMeetings
    };
}
