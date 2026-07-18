import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, Text, View, Pressable, Platform, Alert, ScrollView, Image 
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 


function showAlert(message) {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(message);
  }
}
 

export default function Customtext() {
  const [activeTab, setActiveTab] = useState('Home');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
         
  
              {/* Custom Verbal */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput 
                  placeholder=""  
                  placeholderTextColor=" "
                  secureTextEntry={false}
                  style="" 
                  value="{value}"  
                  onChangeText={onChangeText}
                  autoCapitalize="none"
                  leftIcon="lock"
                  rightIcon="eye"
                  maxLength={}

                  
                />
              </View>
       
       
        <StatusBar style="dark" /> 
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', 
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 16, 
    paddingBottom: 35, 
  },
  headerLogoWrapper: {
    width: '92%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', 
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: BRAND_COLOR, 
    borderRadius: 16,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
    marginRight: 10,
    tintColor: '#ffffff', 
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.1,
  },
  sectionHeader: {
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginLeft: 8,
  },
  inlineButtonRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    width: '92%', 
    marginVertical: 4,
  },
  premiumTile: {
    flex: 1, 
    flexDirection: 'column', 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Corrected syntax
    paddingVertical: 16,     
    marginHorizontal: 4, 
    borderRadius: 16,
    borderWidth: 1,           // Added to make the border visible
    borderColor: BRAND_COLOR, // Corrected syntax
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tilePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  iconBackdropCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(42, 95, 211, 0.1)', // Changed to light blue so it shows on white bg
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tileBtnText: {
    color: BRAND_COLOR, // Changed from white to blue so it's readable
    fontSize: 10, 
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});