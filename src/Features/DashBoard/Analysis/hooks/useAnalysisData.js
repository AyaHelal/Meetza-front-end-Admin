import { useState, useEffect, useMemo } from 'react';
import api from '../../../../utils/api';

const useAnalysisData = (startDate, endDate) => {
    const cacheKey = `analysis_dashboard_${startDate || 'all'}_${endDate || 'all'}`;

    // Initialize states from cache if available
    const [summary, setSummary] = useState(() => {
        const cached = localStorage.getItem(`${cacheKey}_summary`);
        return cached ? JSON.parse(cached) : null;
    });
    const [rawComparison, setRawComparison] = useState(() => {
        const cached = localStorage.getItem(`${cacheKey}_comparison`);
        return cached ? JSON.parse(cached) : null;
    });
    const [rawTrends, setRawTrends] = useState(() => {
        const cached = localStorage.getItem(`${cacheKey}_trends`);
        return cached ? JSON.parse(cached) : [];
    });
    const [rawGroups, setRawGroups] = useState(() => {
        const cached = localStorage.getItem(`${cacheKey}_groups`);
        return cached ? JSON.parse(cached) : [];
    });
    const [rawMeetings, setRawMeetings] = useState(() => {
        const cached = localStorage.getItem(`${cacheKey}_meetings`);
        return cached ? JSON.parse(cached) : [];
    });

    const [loading, setLoading] = useState(!summary);

    useEffect(() => {
        const fetchAnalytics = async () => {
            const hasCache = !!summary;
            try {
                if (!hasCache) setLoading(true);
                
                const params = {};
                if (startDate && endDate) {
                    params.startDate = startDate;
                    params.endDate = endDate;
                }

                const response = await api.get('/reports/analytics', { params });
                const responseData = response.data?.data || response.data;

                const newSummary = responseData?.summary || responseData;
                const newComparison = responseData?.comparison || null;
                const newTrends = responseData?.activityTrends || [];
                const newGroups = responseData?.groups || [];
                const newMeetings = responseData?.meetings || [];

                setSummary(newSummary);
                setRawComparison(newComparison);
                setRawTrends(newTrends);
                setRawGroups(newGroups);
                setRawMeetings(newMeetings);

                // Save to localStorage
                localStorage.setItem(`${cacheKey}_summary`, JSON.stringify(newSummary));
                localStorage.setItem(`${cacheKey}_comparison`, JSON.stringify(newComparison));
                localStorage.setItem(`${cacheKey}_trends`, JSON.stringify(newTrends));
                localStorage.setItem(`${cacheKey}_groups`, JSON.stringify(newGroups));
                localStorage.setItem(`${cacheKey}_meetings`, JSON.stringify(newMeetings));

            } catch (error) {
                console.error("Failed to load analytics data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [startDate, endDate, cacheKey]);

    const cardsData = useMemo(() => {
        if (!summary) return [];
        return [
            { title: "Total Groups", value: `${summary.totalGroups ?? 0} Groups`, change: "+2.45%", iconType: "UsersFour", showAvatars: true },
            { 
                title: "Total Members", 
                value: `${summary.totalMembers ?? 0} Members`, 
                change: "+2.45%", 
                iconType: "ChartLineUp", 
                showAvatars: true,
                sparkline: [
                    { value: 10 }, { value: 20 }, { value: 15 }, { value: 30 }, 
                    { value: 25 }, { value: 40 }, { value: 35 }, { value: 50 }, 
                    { value: 45 }, { value: 65 }, { value: 60 }, { value: 95 }
                ],
                sparklineColor: "#00DC85",
                showFill: true
            },
            { title: "Total Meetings", value: `${summary.totalMeetings ?? 0} Meetings`, change: "+2.45%", iconType: "Headset", showAvatars: true },
            { title: "Total Videos", value: `${summary.totalVideos ?? 0} Videos`, change: "+2.45%", iconType: "Progress", showAvatars: true },
            { title: "Total Messages", value: `${summary.totalMessages ?? 0} Messages`, change: "+2.45%", iconType: "Chats", showAvatars: false },
            { title: "Average Meeting Time", value: `${summary.avgMeetingDuration ?? 0} Mins`, change: null, iconType: "CalendarCheck", showAvatars: false },
            { title: "Avg attendance", 
                value: `${summary.avgAttendance ?? 0}%`, 
                change: "+2.45%", 
                iconType: "Waveform", 
                showAvatars: false,
                sparkline: [
                    { value: 40 }, { value: 90 }, { value: 30 }, { value: 95 }, 
                    { value: 50 }, { value: 100 }, { value: 40 }, { value: 105 },
                    { value: 60 }, { value: 110 }, { value: 50 }, { value: 115 },
                    { value: 70 }, { value: 120 }, { value: 60 }, { value: 125 }
                ],
                sparklineColor: "#0076EA",
                showFill: false
            }
        ];
    }, [summary]);

    const comparisonData = useMemo(() => {
        if (!rawComparison) return null;
        const safeGet = (category) => ({
            current: rawComparison[category]?.current || 0,
            previous: rawComparison[category]?.previous || 0
        });
        return [
            { name: 'Groups', ...safeGet('groups') },
            { name: 'Members', ...safeGet('members') },
            { name: 'Meetings', ...safeGet('meetings') },
            { name: 'Videos', ...safeGet('videos') },
            { name: 'Messages', ...safeGet('messages') },
            { name: 'Attendance', ...safeGet('attendance') }
        ];
    }, [rawComparison]);

    const dailyActivityData = useMemo(() => {
        if (!rawTrends || rawTrends.length === 0) return null;
        return rawTrends.map(trend => {
            let displayDate = trend.date;
            try {
                if (trend.date && trend.date.includes('-')) {
                    const parts = trend.date.split('T')[0].split('-');
                    if (parts.length === 3) {
                        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
                        displayDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                    } else {
                        const dateObj = new Date(trend.date);
                        if (!isNaN(dateObj)) {
                            displayDate = dateObj.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
                        }
                    }
                }
            } catch (e) { }
            return {
                name: displayDate,
                groups: trend.groups || 0,
                meetings: trend.meetings || 0,
                videos: trend.videos || 0
            };
        });
    }, [rawTrends]);

    const groupsData = useMemo(() => {
        if (!rawGroups || rawGroups.length === 0) return [];
        return rawGroups.map(group => {
            const date = new Date(group.created_at);
            return {
                id: group.id,
                name: group.group_name,
                members: group.totalMembers ?? 0,
                meetings: group.totalMeetings ?? 0,
                videos: group.totalVideos ?? 0,
                messages: group.totalMessages ?? 0,
                comments: group.totalComments ?? 0,
                createdAt: group.created_at
                    ? `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                    : '-'
            };
        });
    }, [rawGroups]);

    const meetingsData = useMemo(() => {
        if (!rawMeetings || rawMeetings.length === 0) return [];
        return rawMeetings.map(meeting => {
            const startDate = new Date(meeting.start_time);
            return {
                id: meeting.id,
                title: meeting.title,
                group: meeting.group_name,
                startDate: meeting.start_time
                    ? `${startDate.getDate()}/${startDate.getMonth() + 1}/${startDate.getFullYear()}`
                    : '-',
                duration: `${meeting.duration ?? 0} mins`,
                status: meeting.status,
                isWeekly: meeting.is_weekly,
                isRecorded: meeting.recording === true || meeting.recording === 1 || meeting.recording === '1' || String(meeting.recording).trim() === '1' || meeting.recording === 'Recording' || 
                           meeting.record_meeting === true || meeting.record_meeting === 1 || meeting.record_meeting === '1' || meeting.recordMeeting === 'Recording'
            };
        });
    }, [rawMeetings]);

    return { cardsData, comparisonData, dailyActivityData, groupsData, meetingsData, loading };
};

export default useAnalysisData;