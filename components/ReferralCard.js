// components/ReferralCard.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

const BRAND_COLOR = '#2a5fd3';

export function ReferralCard({ referralCode, onCopy, isCopying }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Share Evault, Earn Rewards</Text>
      <Text style={styles.description}>
        Invite your business colleagues. When they secure their first appliance funding line, you both receive bonus wallet credits.
      </Text>
      
      <View style={styles.codeContainer}>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{referralCode}</Text>
        </View>
        <TouchableOpacity style={styles.copyBtn} onPress={() => onCopy(referralCode)} disabled={isCopying}>
          {isCopying ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.copyBtnText}>Copy Code</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: BRAND_COLOR, borderRadius: 16, padding: 20, marginHorizontal: 20, marginTop: 16, elevation: 4, shadowColor: BRAND_COLOR, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 },
  title: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 },
  description: { fontSize: 13, color: '#E0F2FE', lineHeight: 18, marginBottom: 16 },
  codeContainer: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  codeBox: { flex: 2, backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.25)', alignItems: 'center' },
  codeText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 1.5 },
  copyBtn: { flex: 1, backgroundColor: '#FFFFFF', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  copyBtnText: { color: BRAND_COLOR, fontWeight: '700', fontSize: 14 }
});