import React, { useMemo } from "react";
import { PlusCircle } from "phosphor-react";
import '../../CSS/Table.css';
import ResourcesRow from "./ResourcesRow";

const ResourcesTable = ({ contents = [], currentUser, onUploadClick, onDelete, selectedContentId = null }) => {
    // Find the selected content and get its resources directly
    const selectedContent = contents.find(c => c.id === selectedContentId);
    const visibleResources = selectedContent?.resources || [];

    // If no content selected, show message
    if (!selectedContentId) {
        return (
            <div className="m-4 rounded-3" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div className="card shadow-sm rounded-3 border-0">
                    <div className="p-4 text-center text-muted">
                        <p>Please select a group content to view its resources.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="m-4 rounded-3" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div className="card shadow-sm rounded-3 border-0">
            <div className="d-flex justify-content-between align-items-center p-4">
            <h2 className="h5 m-0 fw-semibold">Group Content Resources Management</h2>
            <div className="d-flex gap-3 align-items-center">
                <button
                className="btn rounded-4 d-flex align-items-center gap-2"
                onClick={onUploadClick}
                style={{ background: "linear-gradient(to right, #0076EA, #00DC85)", color: "white", border: "none" }}
                >
                <PlusCircle size={20} weight="bold" />
                <span className="fw-semibold">Upload Files</span>
                </button>
            </div>
            </div>

            <div className="table-responsive user-table-container rounded-3">
            <table className="table table-borderless">
                <thead className="table-header-sticky">
                <tr>
                    <th className="fw-semibold px-4" style={{color: "#888888"}}>File URL</th>
                    <th className="fw-semibold px-4" style={{color: "#888888"}}>File Name</th>
                    <th className="fw-semibold px-2" style={{color: "#888888"}}>File Type</th>
                    <th className="fw-semibold px-1" style={{color: "#888888"}}>File Size</th>
                    <th className="fw-semibold px-5" style={{color: "#888888"}}>Created At</th>
                    <th className="fw-semibold px-4" style={{color: "#888888"}}>Action</th>
                </tr>
                </thead>
                        <tbody>
                            {visibleResources.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-4">No resources found</td></tr>
                            ) : (
                                visibleResources.map(r => (
                                    <ResourcesRow key={r.id} resource={r} onDelete={onDelete} contentId={selectedContentId} />
                                ))
                            )}
                        </tbody>
            </table>
            </div>
        </div>
        </div>
    );
};

export default ResourcesTable;
