
// screens/HomeScreen.js

import React, {
  useCallback,
  useState,
} from "react";

import {
  Alert,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// =========================================================
// COMPONENTS
// =========================================================

import PromoCarousel from "../components/Advert-slide";
import AirtimePurchaseModal from "../components/AirtimePurchaseModal";
import BvnRecoveryModal from "../components/BvnRecoveryModal";
import BvnValidationModal from "../components/BvnValidationModal";
import CableTVModal from "../components/CableTVModal";
import DataPurchaseModal from "../components/DataPurchaseModal";
import ExaminationResultPinModal from "../components/ExaminationResultPinModal";
import HomeScreenHeader from "../components/HomeScreenHeader";
import ManualFundingBanner from "../components/ManualFundingBanner";
import NinRecoveryModal from "../components/NinRecoveryModal";
import NinVerificationModal from "../components/NinVerificationModal";
import UserCard from "../components/UserCard";

// =========================================================
// BRAND
// =========================================================

const BRAND_COLOR = "#2A5FD3";
const BRAND_LIGHT = "#EEF4FF";
const WHATSAPP_GREEN = "#25D366";

// =========================================================
// WHATSAPP
// =========================================================

const WHATSAPP_AGENT_NUMBER = "2347084382293";

const WHATSAPP_COMMUNITY_URL =
  "https://chat.whatsapp.com/DAETBeqWEK37amKsrS0U2b?s=sh&p=a&mlu=4&ilr=4";

const WHATSAPP_AGENT_URL =
  `https://wa.me/${WHATSAPP_AGENT_NUMBER}?text=${encodeURIComponent(
    "Hello eVault, I need assistance."
  )}`;

// =========================================================
// ALERT HELPER
// =========================================================

function showAlert(message) {
  if (Platform.OS === "web") {
    window.alert(message);
  } else {
    Alert.alert("eVault", message);
  }
}

// =========================================================
// COMING SOON
// =========================================================

function showComingSoon(serviceName) {
  const message =
    `${serviceName} is coming soon. We are working to make this service available on eVault.`;

  if (Platform.OS === "web") {
    window.alert(`Coming Soon\n\n${message}`);
  } else {
    Alert.alert(
      "Coming Soon",
      message,
      [{ text: "OK" }]
    );
  }
}

// =========================================================
// WHATSAPP URL
// =========================================================

async function openWhatsAppUrl(url, fallbackMessage) {
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.error(
      "[EVault WHATSAPP]",
      error?.message || error
    );

    showAlert(
      fallbackMessage ||
        "Unable to open WhatsApp. Please try again."
    );
  }
}

// =========================================================
// HOME SCREEN
// =========================================================

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const TAB_BAR_HEIGHT = 60;

  // =======================================================
  // MODAL STATES
  // =======================================================

  const [airtimeVisible, setAirtimeVisible] =
    useState(false);

  const [dataVisible, setDataVisible] =
    useState(false);

  const [cableTvVisible, setCableTvVisible] =
    useState(false);

  // Exam Result PIN modal
  const [examResultPinVisible, setExamResultPinVisible] =
    useState(false);

  // Verify BVN modal
  const [bvnVisible, setBvnVisible] =
    useState(false);

  // Recover BVN modal
  const [bvnRecoveryVisible, setBvnRecoveryVisible] =
    useState(false);

  // Verify NIN modal
  const [
    ninVerificationVisible,
    setNinVerificationVisible,
  ] = useState(false);

  // Recover NIN modal
  const [
    ninRecoveryVisible,
    setNinRecoveryVisible,
  ] = useState(false);

  // =======================================================
  // REFRESH
  // =======================================================

  const [refreshing, setRefreshing] =
    useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  }, []);

  // =======================================================
  // NIN MODAL HANDLERS
  // =======================================================

  const openNinVerification = useCallback(() => {
    setNinRecoveryVisible(false);
    setNinVerificationVisible(true);
  }, []);

  const openNinRecovery = useCallback(() => {
    setNinVerificationVisible(false);
    setNinRecoveryVisible(true);
  }, []);

  // =======================================================
  // BVN MODAL HANDLERS
  // =======================================================

  const openBvnVerification = useCallback(() => {
    setBvnRecoveryVisible(false);
    setBvnVisible(true);
  }, []);

  const openBvnRecovery = useCallback(() => {
    setBvnVisible(false);
    setBvnRecoveryVisible(true);
  }, []);

  // =======================================================
  // EXAM RESULT PIN MODAL HANDLER
  // =======================================================

  const openExamResultPin = useCallback(() => {
    setExamResultPinVisible(true);
  }, []);

  // =======================================================
  // PROMO CAROUSEL ACTIONS
  // =======================================================

  const handlePromoPress = useCallback(
    (item) => {
      switch (String(item?.id)) {
        case "1":
          openNinRecovery();
          break;

        case "2":
          openBvnVerification();
          break;

        case "3":
          setDataVisible(true);
          break;

        case "4":
          setAirtimeVisible(true);
          break;

        case "5":
          setCableTvVisible(true);
          break;

        default:
          navigation.navigate("Services");
          break;
      }
    },
    [
      navigation,
      openNinRecovery,
      openBvnVerification,
    ]
  );

  // =======================================================
  // WHATSAPP COMMUNITY
  // =======================================================

  const openCommunity = useCallback(async () => {
    if (
      WHATSAPP_COMMUNITY_URL.includes(
        "REPLACE_WITH_YOUR_GROUP_INVITE"
      )
    ) {
      showAlert(
        "Please add the WhatsApp community invitation link."
      );

      return;
    }

    await openWhatsAppUrl(
      WHATSAPP_COMMUNITY_URL,
      "Unable to open the eVault WhatsApp community."
    );
  }, []);

  // =======================================================
  // WHATSAPP SUPPORT
  // =======================================================

  const openWhatsAppAgent = useCallback(async () => {
    await openWhatsAppUrl(
      WHATSAPP_AGENT_URL,
      "Unable to open eVault WhatsApp support."
    );
  }, []);

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[BRAND_COLOR]}
            tintColor={BRAND_COLOR}
          />
        }
      >
        {/* HEADER */}

        <HomeScreenHeader />

        {/* USER CARD */}

        <View style={styles.cardContentWrapper}>
          <UserCard />
        </View>

        {/* MANUAL FUNDING ADVERT */}

        <ManualFundingBanner />

        {/* COMPACT HERO */}

        <View style={styles.textHeroContainer}>
          <Text style={styles.title}>
            Get Your Business Up to Date
          </Text>

          <Text style={styles.subtitle}>
            Professional processing. Fast service delivery.
          </Text>
        </View>

        {/* SERVICES */}

        <View style={styles.servicesCard}>
          <View style={styles.servicesHeader}>
            <Text style={styles.servicesTitle}>
              Our Services
            </Text>

            <Pressable
              onPress={() =>
                navigation.navigate("Services")
              }
              style={({ pressed }) => [
                styles.seeAllButton,
                pressed && styles.seeAllButtonPressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.seeAll}>
                See all
              </Text>

              <Ionicons
                name="chevron-forward"
                size={12}
                color={BRAND_COLOR}
              />
            </Pressable>
          </View>

          <View style={styles.servicesGrid}>
            <ServiceItem
              icon="phone-portrait-outline"
              label="Airtime"
              onPress={() => setAirtimeVisible(true)}
            />

            <ServiceItem
              icon="wifi-outline"
              label="Data"
              onPress={() => setDataVisible(true)}
            />

            <ServiceItem
              icon="tv-outline"
              label="Cable TV"
              onPress={() => setCableTvVisible(true)}
            />

            <ServiceItem
              icon="shield-checkmark-outline"
              label="IPE Clearance"
              onPress={() =>
                showComingSoon("IPE Clearance")
              }
            />

            {/* VERIFY BVN */}

            <ServiceItem
              icon="finger-print-outline"
              label="Verify BVN"
              onPress={openBvnVerification}
            />

            {/* RECOVER BVN */}

            <ServiceItem
              icon="search-outline"
              label="Recover BVN"
              onPress={openBvnRecovery}
            />

            {/* VERIFY NIN */}

            <ServiceItem
              icon="id-card-outline"
              label="Verify NIN"
              onPress={openNinVerification}
            />

            {/* RECOVER NIN */}

            <ServiceItem
              icon="search-outline"
              label="Recover NIN"
              onPress={openNinRecovery}
            />

            {/* NIN VALIDATION */}

            <ServiceItem
              icon="checkmark-circle-outline"
              label="NIN Validation"
              onPress={() =>
                showComingSoon("NIN Validation")
              }
            />

            {/* EXAM RESULT PIN */}

            <ServiceItem
              icon="school-outline"
              label="Exam Result PIN"
              onPress={openExamResultPin}
            />

            {/* MORE */}

            <ServiceItem
              icon="grid-outline"
              label="More"
              onPress={() =>
                navigation.navigate("Services")
              }
            />
          </View>
        </View>

        {/* WHATSAPP COMMUNITY */}

        <Pressable
          style={({ pressed }) => [
            styles.whatsappCommunityButton,
            pressed &&
              styles.whatsappCommunityButtonPressed,
          ]}
          onPress={openCommunity}
          accessibilityRole="button"
          accessibilityLabel="Join eVault WhatsApp community"
        >
          <View style={styles.whatsappCommunityIcon}>
            <Ionicons
              name="logo-whatsapp"
              size={19}
              color={WHATSAPP_GREEN}
            />
          </View>

          <View style={styles.whatsappCommunityTextWrap}>
            <Text style={styles.whatsappCommunityTitle}>
              Join Our Community
            </Text>

            <Text style={styles.whatsappCommunitySubtitle}>
              Connect with eVault on WhatsApp
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={17}
            color={WHATSAPP_GREEN}
          />
        </Pressable>

        {/* PROMO CAROUSEL */}

        <View style={styles.promoOuter}>
          <View style={styles.promoFrame}>
            <PromoCarousel
              onBannerPress={handlePromoPress}
            />
          </View>
        </View>
      </ScrollView>

      {/* FLOATING WHATSAPP SUPPORT BUTTON */}

      <Pressable
        style={({ pressed }) => [
          styles.whatsappFloatingButton,
          pressed &&
            styles.whatsappFloatingButtonPressed,
          {
            bottom:
              insets.bottom +
              TAB_BAR_HEIGHT +
              8,
          },
        ]}
        onPress={openWhatsAppAgent}
        accessibilityRole="button"
        accessibilityLabel="Chat with eVault on WhatsApp"
      >
        <Ionicons
          name="logo-whatsapp"
          size={25}
          color="#FFFFFF"
        />
      </Pressable>

      <StatusBar style="dark" />

      {/* SERVICE MODALS */}

      <AirtimePurchaseModal
        visible={airtimeVisible}
        onClose={() => setAirtimeVisible(false)}
      />

      <DataPurchaseModal
        visible={dataVisible}
        onClose={() => setDataVisible(false)}
      />

      <CableTVModal
        visible={cableTvVisible}
        onClose={() => setCableTvVisible(false)}
      />

      {/* EXAMINATION RESULT PIN MODAL */}

      <ExaminationResultPinModal
        visible={examResultPinVisible}
        onClose={() => setExamResultPinVisible(false)}
      />

      {/* VERIFY BVN MODAL */}

      <BvnValidationModal
        visible={bvnVisible}
        onClose={() => setBvnVisible(false)}
      />

      {/* RECOVER BVN MODAL */}

      <BvnRecoveryModal
        visible={bvnRecoveryVisible}
        onClose={() => setBvnRecoveryVisible(false)}
      />

      {/* VERIFY NIN MODAL */}

      <NinVerificationModal
        visible={ninVerificationVisible}
        onClose={() => setNinVerificationVisible(false)}
      />

      {/* RECOVER NIN MODAL */}

      <NinRecoveryModal
        visible={ninRecoveryVisible}
        onClose={() => setNinRecoveryVisible(false)}
      />
    </SafeAreaView>
  );
}

// =========================================================
// SERVICE ITEM — NO PRESS/HOVER HIGHLIGHT
// =========================================================

function ServiceItem({
  icon,
  label,
  onPress,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.serviceItem}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.serviceIcon}>
        <Ionicons
          name={icon}
          size={20}
          color={BRAND_COLOR}
        />
      </View>

      <Text
        style={styles.serviceLabel}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },

  scrollContent: {
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 4,
  },

  cardContentWrapper: {
    width: "100%",
    marginBottom: 8,
  },

  textHeroContainer: {
    width: "92%",
    marginTop: 0,
    marginBottom: 3,
    paddingHorizontal: 2,
  },

  title: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    lineHeight: 17,
  },

  subtitle: {
    fontSize: 8.5,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 11,
    marginTop: 1,
  },

  servicesCard: {
    width: "92%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingTop: 5,
    paddingHorizontal: 5,
    paddingBottom: 3,
    marginBottom: 3,
    borderWidth: 1,
    borderColor: "#EAF0F8",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.035,
    shadowRadius: 4,
    elevation: 1,
  },

  servicesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    marginBottom: 2,
    minHeight: 23,
  },

  servicesTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#222222",
  },

  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 6,
  },

  seeAllButtonPressed: {
    backgroundColor: BRAND_LIGHT,
  },

  seeAll: {
    fontSize: 9,
    fontWeight: "700",
    color: BRAND_COLOR,
  },

  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  serviceItem: {
    width: "25%",
    height: 65,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRadius: 10,
    overflow: "hidden",
  },

  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  serviceLabel: {
    fontSize: 8.5,
    lineHeight: 10,
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
    maxWidth: 74,
  },

  whatsappCommunityButton: {
    width: "92%",
    minHeight: 41,
    marginTop: 1,
    marginBottom: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E7F7ED",
  },

  whatsappCommunityButtonPressed: {
    backgroundColor: "#EAFBF0",
  },

  whatsappCommunityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EAFBF0",
    alignItems: "center",
    justifyContent: "center",
  },

  whatsappCommunityTextWrap: {
    flex: 1,
    marginLeft: 8,
  },

  whatsappCommunityTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#168A42",
  },

  whatsappCommunitySubtitle: {
    fontSize: 8,
    color: "#6B7280",
    marginTop: 1,
  },

  promoOuter: {
    width: "100%",
    marginTop: 0,
    marginBottom: 0,
    alignItems: "center",
  },

  promoFrame: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },

  whatsappFloatingButton: {
    position: "absolute",
    right: 13,
    width: 47,
    height: 47,
    borderRadius: 24,
    backgroundColor: WHATSAPP_GREEN,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 999,
  },

  whatsappFloatingButtonPressed: {
    backgroundColor: WHATSAPP_GREEN,
    opacity: 0.82,
  },
});
