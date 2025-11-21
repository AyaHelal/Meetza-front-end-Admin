import { MeetingContentRow } from "./MeetingContentRow";
import { PlusCircle } from "phosphor-react";
import { SearchBar } from "../../shared/SearchBar";
import '../../CSS/Table.css';

export const MeetingContentTable = ({
  contents,
  loading,
  error,
  onSave,
  onDelete,
  onEdit,
  onAdd,
  searchTerm,
  onSearchChange,
  addingNew,
  editing,
  currentUser,
}) => {
  const isSuperAdmin = currentUser?.role === 'Super_Admin' || currentUser?.role === 'Administrator';

  return (
    <div className="m-4 rounded-3" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <div className="card shadow-sm rounded-3 border-0">
        <div className="d-flex justify-content-between align-items-center p-4">
          <h2 className="h4 m-0 fw-semibold">Meeting Content Management</h2>
            <div className="d-flex gap-3 align-items-center">
            {isSuperAdmin && (
              <button
                className="btn rounded-4 d-flex align-items-center gap-2"
                onClick={onAdd}
                disabled={addingNew}
                style={{
                    background: "linear-gradient(to right, #0076EA, #00DC85)",
                    color: "white",
                    fontSize: "16px",
                    padding: "0.75rem 1.5rem",
                    border: "none",
                }}
              >
                <PlusCircle size={20} weight="bold" />
                <span className="fw-semibold">Create Content</span>
              </button>
            )}
            <SearchBar
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Search contents..."
            />
          </div>
        </div>

        <div className="table-responsive user-table-container rounded-3">
          <table className="table table-borderless">
            <thead className="table-header-sticky">
              <tr>
                <th className="fw-semibold px-4" style={{ color: "#888888", minWidth: '150px' }}>Content Name</th>
                <th className="fw-semibold px-4" style={{ color: "#888888", minWidth: '200px' }}>Content Description</th>
                <th className="fw-semibold" style={{ color: "#888888" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" className="text-center py-4">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan="3" className="text-center py-4 text-danger">{error}</td></tr>
              ) : contents.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-4">No contents found</td></tr>
              ) : (
                <>
                  {contents.map((content) => (
                    <MeetingContentRow
                      key={content.id}
                      content={content}
                      onDelete={onDelete}
                      onEdit={onEdit}
                      currentUser={currentUser}
                      isSuperAdmin={isSuperAdmin}
                    />
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
