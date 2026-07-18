// ProfileScreen.jsx
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  TextInput 
} from 'react-native';
// Fix 1: Migrated safe area layout wrapper to the context library
import { SafeAreaView } from 'react-native-safe-area-context'; 

import { useProfile } from '../hooks/useProfile';
import { ProfileAvatar } from '../components/ProfileAvatar';

// Fix 2: Changed to a named import to match the 'export function CustomModal' statement
import { CustomModal } from '../components/CustomModal'; 

const BRAND_COLOR = '#2a5fd3';
const BRAND_MUTED = '#eff6ff';

export default function ProfileScreen({ userId }) {
  const { profileData, isLoading, isSaving, updateProfile } = useProfile(userId);
  
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  const navigation = useNavigation();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={BRAND_COLOR} />
      </SafeAreaView>
    );
  }

  const handleSavePin = async () => {
    if (!loginPassword || !pin || !confirmPin) {
      Alert.alert("Error", "Please fill in all security parameter entries.");
      return;
    }
    if (pin !== confirmPin) {
      Alert.alert("Mismatched Fields", "Your new PIN configurations do not match.");
      return;
    }
    
    const result = await updateProfile({ transactionPin: pin });
    if (result.success) {
      Alert.alert("Success", "Your Transaction PIN has been changed successfully.");
      setPhoneModalVisible(false);
      setLoginPassword('');
      setPin('');
      setConfirmPin('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={true}>
        
        {/* Brand Header Context */}
        <View style={styles.headerPlate}>
          <ProfileAvatar 
            url={profileData.avatarUrl} 
            onPickImage={() => Alert.alert("Evault Media", "Launch image library picker context")} 
          />
          <Text style={styles.profileName}>{profileData.firstName} {profileData.lastName}</Text>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>Evault Verified Account</Text>
          </View>
        </View>

        {/* Section 1: Account Attributes */}
        <Text style={styles.sectionTitle}>ACCOUNT DETAILS</Text>
        <View style={styles.groupCard}>
          <ProfileRow title="Name" value={`${profileData.firstName} ${profileData.lastName}`} />
          <ProfileRow title="Registered Email" value={profileData.email} />
          <ProfileRow title="Phone Number" value={profileData.phoneNumber} />
          <ProfileRow title="Username" value={`@${profileData.username}`} />
        </View>

        {/* Section 2: Security Configurations */}
        <Text style={styles.sectionTitle}>SECURITY & PRIVACY</Text>
        <View style={styles.groupCard}>
          <ProfileRow title="Change Transaction PIN" onPress={() => setPhoneModalVisible(true)}/>
        </View>

        {/* Section 3: Session Actions */}
        <Text style={styles.sectionTitle}>SIGNOUT</Text>
        <View style={styles.groupCard}>
          <ProfileRow title="Logout" isDestructive onPress={() => navigation.navigate('LoginScreen')} />
        </View>
        
      </ScrollView>

      {/* Renders safely now that the component evaluation isn't undefined */}
      <CustomModal
        isVisible={phoneModalVisible}
        onClose={() => setPhoneModalVisible(false)}
        title="Change Transaction PIN"
      >
        <Text style={styles.inputDescription}>
          Confirm your password security credentials to apply changes to your transaction authorization rules.
        </Text>

        <Text style={styles.inputLabel}>Current Password</Text>
        <TextInput
          style={styles.textInput}
          value={loginPassword}
          onChangeText={setLoginPassword}
          placeholder="Enter current log-in password"
          placeholderTextColor="#94A3B8"
          secureTextEntry={true}
        />

        <Text style={styles.inputLabel}>New 4-Digit PIN</Text>
        <TextInput
          style={styles.textInput}
          value={pin}
          onChangeText={setPin}
          keyboardType="numeric"
          maxLength={4}
          placeholder="****"
          secureTextEntry={true}
          placeholderTextColor="#94A3B8"
        />

        <Text style={styles.inputLabel}>Confirm New PIN</Text>
        <TextInput
          style={styles.textInput}
          value={confirmPin}
          onChangeText={setConfirmPin}
          keyboardType="numeric"
          maxLength={4}
          placeholder="****"
          secureTextEntry={true}
          placeholderTextColor="#94A3B8"
        />

        <View style={styles.modalActionRow}>
          <TouchableOpacity 
            style={styles.cancelAction} 
            onPress={() => setPhoneModalVisible(false)}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.saveAction} 
            onPress={handleSavePin}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveText}>Update PIN</Text>
            )}
          </TouchableOpacity>
        </View>
      </CustomModal>
    </SafeAreaView>
  );
}

function ProfileRow({ title, value, onPress, isDestructive }) {
  return (
    <TouchableOpacity style={styles.rowItem} onPress={onPress} disabled={!onPress}>
      <Text style={[styles.rowTitle, isDestructive && styles.destructiveText]}>{title}</Text>
      <View style={styles.rightSlot}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { justifyContent: 'center', alignItems: 'center' },
  headerPlate: { alignItems: 'center', backgroundColor: '#FFFFFF', paddingTop: 20, paddingBottom: 18, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  profileName: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 6, marginTop: 10 },
  verifiedBadge: { backgroundColor: BRAND_MUTED, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  verifiedText: { fontSize: 12, fontWeight: '600', color: BRAND_COLOR },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#64748B', letterSpacing: 1.2, paddingHorizontal: 20, marginTop: 24, marginBottom: 8 },
  groupCard: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  rowTitle: { fontSize: 15, fontWeight: '500', color: '#1E293B' },
  destructiveText: { color: '#EF4444', fontWeight: '600' },
  rightSlot: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { fontSize: 14, color: '#64748B', marginRight: 8 },
  chevron: { fontSize: 20, color: '#94A3B8', marginTop: -2 },
  
  inputDescription: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6, marginLeft: 2 },
  textInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, padding: 14, fontSize: 16, color: '#0F172A', backgroundColor: '#F8FAFC', marginBottom: 16 },
  modalActionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelAction: { flex: 1, backgroundColor: '#F1F5F9', padding: 14, borderRadius: 10, alignItems: 'center' },
  cancelText: { color: '#475569', fontWeight: '600', fontSize: 15 },
  saveAction: { flex: 1, backgroundColor: BRAND_COLOR, padding: 14, borderRadius: 10, alignItems: 'center' },
  saveText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 }
});