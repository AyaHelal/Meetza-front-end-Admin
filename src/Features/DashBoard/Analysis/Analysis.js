import React from 'react';
import AnalysisHeader from './components/AnalysisHeader';
import OverallNumbers from './components/OverallNumbers';
import useAnalysisData from './hooks/useAnalysisData';
import './Analysis.css';

const Analysis = ({ currentUser }) => {
    const { cardsData } = useAnalysisData();

    return (
        <div className="w-100">
            <AnalysisHeader currentUser={currentUser} />
            <OverallNumbers cardsData={cardsData} />
            {/* Future analysis components will go here */}
        </div>
    );
};

export default Analysis;
