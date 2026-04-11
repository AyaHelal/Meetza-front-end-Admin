import { useState, useEffect, useCallback } from "react";
import { smartToast } from "../../../../utils/toastManager";
import apiCommon from "../../../../utils/api";
import { useGroupData } from "../../Group/hooks/useGroupData";
import { dedupeById } from "../../../../utils/dedupeById";
import { groupIsManagedByUser } from "../../../../utils/groupIsManagedByUser";
import { useAuth } from "../../../../context/AuthContext";

/** Content row visible to a group admin: legacy owner fields, or linked group they manage, or group uses this content id. */
function contentVisibleToAdministrator(content, userId, groupsData) {
    if (!content || userId == null) return false;
    const uid = String(userId);
    if (content.administrator_id != null && String(content.administrator_id) === uid) return true;
    if (content.admin_id != null && String(content.admin_id) === uid) return true;
    if (content.user_id != null && String(content.user_id) === uid) return true;
    const gid = content.group_id;
    if (gid) {
        const g = groupsData.find((x) => String(x.id) === String(gid));
        if (g && groupIsManagedByUser(g, uid)) return true;
    }
    const cid = content.id;
    if (cid != null && Array.isArray(groupsData)) {
        const linked = groupsData.filter(
            (x) => x.group_content_id != null && String(x.group_content_id) === String(cid)
        );
        if (linked.some((g) => groupIsManagedByUser(g, uid))) return true;
    }
    return false;
}

export default function useGroupContentData() {
    const { user: currentUser } = useAuth();
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { fetchData: refetchGroups } = useGroupData();

    const fetchContents = useCallback(async () => {
        try {
            setLoading(true);

            const contentsResponse = await apiCommon.get("/group-contents");
            if (!contentsResponse.data.success) {
                smartToast.error("Failed to load contents");
                setContents([]);
                return;
            }

            const user = currentUser;
            const roleNorm = String(user?.role || "").trim();
            const isSuperAdmin =
                roleNorm === "Super_Admin" || roleNorm.toLowerCase() === "super_admin";
            const isAdministrator =
                roleNorm === "Administrator" || roleNorm.toLowerCase() === "administrator";

            const groupsResponse = await apiCommon.get("/group");
            const rawGroups = groupsResponse.data?.data ?? groupsResponse.data;
            const groupsData = dedupeById(Array.isArray(rawGroups) ? rawGroups : []);

            const allContents = Array.isArray(contentsResponse.data.data)
                ? contentsResponse.data.data
                : [];

            let filteredContents = allContents;
            if (isAdministrator && !isSuperAdmin) {
                filteredContents = allContents.filter((c) =>
                    contentVisibleToAdministrator(c, user?.id, groupsData)
                );
            }

            const byContentId = new Map();
            for (const content of filteredContents) {
                const cid = content?.id != null ? String(content.id) : "";
                if (!cid || byContentId.has(cid)) continue;
                const assignedGroup = groupsData.find(
                    (g) => String(g.id) === String(content.group_id)
                );
                byContentId.set(cid, {
                    ...content,
                    assigned_group_id: assignedGroup ? assignedGroup.id : null,
                    assigned_group_name: assignedGroup ? assignedGroup.group_name : "Unassigned"
                });
            }
            setContents(Array.from(byContentId.values()));

        } catch (err) {
            console.error(err);
            setError(err);
            smartToast.error(err.response?.data?.message || "Error loading contents");
            setContents([]);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    // Add new content
    const addContent = async (data) => {
        try {
            const contentData = {
                content_name: data.content_name,
                content_description: data.content_description,
                group_id: data.group_id,
                role:data.role,
                administrator_id:data.administrator_id,
            };

            // If group_id is provided, include it in the payload
            // This allows creating content directly linked to a group
            if (data.group_id) {
                contentData.group_id = data.group_id;
            }

            if (!contentData.content_name || !contentData.content_description) {
                smartToast.error("Content name and description are required");
                return;
            }

            const response = await apiCommon.post(`/group-contents`, contentData);

            if (response.data.success) {
                smartToast.success("Group content created successfully");
                await fetchContents();
            } else {
                smartToast.error(response.data.message || "Failed to create content");
            }

            return response.data;
        } catch (err) {
            smartToast.error(err.response?.data?.message || "Error creating content");
            throw err;
        }
    };

    // Update content including group assignment
    const updateContent = async (id, updatedData) => {
    try {
        const oldContent = contents.find(c => c.id === id);
        if (!oldContent) return;

        const payload = {};
        if (updatedData.content_name !== undefined) payload.content_name = updatedData.content_name;
        if (updatedData.content_description !== undefined) payload.content_description = updatedData.content_description;
        if (updatedData.group_id !== undefined) payload.group_id = updatedData.group_id;

        if (Object.keys(payload).length === 0) {
        smartToast.error("Nothing to update (group assignment cannot be changed here)");
        return;
        }

    await apiCommon.put(`/group-contents/${id}`, payload);

    smartToast.success("Content updated successfully");
    await fetchContents();
    } catch (err) {
        console.error(err);
        smartToast.error(err.response?.data?.message || "Error updating content");
    }
};




    // Delete content
    const deleteContent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this content?")) return;

        try {
            const response = await apiCommon.delete(`/group-contents/${id}`);

            if (response.data.success) {
                setContents(prev => prev.filter(c => c.id !== id));
                // After deleting content, refetch groups so the Group UI knows the group no longer has this content
                await refetchGroups();
                smartToast.success("Group content deleted successfully");
            } else {
                smartToast.error(response.data.message || "Failed to delete content");
            }

            return response.data;
        } catch (err) {
            smartToast.error(err.response?.data?.message || "Error deleting content");
            throw err;
        }
    };

    useEffect(() => {
        fetchContents();
    }, [fetchContents]);

    // Search contents
    const searchContents = async (query) => {
        try {
            setLoading(true);
            const response = await apiCommon.get(`/group-contents?search=${query}`);
            if (!response.data.success) {
                smartToast.error("Failed to search contents");
                setContents([]);
                return;
            }

            const user = currentUser;
            const roleNorm = String(user?.role || "").trim();
            const isSuperAdmin =
                roleNorm === "Super_Admin" || roleNorm.toLowerCase() === "super_admin";
            const isAdministrator =
                roleNorm === "Administrator" || roleNorm.toLowerCase() === "administrator";

            const groupsResponse = await apiCommon.get("/group");
            const rawGroups = groupsResponse.data?.data ?? groupsResponse.data;
            const groupsData = dedupeById(Array.isArray(rawGroups) ? rawGroups : []);

            const allFound = Array.isArray(response.data.data) ? response.data.data : [];
            let filteredContents = allFound;
            if (isAdministrator && !isSuperAdmin) {
                filteredContents = allFound.filter((c) =>
                    contentVisibleToAdministrator(c, user?.id, groupsData)
                );
            }

            const byContentId = new Map();
            for (const content of filteredContents) {
                const cid = content?.id != null ? String(content.id) : "";
                if (!cid || byContentId.has(cid)) continue;
                const assignedGroup = groupsData.find(
                    (g) => g.group_content_id === content.id
                );
                byContentId.set(cid, {
                    ...content,
                    assigned_group_id: assignedGroup ? assignedGroup.id : null,
                    assigned_group_name: assignedGroup ? assignedGroup.group_name : "Unassigned"
                });
            }
            setContents(Array.from(byContentId.values()));
        } catch (err) {
            console.error(err);
            setError(err);
            smartToast.error(err.response?.data?.message || "Error searching contents");
            setContents([]);
        } finally {
            setLoading(false);
        }
    };

    return {
        contents,
        loading,
        error,
        currentUser,
        fetchContents,
        addContent,
        updateContent,
        deleteContent,
        searchContents,
    };
}
