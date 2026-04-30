import { useState, useEffect, useCallback } from "react";
import { positionService } from "../service/positionService";
import { smartToast } from "../../../../utils/toastManager";

export const usePositionData = (userId, authUser = null) => {
  const cacheKey = `admin_positions_cache_${userId || 'guest'}`;

  const [positions, setPositions] = useState(() => {
    const cached = localStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) : [];
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(positions.length === 0);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchData = useCallback(async () => {
    const hasCache = positions.length > 0;
    try {
      if (!hasCache) setLoading(true);
      setError(null);

      const { allUsers, allPositions } = await positionService.fetchPositionsAndUsers();

      const currentUser = allUsers.find((u) => u.id === userId);

      if (!currentUser) {
        setError("User not found");
        smartToast.error("User not found");
        setUsers([]);
        setPositions([]);
        return;
      }

      let finalPositions = [];
      if (currentUser.role === 'Super_Admin') {
        finalPositions = allPositions.map(position => {
          const user = allUsers.find(u => u.id === position.administrator_id) || {};
          return {
            ...position,
            user: {
              id: user.id,
              name: user.name || user.fullName || 'Unknown User',
              email: user.email,
              role: user.role,
              avatarUrl: user.user_photo || user.avatarUrl || user.avatar_url
            }
          };
        });

        setUsers(allUsers);
        setCurrentUser(currentUser);
        setPositions(finalPositions);
      } else {
        finalPositions = allPositions.filter(pos => pos.administrator_id === userId);
        setUsers([{ ...currentUser, positions: finalPositions }]);
        setCurrentUser(currentUser);
        setPositions(finalPositions);
      }

      localStorage.setItem(cacheKey, JSON.stringify(finalPositions));
    } catch (err) {
      if (!hasCache) {
        smartToast.error("Failed to load positions");
        setError("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  }, [userId, positions.length, cacheKey]);

const createPosition = async (title, selectedUser) => {
  try {
    const resData = await positionService.createPosition(title, authUser, selectedUser);

    await fetchData();
    smartToast.success("Position created successfully");
    return resData;

  } catch (e) {
    smartToast.error(e?.response?.data?.message || "Failed to create position");
    throw e;
  }
};

  const updatePosition = async (id, title) => {
    try {
      const updatedPosition = await positionService.updatePosition(id, title);

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

      await positionService.deletePosition(id);
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
      let payload = await positionService.searchPositions(query);

      if (query && query.trim() !== "") {
        payload = payload.filter(p => p.title && p.title.toLowerCase().includes(query.toLowerCase()));
      }

      if (authUser?.role !== 'Super_Admin') {
        payload = payload.filter(pos => pos.administrator_id === userId);
      }

      if (payload.length > 0) {
        const allUsers = await positionService.getUsers();

        payload = payload.map(position => {
          const user = allUsers.find(u => u.id === position.administrator_id);
          return {
            ...position,
            user: user ? {
              id: user.id,
              name: user.name || user.fullName || 'Unknown User',
              email: user.email,
              role: user.role,
              avatarUrl: user.user_photo || user.avatarUrl || user.avatar_url
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

