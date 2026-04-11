/**
 * True if the user is a legacy primary admin or listed in `group.admins` (OWNER / ADMIN).
 * Matches meetza `groupIsManagedByUser` for co-admins assigned via group_admin.
 */
export function groupIsManagedByUser(group, userId) {
  if (userId == null || !group) return false;
  const uid = String(userId);
  const legacyIds = [
    group.administrator_id,
    group.admin_id,
    group.adminId,
    group.user_id,
    group.admin?.id,
  ];
  if (legacyIds.some((id) => id != null && String(id) === uid)) return true;
  if (Array.isArray(group.admins)) {
    return group.admins.some((a) => {
      const aid = a?.user_id ?? a?.userId ?? a?.group_admin_id;
      return aid != null && String(aid) === uid;
    });
  }
  return false;
}
