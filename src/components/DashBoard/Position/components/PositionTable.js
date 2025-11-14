import { PositionRow } from "./PositionRow";
import { SearchBar } from "../../shared/SearchBar";
import { PlusCircle } from "phosphor-react";

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
  return (
    <div className="m-4 rounded-3" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <div className="card shadow-sm rounded-3 border-0">
        <div className="d-flex justify-content-between align-items-center p-4">
          <h2 className="h4 m-0 fw-semibold" style={{ color: "#010101" }}>Position Management</h2>
          <div className="d-flex gap-3 align-items-center">
            <button
                className="btn rounded-4 d-flex align-items-center gap-2"
                onClick={onAdd}
                disabled={addingNew}
                style={{
                    background: "linear-gradient(to right, #0076EA, #00DC85)",
                    color: "white",
                    fontSize: "16px",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    paddingLeft: "1.5rem",
                    paddingRight: "1.5rem",
                    border: "none",
                }}
            >
                <PlusCircle size={20} weight="bold" />
                <span className="fw-semibold">Create Position</span>
            </button>
            <SearchBar
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Search positions..."
            />
          </div>
        </div>
        <div className="table-responsive overflow-hidden">
          <table className="table table-borderless">
            <thead style={{ borderBottom: "5px solid #F4F4F4" }}>
              <tr>
                {currentUser?.role === 'Super_Admin' && (
                  <th className="fw-semibold px-4" style={{ color: "#888888" }}>
                    User
                  </th>
                )}
                <th className="fw-semibold px-4" style={{ color: "#888888" }}>
                  Position
                </th>
                <th className="fw-semibold px-4" style={{ color: "#888888" }}>
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
                      users={users}
                    />
                  ))}
                  {addingNew && (
                    <PositionRow
                      key="new"
                      user={currentUser}
                      position={null}
                      onSave={onSave}
                      onEdit={onAdd}
                      onDelete={onAdd}
                      isEditing={true}
                      users={users}
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
