// WorksScreen.jsx
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { 
  FlatList, 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity // Added for back button interaction
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; // Added for the back arrow icon

import { useWorks } from '../hooks/useWorks';
import { StatusFilterTabs } from '../components/StatusFilterTabs';
import { WorkItemCard } from '../components/WorkItemCard';

const BRAND_COLOR = '#2a5fd3';

export default function WorksScreen() {
  const {
    filteredWorks,
    activeTab,
    setActiveTab,
    isLoading,
    isRefreshing,
    refreshWorksList
  } = useWorks();
  const navigation = useNavigation();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color={BRAND_COLOR} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      
      {/* --- UNIFORM TOP NAVIGATION HEADER CONTAINER --- */}
      <View style={styles.headerPlate}>
        
        {/* Horizontal Navigation Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()} // Safely routes straight back to your home dashboard
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Service Operations</Text>
        </View>

        <Text style={styles.screenSub}>
          Track pending filings, airtime channels, and data bundle delivery status
        </Text>
      </View>

      {/* Status Filtering Tabs */}
      <StatusFilterTabs activeTab={activeTab} onTabSelect={setActiveTab} />

      {/* Main Data Feed */}
      <FlatList
        data={filteredWorks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WorkItemCard work={item} />}
        showsVerticalScrollIndicator={false}
        refreshing={isRefreshing}
        onRefresh={refreshWorksList}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No service records matched this status filter.</Text>
          </View>
        }
      />
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  center: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerPlate: { 
    paddingHorizontal: 16, 
    marginTop: 16, 
    marginBottom: 8 
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  backButton: {
    padding: 6,
    marginRight: 8,
    marginLeft: -4, // Counterbalances the button's internal touch padding alignment
  },
  screenTitle: { 
    fontSize: 22, // Adjusted down slightly to sit comfortably next to the arrow icon
    fontWeight: '700', 
    color: '#0F172A',
    letterSpacing: -0.3
  },
  screenSub: { 
    fontSize: 13, 
    color: '#64748B', 
    marginTop: 2, 
    lineHeight: 18,
    paddingLeft: 2 // Keeps subtext aligned neatly underneath the title text row
  },
  listContent: { 
    paddingBottom: 40 
  },
  emptyContainer: { 
    alignItems: 'center', 
    padding: 40, 
    marginTop: 20 
  },
  emptyText: { 
    color: '#94A3B8', 
    fontSize: 14, 
    textAlign: 'center', 
    lineHeight: 20 
  }
});