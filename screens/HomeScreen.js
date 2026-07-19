import React, { useState, useCallback } from 'react'; 
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, Text, View, Pressable, Platform, Alert, ScrollView, Modal, RefreshControl 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { Ionicons } from '@expo/vector-icons';

// --- CUSTOM COMPONENT IMPORTS ---
import UserCard from '../components/UserCard';
import PromoCarousel from '../components/Advert-slide';
import ServicesScreen from '../screens/ServicesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TinRegistration from '../screens/TinRegistration';
import WorksScreen from '../screens/WorksScreen';
import AirtimePurchaseModal from '../components/AirtimePurchaseModal'; 
import DataPurchaseModal from '../components/DataPurchaseModal'; 
import CacRegistrationForm from '../components/CacRegistrationForm'; 
import HomeScreenHeader from '../components/HomeScreenHeader';

function showAlert(message) {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert(message);
  }
}

const BRAND_COLOR = '#2a5fd3'; 

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets(); // real bottom inset for THIS device (gesture bar / home indicator)

  // Modal Display States
  const [airtimeVisible, setAirtimeVisible] = useState(false);
  const [dataVisible, setDataVisible] = useState(false);
  const [cacVisible, setCacVisible] = useState(false); 

  // Refresh State Control
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  // If you have a custom bottom tab bar, set its rendered height here (excluding safe area inset).
  const TAB_BAR_HEIGHT = 60;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent,
          // Tightened bottom spacing: removed the large +24 buffer down to a minimal +4
          { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 4 },
        ]} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[BRAND_COLOR]} 
            tintColor={BRAND_COLOR}
          />
        }
      >
        
        {/* Top Header Logo Container */}
        <HomeScreenHeader />

        {/* User Account Dashboard Card */}
        <View style={styles.cardContentWrapper}>
          <UserCard 
            username="Ziyaulhaq" 
            bank="Evaultmoney" 
            accountNumber="4092817364"
            accountBalance="150,000" 
          />
        </View>
        
        {/* Promo Carousel */}
        <PromoCarousel />

        {/* Typography Content Group */}
        <View style={styles.textHeroContainer}>
          <Text style={styles.title}>Get your Business Up to Date without the headache</Text>
          <Text style={styles.subtitle}>Professional processing, WhatsApp updates, Fast Services Delivery</Text>
        </View>
      
        {/* Quick Sub-Navigation Action Segment */}
        <View style={styles.row2}> 
          <View style={styles.wrapper}>
            <Pressable 
              style={({ pressed }) => [
                styles.tabButton, 
                pressed && styles.tabButtonPressed
              ]} 
              onPress={() => navigation.navigate('StatutoryHistoryScreen')}
            >
              <Text style={styles.tabBtnText}>History</Text>
            </Pressable>
          </View>
          <View style={styles.wrapper}>
            <Pressable 
              style={({ pressed }) => [
                styles.tabButton, 
                pressed && styles.tabButtonPressed
              ]} 
              onPress={() => navigation.navigate('WorksScreen')}
            >
              <Text style={styles.tabBtnText}>Pending work</Text>
            </Pressable>
          </View>     
        </View>

        {/* --- UNIFIED SERVICES GRID CARD --- */}
        <View style={styles.servicesGridCard}>
          <Text style={styles.gridSectionTitle}>Our Services</Text>

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
              onPress={() => showAlert('Cable TV subscription portals for DStv, GOtv, and StarTimes loading...')}
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
              onPress={() => setCacVisible(true)}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="business-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>CAC Reg</Text>
            </Pressable>
          
            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => showAlert('SCUML Compliance processing portal routing active soon.')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>SCUML</Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => showAlert('Trademark Protection setup: Secure your business brand name and logo.')}
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
              onPress={() => showAlert('NIN Validation Engine online: Verify identity records.')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="id-card-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>NIN</Text>
            </Pressable>
          
            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => showAlert('BVN Validation Verification Engine online.')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="finger-print-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>BVN Services</Text>
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

          {/* Row 4: Premium Operations & Catch-All */}
          <View style={styles.inlineButtonRow}>
            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => showAlert('Premium NIN Extended Services Portal.')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="people-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>NIN Services</Text>
            </Pressable>
          
            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => showAlert('BVN Premium Data Slip extraction utility online.')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="receipt-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>BVN Slip</Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [styles.premiumTile, pressed && styles.tilePressed]} 
              onPress={() => navigation.navigate('Services')}
            >
              <View style={styles.iconBackdropCircle}>
                <Ionicons name="ellipsis-horizontal-outline" size={20} color="#ffffff" />
              </View>
              <Text style={styles.tileBtnText}>More</Text>
            </Pressable>
          </View>
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

      <Modal
        animationType="slide"
        transparent={false}
        visible={cacVisible}
        onRequestClose={() => setCacVisible(false)}
      >
        <CacRegistrationForm onClose={() => setCacVisible(false)} />
      </Modal>

    </SafeAreaView>
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
  },
  cardContentWrapper: {
    width: '100%', 
    marginBottom: 24,
  },
  textHeroContainer: {
    width: '92%',
    paddingHorizontal: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a', 
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b', 
    textAlign: 'center',
    lineHeight: 18,
  },
  row2: {
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 20,
    width: '92%',
    borderRadius: 20,
    backgroundColor: '#f1f5f9', 
    padding: 4,
  },
  wrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  tabButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabButtonPressed: {
    backgroundColor: '#f8fafc',
    opacity: 0.9,
  },
  tabBtnText: {
    color: BRAND_COLOR,
    fontSize: 13,
    fontWeight: '700',
  },
  servicesGridCard: {
    width: '92%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 12,
    paddingTop: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    /* Shadows removed cleanly */
  },
  gridSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
    marginLeft: 6,
  },
  inlineButtonRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    width: '100%', 
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
    /* Shadows removed cleanly */
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