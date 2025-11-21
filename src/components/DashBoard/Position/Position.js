// Position.js
import { useState, useEffect } from "react";
import { smartToast } from "../../../utils/toastManager";
import { usePositionData } from "./hooks/usePositionData";
import { PositionTable } from "./components/PositionTable";
import UserWelcomeHeader from "../shared/UserWelcomeHeader";
import "../User/UserMainComponent.css";
import api from "../../../utils/api";
import apiCommon from "../../../utils/api";
import PositionModal from "./components/PositionModal";

export default function Position() {
  const [currentUser, setCurrentUser] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [modalData, setModalData] = useState({ title: '', selectedUser: null, showUserSelect: false, id: null });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) setCurrentUser({ id: user.id, name: user.name || user.fullName || 'User', role: user.role || '' });
  }, []);

  const userId = currentUser?.id;
  const { positions, users, loading, error, fetchData, searchPositions, deletePosition } = usePositionData(userId);

  useEffect(() => { if (userId) fetchData(); }, [userId, fetchData]);

  const handleModalSubmit = async (data) => {
    try {
      const current = JSON.parse(localStorage.getItem('user')) || {};
      let payload = { title: data.title };

      // If Super_Admin creating/updating, allow selecting administrator
      if (current.role === 'Super_Admin') {
        payload.administrator_id = data.selectedUser || null;
        payload.role = 'Super_Admin';
      } else {
        // Administrator: only set title, assign administrator_id to current user
        payload.administrator_id = current.id;
        payload.role = 'Administrator';
      }

      if (modalMode === 'edit' && data.id) {
        await api.put(`/position/${data.id}`, payload);
        smartToast.success("Position updated successfully");
      } else {
        await api.post(`/position`, payload);
        smartToast.success("Position created successfully");
      }
      fetchData();
      setModalOpen(false);
    } catch (err) {
      smartToast.error(err.response?.data?.message || "Failed to save position");
    }
};


  const handleAdd = () => {
    setModalMode('create');
    setModalData({ id: null, title: '', selectedUser: null, showUserSelect: currentUser?.role === 'Super_Admin' });
    setModalOpen(true);
  };

  const handleEdit = (positionId) => {
    const pos = positions.find(p => String(p.id) === String(positionId));
    setModalMode('edit');
    setModalData({
      id: pos?.id || null,
      title: pos?.title || '',
      selectedUser: pos?.user?.id || null,
      showUserSelect: currentUser?.role === 'Super_Admin'
    });
    setModalOpen(true);
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim() === "") return fetchData();
    if (query.trim().length > 2) searchPositions(query).catch(() => smartToast.error("Failed to search positions"));
  };

  const handleDelete = async (id) => {
    const result = await deletePosition(id);
    if (!result.success) smartToast.error(result.message || "Failed to delete position");
  };

  return (
    <main className="flex-fill">
      <UserWelcomeHeader userName={currentUser?.name || 'User'} description="Welcome back! Manage your positions efficiently." />

      <PositionTable
        currentUser={currentUser}
        positions={positions}
        users={users}
        loading={loading}
        error={error}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchTerm={searchQuery}
        onSearchChange={handleSearch}
      />

      {modalOpen && (
        <PositionModal
          mode={modalMode}
          data={modalData}
          users={users}
          onChange={setModalData}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      )}
    </main>
  );
}
