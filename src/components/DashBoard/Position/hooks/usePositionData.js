import { useState, useEffect , useCallback} from "react";
import api from "../../../../utils/api";

export const usePositionData = (userId) => {
  const [positions, setPositions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🟩 Get only current user positions
  const fetchData = useCallback(async  () => {
    try {
      setLoading(true);
      setError(null);

      const [userRes, posRes] = await Promise.all([
        api.get(`/user`),
        api.get(`/position`),
      ]);

      const allUsers = userRes.data || [];
      const allPositions = posRes.data || [];

      const currentUser = allUsers.find((u) => u.id === userId);

      if (!currentUser) {
        setError("User not found");
        setUsers([]);
        setPositions([]);
        return;
      }

      const myPositions = allPositions.filter(
        (pos) => pos.administrator_id === userId
      );

      setUsers([{ ...currentUser, positions: myPositions }]);
      setPositions(myPositions);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ➕ Create new position
  const createPosition = async (title, administrator_id) => {
    try {
      const res = await api.post(`/position`, {
        title,
        administrator_id,
      });

      const newPosition = res.data;
      setPositions((prev) => [...prev, newPosition]);

      await fetchData();
      return newPosition;
    } catch (e) {
      console.error("Create error:", e);
      return null;
    }
  };

  // ✏️ Update existing position
  const updatePosition = async (id, title) => {
    try {
      const res = await api.put(`/position/${id}`, { title });
      const updatedPosition = res.data;

      setPositions((prev) =>
        prev.map((pos) => (pos.id === id ? updatedPosition : pos))
      );
      await fetchData();
      return updatedPosition;
    } catch (e) {
      console.error("Update error:", e);
      return null;
    }
  };

  // 🗑️ Delete position
  const deletePosition = async (id) => {
    try {
      await api.delete(`/position/${id}`);
      setPositions((prev) => prev.filter((pos) => pos.id !== id));
      return { success: true };
    } catch (e) {
      console.error("Delete error:", e);
      return { success: false, message: e.message };
    }
  };

  useEffect(() => {
    if (userId) fetchData();
  },  [userId, fetchData]);

  return {
    positions,
    users,
    loading,
    error,
    deletePosition,
    createPosition,
    updatePosition,
    fetchData,
  };
};
