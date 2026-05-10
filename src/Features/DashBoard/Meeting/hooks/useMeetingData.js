import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { smartToast } from "../../../../utils/toastManager";
import { useAuth } from "../../../../context/AuthContext";
import * as meetingService from "../service/meetingService";

export default function useMeetingData() {
    const { user: currentUser } = useAuth();
    const cacheKey = `admin_meetings_cache_${currentUser?.id || 'guest'}`;

    const [meetings, setMeetings] = useState(() => {
        const cached = localStorage.getItem(cacheKey);
        return cached ? JSON.parse(cached) : [];
    });
    const [loading, setLoading] = useState(meetings.length === 0);
    const [error, setError] = useState(null);

    const fetchMeetings = async (query = '') => {
        const hasCache = meetings.length > 0;
        if (!hasCache) setLoading(true);
        setError(null);
        try {
            const resData = await meetingService.getMeetings(query);

            if (resData.success) {
                const isSuperAdmin = currentUser?.role === 'Super_Admin' || currentUser?.role === 'Administrator';

                const filteredMeetings = resData.data.filter(meeting => {
                    if (isSuperAdmin) return true;
                    return meeting.administrator_id === currentUser?.id;
                });

                const mapped = (filteredMeetings || []).map(m => {
                    const existing = meetings.find(p => p.id === m.id);
                    const raw = m.recording ?? m.record_meeting ?? (existing?.record_meeting ?? existing?.recording);
                    const recordMeeting = (raw !== undefined && raw !== null) ? raw : undefined;
                    return { ...m, record_meeting: recordMeeting, recording: m.recording ?? recordMeeting };
                });

                setMeetings(mapped);
                localStorage.setItem(cacheKey, JSON.stringify(mapped));
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
            let groupId = data.group_id || (meetings.length > 0 ? meetings[0].group_id : null);

            if (!groupId) {
                try {
                    const allGroups = await meetingService.getGroups();
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
            formData.append("start_time", meetingService.formatForAPI(data.start_time));
            formData.append("end_time", meetingService.formatForAPI(data.end_time));
            formData.append("group_id", groupId);
            // formData.append("status", data.status); // User requested not to send status on create
            formData.append("recording", (data.recordMeeting || data.record_meeting) === "Recording" ? "1" : "0");
            formData.append("weekly", (data.weekly || data.weekly_option) === "Active" ? "1" : (data.weekly || data.weekly_option) === "Inactive" ? "0" : "");
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

            const resData = await meetingService.createMeeting(formData);
            if (resData.success) {
                smartToast.success("Meeting created successfully");
                const recordValue = (data.recordMeeting || data.record_meeting) === "Recording" ? 1 : 0;
                setMeetings((prev) => [...prev, { ...resData.data, record_meeting: recordValue }]);
                return resData.data;
            } else smartToast.error(resData.message || "Failed to create meeting");
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

            let resData;
            if (hasPoster || hasDescription) {
                const formData = new FormData();
                if (data.title != null) formData.append("title", data.title);
                if (data.start_time != null) formData.append("start_time", meetingService.formatForAPI(data.start_time));
                if (data.end_time != null) formData.append("end_time", meetingService.formatForAPI(data.end_time));
                if (data.status != null) formData.append("status", data.status);
                formData.append("group_id", data.group_id || originalMeeting?.group_id);
                if (data.description != null) formData.append("description", data.description);
                formData.append("recording", (data.recordMeeting || data.record_meeting) === "Recording" ? "1" : "0");
                formData.append("weekly", (data.weekly || data.weekly_option) === "Active" ? "1" : (data.weekly || data.weekly_option) === "Inactive" ? "0" : "");

                if (hasPoster) {
                    formData.append("poster_file", data.poster_file);
                }

                resData = await meetingService.updateMeeting(id, formData, true);
            } else {
                const payload = {
                    title: data.title,
                    start_time: meetingService.formatForAPI(data.start_time),
                    end_time: meetingService.formatForAPI(data.end_time),
                    status: data.status,
                    group_id: data.group_id || originalMeeting?.group_id,
                    recording: (data.recordMeeting || data.record_meeting) === "Recording" ? "1" : "0",
                    weekly: (data.weekly || data.weekly_option) === "Active" ? "1" : (data.weekly || data.weekly_option) === "Inactive" ? "0" : "",
                };
                resData = await meetingService.updateMeeting(id, payload, false);
            }

            if (resData.success) {
                smartToast.success("Meeting updated successfully");
                const recordValue = (data.recordMeeting || data.record_meeting) === "Recording" ? 1 : 0;
                setMeetings(prev =>
                    prev.map(m => (m.id === id ? { ...m, ...data, record_meeting: recordValue } : m))
                );
                return resData;
            } else {
                smartToast.error(resData.message || "Failed to update meeting");
            }
        } catch (err) {
            smartToast.error(err.response?.data?.message || "Error updating meeting");
            throw err;
        }
    };


    const deleteMeeting = async (id, config = {}) => {
        try {
            const resData = await meetingService.deleteMeeting(id, config);
            if (resData.success) {
                setMeetings(prev => prev.filter(m => m.id !== id));
                return resData;
            } else {
                smartToast.error(resData.message || "Failed to delete meeting");
            }
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
