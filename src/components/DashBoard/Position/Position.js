import { useState, useEffect } from "react";
import { smartToast } from "../../../utils/toastManager";
import { usePositionData } from "./hooks/usePositionData";
import { PositionTable } from "./components/PositionTable";
import UserWelcomeHeader from "../shared/UserWelcomeHeader";
import "../User/UserMainComponent.css";
import api from "../../../utils/api";

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
    deletePosition,
    searchPositions,
    fetchData,
  } = usePositionData(userId);

  const [editing, setEditing] = useState({});
  const [addingNew, setAddingNew] = useState(false);

  useEffect(() => {
    if (userId) fetchData();
  }, [userId, fetchData]);

const handleSave = async (positionId, title, selectedUserId) => {
  if (!title.trim()) {
    smartToast.error("Position title is required");
    return;
  }

  let payload = { title };

  if (currentUser?.role === 'Super_Admin') {
    if (!selectedUserId) {
      smartToast.error("Please select a user for this position");
      return;
    }
    payload = {
      ...payload,
      role: "Super_Admin",
      administrator_id: selectedUserId
    };
  } else {
    payload = {
      ...payload,
      administrator_id: currentUser.id
    };
  }

  try {
    if (positionId) {
      await api.put(`/position/${positionId}`, payload);
      smartToast.success("Position updated successfully");
    } else {
      await api.post(`/position`, payload);
      smartToast.success("Position created successfully");
    }

    setEditing((prev) => ({ ...prev, [positionId || "new"]: false }));
    setAddingNew(false);
    fetchData();
  } catch (err) {
    smartToast.error(err.response?.data?.message || "Failed to save position");
  }
};




  const handleDelete = async (id) => {
    const result = await deletePosition(id);
    if (!result.success) {
      smartToast.error(result.message || "Failed to delete position");
    }
  };

  const handleEdit = (positionId) => {
    setEditing((prev) => ({
      ...prev,
      [positionId]: !prev[positionId]
    }));
  };

  const handleAdd = () => {
    setAddingNew(true);
    setEditing((prev) => ({ ...prev, "new": true }));
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (searchTimeout) clearTimeout(searchTimeout);

    const timeoutId = setTimeout(async () => {
      if (query.trim() === "") {
        await fetchData();
      } else if (query.trim().length > 2) {
        await searchPositions(query).catch(() => {
          smartToast.error("Failed to search positions");
        });
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
