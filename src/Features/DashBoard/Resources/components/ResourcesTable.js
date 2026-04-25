import { PlusCircle } from "phosphor-react";
import "../../CSS/Table.css";
import ResourcesRow from "./ResourcesRow";
import { ResourcesRowCard } from "./ResourcesRowCard";

const ResourcesTable = ({ contents = [], onUploadClick, onLinksClick, onDelete, selectedContentId = null }) => {
  const selectedContent = contents.find((c) => c.id === selectedContentId);
  const visibleResources = selectedContent?.resources || [];

  if (!selectedContentId) {
    return (
      <div className="m-4 rounded-3" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div className="card shadow-sm rounded-3 border-0 branded-card-bg">
          <div className="p-4 text-center text-muted">
            <p>Please select a group content to view its resources.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-4 rounded-3" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <div className="card shadow-sm rounded-3 border-0 branded-card-bg">
        <div className="card-body p-3 mb-4 position-header">
          <h2 className="h5 m-0 fw-semibold position-header-title">Group Content Resources Management</h2>
          <div className="position-header-actions">
            <button
              type="button"
              className="btn rounded-4 d-flex align-items-center gap-2 position-header-btn"
              onClick={onUploadClick}
            >
              <PlusCircle size={20} weight="bold" />
              <span className="fw-semibold">Upload Files</span>
            </button>
            <button
              type="button"
              className="btn rounded-4 d-flex align-items-center gap-2 position-header-btn"
              onClick={onLinksClick}
            >
              <PlusCircle size={20} weight="bold" />
              <span className="fw-semibold">Add Links</span>
            </button>
          </div>
        </div>

        <div className="resources-table-desktop table-responsive user-table-container rounded-3">
          <table className="table table-borderless">
            <thead className="table-header-sticky">
              <tr>
                <th className="fw-semibold px-4 resources-th">File URL</th>
                <th className="fw-semibold px-4 resources-th">File Name</th>
                <th className="fw-semibold px-2 resources-th">File Type</th>
                <th className="fw-semibold px-1 resources-th">File Size</th>
                <th className="fw-semibold px-5 resources-th">Created At</th>
                <th className="fw-semibold px-4 resources-th">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleResources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No resources found
                  </td>
                </tr>
              ) : (
                visibleResources.map((r) => (
                  <ResourcesRow
                    key={r.id}
                    resource={r}
                    onDelete={onDelete}
                    contentId={selectedContentId}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="resources-table-mobile user-cards-container">
          {visibleResources.length === 0 ? (
            <div className="user-card user-card-placeholder text-center py-4 text-muted">
              No resources found
            </div>
          ) : (
            visibleResources.map((r) => (
              <ResourcesRowCard
                key={r.id}
                resource={r}
                onDelete={onDelete}
                contentId={selectedContentId}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesTable;
