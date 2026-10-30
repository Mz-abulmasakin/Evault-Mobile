
import api from "../services/api";

/**
 * Extract a notification array from common backend
 * response formats without changing the public API.
 */
function extractNotificationArray(payload) {
  const candidates = [
    payload,
    payload?.data,
    payload?.notifications,
    payload?.data?.notifications,
    payload?.data?.data,
    payload?.data?.data?.notifications,
    payload?.result,
    payload?.result?.notifications,
  ];

  return (
    candidates.find(Array.isArray) ?? null
  );
}

/**
 * =========================================================
 * GET ALL NOTIFICATIONS
 * =========================================================
 */
export async function getNotifications() {
  const response = await api.get("/notifications");

  const notifications =
    extractNotificationArray(response.data);

  if (!notifications) {
    console.warn(
      "[EVAULT NOTIFICATIONS API] Unexpected response format:",
      Object.keys(response.data || {})
    );

    return [];
  }

  return notifications;
}

/**
 * =========================================================
 * GET UNREAD NOTIFICATIONS
 * =========================================================
 */
export async function getUnreadNotifications() {
  const response = await api.get(
    "/notifications/unread"
  );

  const notifications =
    extractNotificationArray(response.data);

  if (!notifications) {
    console.warn(
      "[EVAULT NOTIFICATIONS API] Unexpected unread response format:",
      Object.keys(response.data || {})
    );

    return [];
  }

  return notifications;
}

/**
 * =========================================================
 * GET UNREAD NOTIFICATION COUNT
 * =========================================================
 */
export async function getNotificationCount() {
  const response = await api.get(
    "/notifications/count"
  );

  const payload = response.data;

  const count =
    payload?.count ??
    payload?.unreadCount ??
    payload?.data?.count ??
    payload?.data?.unreadCount ??
    (typeof payload?.data === "number"
      ? payload.data
      : 0);

  const parsedCount = Number(count);

  return Number.isFinite(parsedCount) &&
    parsedCount >= 0
    ? parsedCount
    : 0;
}

/**
 * =========================================================
 * MARK ONE NOTIFICATION AS READ
 * =========================================================
 */
export async function markNotificationAsRead(id) {
  const response = await api.patch(
    `/notifications/${id}/read`
  );

  return response.data?.data ?? null;
}

/**
 * =========================================================
 * MARK ALL NOTIFICATIONS AS READ
 * =========================================================
 */
export async function markAllNotificationsAsRead() {
  const response = await api.patch(
    "/notifications/read-all"
  );

  return response.data;
}

/**
 * =========================================================
 * DELETE ONE NOTIFICATION
 * =========================================================
 */
export async function deleteNotification(id) {
  const response = await api.delete(
    `/notifications/${id}`
  );

  return response.data;
}

/**
 * =========================================================
 * DELETE ALL NOTIFICATIONS
 * =========================================================
 */
export async function deleteAllNotifications() {
  const response = await api.delete(
    "/notifications"
  );

  return response.data;
}
