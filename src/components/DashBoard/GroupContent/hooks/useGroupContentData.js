import { useState, useEffect } from "react";
import { smartToast } from "../../../../utils/toastManager";
import apiCommon from "../../../../utils/api";
import { useGroupData } from "../../Group/hooks/useGroupData";

export default function useGroupContentData() {
    const [contents, setContents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const { updateGroup, fetchData: refetchGroups } = useGroupData();

    // Fetch all contents with their assigned groups
    const fetchContents = async () => {
        try {
            setLoading(true);

            const contentsResponse = await apiCommon.get("/group-contents");
            if (!contentsResponse.data.success) {
                smartToast.error("Failed to load contents");
                setContents([]);
                return;
            }

            const user = JSON.parse(localStorage.getItem("user"));
            setCurrentUser(user);

            const isSuperAdmin = user?.role === "Super_Admin";
            const isAdministrator = user?.role === "Administrator";

            let filteredContents = contentsResponse.data.data;

            // Filter contents based on user role
            if (isAdministrator && !isSuperAdmin) {
                // Administrator can only see contents they created (where administrator_id matches their user ID)
                filteredContents = contentsResponse.data.data.filter(c =>
                    c.administrator_id === user?.id ||
                    c.admin_id === user?.id ||
                    c.user_id === user?.id
                );
            }
            // Super_Admin sees all contents (no filtering)

            const groupsResponse = await apiCommon.get("/group");
            const groupsData = groupsResponse.data.data || groupsResponse.data;

            const contentsWithGroups = filteredContents.map((content) => {
                const assignedGroup = groupsData.find(
                    (g) => g.group_content_id === content.id
                );
                return {
                    ...content,
                    assigned_group_id: assignedGroup ? assignedGroup.id : null,
                    assigned_group_name: assignedGroup ? assignedGroup.group_name : "Unassigned"
                };
            });

            setContents(contentsWithGroups);

        } catch (err) {
            console.error(err);
            setError(err);
            smartToast.error(err.response?.data?.message || "Error loading contents");
            setContents([]);
        } finally {
            setLoading(false);
        }
    };

    // Add new content
    const addContent = async (data) => {
        try {
            const contentData = {
                content_name: data.content_name,
                content_description: data.content_description
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

            console.log('[addContent] Creating content with data:', contentData);
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
    }, []);

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

            const user = JSON.parse(localStorage.getItem("user"));
            const isSuperAdmin = user?.role === "Super_Admin" || user?.role === "Administrator";

            const filteredContents = isSuperAdmin
                ? response.data.data
                : response.data.data.filter(c => c.administrator_id === user?.id);

            const groupsResponse = await apiCommon.get("/group");
            const groupsData = groupsResponse.data.data || groupsResponse.data;

            const contentsWithGroups = filteredContents.map((content) => {
                const assignedGroup = groupsData.find(
                    (g) => g.group_content_id === content.id
                );
                return {
                    ...content,
                    assigned_group_id: assignedGroup ? assignedGroup.id : null,
                    assigned_group_name: assignedGroup ? assignedGroup.group_name : "Unassigned"
                };
            });

            setContents(contentsWithGroups);
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
