// components/FaqCard.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export function FaqCard({ item, isExpanded, onToggle }) {
  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity style={styles.questionRow} onPress={onToggle} activeOpacity={0.7}>
        <Text style={styles.questionText}>{item.question}</Text>
        <Text style={[styles.arrow, isExpanded && styles.arrowRotated]}>
          {isExpanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.answerRow}>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: '#F1F5F9' },
  questionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 20 },
  questionText: { fontSize: 15, fontWeight: '600', color: '#1E293B', flex: 0.95 },
  arrow: { fontSize: 11, color: '#94A3B8' },
  arrowRotated: { color: '#2a5fd3' },
  answerRow: { paddingHorizontal: 20, paddingBottom: 18, paddingTop: 2 },
  answerText: { fontSize: 14, color: '#64748B', lineHeight: 20 }
});