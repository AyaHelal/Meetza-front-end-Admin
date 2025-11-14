import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { usePositionData } from "./hooks/usePositionData";
import { PositionTable } from "./components/PositionTable";
import UserWelcomeHeader from "../shared/UserWelcomeHeader";
import { SearchBar } from "../shared/SearchBar";
import "../User/UserMainComponent.css";

export default function Position() {
  const [currentUser, setCurrentUser] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setCurrentUser({
        id: user.id,
        name: user.name || user.fullName || 'User',
        role: user.role || ''
      });
    }
  }, []);

  const userId = currentUser?.id;

  const {
    positions,
    users,
    loading,
    error,
    createPosition,
    updatePosition,
    deletePosition,
    searchPositions,
    fetchData,
  } = usePositionData(userId);

  const [editing, setEditing] = useState({});
  const [addingNew, setAddingNew] = useState(false);


  useEffect(() => {
    if (userId) fetchData();
  }, [userId, fetchData]);

  const handleSave = async (positionId, title, selectedUser) => {
    if (!title.trim()) {
      toast.error("Position title is required");
      return;
    }
    
    // For new positions, ensure user is selected for Super Admin
    if (!positionId && currentUser?.role === 'Super_Admin' && !selectedUser) {
      toast.error("Please select a user for this position");
      return;
    }
    
    try {
      if (positionId) {
        await updatePosition(positionId, title);
        toast.success("Position updated successfully");
      } else {
        // Always use the selected user's ID for the position
        const administrator_id = selectedUser ? selectedUser.value : currentUser?.id;
        console.log('Creating position with:', { title, administrator_id });
        await createPosition(title, administrator_id);
        toast.success("Position created successfully");
      }
      
      setEditing((prev) => ({ ...prev, [positionId || "new"]: false }));
      setAddingNew(false);
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.response?.data?.message || "Failed to save position");
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await deletePosition(id);
      if (result.success) {
        toast.success("Position deleted successfully");
      } else {
        toast.error(result.message || "Failed to delete position");
      }
    } catch (error) {
      console.error("Error deleting position:", error);
      toast.error(error.response?.data?.message || "Error deleting position");
    }
  };

  const handleEdit = (positionId) => {
    setEditing((prev) => ({ ...prev, [positionId]: true }));
  };

  const handleAdd = () => {
    setAddingNew(true);
    setEditing((prev) => ({ ...prev, "new": true }));
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set a new timeout
    const timeoutId = setTimeout(async () => {
      if (query.trim() === "") {
        await fetchData();
      } else {
        if (query.trim().length > 2){
            await searchPositions(query).catch((err) => {
            toast.error(err?.response?.data?.message || "Failed to search users");
          });
        }
      }
    }, 500);

    setSearchTimeout(timeoutId);
  };

  return (
    <main className="flex-fill">
      <UserWelcomeHeader
        userName={currentUser?.name || 'User'}
        description="Welcome back! Manage your positions efficiently."
      />
      <PositionTable
        currentUser={currentUser}
        positions={positions}
        users={users}
        loading={loading}
        error={error}
        onSave={handleSave}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onAdd={handleAdd}
        searchTerm={searchQuery}
        onSearchChange={handleSearch}
        editing={editing}
        addingNew={addingNew}
      />
    </main>
  );
}
