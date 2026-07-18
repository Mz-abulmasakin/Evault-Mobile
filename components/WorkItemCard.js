// components/WorkItemCard.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BRAND_COLOR = '#2a5fd3';

export function WorkItemCard({ work }) {
  const isOngoing = work.status === 'ongoing';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.workId}>{work.id}</Text>
        
        {/* Crisp FinTech Status Badges */}
        <View style={[styles.badge, isOngoing ? styles.badgeOngoing : styles.badgeCompleted]}>
          <Text style={[styles.badgeText, isOngoing ? styles.textOngoing : styles.textCompleted]}>
            {work.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>{work.title}</Text>
      <Text style={styles.category}>{work.category}</Text>

      <View style={styles.footerRow}>
        <View>
          <Text style={styles.label}>VALUATION</Text>
          <Text style={styles.value}>{work.valuation}</Text>
        </View>
        <View style={styles.rightAlign}>
          <Text style={styles.label}>LAST UPDATED</Text>
          <Text style={styles.value}>{work.date}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginHorizontal: 20, marginBottom: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  workId: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5 },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  badgeOngoing: { backgroundColor: '#FFF7ED' }, // Amber tint
  badgeCompleted: { backgroundColor: '#ECFDF5' }, // Green tint
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  textOngoing: { color: '#C2410C' },
  textCompleted: { color: '#15803D' },

  title: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4, lineHeight: 22 },
  category: { fontSize: 13, color: '#64748B', marginBottom: 16, fontWeight: '500' },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 12 },
  label: { fontSize: 9, fontWeight: '700', color: '#94A3B8', marginBottom: 2, letterSpacing: 0.5 },
  value: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  rightAlign: { alignItems: 'flex-end' }
});