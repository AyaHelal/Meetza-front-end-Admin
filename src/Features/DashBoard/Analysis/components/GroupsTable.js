import React from 'react';
import './GroupsTable.css';

const GroupsTable = ({ groupsData = [] }) => {
    return (
        <div className="px-4 mt-2 mb-4">
            <div className="mb-3">
                <h4 className="fw-semibold mb-0" style={{ color: "#010101" }}>Groups</h4>
            </div>

            <div className="bg-g activity-comparison-card groups-table-card p-0 overflow-hidden position-relative">
                <div className="table-responsive groups-table-container position-relative">
                    <table className="table table-borderless mb-0 align-middle groups-table">
                        <thead>
                            <tr>
                                <th className="ps-4 py-3">Group Name</th>
                                <th className="text-center py-3">Members</th>
                                <th className="text-center py-3">Meetings</th>
                                <th className="text-center py-3">Videos</th>
                                <th className="text-center py-3">Messages</th>
                                <th className="text-center py-3">Comments</th>
                                <th className="text-center pe-4 py-3">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {groupsData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-4 text-muted">No groups found</td>
                                </tr>
                            ) : (
                                groupsData.map((row) => (
                                    <tr key={row.id}>
                                        <td className="ps-4 py-3">{row.name}</td>
                                        <td className="text-center py-3">{row.members}</td>
                                        <td className="text-center py-3">{row.meetings}</td>
                                        <td className="text-center py-3">{row.videos}</td>
                                        <td className="text-center py-3">{row.messages}</td>
                                        <td className="text-center py-3">{row.comments}</td>
                                        <td className="text-center pe-4 py-3">{row.createdAt}</td>
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

export default GroupsTable;