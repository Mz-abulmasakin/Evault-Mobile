// components/StatusFilterTabs.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const BRAND_COLOR = '#2a5fd3';

export function StatusFilterTabs({ activeTab, onTabSelect }) {
  const tabs = [
    { id: 'all', label: 'All Services' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'completed', label: 'Completed' }
  ];

  return (
    <View style={styles.tabsContainer}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, isActive && styles.activeTabButton]}
            onPress={() => onTabSelect(tab.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabsContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#E2E8F0', // Clean Slate divider zone
    borderRadius: 10, 
    padding: 4, 
    marginHorizontal: 20, 
    marginTop: 12, 
    marginBottom: 16 
  },
  tabButton: { 
    flex: 1, 
    paddingVertical: 10, 
    alignItems: 'center', 
    borderRadius: 8 
  },
  activeTabButton: { 
    backgroundColor: '#FFFFFF', 
    shadowColor: '#0F172A', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 3, 
    elevation: 1 
  },
  tabText: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#64748B' 
  },
  activeTabText: { 
    color: BRAND_COLOR 
  }
});