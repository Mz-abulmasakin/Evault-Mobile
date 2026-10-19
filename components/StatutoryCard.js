// components/StatutoryCard.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const BRAND_BLUE = '#2a5fd3';

const STATUS_THEMES = {
  completed: { bg: '#E6F4EA', text: '#137333', label: 'Completed' },
  pending: { bg: '#FEF3C7', text: '#D97706', label: 'Processing' },
  review: { bg: '#FCE8E6', text: '#C5221F', label: 'Action Needed' }
};

export function StatutoryCard({ filing, onDownloadFile }) {
  const statusTheme = STATUS_THEMES[filing.status] || { bg: '#F1F5F9', text: '#475569', label: 'Pending' };

  return (
    <View style={styles.card}>
      {/* Top Identity Block */}
      <View style={styles.cardHeader}>
        <View style={styles.companySlot}>
          <Text style={styles.companyTitle} numberOfLines={1}>{filing.companyName}</Text>
          <Text style={styles.filingId}>{filing.id} • {filing.date}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusTheme.bg }]}>
          <Text style={[styles.statusPillText, { color: statusTheme.text }]}>{statusTheme.label}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Info Section */}
      <View style={styles.detailsRow}>
        <View>
          <Text style={styles.metaLabel}>Filing Type</Text>
          <Text style={styles.metaValue}>{filing.label}</Text>
        </View>
        <View style={styles.alignRight}>
          <Text style={styles.metaLabel}>Total Paid</Text>
          <Text style={styles.metaValuePrice}>{filing.cost}</Text>
        </View>
      </View>

      {/* Interactive Bottom Control Panel */}
      {filing.status === 'completed' && filing.documents?.length > 0 && (
        <View style={styles.downloadSection}>
          <Text style={styles.sectionLabel}>AVAILABLE DOWNLOADS</Text>
          
          {/* Dynamic Grid Mapping for Document Arrays */}
          <View style={styles.documentGrid}>
            {filing.documents.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.docChipButton}
                onPress={() => onDownloadFile(doc.url, doc.fileName)}
                activeOpacity={0.7}
              >
                <Text style={styles.docChipIcon}>📄</Text>
                <Text style={styles.docChipText} numberOfLines={1}>{doc.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {filing.status === 'review' && (
        <TouchableOpacity style={styles.actionErrorButton} activeOpacity={0.8}>
          <Text style={styles.actionErrorText}>Resolve Application Rejection Review</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', marginHorizontal: 20, marginBottom: 14, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  companySlot: { flex: 1 },
  companyTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 3 },
  filingId: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alignRight: { alignItems: 'flex-end' },
  metaLabel: { fontSize: 10, fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 2 },
  metaValue: { fontSize: 14, fontWeight: '600', color: '#334155' },
  metaValuePrice: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  
  // Adaptive Grid Configuration
  downloadSection: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  sectionLabel: { fontSize: 9, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.5, marginBottom: 8 },
  documentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  docChipButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: 'rgba(42, 95, 211, 0.12)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, minWidth: '47%', flexGrow: 1 },
  docChipIcon: { fontSize: 12, marginRight: 6 },
  docChipText: { color: BRAND_BLUE, fontSize: 12, fontWeight: '700' },
  
  // Exception handling styles
  actionErrorButton: { marginTop: 14, backgroundColor: '#FCE8E6', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  actionErrorText: { color: '#C5221F', fontSize: 12, fontWeight: '700' }
});