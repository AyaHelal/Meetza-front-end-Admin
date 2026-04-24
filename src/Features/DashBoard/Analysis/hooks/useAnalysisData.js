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
    const [rawVideos, setRawVideos] = useState(() => {
        const cached = localStorage.getItem(`${cacheKey}_videos`);
        return cached ? JSON.parse(cached) : [];
    });
    const [rawReviews, setRawReviews] = useState(() => {
        const cached = localStorage.getItem(`${cacheKey}_reviews`);
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
                const newVideos = responseData?.videos || [];
                const newReviews = responseData?.reviews || [];


                setSummary(newSummary);
                setRawComparison(newComparison);
                setRawTrends(newTrends);
                setRawGroups(newGroups);
                setRawMeetings(newMeetings);
                setRawVideos(newVideos);
                setRawReviews(newReviews);

                // Save to localStorage
                localStorage.setItem(`${cacheKey}_summary`, JSON.stringify(newSummary));
                localStorage.setItem(`${cacheKey}_comparison`, JSON.stringify(newComparison));
                localStorage.setItem(`${cacheKey}_trends`, JSON.stringify(newTrends));
                localStorage.setItem(`${cacheKey}_groups`, JSON.stringify(newGroups));
                localStorage.setItem(`${cacheKey}_meetings`, JSON.stringify(newMeetings));
                localStorage.setItem(`${cacheKey}_videos`, JSON.stringify(newVideos));
                localStorage.setItem(`${cacheKey}_reviews`, JSON.stringify(newReviews));

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

        const getVal = (item) => {
            if (typeof item === 'object' && item !== null) {
                return item.numbers ?? 0;
            }
            return item ?? 0;
        };

        const getPhotos = (item) => {
            if (typeof item === 'object' && item !== null && Array.isArray(item.photos)) {
                return item.photos.filter(p => p && p.trim() !== '');
            }
            return [];
        };

        return [
            {
                title: "Total Groups",
                value: `${getVal(summary.totalGroups)} Groups`,
                change: null,
                iconType: "UsersFour",
                showAvatars: true,
                avatars: getPhotos(summary.totalGroups)
            },
            {
                title: "Total Members",
                value: `${getVal(summary.totalMembers)} Members`,
                change: null,
                iconType: "ChartLineUp",
                showAvatars: true,
                avatars: getPhotos(summary.totalMembers),
                sparkline: [
                    { value: 10 }, { value: 20 }, { value: 15 }, { value: 30 },
                    { value: 25 }, { value: 40 }, { value: 35 }, { value: 50 },
                    { value: 45 }, { value: 65 }, { value: 60 }, { value: 95 }
                ],
                sparklineColor: "#00DC85",
                showFill: true
            },
            {
                title: "Total Meetings",
                value: `${getVal(summary.totalMeetings)} Meetings`,
                change: null,
                iconType: "Headset",
                showAvatars: true,
                avatars: getPhotos(summary.totalMeetings)
            },
            {
                title: "Total Videos",
                value: `${getVal(summary.totalVideos)} Videos`,
                change: null,
                iconType: "Progress",
                showAvatars: true,
                avatars: getPhotos(summary.totalVideos)
            },
            {
                title: "Total Messages",
                value: `${getVal(summary.totalMessages)} Messages`,
                change: null,
                iconType: "Chats",
                showAvatars: false
            },
            {
                title: "Average Meeting Time",
                value: `${getVal(summary.avgMeetingDuration)} Mins`,
                change: null,
                iconType: "CalendarCheck",
                showAvatars: false
            },
            {
                title: "Avg Meeting attendance",
                value: `${getVal(summary.avgMeetingAttendance)}`,
                change: null,
                iconType: "WaveSine",
                showAvatars: false,
                sparkline: [
                    { value: 30 }, { value: 40 }, { value: 35 }, { value: 50 },
                    { value: 49 }, { value: 60 }, { value: 70 }, { value: 91 }
                ],
                showFill: true
            },
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
            { name: 'Attendance', ...safeGet('meetingAttendance') },
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
                    meeting.record_meeting === true || meeting.record_meeting === 1 || meeting.record_meeting === '1' || meeting.recordMeeting === 'Recording',
                attendeeCount: meeting.attendeeCount ?? 0,
                posterUrl: meeting.poster_url || null
            };
        });
    }, [rawMeetings]);

    const videosData = useMemo(() => {
        if (!rawVideos || rawVideos.length === 0) return [];
        return rawVideos.map(video => {
            const date = new Date(video.created_at);
            return {
                id: video.id,
                title: video.title,
                group: video.group_name,
                date: video.created_at
                    ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '-',
                posterUrl: video.poster_url || video.thumbnail_url || video.thumbnail || video.cover_url || null,
                duration: video.duration_seconds || 0,
                commentCount: video.commentCount || 0,
                likeCount: video.likeCount || 0,
                viewerCount: video.viewerCount || 0,
                avgProgressPercent: video.avgProgressPercent || 0,
                completionRate: video.completionRate || 0
            };
        });
    }, [rawVideos]);

    const reviewsData = useMemo(() => {
        if (!rawReviews || rawReviews.length === 0) return [];
        return rawReviews.map(review => {
            const date = new Date(review.created_at);
            return {
                id: review.id,
                comment: review.comment_text,
                reviewerName: review.reviewer_name,
                reviewerPhoto: review.reviewer_photo,
                videoTitle: review.video_title,
                videoPoster: review.video_poster,
                groupName: review.group_name,
                date: review.created_at
                    ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '-',
                rawDate: review.created_at
            };
        });
    }, [rawReviews]);

    return { cardsData, comparisonData, dailyActivityData, groupsData, meetingsData, videosData, reviewsData, loading };
};

export default useAnalysisData;