import React, { useState } from 'react';
import AnalysisHeader from './components/AnalysisHeader';
import OverallNumbers from './components/OverallNumbers';
import ActivityComparison from './components/ActivityComparison';
import DailyActivity from './components/DailyActivity';
import GroupsTable from './components/GroupsTable';
import ScheduledMeetingsTable from './components/ScheduledMeetingsTable';
import RecentVideos from './components/RecentVideos';
import RecentReviews from './components/RecentReviews';
import useAnalysisData from './hooks/useAnalysisData';
import './Analysis.css';

const Analysis = ({ currentUser }) => {
    // Default to the last 7 days or a specific range
    const [dateRange, setDateRange] = useState([]);

    // Format dates to YYYY-MM-DD for API in local timezone to avoid off-by-one errors
    const formatDate = (date) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const startDate = dateRange[0] ? formatDate(dateRange[0]) : null;
    const endDate = dateRange[1] ? formatDate(dateRange[1]) : null;

    const { cardsData, comparisonData, dailyActivityData, groupsData, meetingsData, videosData, reviewsData } = useAnalysisData(startDate, endDate);

    return (
        <div className="w-100">
            <AnalysisHeader
                currentUser={currentUser}
                dateRange={dateRange}
                setDateRange={setDateRange}
            />
            <OverallNumbers cardsData={cardsData} />

            <div className="row px-4 mb-2 g-4">
                <div className="col-12 col-xl-6">
                    <ActivityComparison data={comparisonData} />
                </div>
                <div className="col-12 col-xl-6">
                    <DailyActivity data={dailyActivityData} />
                </div>
            </div>

            <GroupsTable groupsData={groupsData} />
            <ScheduledMeetingsTable meetingsData={meetingsData} />
            <RecentVideos videosData={videosData} />
            <RecentReviews reviewsData={reviewsData} />

            {/* Future analysis components will go here */}
        </div>
    );
};

export default Analysis;
