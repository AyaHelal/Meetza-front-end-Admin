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

            setMeetings(filteredMeetings || []);
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

        // استخدم group_id من payload لو موجود أو خذ أول group_id من groups (fetch all groups)
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

        const payload = {
            ...data,
            datetime: formatForAPI(data.datetime),
            group_id: groupId,
            administrator_id: currentUser.id,
        };

        const res = await apiCommon.post("/meeting", payload);
        if (res.data.success) {
            smartToast.success("Meeting created successfully");
            setMeetings((prev) => [...prev, res.data.data]);
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

        const payload = {
            title: data.title,
            datetime: formatForAPI(data.datetime),
            status: data.status,
            meeting_content_id: data.meeting_content_id,
            group_id: data.group_id || originalMeeting?.group_id,
        };

        const res = await apiCommon.put(`/meeting/${id}`, payload);
        if (res.data.success) {
            smartToast.success("Meeting updated successfully");
            setMeetings(prev =>
                prev.map(m => (m.id === id ? { ...m, ...data } : m))
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
