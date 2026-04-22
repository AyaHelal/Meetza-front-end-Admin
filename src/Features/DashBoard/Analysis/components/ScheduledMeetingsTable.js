import React, { useRef } from 'react';
import './GroupsTable.css'; // Reusing the same styles as GroupsTable

const ScheduledMeetingsTable = ({ meetingsData = [] }) => {
    const headerRef = useRef(null);

    const handleScroll = (e) => {
        if (headerRef.current) {
            headerRef.current.scrollLeft = e.target.scrollLeft;
        }
    };

    return (
        <div className="px-4 mt-2 mb-4">
            <div className="mb-3">
                <h4 className="fw-semibold mb-0" style={{ color: "#010101" }}>Scheduled Meetings</h4>
            </div>

            <div className="bg-g activity-comparison-card groups-table-card p-0 overflow-hidden position-relative">
                <div className="groups-table-header-wrapper" ref={headerRef}>
                    <table className="table table-borderless mb-0 align-middle groups-table">
                        <colgroup>
                            <col style={{ width: '16.66%' }} />
                            <col style={{ width: '16.66%' }} />
                            <col style={{ width: '16.66%' }} />
                            <col style={{ width: '16.66%' }} />
                            <col style={{ width: '16.66%' }} />
                            <col style={{ width: '16.66%' }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th className="ps-4 py-3">Title</th>
                                <th className="text-center py-3">Group</th>
                                <th className="text-center py-3">Start Date</th>
                                <th className="text-center py-3">Duration</th>
                                <th className="text-center py-3">Status</th>
                                <th className="text-center pe-4 py-3">Features</th>
                            </tr>
                        </thead>
                    </table>
                </div>
                <div className="table-responsive groups-table-container position-relative" onScroll={handleScroll}>
                    <table className="table table-borderless mb-0 align-middle groups-table">
                        <colgroup>
                            <col style={{ width: '16.66%' }} />
                            <col style={{ width: '16.66%' }} />
                            <col style={{ width: '16.66%' }} />
                            <col style={{ width: '16.66%' }} />
                            <col style={{ width: '16.66%' }} />
                            <col style={{ width: '16.66%' }} />
                        </colgroup>
                        <tbody>
                            {meetingsData.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-4 text-muted">No scheduled meetings found</td>
                                </tr>
                            ) : (
                                meetingsData.map((row) => (
                                    <tr key={row.id}>
                                        <td className="ps-4 py-3" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.title}>
                                            {row.title}
                                        </td>
                                        <td className="text-center py-3">{row.group}</td>
                                        <td className="text-center py-3">{row.startDate}</td>
                                        <td className="text-center py-3">{row.duration}</td>
                                        <td className="text-center py-3">
                                            <span className={`badge ${row.status === 'Scheduled' ? 'bg-primary' : 'bg-secondary'}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="text-center pe-4 py-3">
                                            <div className="d-flex flex-wrap justify-content-center gap-1">
                                                {row.isWeekly && (
                                                    <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-2" style={{ fontSize: '0.75rem' }}>
                                                        Weekly
                                                    </span>
                                                )}
                                                {row.isRecorded && (
                                                    <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle px-2" style={{ fontSize: '0.75rem' }}>
                                                        Recording
                                                    </span>
                                                )}
                                                {!row.isWeekly && !row.isRecorded && <span className="text-muted small">-</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ScheduledMeetingsTable;
