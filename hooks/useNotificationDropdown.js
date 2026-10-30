
import {
  useCallback,
  useRef,
  useState,
} from "react";

import {
  AppState,
} from "react-native";

import {
  useFocusEffect,
} from "@react-navigation/native";

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/notificationApi";

const REFRESH_INTERVAL_MS = 15000;

/**
 * Extract notifications from common API response shapes.
 */
function extractNotificationList(response) {
  const candidates = [
    response,
    response?.data,
    response?.notifications,
    response?.data?.notifications,
    response?.data?.data,
    response?.data?.data?.notifications,
    response?.result,
    response?.result?.notifications,
  ];

  return candidates.find(
    (candidate) => Array.isArray(candidate)
  ) || null;
}

/**
 * Normalize notification records for HomeScreenHeader.
 */
function normalizeNotification(item) {
  const metadata =
    item?.metadata ||
    item?.meta ||
    item?.data ||
    {};

  const isRead =
    item?.is_read === true ||
    item?.is_read === 1 ||
    item?.isRead === true;

  const explicitlyUnread =
    item?.is_read === false ||
    item?.is_read === 0 ||
    item?.isRead === false ||
    item?.unread === true;

  return {
    ...item,

    id: item?.id,

    title:
      item?.title ||
      "Notification",

    description:
      item?.message ||
      item?.description ||
      "",

    unread: explicitlyUnread
      ? true
      : isRead
        ? false
        : Boolean(item?.unread),

    icon: getNotificationIcon(item?.type),

    time: formatNotificationTime(
      item?.created_at ||
      item?.createdAt
    ),

    metadata,
  };
}

/**
 * Choose an icon based on notification type.
 */
function getNotificationIcon(type) {
  switch (String(type || "").toUpperCase()) {
    case "SUCCESS":
      return "checkmark-circle";

    case "PAYMENT":
      return "card";

    case "FUNDING":
    case "WALLET_FUNDED":
      return "wallet";

    case "TRANSACTION":
      return "swap-horizontal";

    case "WARNING":
      return "warning";

    case "ERROR":
      return "alert-circle";

    case "IDENTITY":
      return "person-circle";

    case "DOCUMENT":
      return "document-text";

    case "CAC":
      return "business";

    case "TIN":
      return "document";

    default:
      return "information-circle";
  }
}

/**
 * Format notification timestamps.
 */
function formatNotificationTime(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const difference =
    Date.now() - date.getTime();

  const seconds = Math.floor(
    difference / 1000
  );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(
    seconds / 60
  );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
}

/**
 * Notification dropdown and automatic refresh.
 */
export function useNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing,
  ] = useState(false);

  const screenFocusedRef = useRef(false);
  const requestInProgressRef = useRef(false);
  const hasLoadedRef = useRef(false);

  /**
   * Fetch notifications from the backend.
   *
   * Only one fetch runs at a time. Background refreshes
   * do not clear the existing list or show a full loader.
   */
  const loadNotifications = useCallback(
    async ({ manual = false } = {}) => {
      if (requestInProgressRef.current) {
        return;
      }

      requestInProgressRef.current = true;

      if (!hasLoadedRef.current) {
        setIsLoading(true);
      }

      if (manual && hasLoadedRef.current) {
        setIsRefreshing(true);
      }

      try {
        const response = await getNotifications();

        const rawNotifications =
          extractNotificationList(response);

        if (!rawNotifications) {
          throw new Error(
            "Unexpected notifications API response format."
          );
        }

        const normalized =
          rawNotifications.map(
            normalizeNotification
          );

        setNotifications(normalized);

        hasLoadedRef.current = true;

        console.log(
          "[EVAULT NOTIFICATIONS] Refreshed:",
          normalized.length
        );
      } catch (error) {
        console.error(
          "[EVAULT NOTIFICATIONS] Refresh failed:",
          error?.response?.data ||
            error?.message ||
            error
        );

        // Keep existing notifications when a request fails.
      } finally {
        requestInProgressRef.current = false;

        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  /**
   * Automatically refresh while the HomeScreen is focused.
   *
   * Refresh immediately, poll every 15 seconds, and fetch
   * again when the app returns to the foreground.
   */
  useFocusEffect(
    useCallback(() => {
      screenFocusedRef.current = true;

      void loadNotifications();

      const intervalId = setInterval(() => {
        if (
          screenFocusedRef.current &&
          AppState.currentState === "active"
        ) {
          void loadNotifications();
        }
      }, REFRESH_INTERVAL_MS);

      const appStateSubscription =
        AppState.addEventListener(
          "change",
          (nextState) => {
            if (
              nextState === "active" &&
              screenFocusedRef.current
            ) {
              void loadNotifications();
            }
          }
        );

      return () => {
        screenFocusedRef.current = false;

        clearInterval(intervalId);

        appStateSubscription.remove();
      };
    }, [loadNotifications])
  );

  /**
   * Open the dropdown and immediately check for new items.
   */
  const toggleDropdown = useCallback(() => {
    if (!isOpen) {
      void loadNotifications();
    }

    setIsOpen((previous) => !previous);
  }, [isOpen, loadNotifications]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  /**
   * Manually refresh the list.
   */
  const refreshNotifications = useCallback(
    async () => {
      await loadNotifications({ manual: true });
    },
    [loadNotifications]
  );

  /**
   * Mark every notification as read.
   */
  const markAllAsRead = useCallback(
    async () => {
      try {
        await markAllNotificationsAsRead();

        setNotifications((previous) =>
          previous.map((item) => ({
            ...item,
            unread: false,
            is_read: true,
          }))
        );
      } catch (error) {
        console.error(
          "[EVAULT NOTIFICATIONS] Mark all as read failed:",
          error?.response?.data ||
            error?.message ||
            error
        );
      }
    },
    []
  );

  /**
   * Mark one notification as read.
   */
  const handleNotificationPress = useCallback(
    async (item) => {
      setIsOpen(false);

      if (!item?.unread) {
        return item;
      }

      // Update the badge immediately.
      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === item.id
            ? {
                ...notification,
                unread: false,
                is_read: true,
              }
            : notification
        )
      );

      try {
        await markNotificationAsRead(item.id);
      } catch (error) {
        console.error(
          "[EVAULT NOTIFICATIONS] Mark as read failed:",
          error?.response?.data ||
            error?.message ||
            error
        );

        // Restore unread status if saving failed.
        setNotifications((previous) =>
          previous.map((notification) =>
            notification.id === item.id
              ? {
                  ...notification,
                  unread: true,
                  is_read: false,
                }
              : notification
          )
        );
      }

      return item;
    },
    []
  );

  const handleSeeAllPress = useCallback(() => {
    setIsOpen(false);
  }, []);

  const unreadCount = notifications.filter(
    (item) => item.unread
  ).length;

  return {
    isOpen,
    notifications,
    unreadCount,
    isLoading,
    isRefreshing,
    toggleDropdown,
    closeDropdown,
    markAllAsRead,
    handleNotificationPress,
    handleSeeAllPress,
    refreshNotifications,
    loadNotifications,
  };
}

export default useNotificationDropdown;
