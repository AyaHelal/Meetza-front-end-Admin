import { PositionRow } from "./PositionRow";

export const PositionTable = ({
  currentUser,
  positions,
  loading,
  error,
  onSave,
  onDelete,
  onEdit,
  editing,
  addingNew,
}) => {
  return (
    <div className="m-4 rounded-3" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <div className="card shadow-sm rounded-3 border-0">
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
