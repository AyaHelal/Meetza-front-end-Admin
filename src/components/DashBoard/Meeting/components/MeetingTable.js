import { MeetingRow } from "./MeetingRow";
import { PlusCircle } from "phosphor-react";
import { SearchBar } from "../../shared/SearchBar";

export const MeetingTable = ({ meetings, loading, error, onSave, onDelete, onEdit, onAdd, searchTerm, onSearchChange, addingNew, editing, contents, currentUser }) => {
    return (
        <div className="m-4 rounded-3" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div className="card shadow-sm rounded-3 border-0">
            <div className="d-flex justify-content-between align-items-center p-4">
            <h2 className="h4 m-0 fw-semibold">Meeting Management</h2>
            <div className="d-flex gap-3 align-items-center">
                <button className="btn rounded-4 d-flex align-items-center gap-2" onClick={onAdd} disabled={addingNew} style={{ background: "linear-gradient(to right, #0076EA, #00DC85)", color: "white", fontSize: "16px", padding: "0.75rem 1.5rem", border: "none" }}>
                <PlusCircle size={20} weight="bold" />
                <span className="fw-semibold">Create Meeting</span>
                </button>
                <SearchBar value={searchTerm} onChange={onSearchChange} placeholder="Search meetings..." />
            </div>
            </div>

            <div className="table-responsive overflow-hidden">
            <table className="table table-borderless">
                <thead style={{ borderBottom: "5px solid #F4F4F4" }}>
                <tr>
                    <th className="fw-semibold px-4" style={{ color: "#888888", minWidth: '150px' }}>Title</th>
                    <th className="fw-semibold px-4" style={{ color: "#888888", minWidth: '150px' }}>Datetime</th>
                    <th className="fw-semibold px-4" style={{ color: "#888888", minWidth: '200px' }}>Status</th>
                    <th className="fw-semibold px-4" style={{ color: "#888888", minWidth: '200px' }}>Content Name</th>
                    <th className="fw-semibold" style={{ color: "#888888" }}>Actions</th>
                </tr>
                </thead>
                <tbody>
                {loading ? (
                    <tr><td colSpan="5" className="text-center py-4">Loading...</td></tr>
                ) : error ? (
                    <tr><td colSpan="5" className="text-center py-4 text-danger">{error}</td></tr>
                ) : meetings.length === 0 && !addingNew ? (
                    <tr><td colSpan="5" className="text-center py-4">No meetings found</td></tr>
                ) : (
                    <>
                    {meetings.map((m) => (
                        <MeetingRow key={m.id} meeting={m} isEditing={editing[m.id]} onSave={onSave} onEdit={onEdit} onDelete={onDelete} contents={contents} currentUser={currentUser} />
                    ))}
                    {addingNew && <MeetingRow key="new" meeting={null} isEditing={true} onSave={onSave} contents={contents} currentUser={currentUser} />}
                    </>
                )}
                </tbody>
            </table>
            </div>
        </div>
        </div>
    );
};
