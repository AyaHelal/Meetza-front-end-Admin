import React from 'react';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/light.css";
import { CalendarBlank } from "phosphor-react";

const AnalysisHeader = ({ currentUser, dateRange, setDateRange }) => {
    return (
        <div
            className="bg-white border-bottom px-4 py-3 mt-4 mx-4 rounded-3 d-flex justify-content-between align-items-center"
            style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
        >
            <div>
                <h1 className="h4 fw-semibold mb-1" style={{ color: "#010101" }}>
                    Hello, {currentUser?.name || "User"}
                </h1>
                <p className="mb-0" style={{ color: "#888888", fontSize: "16px" }}>
                    Welcome back, Track your team progress...
                </p>
            </div>
            
            <div className="d-flex align-items-center gap-3">
                <div className="position-relative" style={{ minWidth: '260px' }}>
                    <div className="position-absolute top-50 translate-middle-y" style={{ left: '16px', zIndex: 10 }}>
                        <CalendarBlank size={20} color="#010101" weight="regular" />
                    </div>
                    <Flatpickr
                        value={dateRange}
                        onChange={(dates) => setDateRange(dates)}
                        options={{
                            mode: "range",
                            dateFormat: "d M Y",
                            locale: {
                                rangeSeparator: '  -  '
                            }
                        }}
                        className="form-control bg-white text-center"
                        style={{
                            paddingLeft: '44px',
                            paddingTop: '10px',
                            paddingBottom: '10px',
                            borderRadius: '30px',
                            border: '1px solid #888888',
                            color: '#010101',
                            fontWeight: '600',
                            fontSize: '15px',
                            cursor: 'pointer',
                            boxShadow: 'none',
                            width: '100%'
                        }}
                        placeholder="Select Date Range"
                    />
                </div>
            </div>
        </div>
    );
};

export default AnalysisHeader;
