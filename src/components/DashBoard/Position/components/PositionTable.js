import { PositionRow } from "./PositionRow";
import { Plus } from "phosphor-react";
import { SearchBar } from "../../shared/SearchBar";

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
}) => {
  return (
    <div className="m-4 rounded-3" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <div className="card shadow-sm rounded-3 border-0">
        <div className="d-flex justify-content-between align-items-center p-4">
          <h2 className="h4 m-0 fw-semibold" style={{ color: "#010101" }}>Position Management</h2>
          <div className="d-flex gap-3 align-items-center">
            <SearchBar
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Search positions..."
            />
            <button
              className="btn btn-success rounded-4 d-flex align-items-center gap-2"
              onClick={onAdd}
              disabled={addingNew}
              style={{
                background: "linear-gradient(to right, #0076EA, #00DC85)",
                border: "2px solid #E9ECEF",
                padding: "0.75rem 1.5rem",
                whiteSpace: 'nowrap'
              }}
            >
              <Plus size={20} weight="bold" />
              Add Position
            </button>
          </div>
        </div>
        <div className="table-responsive overflow-hidden">
          <table className="table table-borderless">
            <thead style={{ borderBottom: "5px solid #F4F4F4" }}>
              <tr>
                <th className="fw-semibold px-4" style={{ color: "#888888" }}>
                  Administrator
                </th>
                <th className="fw-semibold" style={{ color: "#888888" }}>
                  Position
                </th>
                <th className="fw-semibold" style={{ color: "#888888" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-danger">
                    {error}
                  </td>
                </tr>
              ) : positions.length === 0 && !addingNew ? (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted">
                    No positions found
                  </td>
                </tr>
              ) : (
                <>
                  {positions.map((pos) => (
                    <PositionRow
                      key={pos.id}
                      user={currentUser}
                      position={pos}
                      onSave={onSave}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isEditing={editing[pos.id]}
                    />
                  ))}
                  {addingNew && (
                    <PositionRow
                      key="new"
                      user={currentUser}
                      position={null}
                      onSave={onSave}
                      isEditing={editing["new"]}
                    />
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
