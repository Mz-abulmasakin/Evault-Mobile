// components/ProfileAvatar.jsx
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const BRAND_COLOR = '#2a5fd3';

export function ProfileAvatar({ url, onPickImage }) {
  return (
    <View style={styles.avatarContainer}>
      <TouchableOpacity onPress={onPickImage} style={styles.avatarWrapper}>
        <Image source={{ uri: url }} style={styles.avatar} />
        <View style={styles.editBadge}>
          <Text style={styles.editBadgeText}>+</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: { alignItems: 'center', paddingVertical: 20 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: '#E2E8F0', marginTop: 3},
  editBadge: { position: 'absolute', bottom: 0, right: 2, backgroundColor: BRAND_COLOR, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF' },
  editBadgeText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginTop: 3},
});