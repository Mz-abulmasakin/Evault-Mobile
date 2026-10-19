import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  TouchableOpacity, // Added for the skip button action
  Platform, 
  Image, 
  FlatList, 
  Dimensions 
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Handles persisting first-time user status

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_KEY = '@evault_has_seen_onboarding';

const INTRO_SLIDES = [
  {
    id: '1',
    title: 'Easy Registration',
    desc: 'Set up your corporate profile in minutes. Secure your institutional workspace with verification steps built for scale.',
    icon: 'person-add-outline',
    iconColor: '#264bc5',
    bgTint: '#f0f4ff',
  },
  {
    id: '2',
    title: 'Secure Access',
    desc: 'Log in confidently with multi-factor authentication protecting your corporate repository files and data logs.',
    icon: 'shield-checkmark-outline',
    iconColor: '#10b981',
    bgTint: '#e6fbf2',
  },
  {
    id: '3',
    title: 'On-Demand Corporate Services',
    desc: 'Track instant CAC registrations, request flexible solar finance pipelines, and access TIN modifications seamlessly.',
    icon: 'apps-outline',
    iconColor: '#7c3aed',
    bgTint: '#f5f0ff',
  }
];

//const topLogo = require('../assets/evault-logo.png');

export default function App({ navigation }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true); // Prevents visual blinking while reading disk storage
  const flatListRef = useRef(null);

  // --- 1. CHECK IF RETURNING USER ON MOUNT ---
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (hasSeen === 'true') {
          // .replace replaces this screen in the stack history so they can't press back to return here
          navigation.replace('LoginScreen'); 
        } else {
          setIsCheckingStatus(false);
        }
      } catch (error) {
        // Fallback safely if storage fails
        setIsCheckingStatus(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // --- AUTOMATED ROTATION EFFECT ---
  useEffect(() => {
    if (isCheckingStatus) return;

    const timer = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= INTRO_SLIDES.length) {
        nextIndex = 0;
      }
      
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 3500);

    return () => clearInterval(timer);
  }, [activeIndex, isCheckingStatus]);

  // --- 2. SAVE STATUS AND NAVIGATE OUT ---
  const handleFinishOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      navigation.replace('LoginScreen');
    } catch (error) {
      // Direct fallback if saving breaks down
      navigation.replace('LoginScreen');
    }
  };

  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < INTRO_SLIDES.length) {
      setActiveIndex(index);
    }
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slideContainer}>
      <View style={[styles.vectorWrapper, { backgroundColor: item.bgTint }]}>
        <Ionicons name={item.icon} size={72} color={item.iconColor} />
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDesc}>{item.desc}</Text>
    </View>
  );

  // Keep screen blank or show a loading indicator while reading storage memory
  if (isCheckingStatus) {
    return <View style={styles.loadingContainer} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        
        {/* Top Navigation Row: Contains Logo + Skip Button */}
        <View style={styles.headerRow}>
         
          
          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={handleFinishOnboarding}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
            <Ionicons name="chevron-forward" size={14} color="#64748b" />
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {/* Interactive Informative Onboarding Slider */}
          <View style={styles.sliderWrapper}>
            <FlatList
              ref={flatListRef}
              data={INTRO_SLIDES}
              renderItem={renderSlide}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              decelerationRate="fast"
            />

            {/* Pagination Active Indicator Dots */}
            <View style={styles.paginationContainer}>
              {INTRO_SLIDES.map((_, index) => (
                <View 
                  key={index}
                  style={[
                    styles.dot,
                    activeIndex === index ? styles.activeDot : styles.inactiveDot
                  ]}
                />
              ))}
            </View>
          </View>
          
          {/* Primary Action Button */}
          <Pressable 
            style={({ pressed }) => [
              styles.primaryButton, 
              { transform: [{ scale: pressed ? 0.98 : 1 }] }
            ]} 
            onPress={handleFinishOnboarding}
          >
            <Text style={styles.primaryButtonText}>Proceed</Text>
          </Pressable>

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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 15,
  },
  logoContainer: {
    padding: 10,
    backgroundColor: '#264bc5',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerLogo: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#f1f5f9', // soft background pill accent
    borderRadius: 20,
  },
  skipButtonText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
    marginRight: 2,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  sliderWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    marginVertical: 10,
  },
  slideContainer: {
    width: SCREEN_WIDTH - 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  vectorWrapper: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 10,
  },
  slideDesc: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 16,
    backgroundColor: '#264bc5',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#cbd5e1',
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
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});