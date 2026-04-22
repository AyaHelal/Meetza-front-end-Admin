import { useState, useEffect, useMemo } from 'react';
import api from '../../../../utils/api';

const useAnalysisData = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Fetch reports summary data from API
                const response = await api.get('/reports/analytics');
                const data = response.data?.summary || response.data?.data?.summary || response.data;
                setSummary(data);
            } catch (error) {
                console.error("Failed to load analytics data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

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

    return { cardsData, loading };
};

export default useAnalysisData;
