import api from "../../../../utils/api";

export const positionService = {
  fetchPositionsAndUsers: async () => {
    const [userRes, posRes] = await Promise.all([
      api.get(`/user`),
      api.get(`/position`),
    ]);

    const allUsers = Array.isArray(userRes.data) ? userRes.data : (userRes.data?.data || []);
    const allPositions = Array.isArray(posRes.data) ? posRes.data : (posRes.data?.data || []);

    return { allUsers, allPositions };
  },

  createPosition: async (title, authUser, selectedUser) => {
    let payload = { title };
    if (authUser?.role === "Super_Admin") {
      payload.role = "Super_Admin";
      payload.administrator_id = selectedUser;
    } else {
      payload.role = "Administrator";
      payload.administrator_id = authUser?.id;
    }

    const res = await api.post("/position", payload);
    return res.data;
  },

  updatePosition: async (id, title) => {
    const res = await api.put(`/position/${id}`, { title });
    return res.data;
  },

  deletePosition: async (id) => {
    return await api.delete(`/position/${id}`);
  },

  searchPositions: async (query) => {
    const res = await api.get(`/position?title=${query}`);
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
  },

  getUsers: async () => {
    const res = await api.get("/user");
    return Array.isArray(res.data) ? res.data : (res.data?.data || []);
  },
};
