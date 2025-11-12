import { useState, useEffect, useCallback } from "react";
import api from "../../../../utils/api";

export const useUserData = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 🟩 Fetch all users
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await api.get("/user");
            const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];

            const normalized = payload.map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role:
                    u.role === "Administrator"
                        ? "administrator"
                        : u.role === "Member"
                            ? "member"
                            : (u.role || "").toString().toLowerCase(),
                avatarUrl: u.avatarUrl || u.avatar_url,
            }));

            setUsers(normalized);
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    }, []);

    // ➕ Create new user
    const createUser = async (name, email, password, role) => {
        try {
            const res = await api.post("/register", {
                name,
                email,
                password,
                role: role === "administrator" ? "Administrator" : "Member",
            });

            const newUser = res.data;
            await fetchData();
            return newUser;
        } catch (e) {
            console.error("Create error:", e);
            throw e;
        }
    };

    // ✏️ Update existing user
    const updateUser = async (id, name, email, password, role) => {
        try {
            const payload = {
                name,
                email,
                role: role === "administrator" ? "Administrator" : "Member",
            };
            if (password) {
                payload.password = password;
            }

            const res = await api.patch(`/user/${id}`, payload);
            const updatedUser = res.data;
            await fetchData();
            return updatedUser;
        } catch (e) {
            console.error("Update error:", e);
            throw e;
        }
    };

    // 🗑️ Delete user
    const deleteUser = async (id) => {
        try {
            await api.delete(`/user/${id}`);
            setUsers((prev) => prev.filter((u) => u.id !== id));
            return { success: true };
        } catch (e) {
            console.error("Delete error:", e);
            return { success: false, message: e.message };
        }
    };

    // 🔍 Search users
    const searchUsers = async (query) => {
        try {
            const res = await api.get("/user/search", {
                params: { name: query },
            });
            const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
            const normalized = payload.map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role:
                    u.role === "Administrator"
                        ? "administrator"
                        : u.role === "Member"
                            ? "member"
                            : (u.role || "").toString().toLowerCase(),
                avatarUrl: u.avatarUrl || u.avatar_url,
            }));
            setUsers(normalized);
        } catch (e) {
            console.error("Search error:", e);
            throw e;
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        users,
        loading,
        error,
        createUser,
        updateUser,
        deleteUser,
        searchUsers,
        fetchData,
    };
};

