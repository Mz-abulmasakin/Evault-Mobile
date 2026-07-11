import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, Text, View, Pressable, Platform, Alert, Image, 
  TextInput, KeyboardAvoidingView, ScrollView 
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

function showAlert(message) {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(message);
  }
}

const topLogo = require('./assets/evault-logo.png');

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
   const [email, setEmail] = useState('');
    const [phonenumber, setPhoneNumber] = useState('');
    

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            {/* Top Branding Header */}
            <View style={styles.logoContainer}>
              <Image style={styles.headerLogo} source={topLogo} />
            </View>

            <Text style={styles.title}>Corporate Portal</Text>
            <Text style={styles.subtitle}>Secure workspace authentication layer</Text>

            {/* Login Form Container Card */}
            <View style={styles.formContainer}>
              
              {/* Username Input Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username or Email</Text>
                <TextInput 
                  placeholder='Enter your username' 
                  placeholderTextColor="#94a3b8"
                  style={styles.input} 
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              {/* Password Input Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput 
                  placeholder='Enter your password' 
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={true}
                  style={styles.input} 
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
              </View>

              {/* email Input Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput 
                  placeholder='Enter your password' 
                  placeholderTextColor="#94a3b8"
                  style={styles.input} 
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>

               {/* phone Input Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput 
                  placeholder='Enter your password' 
                  placeholderTextColor="#94a3b8"
                  style={styles.input} 
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  autoCapitalize="none"
                />
              </View>

             

              {/* Primary Login Button */}
              <Pressable 
                style={({ pressed }) => [
                  styles.primaryButton, 
                  { transform: [{ scale: pressed ? 0.98 : 1 }] }
                ]} 
                onPress={() => showAlert(`Registered Successfully`)}
              >
                <Text style={styles.primaryButtonText}>Register</Text>
              </Pressable>

            </View>

            {/* Registration Action Layout Section */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>New to eVault Corporate?</Text>
              <Pressable 
                style={({ pressed }) => [
                  styles.secondaryButton, 
                  { opacity: pressed ? 0.75 : 1 }
                ]}
                onPress={() => showAlert('Redirecting to Registration setup')}
              >
                <Text style={styles.secondaryButtonText}>Create an Account</Text>
              </Pressable>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // Modern off-white background
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    marginBottom: 20,
    padding: 14,
    backgroundColor: '#264bc5', 
    borderRadius: 22,
    shadowColor: '#264bc5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  headerLogo: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b', 
    textAlign: 'center',
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    paddingLeft: 2,
  },
  input: {
    width: '100%',
    backgroundColor: '#f1f5f9',
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  forgotPasswordWrapper: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#264bc5',
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#264bc5', 
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#264bc5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
  },
  secondaryButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: '#264bc5',
    fontSize: 15,
    fontWeight: '700',
  },
});