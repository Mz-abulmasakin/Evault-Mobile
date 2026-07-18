import React, { useState } from 'react'; 
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, Text, View, Pressable, Platform, Alert, ScrollView, Image 
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; 

// --- CUSTOM COMPONENT IMPORTS ---
import PromoCarousel from '../components/Advert-slide';
import Category from '../components/Category'; 
import AirtimePurchaseModal from '../components/AirtimePurchaseModal';
import DataPurchaseModal from '../components/DataPurchaseModal'; 
import TinRegistration from '../screens/TinRegistration';

function showAlert(message) {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(message);
  }
}

const topLogo = require('../assets/evault-logo.png');
const BRAND_COLOR = '#2a5fd3'; 

export default function ServicesScreen() {
  const navigation = useNavigation();
  const [airtimeVisible, setAirtimeVisible] = useState(false);
  const [dataVisible, setDataVisible] = useState(false); 

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Top Header Logo Container */}
          <View style={styles.headerLogoWrapper}>
            <View style={styles.headerLeft}>
              <Image style={styles.headerLogo} source={topLogo} />
              <Text style={styles.headerTitle}>eVault Corporate</Text>
            </View>
          </View>

          {/* PromoCarousel Segment */}
          <PromoCarousel />

          {/* Category Segment */}
          <Category />

          {/* --- SERVICES GRID SYSTEM --- */}

          {/* Row 1: Utilities & Telecom */}
          <View style={styles.inlineButtonRow}>
            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => setAirtimeVisible(true)} 
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="phone-portrait-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>Airtime</Text>
            </Pressable>
          
            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => setDataVisible(true)} 
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="wifi-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>Data</Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => showAlert('Coming soon')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="tv-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>Cable TV</Text>
            </Pressable>
          </View>

          {/* Row 2: Corporate Registrations */}
          <View style={styles.inlineButtonRow}>
            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => showAlert('Coming soon')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="business-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>CAC Reg</Text>
            </Pressable>
          
            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => showAlert('Coming soon')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>SCUML</Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => showAlert('Coming soon')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="ribbon-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>Trademark</Text>
            </Pressable>
          </View>
    
          {/* Row 3: Identity & Basic Tax Verification */}
          <View style={styles.inlineButtonRow}>
            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => showAlert('Coming soon')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="id-card-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>NIN</Text>
            </Pressable>
          
            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => showAlert('Coming soon')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="finger-print-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>BVN</Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => navigation.navigate('TinRegistration')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="document-text-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>TIN</Text>
            </Pressable>
          </View>

          {/* Row 4: Premium Identity Operations & Procurement */}
          <View style={styles.inlineButtonRow}>
            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => showAlert('Coming soon')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="people-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>NIN Services</Text>
            </Pressable>
          
            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => showAlert('Coming soon')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="receipt-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>BVN Slip</Text>
            </Pressable>
 
            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => showAlert('Coming soon')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="briefcase-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>Bid bond</Text>
            </Pressable>
          </View>
    
          {/* Row 5: Regulatory Compliance & Certification */}
          <View style={styles.inlineButtonRow}>
            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => showAlert('Coming soon')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="shield-half-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>NSITF</Text>
            </Pressable>
          
            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => showAlert('Coming soon')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="receipt-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>Tax Clearance</Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => showAlert('Coming soon')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="globe-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>NEPC</Text>
            </Pressable>
          </View>

        </ScrollView>
        <StatusBar style="dark" /> 

        {/* Modal Context Mounting Points */}
        <AirtimePurchaseModal 
          visible={airtimeVisible} 
          onClose={() => setAirtimeVisible(false)} 
        />

        <DataPurchaseModal
          visible={dataVisible}
          onClose={() => setDataVisible(false)}
        />

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
    paddingBottom: 32, 
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
    backgroundColor: BRAND_COLOR, 
    paddingVertical: 16,     
    marginHorizontal: 4, 
    borderRadius: 16,
    shadowColor: BRAND_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  tilePressed: {
    opacity: 0.88,
    transform: [{ scale: 0.96 }],
  },
  iconBackdropCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tileBtnText: {
    color: '#ffffff',
    fontSize: 11, 
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
});