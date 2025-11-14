import { useState, useEffect , useCallback} from "react";
import api from "../../../../utils/api";

export const usePositionData = (userId) => {
  const [positions, setPositions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // 🟩 Get positions based on user role
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
        setUsers([]);
        setPositions([]);
        return;
      }

      // For Super Admin, get all positions with user data
      if (currentUser.role === 'Super_Admin') {
        // Map positions with user data
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
        // Regular users can only see their own positions
        const userPositions = allPositions.filter(pos => pos.administrator_id === userId);
        setUsers([{ ...currentUser, positions: userPositions }]);
        setCurrentUser(currentUser);
        setPositions(userPositions);
      }
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
      // For Super Admin, use the selected administrator_id
      // For regular users, use their own ID
      const adminId = currentUser?.role === 'Super_Admin' ? administrator_id : userId;
      
      const res = await api.post(`/position`, {
        title,
        administrator_id: adminId,
      });

      await fetchData(); // Refresh the data to ensure consistency
      return res.data;
    } catch (e) {
      console.error("Create error:", e);
      throw e; // Re-throw to handle in the UI
    }
  };

  // Update existing position
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

  // Delete position
  // 🗑️ Delete position
  const deletePosition = async (id) => {
    try {
      // For Super Admin, allow deleting any position
      // For regular users, check if they own the position
      const position = positions.find(p => p.id === id);
      if (!position) {
        return { success: false, message: 'Position not found' };
      }
      
      if (currentUser?.role !== 'Super_Admin' && position.administrator_id !== userId) {
        return { success: false, message: 'You do not have permission to delete this position' };
      }
      
      await api.delete(`/position/${id}`);
      await fetchData(); // Refresh the data to ensure consistency
      return { success: true };
    } catch (e) {
      console.error("Delete error:", e);
      return { success: false, message: e.message };
    }
  };

  useEffect(() => {
    if (userId) fetchData();
  },  [userId, fetchData]);

  // Search positions by title and include user information
  const searchPositions = async (query) => {
    try {
      // First, search for positions
      const res = await api.get(`/position?title=${query}`);
      let payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
      
      // If we have positions, fetch all users to include their information
      if (payload.length > 0) {
        const usersRes = await api.get('/user');
        const allUsers = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.data || [];
        
        // Map positions with user information
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
      console.error("Search error:", e);
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
