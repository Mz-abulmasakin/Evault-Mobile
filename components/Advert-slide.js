import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  Dimensions, 
  Pressable, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.92; // Match the 92% width of your other home elements

// --- PREMIUM PROMOTIONAL BANNER DATA ---
const BANNERS = [
  {
    id: '1',
    title: 'eVault SolarFlex',
    desc: 'Flexible solar financing backings for salaried professionals.',
    badge: 'ECO-ENERGY',
    icon: 'sunny',
    primaryColor: '#10b981', // Emerald green
    btnText: 'Apply Now',
  },
  {
    id: '2',
    title: 'Instant CAC Setup',
    desc: 'Enterprise registration for ₦45,000. Ltd shares starting at ₦55k.',
    badge: '48HR GUARANTEE',
    icon: 'business',
    primaryColor: '#2a5fd3', // eVault Blue
    btnText: 'Register',
  },
  {
    id: '3',
    title: 'SCUML & TIN processing',
    desc: 'Skip the stress. Smooth verification files processed directly.',
    badge: 'PROMO PRICE',
    icon: 'shield-checkmark',
    primaryColor: '#7c3aed', // Royal Violet
    btnText: 'Get Started',
  }
];

export default function PromoCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);

  // --- AUTO-PLAY ROTATION TIMER (Slides every 4 seconds) ---
  useEffect(() => {
    const autoPlayTimer = setInterval(() => {
      let nextIndex = activeIndex + 1;
      if (nextIndex >= BANNERS.length) {
        nextIndex = 0;
      }
      
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 4000);

    return () => clearInterval(autoPlayTimer);
  }, [activeIndex]);

  // --- TRACKS ACTIVE SLIDE INDEX DURING MANUAL SCROLLS ---
  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    if (index !== activeIndex && index >= 0 && index < BANNERS.length) {
      setActiveIndex(index);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.slideWrapper}>
      <View style={[styles.card, { backgroundColor: item.primaryColor }]}>
        
        {/* Visual Background Accent Rings */}
        <View style={styles.bgCircleLeft} />
        <View style={styles.bgCircleRight} />

        {/* Left Side: Text Information */}
        <View style={styles.textContainer}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.desc}</Text>
          
          <Pressable style={styles.ctaButton}>
            <Text style={[styles.ctaText, { color: item.primaryColor }]}>{item.btnText}</Text>
            <Ionicons name="arrow-forward" size={12} color={item.primaryColor} />
          </Pressable>
        </View>

        {/* Right Side: Big Floating Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon} size={64} color="rgba(255, 255, 255, 0.22)" />
        </View>

      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Scrollable Slider */}
      <FlatList
        ref={flatListRef}
        data={BANNERS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center"
      />

      {/* Pagination Active Dots Indicator */}
      <View style={styles.paginationContainer}>
        {BANNERS.map((_, index) => (
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
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideWrapper: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: 145,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    position: 'overflow',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  // Soft decorative vector circles to add app depth
  bgCircleRight: {
    position: 'absolute',
    right: -30,
    bottom: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  bgCircleLeft: {
    position: 'absolute',
    left: -20,
    top: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  textContainer: {
    flex: 1.3,
    justifyContent: 'center',
    zIndex: 2,
  },
  iconContainer: {
    flex: 0.7,
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  cardDesc: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
    marginBottom: 10,
    paddingRight: 10,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  ctaText: {
    fontSize: 10,
    fontWeight: '800',
    marginRight: 4,
  },
  // --- PAGINATION INDICATOR (OPAY PIN OVAL STYLE) ---
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 14, // Extended oval pill look when active
    backgroundColor: '#2a5fd3', 
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#cbd5e1', 
  },
});