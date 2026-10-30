 // hooks/useStatutory.js

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Alert,
} from "react-native";

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/notificationApi";


/**
 * =========================================================
 * NOTIFICATION ICON
 * =========================================================
 */

function getNotificationIcon(type) {

  switch (
    String(type || "").toUpperCase()
  ) {

    case "SUCCESS":
      return "checkmark-circle";

    case "PAYMENT":
      return "card";

    case "FUNDING":
      return "wallet";

    case "TRANSACTION":
      return "swap-horizontal";

    case "AIRTIME":
      return "phone-portrait";

    case "DATA":
      return "wifi";

    case "BILLS":
      return "receipt";

    case "CAC":
      return "business";

    case "TIN":
      return "document-text";

    case "SCUML":
      return "shield-checkmark";

    case "IDENTITY":
      return "person-circle";

    case "DOCUMENT":
      return "document-text";

    case "WARNING":
      return "warning";

    case "ERROR":
      return "alert-circle";

    case "INFO":
    default:
      return "information-circle";
  }
}


/**
 * =========================================================
 * FORMAT NOTIFICATION TIME
 * =========================================================
 */

function formatNotificationTime(
  dateValue
) {

  if (!dateValue) {
    return "";
  }

  const date =
    new Date(dateValue);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const now =
    new Date();

  const difference =
    now.getTime() -
    date.getTime();

  const seconds =
    Math.floor(
      difference / 1000
    );

  if (seconds < 60) {
    return "Just now";
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours / 24
    );

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString();
}


/**
 * =========================================================
 * NORMALIZE NOTIFICATION
 * =========================================================
 *
 * Backend notification:
 *
 * {
 *   id,
 *   user_id,
 *   title,
 *   message,
 *   type,
 *   is_read,
 *   data,
 *   created_at
 * }
 *
 * Frontend:
 *
 * {
 *   id,
 *   title,
 *   description,
 *   unread,
 *   icon,
 *   time,
 *   type,
 *   data
 * }
 */

function normalizeNotification(
  item
) {

  return {

    ...item,

    id:
      item.id,

    title:
      item.title ||
      "Notification",

    description:
      item.message ||
      item.description ||
      "",

    unread:
      item.is_read === false,

    icon:
      getNotificationIcon(
        item.type
      ),

    time:
      formatNotificationTime(
        item.created_at
      ),

    type:
      item.type ||
      "INFO",

    data:
      item.data ||
      {},

  };
}


/**
 * =========================================================
 * MAIN HOOK
 * =========================================================
 *
 * This hook is now used by the MAIN notification page.
 *
 * It does NOT use:
 *
 * INITIAL_STATUTORY_DATA
 *
 * Everything comes from the backend notifications table.
 */

export function useStatutory() {

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");


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


  /**
   * =======================================================
   * LOAD NOTIFICATIONS
   * =======================================================
   */

  const loadNotifications =
    useCallback(
      async () => {

        try {

          setIsLoading(true);


          const data =
            await getNotifications();


          const normalized =
            Array.isArray(data)
              ? data.map(
                  normalizeNotification
                )
              : [];


          setNotifications(
            normalized
          );

        } catch (error) {

          console.error(
            "Load notifications error:",
            error.response?.data ||
            error.message
          );


          Alert.alert(
            "Notifications",
            "Unable to load notifications."
          );

        } finally {

          setIsLoading(false);

        }

      },
      []
    );


  /**
   * =======================================================
   * INITIAL LOAD
   * =======================================================
   */

  useEffect(() => {

    loadNotifications();

  }, [
    loadNotifications,
  ]);


  /**
   * =======================================================
   * FILTER NOTIFICATIONS
   * =======================================================
   */

  const filteredNotifications =
    useMemo(() => {

      if (
        !searchQuery.trim()
      ) {

        return notifications;

      }


      const query =
        searchQuery
          .trim()
          .toLowerCase();


      return notifications.filter(
        item => {

          const title =
            String(
              item.title || ""
            ).toLowerCase();


          const description =
            String(
              item.description ||
              ""
            ).toLowerCase();


          const type =
            String(
              item.type || ""
            ).toLowerCase();


          return (
            title.includes(query) ||
            description.includes(query) ||
            type.includes(query)
          );

        }
      );

    }, [
      searchQuery,
      notifications,
    ]);


  /**
   * =======================================================
   * UNREAD COUNT
   * =======================================================
   */

  const unreadCount =
    notifications.filter(
      item =>
        item.unread
    ).length;


  /**
   * =======================================================
   * REFRESH
   * =======================================================
   */

  const refreshRegistry =
    useCallback(
      async () => {

        try {

          setIsRefreshing(
            true
          );


          const data =
            await getNotifications();


          const normalized =
            Array.isArray(data)
              ? data.map(
                  normalizeNotification
                )
              : [];


          setNotifications(
            normalized
          );

        } catch (error) {

          console.error(
            "Refresh notifications error:",
            error.response?.data ||
            error.message
          );


          Alert.alert(
            "Notifications",
            "Unable to refresh notifications."
          );

        } finally {

          setIsRefreshing(
            false
          );

        }

      },
      []
    );


  /**
   * =======================================================
   * MARK ONE AS READ
   * =======================================================
   */

  const handleNotificationPress =
    useCallback(
      async (
        notification
      ) => {

        if (
          !notification?.id
        ) {
          return;
        }


        /**
         * If already read,
         * nothing needs to happen.
         */

        if (
          !notification.unread
        ) {
          return;
        }


        /**
         * Optimistic update.
         */

        setNotifications(
          previous =>
            previous.map(
              item =>
                item.id ===
                notification.id
                  ? {
                      ...item,
                      unread: false,
                      is_read: true,
                    }
                  : item
            )
        );


        try {

          await markNotificationAsRead(
            notification.id
          );

        } catch (error) {

          console.error(
            "Mark notification read error:",
            error.response?.data ||
            error.message
          );


          /**
           * Restore unread state
           * if backend request fails.
           */

          setNotifications(
            previous =>
              previous.map(
                item =>
                  item.id ===
                  notification.id
                    ? {
                        ...item,
                        unread: true,
                        is_read: false,
                      }
                    : item
              )
          );


          Alert.alert(
            "Error",
            "Unable to mark notification as read."
          );

        }

      },
      []
    );


  /**
   * =======================================================
   * MARK ALL AS READ
   * =======================================================
   */

  const markAllAsRead =
    useCallback(
      async () => {

        try {

          await markAllNotificationsAsRead();


          setNotifications(
            previous =>
              previous.map(
                item => ({
                  ...item,
                  unread: false,
                  is_read: true,
                })
              )
          );

        } catch (error) {

          console.error(
            "Mark all notifications read error:",
            error.response?.data ||
            error.message
          );


          Alert.alert(
            "Error",
            "Unable to mark notifications as read."
          );

        }

      },
      []
    );


  /**
   * =======================================================
   * RETURN
   * =======================================================
   */

  return {

    /**
     * Search
     */

    searchQuery,

    setSearchQuery,


    /**
     * Notifications
     */

    notifications,

    filteredNotifications,


    /**
     * Loading
     */

    isLoading,

    isRefreshing,


    /**
     * Counts
     */

    unreadCount,


    /**
     * Actions
     */

    loadNotifications,

    refreshRegistry,

    handleNotificationPress,

    markAllAsRead,

  };
}