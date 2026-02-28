// Position.js
import { useState, useEffect } from "react";
import { smartToast } from "../../../utils/toastManager";
import { usePositionData } from "./hooks/usePositionData";
import { PositionTable } from "./components/PositionTable";
import UserWelcomeHeader from "../shared/UserWelcomeHeader";
import { ConfirmDeleteModal } from "../shared/ConfirmDeleteModal";
import "../User/UserMainComponent.css";
import api from "../../../utils/api";
import apiCommon from "../../../utils/api";
import PositionModal from "./components/PositionModal";
import { useAuth } from "../../../context/AuthContext";

export default function Position() {
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [modalData, setModalData] = useState({ title: '', selectedUser: null, showUserSelect: false, id: null });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState(null);

  const userId = currentUser?.id;
  const { positions, users, loading, error, fetchData, searchPositions, deletePosition } = usePositionData(userId, currentUser);

  useEffect(() => { if (userId) fetchData(); }, [userId, fetchData]);

  const handleModalSubmit = async (data) => {
    try {
      const current = currentUser || {};
      let payload = { title: data.title };

      if (current.role === 'Super_Admin') {
        payload.administrator_id = data.selectedUser || null;
        payload.role = 'Super_Admin';
      } else {
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

  const handleDelete = (id) => {
    setPositionToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeletePosition = async () => {
    if (!positionToDelete) return;
    const result = await deletePosition(positionToDelete);
    setShowDeleteModal(false);
    setPositionToDelete(null);
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

      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setPositionToDelete(null); }}
        onConfirm={confirmDeletePosition}
        title="Delete Position"
        message="Are you sure you want to delete this position? This action cannot be undone."
      />
    </main>
  );
}
