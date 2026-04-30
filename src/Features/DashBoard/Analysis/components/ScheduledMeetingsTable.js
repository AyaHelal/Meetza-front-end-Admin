import React, { useRef } from 'react';
import { ArrowDown } from "phosphor-react";
import './ScheduledMeetingsTable.css';

const ScheduledMeetingsTable = ({ meetingsData = [] }) => {
    const headerRef = useRef(null);

    const handleScroll = (e) => {
        if (headerRef.current) {
            headerRef.current.scrollLeft = e.target.scrollLeft;
        }
    };

    return (
        <div className="scheduled-meetings-container mt-2 mb-4">
            <h4 className="scheduled-meetings-title" style={{ color: 'var(--text-primary)' }}>Scheduled Meetings</h4>

            <div className="scheduled-meetings-card">
                <div className="scheduled-meetings-header-wrapper" ref={headerRef}>
                    <table className="scheduled-table mb-0">
                        <colgroup>
                            <col style={{ width: '22%' }} />
                            <col style={{ width: '13%' }} />
                            <col style={{ width: '12%' }} />
                            <col style={{ width: '11%' }} />
                            <col style={{ width: '12%' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '15%' }} />
                        </colgroup>
                        <thead>
                            <tr>
                                <th>
                                    Title <ArrowDown size={20} className="sort-icon" />
                                </th>
                                <th>Group</th>
                                <th>Start Date</th>
                                <th>Duration</th>
                                <th>Attendees</th>
                                <th>
                                    Status <ArrowDown size={20} className="sort-icon" />
                                </th>
                                <th>Features</th>
                            </tr>
                        </thead>
                    </table>
                </div>

                <div className="scheduled-meetings-table-wrapper" onScroll={handleScroll}>
                    <table className="scheduled-table">
                        <colgroup>
                            <col style={{ width: '22%' }} />
                            <col style={{ width: '13%' }} />
                            <col style={{ width: '12%' }} />
                            <col style={{ width: '11%' }} />
                            <col style={{ width: '12%' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '15%' }} />
                        </colgroup>
                        <tbody>
                            {meetingsData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-4 text-muted">No scheduled meetings found</td>
                                </tr>
                            ) : (
                                meetingsData.map((row, index) => (
                                    <tr key={row.id || index}>
                                        <td title={row.title}>
                                            <div style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {row.title}
                                            </div>
                                        </td>
                                        <td>{row.group}</td>
                                        <td>{row.startDate}</td>
                                        <td>{row.duration}</td>
                                        <td>
                                            <span className="fw-semibold" style={{ color: 'var(--text-primary)' }}>
                                                {row.attendeeCount ?? 0}
                                            </span>
                                        </td>
                                        <td>
                                            {(() => {
                                                const status = row.status?.toLowerCase();
                                                let pillClass = 'status-scheduled-green';
                                                let dotClass = 'dot-green';

                                                if (status === 'completed') {
                                                    pillClass = 'status-completed-blue';
                                                    dotClass = 'dot-blue';
                                                } else if (status === 'cancelled' || status === 'cancel') {
                                                    pillClass = 'status-cancelled-red';
                                                    dotClass = 'dot-red';
                                                }

                                                return (
                                                    <span className={`status-pill ${pillClass}`}>
                                                        <span className={`status-dot ${dotClass}`}></span>
                                                        {row.status}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="features-column">
                                            <div className="d-flex flex-wrap justify-content-center gap-1">
                                                {!!row.isWeekly && (
                                                    <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-2" style={{ fontSize: '0.75rem' }}>
                                                        Weekly
                                                    </span>
                                                )}
                                                {!!row.isRecorded && (
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
