
 // src/components/Advert-slide.js

import React, { useState, useEffect, useRef } from "react";

import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Dimensions,
  Pressable,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { NOTIFICATIONS_DATA } from "../data/notificationData";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CARD_WIDTH = SCREEN_WIDTH * 0.92;
const CARD_HEIGHT = 174;

// ------------------------------------------------------
// PREMIUM eVAULT COLOURS
// ------------------------------------------------------

const BANNER_COLORS = {
  "1": { background: "#073F42", accent: "#55E6C1" },
  "2": { background: "#173A78", accent: "#8BB8FF" },
  "3": { background: "#064E70", accent: "#72E5F5" },
  "4": { background: "#823D22", accent: "#FFD09A" },
  "5": { background: "#493078", accent: "#D8B7FF" },
};

const BANNER_BUTTONS = {
  "1": "Recover NIN",
  "2": "Recover BVN",
  "3": "Explore Data",
  "4": "Buy Airtime",
  "5": "Renew TV",
};

// ------------------------------------------------------
// USE notificationsData.js AS THE DATA SOURCE
// ------------------------------------------------------

const BANNERS = NOTIFICATIONS_DATA.map((item) => {
  const colors = BANNER_COLORS[String(item.id)] || {
    background: "#173A78",
    accent: "#8BB8FF",
  };

  return {
    ...item,
    desc: item.description,
    badge: item.time || "FEATURED",
    primaryColor: colors.background,
    accentColor: colors.accent,
    btnText: BANNER_BUTTONS[String(item.id)] || "Explore",
  };
});

// ------------------------------------------------------
// CAROUSEL
// ------------------------------------------------------

export default function PromoCarousel({ onBannerPress }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  // Auto-slide every 4.5 seconds
  useEffect(() => {
    if (BANNERS.length <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % BANNERS.length;

        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });

        return nextIndex;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  // Sync pagination with manual swiping
  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);

    if (index >= 0 && index < BANNERS.length && index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  // The parent screen opens the correct modal.
  // Fallback navigation is retained for other uses.
  const handleBannerPress = (item) => {
    if (typeof onBannerPress === "function") {
      onBannerPress(item);
      return;
    }

    navigation.navigate("Services", {
      bannerId: item.id,
      bannerTitle: item.title,
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.slideWrapper}>
      <View
        style={[
          styles.card,
          { backgroundColor: item.primaryColor },
        ]}
      >
        <View
          style={[
            styles.glowCircleLarge,
            { borderColor: item.accentColor },
          ]}
        />

        <View
          style={[
            styles.glowCircleSmall,
            { backgroundColor: item.accentColor },
          ]}
        />

        <View style={styles.cardContent}>
          <View style={styles.badgeContainer}>
            <View
              style={[
                styles.badgeDot,
                { backgroundColor: item.accentColor },
              ]}
            />

            <Text style={styles.badgeText} numberOfLines={1}>
              {String(item.badge).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.desc}
          </Text>

          <Pressable
            onPress={() => handleBannerPress(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.btnText}: ${item.title}`}
            style={({ pressed }) => [
              styles.ctaButton,
              pressed && styles.ctaButtonPressed,
            ]}
          >
            <Text
              style={[
                styles.ctaText,
                { color: item.primaryColor },
              ]}
            >
              {item.btnText}
            </Text>

            <View
              style={[
                styles.arrowContainer,
                { backgroundColor: item.accentColor },
              ]}
            >
              <Ionicons
                name="arrow-forward"
                size={12}
                color={item.primaryColor}
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.visualContainer}>
          <View
            style={[
              styles.iconHalo,
              { borderColor: item.accentColor },
            ]}
          />

          <View style={styles.iconBox}>
            <Ionicons
              name={item.icon || "notifications-outline"}
              size={39}
              color="#FFFFFF"
            />
          </View>

          <View
            style={[
              styles.iconAccent,
              { backgroundColor: item.accentColor },
            ]}
          />
        </View>
      </View>
    </View>
  );

  if (!BANNERS.length) return null;

  const activeBanner = BANNERS[activeIndex];

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>
            EVAULT SPOTLIGHT
          </Text>

          <Text style={styles.sectionTitle}>
            More for your everyday
          </Text>
        </View>

        <View style={styles.spotlightIcon}>
          <Ionicons
            name="sparkles-outline"
            size={17}
            color="#0F766E"
          />
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={BANNERS}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SCREEN_WIDTH}
        snapToAlignment="center"
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onScrollToIndexFailed={({ index }) => {
          setTimeout(() => {
            flatListRef.current?.scrollToOffset({
              offset: index * SCREEN_WIDTH,
              animated: true,
            });
          }, 300);
        }}
      />

      <View style={styles.paginationRow}>
        <View style={styles.paginationContainer}>
          {BANNERS.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => {
                setActiveIndex(index);

                flatListRef.current?.scrollToIndex({
                  index,
                  animated: true,
                });
              }}
              accessibilityRole="button"
              accessibilityLabel={`Show advert ${index + 1}`}
              style={[
                styles.dot,
                activeIndex === index
                  ? [
                      styles.activeDot,
                      { backgroundColor: item.accentColor },
                    ]
                  : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <Text style={styles.slideCounter}>
          {String(activeIndex + 1).padStart(2, "0")}
          <Text style={styles.slideCounterMuted}>
            {" "}/ {String(BANNERS.length).padStart(2, "0")}
          </Text>
        </Text>
      </View>

      <View style={styles.bottomCaption}>
        <View
          style={[
            styles.captionLine,
            {
              backgroundColor:
                activeBanner?.accentColor || "#0F766E",
            },
          ]}
        />

        <Text style={styles.bottomCaptionText} numberOfLines={1}>
          Discover what you can do with eVault
        </Text>
      </View>
    </View>
  );
}

// ------------------------------------------------------
// PREMIUM STYLING
// ------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 8,
    marginBottom: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    marginBottom: 13,
  },

  sectionEyebrow: {
    color: "#0F766E",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.8,
    marginBottom: 4,
  },

  sectionTitle: {
    color: "#142D3A",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.45,
  },

  spotlightIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "#E7F7F2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D3EEE5",
  },

  slideWrapper: {
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 18,
    paddingRight: 15,
    paddingVertical: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.13)",
    ...Platform.select({
      ios: {
        shadowColor: "#102A32",
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  glowCircleLarge: {
    position: "absolute",
    right: -58,
    top: -77,
    width: 218,
    height: 218,
    borderRadius: 109,
    borderWidth: 1,
    opacity: 0.24,
  },

  glowCircleSmall: {
    position: "absolute",
    right: 43,
    bottom: -72,
    width: 145,
    height: 145,
    borderRadius: 73,
    opacity: 0.07,
  },

  cardContent: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    zIndex: 2,
    paddingRight: 4,
  },

  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    maxWidth: "100%",
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.09)",
  },

  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 6,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
  },

  cardTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 21,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 5,
    paddingRight: 2,
  },

  cardDesc: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "500",
    marginBottom: 10,
    paddingRight: 3,
  },

  ctaButton: {
    minHeight: 29,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    paddingLeft: 11,
    paddingRight: 5,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
  },

  ctaButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.97 }],
  },

  ctaText: {
    fontSize: 10,
    fontWeight: "800",
    marginRight: 8,
  },

  arrowContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  visualContainer: {
    width: 94,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 1,
    zIndex: 1,
  },

  iconHalo: {
    position: "absolute",
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 1,
    opacity: 0.26,
  },

  iconBox: {
    width: 76,
    height: 76,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.19)",
    transform: [{ rotate: "-4deg" }],
  },

  iconAccent: {
    position: "absolute",
    right: 5,
    top: 14,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.55)",
  },

  paginationRow: {
    paddingHorizontal: SCREEN_WIDTH * 0.045,
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  dot: {
    height: 6,
    borderRadius: 5,
  },

  activeDot: {
    width: 23,
  },

  inactiveDot: {
    width: 6,
    backgroundColor: "#D6E0E5",
  },

  slideCounter: {
    color: "#24404B",
    fontSize: 10,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },

  slideCounterMuted: {
    color: "#9AAAB2",
    fontWeight: "600",
  },

  bottomCaption: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingHorizontal: SCREEN_WIDTH * 0.045,
  },

  captionLine: {
    width: 20,
    height: 3,
    borderRadius: 2,
    marginRight: 8,
  },

  bottomCaptionText: {
    flex: 1,
    color: "#81919A",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.1,
  },
});
