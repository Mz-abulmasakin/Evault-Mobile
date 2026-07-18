// WorksScreen.jsx
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { FlatList, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      
      <View style={styles.headerPlate}>
        <Text style={styles.screenTitle}>Service Operations</Text>
        <Text style={styles.screenSub}>Track pending filings, airtime channels, and data bundle delivery status</Text>
      </View>

      <StatusFilterTabs activeTab={activeTab} onTabSelect={setActiveTab} />

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
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { justifyContent: 'center', alignItems: 'center' },
  headerPlate: { paddingHorizontal: 20, marginTop: 16, marginBottom: 8 },
  screenTitle: { fontSize: 24, fontWeight: '700', color: '#0F172A' },
  screenSub: { fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 18 },
  listContent: { paddingBottom: 20 },
  emptyContainer: { alignItems: 'center', padding: 40, marginTop: 20 },
  emptyText: { color: '#94A3B8', fontSize: 14, textAlign: 'center', lineHeight: 20 }
});