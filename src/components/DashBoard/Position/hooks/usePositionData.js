import { useState, useEffect , useCallback} from "react";
import api from "../../../../utils/api";
import { smartToast } from "../../../../utils/toastManager";

export const usePositionData = (userId) => {
  const [positions, setPositions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchData = useCallback(async () => {
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
        smartToast.error("User not found");
        setUsers([]);
        setPositions([]);
        return;
      }

      if (currentUser.role === 'Super_Admin') {
        const positionsWithUsers = allPositions.map(position => {
          const user = allUsers.find(u => u.id === position.administrator_id) || {};
          return {
            ...position,
            user: {
              id: user.id,
              name: user.name || user.fullName || 'Unknown User',
              email: user.email,
              role: user.role
            }
          };
        });

        setUsers(allUsers);
        setCurrentUser(currentUser);
        setPositions(positionsWithUsers);
      } else {
        const userPositions = allPositions.filter(pos => pos.administrator_id === userId);
        setUsers([{ ...currentUser, positions: userPositions }]);
        setCurrentUser(currentUser);
        setPositions(userPositions);
      }
    } catch (err) {
      smartToast.error("Failed to load positions");
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

const createPosition = async (title, selectedUser) => {
  try {
    let payload = { title };

    if (currentUser?.role === 'Super_Admin') {
      payload.role = 'Super_Admin';
      payload.administrator_id = selectedUser?.value;
    }

    const res = await api.post('/position', payload);

    await fetchData();
    smartToast.success("Position created successfully");
    return res.data;

  } catch (e) {
    smartToast.error(e?.response?.data?.message || "Failed to create position");
    throw e;
  }
};





  const updatePosition = async (id, title) => {
    try {
      const res = await api.put(`/position/${id}`, { title });
      const updatedPosition = res.data;

      setPositions((prev) =>
        prev.map((pos) => (pos.id === id ? updatedPosition : pos))
      );

      await fetchData();
      smartToast.success("Position updated successfully");

      return updatedPosition;
    } catch (e) {
      smartToast.error("Failed to update position");
      return null;
    }
  };

  const deletePosition = async (id) => {
    if (!window.confirm("Are you sure you want to delete this position?")) return;

    try {
      const position = positions.find(p => p.id === id);
      if (!position) {
        smartToast.error("Position not found");
        return { success: false, message: 'Position not found' };
      }

      if (currentUser?.role !== 'Super_Admin' && position.administrator_id !== userId) {
        smartToast.error("You do not have permission to delete this position");
        return { success: false, message: 'No permission' };
      }

      await api.delete(`/position/${id}`);
      await fetchData();
      smartToast.success("Position deleted successfully");

      return { success: true };
    } catch (e) {
      smartToast.error("Failed to delete position");
      return { success: false, message: e.message };
    }
  };

  useEffect(() => {
    if (userId) fetchData();
  },  [userId, fetchData]);

  const searchPositions = async (query) => {
    try {
      const res = await api.get(`/position?title=${query}`);
      let payload = Array.isArray(res.data) ? res.data : res.data?.data || [];

      if (payload.length > 0) {
        const usersRes = await api.get('/user');
        const allUsers = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.data || [];

        payload = payload.map(position => {
          const user = allUsers.find(u => u.id === position.administrator_id);
          return {
            ...position,
            user: user ? {
              id: user.id,
              name: user.name || user.fullName || 'Unknown User',
              email: user.email,
              role: user.role
            } : null
          };
        });
      }

      setPositions(payload);
    } catch (e) {
      smartToast.error("Failed to search positions");
      throw e;
    }
  };

  return {
    positions,
    users,
    loading,
    error,
    createPosition,
    updatePosition,
    deletePosition,
    searchPositions,
    fetchData,
  };
};
