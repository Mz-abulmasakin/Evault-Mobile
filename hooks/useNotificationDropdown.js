import { useState, useMemo } from 'react';
import { Alert } from 'react-native';
// Corrected: Explicitly matching your named export layout
import { NOTIFICATIONS_DATA } from '../data/notificationData';

export function useNotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Safe initialization: falls back to empty array if bundler is stale
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA || []);

  // Dynamically calculates unread counts safely
  const unreadCount = useMemo(() => {
    return notifications.filter(item => item.unread).length;
  }, [notifications]);

  const toggleDropdown = () => setIsOpen(prev => !prev);
  
  const closeDropdown = () => setIsOpen(false);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, unread: false })));
    Alert.alert("Success", "All notifications marked as read.");
  };

  const handleNotificationPress = (item) => {
    setIsOpen(false);
    // Mutate unread state locally for immediate UI response 
    setNotifications(prev => 
      prev.map(n => n.id === item.id ? { ...n, unread: false } : n)
    );
    Alert.alert(item.title, item.description);
  };

  const handleSeeAllPress = () => {
    setIsOpen(false);
    Alert.alert("Navigation", "Redirecting.");
  };

  return {
    isOpen,
    notifications,
    unreadCount,
    toggleDropdown,
    closeDropdown,
    markAllAsRead,
    handleNotificationPress,
    handleSeeAllPress
  };
}