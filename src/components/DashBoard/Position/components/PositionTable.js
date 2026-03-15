import { PositionRow } from "./PositionRow";
import { PositionRowCard } from "./PositionRowCard";
import { SearchBar } from "../../shared/SearchBar";
import { PlusCircle } from "phosphor-react";
import '../../CSS/Table.css';

const colCount = (currentUser) => (currentUser?.role === 'Super_Admin' ? 3 : 2);

export const PositionTable = ({
  currentUser,
  positions,
  loading,
  error,
  onSave,
  onDelete,
  onEdit,
  onAdd,
  searchTerm,
  onSearchChange,
  editing,
  addingNew,
  users = [],
}) => {
  const cols = colCount(currentUser);

  return (
    <div className="m-4 rounded-3 position-management-card">
      <div className="card shadow-sm rounded-3 border-0">
        <div className="position-header p-4">
          <h2 className="position-header-title h4 m-0 fw-semibold">Position Management</h2>
          <div className="position-header-actions">
            <button
              type="button"
              className="btn rounded-4 d-flex align-items-center gap-2 position-header-btn"
              onClick={onAdd}
              disabled={addingNew}
            >
              <PlusCircle size={20} weight="bold" />
              <span className="fw-semibold">Create Position</span>
            </button>
            <div className="position-header-search">
              <SearchBar
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Search positions..."
                className="w-100"
              />
            </div>
          </div>
        </div>

        {/* Desktop: table */}
        <div className="position-table-desktop table-responsive user-table-container rounded-3">
          <table className="table table-borderless">
            <thead className="table-header-sticky">
              <tr>
                {currentUser?.role === 'Super_Admin' && (
                  <th className="fw-semibold px-4 position-th">User</th>
                )}
                <th className="fw-semibold px-4 position-th">Position</th>
                <th className="fw-semibold px-4 position-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={cols} className="text-center py-4 text-muted">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={cols} className="text-center py-4 text-danger">{error}</td>
                </tr>
              ) : positions.length === 0 && !addingNew ? (
                <tr>
                  <td colSpan={cols} className="text-center py-4 text-muted">No positions found</td>
                </tr>
              ) : (
                positions.map((pos) => (
                  <PositionRow
                    key={pos.id}
                    user={currentUser}
                    position={pos}
                    onSave={onSave}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isEditing={false}
                    users={users}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile: cards */}
        <div className="position-table-mobile user-cards-container">
          {loading ? (
            <div className="user-card user-card-placeholder text-center py-4 text-muted">Loading...</div>
          ) : error ? (
            <div className="user-card user-card-placeholder text-center py-4 text-danger">{error}</div>
          ) : positions.length === 0 && !addingNew ? (
            <div className="user-card user-card-placeholder text-center py-4 text-muted">No positions found</div>
          ) : (
            positions.map((pos) => (
              <PositionRowCard
                key={pos.id}
                user={currentUser}
                position={pos}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
