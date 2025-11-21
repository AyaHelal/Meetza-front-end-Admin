import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { smartToast } from "../../../../utils/toastManager";
import apiCommon from "../../../../utils/api";

const API_URL = "https://meetza-backend.vercel.app/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

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
        apiCommon.get(`/user`),
        api.get(`/position`),
      ]);

      const allUsers = Array.isArray(userRes.data) ? userRes.data : userRes.data?.data || [];
      const allPositions = Array.isArray(posRes.data) ? posRes.data : posRes.data?.data || [];

      const currentUser = allUsers.find((u) => u.id === userId);

      if (!currentUser) {
        setError("User not found");
        smartToast.error("User not found");
        setUsers([]);
        setPositions([]);
        return;
      }

      // لو Super Admin يشوف كل الـ positions
      if (currentUser.role === "Super_Admin") {
        const positionsWithUsers = allPositions.map((position) => {
          const user = allUsers.find((u) => u.id === position.administrator_id) || {};
          return {
            ...position,
            user: {
              id: user.id,
              name: user.name || user.fullName || "Unknown User",
              email: user.email,
              role: user.role,
            },
          };
        });

        setUsers(allUsers);
        setCurrentUser(currentUser);
        setPositions(positionsWithUsers);
      } else {
        const userPositions = allPositions.filter(
          (pos) => pos.administrator_id === userId
        );
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

      const curr = JSON.parse(localStorage.getItem("user")) || {};
      if (curr.role === "Super_Admin") {
        payload.role = "Super_Admin";
        payload.administrator_id = selectedUser;
      } else {
        payload.role = "Administrator";
        payload.administrator_id = curr.id;
      }

      const res = await api.post("/position", payload);

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
      const position = positions.find((p) => p.id === id);
      if (!position) {
        smartToast.error("Position not found");
        return { success: false, message: "Position not found" };
      }

      if (currentUser?.role !== "Super_Admin" && position.administrator_id !== userId) {
        smartToast.error("You do not have permission to delete this position");
        return { success: false, message: "No permission" };
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

  const searchPositions = async (query) => {
    try {
      const res = await api.get(`/position?title=${query}`);
      let payload = Array.isArray(res.data) ? res.data : res.data?.data || [];

      if (payload.length > 0) {
        const usersRes = await apiCommon.get("/user");
        const allUsers = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.data || [];

        payload = payload.map((position) => {
          const user = allUsers.find((u) => u.id === position.administrator_id);
          return {
            ...position,
            user: user
              ? {
                  id: user.id,
                  name: user.name || user.fullName || "Unknown User",
                  email: user.email,
                  role: user.role,
                }
              : null,
          };
        });
      }

      setPositions(payload);
    } catch (e) {
      smartToast.error("Failed to search positions");
      throw e;
    }
  };

  useEffect(() => {
    if (userId) fetchData();
  }, [userId, fetchData]);

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
