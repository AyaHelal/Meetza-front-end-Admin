import { useState, useEffect, useCallback } from "react";
import api from "../../../../utils/api";

export const useUserData = () => {
    const cacheKey = "admin_users_cache";

    const [users, setUsers] = useState(() => {
        const cached = localStorage.getItem(cacheKey);
        return cached ? JSON.parse(cached) : [];
    });
    const [loading, setLoading] = useState(users.length === 0);
    const [error, setError] = useState(null);

    // 🟩 Fetch all users
    const fetchData = useCallback(async () => {
        const hasCache = users.length > 0;
        try {
            if (!hasCache) setLoading(true);
            setError(null);

            const res = await api.get("/user");
            const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];

            const normalized = payload.map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role:
                    u.role === "Administrator"
                        ? "Leader"
                        : u.role === "Member"
                            ? "member"
                            : (u.role === "Super_Admin" || u.role === "Super Admin")
                                ? "Super Admin"
                                : (u.role || "").toString().toLowerCase(),
                avatarUrl: u.user_photo || u.avatarUrl || u.avatar_url,
            }));

            setUsers(normalized);
            localStorage.setItem(cacheKey, JSON.stringify(normalized));
        } catch (err) {
            console.error("Fetch error:", err);
            if (!hasCache) setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    }, [users.length]);

    // ➕ Create new user
    const createUser = async (name, email, password, role) => {
        try {
            const res = await api.post("/user", {
                name,
                email,
                password,
                role:
                    role === "Super_Admin"
                        ? "Super_Admin"
                        : role === "administrator"
                            ? "Administrator"
                            : "Member",
            });

            const newUser = res.data;
            await fetchData();
            return newUser;
        } catch (e) {
            console.error("Create error:", e);
            throw e;
        }
    };

    // ✏️ Update existing user (name and photo only)
    const updateUser = async (id, name, photo = null) => {
        try {
            if (photo && photo instanceof File) {
                const formData = new FormData();
                formData.append("name", name || "");
                formData.append("user_photo", photo);
                const res = await api.patch(`/user/${id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                await fetchData();
                return res.data;
            }
            const res = await api.patch(`/user/${id}`, { name: name || "" });
            await fetchData();
            return res.data;
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
            const res = await api.get(`/user?name=${query}`, {

            });
            const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
            const normalized = payload.map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role,
                avatarUrl: u.user_photo || u.avatarUrl || u.avatar_url,
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

