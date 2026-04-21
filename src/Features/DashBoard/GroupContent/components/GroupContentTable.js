import { GroupContentRow } from "./GroupContentRow";
import { GroupContentRowCard } from "./GroupContentRowCard";
import { SearchBar } from "../../shared/SearchBar";
import "../../CSS/Table.css";

export const GroupContentTable = ({
  contents,
  loading,
  error,
  onDelete,
  onEdit,
  searchTerm,
  onSearchChange,
  currentUser,
}) => {
  const isSuperAdmin = currentUser?.role === "Super_Admin" || currentUser?.role === "Administrator";

  const filteredContents =
    searchTerm.length >= 3
      ? contents.filter((content) =>
          content.content_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : contents;

  return (
    <div className="m-4 rounded-3" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <div className="card shadow-sm rounded-3 border-0">
        <div className="card-body p-3 mb-4 position-header">
          <h2 className="h4 m-0 fw-semibold position-header-title">Group Content Management</h2>
          <div className="position-header-actions">
            <div className="position-header-search">
              <SearchBar
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Search contents..."
                className="w-100"
              />
            </div>
          </div>
        </div>

        <div className="content-table-desktop table-responsive user-table-container rounded-3">
          <table className="table table-borderless">
            <thead className="table-header-sticky">
              <tr>
                <th className="fw-semibold px-4 content-th">Content Name</th>
                <th className="fw-semibold px-4 content-th">Content Description</th>
                <th className="fw-semibold px-4 content-th">Group Name</th>
                <th className="fw-semibold text-center content-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-danger">
                    {error}
                  </td>
                </tr>
              ) : filteredContents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    No contents found
                  </td>
                </tr>
              ) : (
                filteredContents.map((content) => (
                  <GroupContentRow
                    key={content.id}
                    content={content}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    currentUser={currentUser}
                    isSuperAdmin={isSuperAdmin}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="content-table-mobile user-cards-container">
          {loading ? (
            <div className="user-card user-card-placeholder text-center py-4 text-muted">
              Loading...
            </div>
          ) : error ? (
            <div className="user-card user-card-placeholder text-center py-4 text-danger">
              {error}
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="user-card user-card-placeholder text-center py-4 text-muted">
              No contents found
            </div>
          ) : (
            filteredContents.map((content) => (
              <GroupContentRowCard
                key={content.id}
                content={content}
                onEdit={onEdit}
                currentUser={currentUser}
                isSuperAdmin={isSuperAdmin}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
