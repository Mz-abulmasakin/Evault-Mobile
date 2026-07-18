// components/ProfileForm.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';

export function ProfileForm({ initialData, onSave, isSaving }) {
  const [formState, setFormState] = useState(initialData);

  const handleInputChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.label}>First Name</Text>
      <TextInput 
        style={styles.input} 
        value={formState.firstName} 
        onChangeText={(text) => handleInputChange('firstName', text)} 
      />

      <Text style={styles.label}>Last Name</Text>
      <TextInput 
        style={styles.input} 
        value={formState.lastName} 
        onChangeText={(text) => handleInputChange('lastName', text)} 
      />

      <Text style={styles.label}>Bio</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        value={formState.bio} 
        multiline
        numberOfLines={3}
        onChangeText={(text) => handleInputChange('bio', text)} 
      />

      <TouchableOpacity 
        style={[styles.saveButton, isSaving && styles.disabledButton]} 
        onPress={() => onSave(formState)}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: { paddingHorizontal: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#666', marginBottom: 5, marginTop: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fff' },
  textArea: { height: 80, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#34C759', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  disabledButton: { opacity: 0.7 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});