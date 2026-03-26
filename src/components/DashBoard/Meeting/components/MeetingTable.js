import { MeetingRow } from "./MeetingRow";
import { MeetingRowCard } from "./MeetingRowCard";
import { PlusCircle } from "phosphor-react";
import { SearchBar } from "../../shared/SearchBar";
import "../../CSS/Table.css";

export const MeetingTable = ({
  meetings,
  groups = [],
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
  return (
    <div className="m-4 rounded-3" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <div className="card shadow-sm rounded-3 border-0">
        <div className="card-body p-3 mb-4 position-header">
          <h2 className="h4 m-0 fw-semibold position-header-title">Meeting Management</h2>
          <div className="position-header-actions">
            <button
              type="button"
              className="btn rounded-4 d-flex align-items-center gap-2 position-header-btn"
              onClick={onAdd}
              disabled={addingNew}
            >
              <PlusCircle size={20} weight="bold" />
              <span className="fw-semibold">Create Meeting</span>
            </button>
            <div className="position-header-search">
              <SearchBar
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Search meetings..."
                className="w-100"
              />
            </div>
          </div>
        </div>

        <div className="meeting-table-desktop table-responsive user-table-container rounded-3">
          <table className="table table-borderless">
            <thead className="table-header-sticky">
              <tr>
                <th className="fw-semibold px-4 meeting-th">Title</th>
                <th className="fw-semibold px-4 meeting-th">Group</th>
                <th className="fw-semibold px-4 meeting-th">Start_Time</th>
                <th className="fw-semibold px-4 meeting-th">End_Time</th>
                <th className="fw-semibold px-4 meeting-th">Recording</th>
                <th className="fw-semibold px-4 meeting-th">Weekly</th>
                <th className="fw-semibold px-4 meeting-th">Status</th>
                <th className="fw-semibold meeting-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-danger">
                    {error}
                  </td>
                </tr>
              ) : meetings.length === 0 && !addingNew ? (
                <tr>
                  <td colSpan={8} className="text-center py-4">
                    No meetings found
                  </td>
                </tr>
              ) : (
                <>
                  {meetings.map((m) => (
                    <MeetingRow
                      key={m.id}
                      meeting={m}
                      groups={groups}
                      isEditing={editing[m.id]}
                      onSave={onSave}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      currentUser={currentUser}
                    />
                  ))}
                  {addingNew && (
                    <MeetingRow
                      key="new"
                      meeting={null}
                      groups={groups}
                      isEditing={true}
                      onSave={onSave}
                      currentUser={currentUser}
                    />
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="meeting-table-mobile user-cards-container">
          {loading ? (
            <div className="user-card user-card-placeholder text-center py-4 text-muted">
              Loading...
            </div>
          ) : error ? (
            <div className="user-card user-card-placeholder text-center py-4 text-danger">
              {error}
            </div>
          ) : meetings.length === 0 ? (
            <div className="user-card user-card-placeholder text-center py-4 text-muted">
              No meetings found
            </div>
          ) : (
            meetings.map((m) => (
              <MeetingRowCard
                key={m.id}
                meeting={m}
                groups={groups}
                onEdit={onEdit}
                onDelete={onDelete}
                currentUser={currentUser}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
