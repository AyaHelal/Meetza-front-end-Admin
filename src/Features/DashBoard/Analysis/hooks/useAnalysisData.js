import { useState, useEffect, useMemo } from 'react';
import api from '../../../../utils/api';

const useAnalysisData = (startDate, endDate) => {
    const [summary, setSummary] = useState(null);
    const [rawComparison, setRawComparison] = useState(null);
    const [rawTrends, setRawTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const params = {};
                if (startDate && endDate) {
                    params.startDate = startDate;
                    params.endDate = endDate;
                }

                const response = await api.get('/reports/analytics', { params });
                const responseData = response.data?.data || response.data;

                setSummary(responseData?.summary || responseData);
                setRawComparison(responseData?.comparison || null);
                setRawTrends(responseData?.activityTrends || []);
            } catch (error) {
                console.error("Failed to load analytics data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [startDate, endDate]);

    const cardsData = useMemo(() => {
        if (!summary) return [];

        return [
            { title: "Total Groups", value: `${summary.totalGroups ?? 0} Groups`, change: "+2.45%", iconType: "UsersFour", showAvatars: true },
            { title: "Total Members", value: `${summary.totalMembers ?? 0} Members`, change: "+2.45%", iconType: "ChartLineUp", showAvatars: true },
            { title: "Total Meetings", value: `${summary.totalMeetings ?? 0} Meetings`, change: "+2.45%", iconType: "Headset", showAvatars: true },
            { title: "Total Videos", value: `${summary.totalVideos ?? 0} Videos`, change: "+2.45%", iconType: "Progress", showAvatars: true },
            { title: "Total Messages", value: `${summary.totalMessages ?? 0} Messages`, change: "+2.45%", iconType: "Chats", showAvatars: false },
            { title: "Average Meeting Time", value: `${summary.avgMeetingDuration ?? 0} Mins`, change: null, iconType: "CalendarCheck", showAvatars: false },
            { title: "Avg attendance", value: `${summary.avgAttendance ?? 0}%`, change: "+2.45%", iconType: "Waveform", showAvatars: false }
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
            // Optional: format date if it's full YYYY-MM-DD
            let displayDate = trend.date;
            try {
                if (trend.date && trend.date.includes('-')) {
                    const parts = trend.date.split('T')[0].split('-');
                    if (parts.length === 3) {
                        // Create date in local timezone to avoid off-by-one errors
                        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
                        displayDate = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                    } else {
                        const dateObj = new Date(trend.date);
                        if (!isNaN(dateObj)) {
                            displayDate = dateObj.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
                        }
                    }
                }
            } catch (e) {
                // ignore
            }

            return {
                name: displayDate,
                groups: trend.groups || 0,
                meetings: trend.meetings || 0,
                videos: trend.videos || 0
            };
        });
    }, [rawTrends]);

    return { cardsData, comparisonData, dailyActivityData, loading };
};

export default useAnalysisData;
