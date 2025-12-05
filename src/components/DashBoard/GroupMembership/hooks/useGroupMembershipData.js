import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../../../utils/api";

export const useGroupMembershipData = (currentUser = null) => {
  const [memberships, setMemberships] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Store a mapping of group_id + member_id -> membership_id for quick lookup
  const membershipIdMapRef = useRef(new Map());

  // 🟩 Fetch all memberships
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the nested structure (for display)
      const res = await api.get("/group-membership");
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];

      console.log("Full API response:", res.data);
      console.log("Payload:", payload);

      // Try to fetch flat structure with IDs by calling a different endpoint format
      // or try with different query parameters
      const membershipIdMap = new Map();

      try {
        // Try to get all memberships in a flat format (some APIs support this)
        // Try multiple approaches to get flat structure with IDs
        const flatRes = await api.get("/group-membership/all"); // Some backends have /all endpoint
        if (flatRes.data && Array.isArray(flatRes.data) && flatRes.data.length > 0) {
          const flatData = Array.isArray(flatRes.data) ? flatRes.data : flatRes.data?.data || [];
          if (flatData.length > 0 && flatData[0].id && flatData[0].group_id && flatData[0].member_id) {
            // Build map: "group_id_member_id" -> membership_id
            flatData.forEach((membership) => {
              const key = `${membership.group_id}_${membership.member_id || membership.memberId}`;
              membershipIdMap.set(key, membership.id || membership.membership_id);
            });
            console.log("Fetched flat structure with IDs, map:", membershipIdMap);
          }
        }
      } catch (e1) {
        // Try another format - maybe the API returns flat structure with different parameter
        try {
          const flatRes2 = await api.get("/group-membership", {
            params: { include_ids: true, format: "flat" }
          });
          const flatData2 = Array.isArray(flatRes2.data) ? flatRes2.data : flatRes2.data?.data || [];
          if (flatData2.length > 0 && flatData2[0].id && flatData2[0].group_id) {
            flatData2.forEach((membership) => {
              const key = `${membership.group_id}_${membership.member_id || membership.memberId}`;
              membershipIdMap.set(key, membership.id || membership.membership_id);
            });
            console.log("Fetched flat structure with IDs (format param), map:", membershipIdMap);
          }
        } catch (e2) {
          console.log("Could not fetch flat structure - API might not support it:", e2.message);
        }
      }

      // Store the map for later use
      membershipIdMapRef.current = membershipIdMap;

      // Try to fetch membership IDs by making requests for each pair
      // Or try a different endpoint that returns IDs
      // For now, we'll store the pairs and try to fetch IDs when needed for deletion

      // Handle nested structure: array of groups with members array
      // Transform to grouped structure where each group appears once with all its members
      let groupedMemberships = [];

      if (payload.length > 0 && payload[0].group_id && payload[0].members) {
        // New nested structure: [{ group_id, group_name, members: [{ member_id, member_name, member_email, member_photo, id? }] }]
        // Use the membershipIdMap we fetched earlier (if available)

        // Already in the correct format - one group per item with members array
        groupedMemberships = payload.map((group) => {
          // Log to see what's in the members array
          console.log("Group:", group.group_name, "Members structure:", group.members);

          return {
            id: group.group_id, // Use group_id as the ID for the row
            group_id: group.group_id,
            group_name: group.group_name || null,
            members: (group.members || []).map((member, index) => {
              // Log the full member object to see all available fields
              console.log(`Full Member ${index} object:`, JSON.stringify(member, null, 2));
              console.log(`Member ${index} keys:`, Object.keys(member || {}));

              // Try to extract membership ID from various possible fields
              let membershipId = member.id
                || member.membership_id
                || member.group_membership_id
                || member._id
                || member.membershipId
                || member.groupMembershipId
                || (member.membership && member.membership.id)
                || (member.groupMembership && member.groupMembership.id);

              // If not found in nested structure, try to find it in the ID map we fetched
              if (!membershipId && membershipIdMap.size > 0) {
                const key = `${group.group_id}_${member.member_id}`;
                membershipId = membershipIdMap.get(key);
                console.log(`Looking up membership ID for key ${key}:`, membershipId);
              }

              // Store the membership ID in the ref for later use
              if (membershipId) {
                const key = `${group.group_id}_${member.member_id}`;
                membershipIdMapRef.current.set(key, membershipId);
                console.log(`Stored membership ID ${membershipId} for key ${key}`);
              } else {
                console.warn(`No membership ID found for member ${member.member_id} in group ${group.group_id}`);
              }

              console.log(`Member ${index}:`, member, "Extracted Membership ID:", membershipId);

              return {
                id: membershipId || null, // Store actual membership ID from database
                member_id: String(member.member_id || ""),
                member_name: member.member_name || null,
                member_email: member.member_email || null,
                member_photo: member.member_photo || null,
                // Store composite ID for delete operations (fallback)
                composite_id: membershipId || `${group.group_id}_${member.member_id}`,
              };
            }),
          };
        });
      } else {
        const groupMap = {};

        payload.forEach((m) => {
          const groupId = m.group_id || m.groupId;
          if (!groupId) return;

          // In flat structure, m.id is the membership ID
          const membershipId = m.id || m.membership_id || m.group_membership_id;

          if (!groupMap[groupId]) {
            groupMap[groupId] = {
              id: groupId,
              group_id: groupId,
              group_name: m.group?.name || m.group?.group_name || m.group_name || null,
              members: [],
            };
          }

          groupMap[groupId].members.push({
            id: membershipId || null, // Store actual membership ID from database
            member_id: String(m.member_id || m.memberId || m.user_id || m.userId || ""),
            member_name: m.member?.name || m.user?.name || m.member_name || null,
            member_email: m.member?.email || m.user?.email || m.member_email || null,
            member_photo: m.member?.photo || m.user?.photo || m.member_photo || null,
            // Use membership ID if available, otherwise create composite
            composite_id: membershipId || `${groupId}_${m.member_id || m.memberId || m.user_id || m.userId}`,
          });
        });

        groupedMemberships = Object.values(groupMap);
      }

      console.log("Grouped memberships:", groupedMemberships);

      // Build membership ID map from the grouped memberships we just created
      // This will help us look up IDs when needed for deletion
      const idMap = new Map();
      groupedMemberships.forEach((group) => {
        group.members.forEach((member) => {
          if (member.id) {
            const key = `${group.group_id}_${member.member_id}`;
            idMap.set(key, member.id);
            console.log(`Added to ID map: ${key} -> ${member.id}`);
          }
        });
      });
      membershipIdMapRef.current = idMap;
      console.log("Final membership ID map:", Array.from(idMap.entries()));

      setMemberships(groupedMemberships);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load memberships");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🟩 Fetch groups
  const fetchGroups = useCallback(async () => {
    try {
      const res = await api.get("/group");
      let payload = Array.isArray(res.data) ? res.data : res.data?.data || [];

      console.log("fetchGroups - currentUser:", currentUser);
      console.log("fetchGroups - all groups payload:", payload);

      // Get current user from localStorage (same as useGroupData.js)
      const user = JSON.parse(localStorage.getItem("user"));
      const isSuperAdmin = user?.role === "Super_Admin";
      const isAdministrator = user?.role === "Administrator";

      console.log("fetchGroups - user from localStorage:", user);
      console.log("fetchGroups - user id:", user?.id);
      console.log("fetchGroups - user role:", user?.role);

      let filteredGroups = payload;

      // Filter groups based on user role
      if (isAdministrator && !isSuperAdmin) {
        // Administrator can only see groups they created (where admin_id matches their user ID)
        console.log("fetchGroups - Administrator: filtering groups for user ID:", user?.id);
        console.log("fetchGroups - All groups before filtering:", payload.map(g => ({
          id: g.id,
          name: g.name || g.group_name,
          admin_id: g.admin_id,
          adminId: g.adminId,
          administrator_id: g.administrator_id,
          user_id: g.user_id,
          admin: g.admin
        })));

        filteredGroups = payload.filter(g =>
          g.admin_id === user?.id ||
          g.adminId === user?.id ||
          g.administrator_id === user?.id ||
          g.user_id === user?.id ||
          g.admin?.id === user?.id
        );
        console.log("fetchGroups - filtered groups:", filteredGroups);
      }
      // Super_Admin sees all groups (no filtering)

      setGroups(filteredGroups);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  }, [currentUser]);

  // 🟩 Fetch members (from member endpoint or user endpoint)
  const fetchUsers = useCallback(async () => {
    try {

      const res = await api.get("/user");
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setUsers(payload);

    } catch (err) {

      console.error("Failed to fetch users:", err);

    }
  }, []);


  // ➕ Create new membership
  const createMembership = async (group_id, member_id) => {
    try {
      const res = await api.post("/group-membership", {
        group_id,
        member_id,
      });

      const newMembership = res.data;
      console.log("Created membership response:", newMembership);
      console.log("Membership ID from create:", newMembership?.id || newMembership?.data?.id || newMembership?.membership_id);

      // Refresh data after creation (this will get the latest data including any IDs)
      await fetchData();
      return newMembership;
    } catch (e) {
      console.error("Create error:", e);
      throw e;
    }
  };

  // 🗑️ Delete membership
  const deleteMembership = async (id) => {
    // id is a composite_id (group_id_member_id) or a membership ID
    try {
      // Find the member in the grouped structure
      let foundGroup = null;
      let foundMember = null;

      for (const group of memberships) {
        foundMember = group.members?.find(
          (member) => member.composite_id === id || `${group.group_id}_${member.member_id}` === id
        );
        if (foundMember) {
          foundGroup = group;
          break;
        }
      }

      if (!foundGroup || !foundMember) {
        console.error("Membership not found for ID:", id);
        return { success: false, message: "Membership not found" };
      }

      const groupId = foundGroup.group_id;
      const memberId = foundMember.member_id;
      // Check if we have the actual membership database ID
      let membershipId = foundMember.id || foundMember.membership_id;

      console.log("Deleting membership:", {
        id,
        groupId,
        memberId,
        membershipId,
        composite_id: foundMember.composite_id,
        memberObject: foundMember
      });

      // Since the API doesn't return membership IDs, we need to delete using group_id and member_id
      // Try different delete approaches
      let deleteResponse = null;
      let deleteSuccess = false;

      // First, check if we have membership ID (from map or if API starts including it)
      const key = `${groupId}_${memberId}`;
      membershipId = membershipId || membershipIdMapRef.current.get(key);

      if (membershipId) {
        // Try delete with membership ID first
        try {
          deleteResponse = await api.delete(`/group-membership/${membershipId}`);
          console.log("Delete with membership ID:", membershipId);

          if (deleteResponse.status >= 200 && deleteResponse.status < 300) {
            deleteSuccess = true;
            console.log("Delete successful with membership ID:", membershipId);
          }
        } catch (error1) {
          console.log("Delete with membership ID failed, trying with group_id and member_id:", error1.response?.status);
        }
      }

      // If membership ID delete didn't work, try deleting with group_id and member_id
      if (!deleteSuccess) {
        console.log("Attempting delete using group_id and member_id since membership ID is not available...");

        // Try DELETE with request body containing group_id and member_id
        try {
          deleteResponse = await api.delete(`/group-membership`, {
            data: {
              group_id: groupId,
              member_id: memberId,
            },
          });
          console.log("Delete with request body - response:", deleteResponse);

          if (deleteResponse.status >= 200 && deleteResponse.status < 300) {
            deleteSuccess = true;
            console.log("Delete successful with request body (group_id + member_id)");
          }
        } catch (error2) {
          console.log("Delete with request body failed, trying query params:", error2.response?.status);

          // Try DELETE with query parameters
          try {
            deleteResponse = await api.delete(`/group-membership?group_id=${groupId}&member_id=${memberId}`);
            console.log("Delete with query params - response:", deleteResponse);

            if (deleteResponse.status >= 200 && deleteResponse.status < 300) {
              deleteSuccess = true;
              console.log("Delete successful with query params");
            }
          } catch (error3) {
            console.error("All delete methods failed. Backend requires membership ID but API doesn't provide it.");
            throw new Error(
              "Cannot delete membership: Backend requires membership ID, but the API response doesn't include it. " +
              "Please ask backend developer to include membership IDs in the nested API response structure " +
              `(add 'id' field to each member object in the 'members' array).`
            );
          }
        }
      }

      if (deleteSuccess) {
        // Wait a bit to ensure backend has processed the deletion
        await new Promise(resolve => setTimeout(resolve, 300));

        // Refresh data after deletion - fetch fresh data
        console.log("Refreshing data after deletion...");

        // Fetch fresh data from API
        try {
          setLoading(true);
          const res = await api.get("/group-membership");
          const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];

          // Transform to grouped structure (same as fetchData)
          let groupedMemberships = [];

          if (payload.length > 0 && payload[0].group_id && payload[0].members) {
            groupedMemberships = payload.map((group) => ({
              id: group.group_id,
              group_id: group.group_id,
              group_name: group.group_name || null,
              members: (group.members || []).map((member) => ({
                member_id: String(member.member_id || ""),
                member_name: member.member_name || null,
                member_email: member.member_email || null,
                member_photo: member.member_photo || null,
                composite_id: `${group.group_id}_${member.member_id}`,
              })),
            }));
          } else {
            const groupMap = {};
            payload.forEach((m) => {
              const gId = m.group_id || m.groupId;
              if (!gId) return;

              if (!groupMap[gId]) {
                groupMap[gId] = {
                  id: gId,
                  group_id: gId,
                  group_name: m.group?.name || m.group?.group_name || m.group_name || null,
                  members: [],
                };
              }

              groupMap[gId].members.push({
                member_id: String(m.member_id || m.memberId || m.user_id || m.userId || ""),
                member_name: m.member?.name || m.user?.name || m.member_name || null,
                member_email: m.member?.email || m.user?.email || m.member_email || null,
                member_photo: m.member?.photo || m.user?.photo || m.member_photo || null,
                composite_id: m.id || `${gId}_${m.member_id || m.memberId || m.user_id || m.userId}`,
              });
            });

            groupedMemberships = Object.values(groupMap);
          }

          setMemberships(groupedMemberships);

          // Verify the deletion by checking if the member still exists in fresh data
          const stillExists = groupedMemberships.some(group =>
            group.members?.some(member =>
              member.composite_id === id ||
              `${group.group_id}_${member.member_id}` === id ||
              (member.member_id === memberId && group.group_id === groupId)
            )
          );

          if (stillExists) {
            console.warn("Warning: Member still exists after deletion in fresh data");
            console.log("Expected to delete:", { groupId, memberId, compositeId: id });
            console.log("Current memberships:", groupedMemberships);
          } else {
            console.log("Deletion verified: Member successfully removed");
          }

          setLoading(false);
        } catch (fetchError) {
          console.error("Error refreshing data after deletion:", fetchError);
          setLoading(false);
          // Still return success since delete API call succeeded
        }

        return { success: true };
      }

      return { success: false, message: "Failed to delete membership" };
    } catch (e) {
      console.error("Delete error:", e);
      const errorMessage = e.response?.data?.message || e.response?.data || e.message || "Failed to delete membership";
      return { success: false, message: errorMessage };
    }
  };

  // ✏️ Update membership
  const updateMembership = async (id, group_id, member_id) => {
    try {
      // id can be a composite_id (group_id_member_id) or a membership ID
      // Extract old group_id and member_id from composite ID if applicable
      let oldGroupId = null;
      let oldMemberId = null;

      // If it's a composite ID, extract the parts
      if (id.includes('_') && id.split('_').length >= 2) {
        const parts = id.split('_');
        oldGroupId = parts[0]; // First part is group_id
        // The rest is member_id (might contain underscores, so join them)
        oldMemberId = parts.slice(1).join('_');
      }

      // Try update by ID first
      try {
        const res = await api.patch(`/group-membership/${id}`, {
          group_id,
          member_id,
        });
        await fetchData();
        return res.data;
      } catch (patchError) {
        // If PATCH with ID doesn't work, try deleting old and creating new
        if (patchError.response?.status === 404 || patchError.response?.status === 400) {
          console.log("PATCH by ID failed, trying delete + create approach");

          // Delete the old membership
          if (oldGroupId && oldMemberId) {
            try {
              await api.delete(`/group-membership`, {
                params: {
                  group_id: oldGroupId,
                  member_id: oldMemberId,
                },
              });
            } catch (deleteError) {
              // Try with composite ID as path parameter
              try {
                await api.delete(`/group-membership/${id}`);
              } catch (e) {
                console.error("Failed to delete old membership:", e);
              }
            }
          } else {
            // Try to find and delete by composite ID
            try {
              await api.delete(`/group-membership/${id}`);
            } catch (e) {
              console.error("Failed to delete old membership:", e);
            }
          }

          // Create new membership
          const res = await api.post("/group-membership", {
            group_id,
            member_id,
          });
          await fetchData();
          return res.data;
        } else {
          throw patchError;
        }
      }
    } catch (e) {
      console.error("Update error:", e);
      throw e;
    }
  };

  // 🔍 Search memberships
  const searchMemberships = async (query) => {
    try {
      // Search by group name or ID
      const res = await api.get(`/group-membership`, {
        params: { search: query },
      });
      const payload = Array.isArray(res.data) ? res.data : res.data?.data || [];

      // Handle nested structure like in fetchData
      let groupedMemberships = [];

      if (payload.length > 0 && payload[0].group_id && payload[0].members) {
        // Filter by group name
        groupedMemberships = payload
          .filter((group) =>
            group.group_name?.toLowerCase().includes(query.toLowerCase()) ||
            group.group_id?.toLowerCase().includes(query.toLowerCase())
          )
          .map((group) => ({
            id: group.group_id,
            group_id: group.group_id,
            group_name: group.group_name || null,
            members: (group.members || []).map((member) => ({
              member_id: String(member.member_id || ""),
              member_name: member.member_name || null,
              member_email: member.member_email || null,
              member_photo: member.member_photo || null,
              composite_id: `${group.group_id}_${member.member_id}`,
            })),
          }));
      } else {
        // Legacy flat structure - group by group_id
        const groupMap = {};
        payload.forEach((m) => {
          const groupId = m.group_id || m.groupId;
          if (!groupId) return;

          const groupName = m.group?.name || m.group?.group_name || m.group_name || "";
          if (!groupName.toLowerCase().includes(query.toLowerCase()) &&
            !groupId.toLowerCase().includes(query.toLowerCase())) {
            return;
          }

          if (!groupMap[groupId]) {
            groupMap[groupId] = {
              id: groupId,
              group_id: groupId,
              group_name: groupName,
              members: [],
            };
          }

          groupMap[groupId].members.push({
            member_id: String(m.member_id || m.memberId || m.user_id || m.userId || ""),
            member_name: m.member?.name || m.user?.name || m.member_name || null,
            member_email: m.member?.email || m.user?.email || m.member_email || null,
            member_photo: m.member?.photo || m.user?.photo || m.member_photo || null,
            composite_id: m.id || `${groupId}_${m.member_id || m.memberId || m.user_id || m.userId}`,
          });
        });

        groupedMemberships = Object.values(groupMap);
      }

      setMemberships(groupedMemberships);
    } catch (e) {
      console.error("Search error:", e);
      throw e;
    }
  };

  useEffect(() => {
    fetchData();
    fetchGroups();
    fetchUsers();
  }, [fetchData, fetchGroups, fetchUsers]);

  return {
    memberships,
    groups,
    users,
    loading,
    error,
    createMembership,
    deleteMembership,
    updateMembership,
    searchMemberships,
    fetchData,
  };
};
