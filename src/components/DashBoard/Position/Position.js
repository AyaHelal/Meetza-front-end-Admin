import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { usePositionData } from "./hooks/usePositionData";
import { PositionHeader } from "./components/PositionHeader";
import { PositionTable } from "./components/PositionTable";
import { SearchBar } from "./components/SearchBar";
import "../User/UserMainComponent.css";

export default function Position() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const userId = currentUser?.id;

  const {
    positions,
    loading,
    error,
    createPosition,
    updatePosition,
    deletePosition,
    fetchData,
  } = usePositionData(userId);

  const [searchQuery, setSearchQuery] = useState("");
  const [editing, setEditing] = useState({});
  const [addingNew, setAddingNew] = useState(false);


  useEffect(() => {
    if (userId) fetchData();
  }, [userId, fetchData]);

  const handleSave = async (positionId, title, adminId) => {
    if (!title.trim()) {
      toast.error("Position title is required");
      return;
    }
    try {
      if (positionId) {
        await updatePosition(positionId, title);
        toast.success("Position updated successfully");
      } else {
        await createPosition(title, adminId);
        toast.success("Position created successfully");
      }
      await fetchData();
      setEditing((prev) => ({ ...prev, [positionId || "new"]: false }));
      setAddingNew(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save position");
    }
  };

  const handleDelete = async (positionId) => {
    if (!window.confirm("Are you sure you want to delete this position?")) return;
    try {
      const res = await deletePosition(positionId);
      if (res.success) {
        toast.success("Position deleted successfully");
        await fetchData();
      } else {
        toast.error(res.message || "Failed to delete position");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting position");
    }
  };

  const handleEdit = (positionId) => {
    setEditing((prev) => ({ ...prev, [positionId]: true }));
  };

  const handleAdd = () => {
    setAddingNew(true);
    setEditing((prev) => ({ ...prev, "new": true }));
  };

  const filteredPositions = positions.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-fill">
      <PositionHeader />

      <div className="d-flex justify-content-between align-items-center mx-4 my-3">
        <button
          className="btn btn-success rounded-4"
          onClick={handleAdd}
          disabled={addingNew}
          style={{
            background: "linear-gradient(to right, #0076EA, #00DC85)",
            border: "2px solid #E9ECEF",
            paddingTop: "0.75rem",
            paddingBottom: "0.75rem",
          }}
        >
          + Add Position
        </button>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by position name..."
        />
      </div>

      <PositionTable
        currentUser={currentUser}
        positions={filteredPositions}
        loading={loading}
        error={error}
        onSave={handleSave}
        onDelete={handleDelete}
        onEdit={handleEdit}
        editing={editing}
        addingNew={addingNew}
      />
    </main>
  );
}
