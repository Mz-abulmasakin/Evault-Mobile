import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, Text, View, Pressable, Platform, Alert, ScrollView, Image 
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; // Standard Expo Vector Icons

// --- CUSTOM COMPONENT IMPORTS ---
import UserCard from '../components/UserCard';
import Videocomponents from '../components/VideoComponents'; 

function showAlert(message) {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(message);
  }
}

const topLogo = require('../assets/evault-logo.png');
const BRAND_COLOR = '#2a5fd3'; 

export default function App() {
  // Track active tab state to handle dynamic navigation colors
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Top Header Logo Container */}
          <View style={styles.headerLogoWrapper}>
            <View style={styles.headerLeft}>
              <Image style={styles.headerLogo} source={topLogo} />
              <Text style={styles.headerTitle}>eVault Corporate</Text>
            </View>
          </View>

          {/* User Account Dashboard Card - Expanded to Full Edge-to-Edge Width */}
          <View style={styles.cardContentWrapper}>
            <UserCard 
              username="Ziyaulhaq" 
              bank="Evaultmoney" 
              accountNumber="4092817364" 
              accountBalance="150,000" 
            />
          </View>
        
          
        <StatusBar style="dark" />
        </ScrollView> 
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', 
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 16, 
    paddingBottom: 32, 
  },
  headerLogoWrapper: {
    width: '92%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginBottom: 20,
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
  cardContentWrapper: {
    width: '100%', 
    marginBottom: 24,
  },
  textHeroContainer: {
    width: '92%',
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a', 
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b', 
    textAlign: 'center',
    lineHeight: 18,
  },
  row2: {
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 16,
    width: '92%',
    borderRadius: 20,
    backgroundColor: '#f1f5f9', 
    padding: 4,
  },
  wrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  tabButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabButtonPressed: {
    backgroundColor: '#f8fafc',
    opacity: 0.9,
  },
  tabBtnText: {
    color: BRAND_COLOR,
    fontSize: 13,
    fontWeight: '700',
  },
  inlineButtonRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    width: '92%', 
    marginVertical: 4,
  },
  premiumTile: {
    flex: 1, 
    flexDirection: 'column', 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BRAND_COLOR, 
    paddingVertical: 16,     
    marginHorizontal: 4, 
    borderRadius: 16,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  tilePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  iconBackdropCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tileBtnText: {
    color: '#ffffff',
    fontSize: 11, 
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  
  // --- BOTTOM TAB NAVIGATION STYLES ---
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12, // Native bottom safety layout
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 10,
  },
  navigationItems: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  tabBarText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});