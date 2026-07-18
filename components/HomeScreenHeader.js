// components/HomeScreenHeader.jsx
import React from 'react';
import { 
  StyleSheet, Text, View, Pressable, ScrollView, Platform, Modal, Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useNotificationDropdown } from '../hooks/useNotificationDropdown';
import StatutoryHistoryScreen from '../screens/StatutoryHistoryScreen';

// Logo Asset & Visual Identity Config
const topLogo = require('../assets/evault-logo.png');
const BRAND_COLOR = '#2a5fd3';

export default function HomeScreenHeader() {
  const navigation = useNavigation();
  const {
    isOpen,
    notifications,
    unreadCount,
    toggleDropdown,
    closeDropdown,
    markAllAsRead,
    handleNotificationPress,
    handleSeeAllPress
  } = useNotificationDropdown();

  // Unified routing handler for item selections and footer navigation
  const navigateToHistory = () => {
    closeDropdown();
    // Redirects directly to your notifications manager/history route
    navigation.navigate('StatutoryHistoryScreen'); 
  };

  return (
    <View style={styles.outerContainer}>
      
      {/* --- BRANDED HEADER CONTAINER RESTORED --- */}
      <View style={styles.headerLogoWrapper}>
        <View style={styles.headerLeft}>
          <Image style={styles.headerLogo} source={topLogo} />
          <Text style={styles.headerTitle}>eVault Corporate</Text>
        </View>
        
        {/* White Stylized Notification Anchor */}
        <Pressable 
          style={styles.bellButton} 
          onPress={toggleDropdown}
          accessibilityRole="button"
          accessibilityLabel="Open notifications panel"
        >
          <Ionicons 
            name={isOpen ? "notifications" : "notifications-outline"} 
            size={22} 
            color="#ffffff" 
          />
          {unreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* --- NATIVE MODAL SYSTEM --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isOpen}
        onRequestClose={closeDropdown}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.dismissAbsoluteContainer} onPress={closeDropdown} />
          
          <View style={styles.modalCard}>
            
            {/* Modal Header Actions */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <Pressable onPress={markAllAsRead}>
                  <Text style={styles.markReadText}>Mark all as read</Text>
                </Pressable>
              )}
            </View>

            {/* Scrollable Notification Sub-list Context */}
            <ScrollView 
              style={styles.listScroll} 
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {notifications.map((item) => (
                <Pressable 
                  key={item.id} 
                  style={({ pressed }) => [
                    styles.notificationItem,
                    item.unread && styles.unreadBackground,
                    pressed && styles.itemPressed
                  ]}
                  onPress={() => {
                    handleNotificationPress(item); // Clears unread tag locally
                    navigateToHistory();          // Redirects to history screen
                  }}
                >
                  {/* Left Side Dynamic Icon Container */}
                  <View style={[
                    styles.iconWrapper, 
                    { backgroundColor: item.unread ? 'rgba(42, 95, 211, 0.1)' : '#f1f5f9' }
                  ]}>
                    <Ionicons 
                      name={item.icon} 
                      size={18} 
                      color={item.unread ? BRAND_COLOR : '#64748b'} 
                    />
                  </View>

                  {/* Middle Descriptive Copy Panels */}
                  <View style={styles.textContainer}>
                    <Text style={[styles.itemTitle, item.unread && styles.boldText]}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    <Text style={styles.itemTime}>{item.time}</Text>
                  </View>

                  {/* Right Action Side Unread Indicator Dot */}
                  {item.unread && <View style={styles.unreadDot} />}
                </Pressable>
              ))}
            </ScrollView>

            {/* Modal Footer Routing Nav Context */}
            <Pressable 
              style={({ pressed }) => [styles.modalFooter, pressed && styles.itemPressed]}
              onPress={() => {
                handleSeeAllPress();
                navigateToHistory();
              }}
            >
              <Text style={styles.footerText}>See all notifications</Text>
              <Ionicons name="arrow-forward" size={14} color={BRAND_COLOR} />
            </Pressable>

          </View>
        </View>
      </Modal>

    </View>
  );
}

// ==========================================
// STYLE SHEET SPECIFICATIONS
// ==========================================
const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingTop: 12,
  },
  headerLogoWrapper: {
    width: '92%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BRAND_COLOR, 
    borderRadius: 16,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginRight: 10,
    tintColor: '#ffffff', 
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.1,
  },
  bellButton: {
    padding: 6,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ef4444',
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: BRAND_COLOR, // Matches brand color backdrop seamlessly
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
    textAlign: 'center',
  },
  
  /* --- MODAL PRESENTATION STYLES --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  dismissAbsoluteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: '88%',
    maxWidth: 340,
    maxHeight: '70%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  markReadText: {
    fontSize: 12,
    color: BRAND_COLOR,
    fontWeight: '600',
  },
  listScroll: {
    flexGrow: 0,
  },
  listContent: {
    paddingVertical: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  unreadBackground: {
    backgroundColor: '#f8fafc', 
  },
  itemPressed: {
    backgroundColor: '#f1f5f9',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    paddingRight: 6,
  },
  itemTitle: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 2,
  },
  boldText: {
    fontWeight: '700',
    color: '#0f172a',
  },
  itemDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 10,
    color: '#94a3b8',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BRAND_COLOR,
    marginTop: 6,
    alignSelf: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND_COLOR,
    marginRight: 4,
  },
});