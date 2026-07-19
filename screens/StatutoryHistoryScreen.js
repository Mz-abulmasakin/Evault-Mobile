// screens/StatutoryHistoryScreen.jsx
import React from 'react';
import { View, Text, FlatList, TextInput, ActivityIndicator, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native'; // Added for routing
import { Ionicons } from '@expo/vector-icons'; // Added for back icon
import { useStatutory } from '../hooks/useStatutory';
import { StatutoryCard } from '../components/StatutoryCard';

const BRAND_BLUE = '#2a5fd3';

export default function StatutoryHistoryScreen() {
  const navigation = useNavigation(); // Instantiate navigation hook
  const {
    searchQuery,
    setSearchQuery,
    filteredFilings,
    isLoading,
    isRefreshing,
    refreshRegistry,
    downloadAssetFile
  } = useStatutory();

  return (
    <SafeAreaView style={styles.layoutContainer} edges={['top', 'left', 'right']}>
      <View style={styles.headerBlock}>
        
        {/* --- ADDED HEADER ROW WITH BACK BUTTON --- */}
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.navigate('HomeScreen')} // Directly points back to Home
            accessibilityRole="button"
            accessibilityLabel="Go back to home screen"
          >
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.titleHeadline}>Corporate History</Text>
        </View>
        
        {/* Search Input field */}
        <View style={styles.searchBarBox}>
          <Text style={styles.searchIconSymbol}>🏢</Text>
          <TextInput
            style={styles.textInputNode}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search registrations or certifications..."
            placeholderTextColor="#94A3B8"
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={BRAND_BLUE} />
        </View>
      ) : (
        <FlatList
          data={filteredFilings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StatutoryCard filing={item} onDownloadFile={downloadAssetFile} />
          )}
          contentContainerStyle={styles.scrollListPadding}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refreshRegistry} colors={[BRAND_BLUE]} tintColor={BRAND_BLUE} />
          }
          ListEmptyComponent={
            <View style={styles.emptyViewCard}>
              <Text style={styles.emptyLabel}>No company matching files discovered.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  layoutContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  headerBlock: { backgroundColor: '#FFFFFF', paddingBottom: 16, borderBottomWidth: 1, borderColor: '#E2E8F0', paddingTop: 8 },
  
  // Header Row Layout Configs
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backButton: {
    padding: 4,
    marginRight: 6,
  },
  titleHeadline: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#0F172A'
  },
  
  searchBarBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', marginHorizontal: 20, borderRadius: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  searchIconSymbol: { fontSize: 13, marginRight: 6 },
  textInputNode: { flex: 1, height: 40, fontSize: 13, color: '#0F172A', paddingVertical: 0 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollListPadding: { paddingTop: 14, paddingBottom: 24 },
  emptyViewCard: { alignItems: 'center', marginTop: 40, paddingHorizontal: 30 },
  emptyLabel: { color: '#64748B', fontSize: 13, textAlign: 'center' }
});