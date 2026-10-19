import React, { useState } from "react";

import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

// Existing service modals
import AirtimePurchaseModal from "../components/AirtimePurchaseModal";
import CableTVModal from "../components/CableTVModal";
import DataPurchaseModal from "../components/DataPurchaseModal";

// =========================================================
// BRAND
// =========================================================

const BRAND_COLOR = "#2a5fd3";
const BRAND_LIGHT = "#EEF4FF";
const BRAND_SOFT = "#F7FAFF";

// =========================================================
// SERVICES
// =========================================================

const SERVICES = [
  {
    id: "airtime",
    title: "Airtime",
    icon: "phone-portrait-outline",
    active: true,
  },
  {
    id: "data",
    title: "Data",
    icon: "wifi-outline",
    active: true,
  },
  {
    id: "cable",
    title: "Cable TV",
    icon: "tv-outline",
    active: true,
  },
  {
    id: "cac",
    title: "CAC",
    icon: "business-outline",
    active: false,
  },
  {
    id: "tin",
    title: "TIN",
    icon: "document-text-outline",
    active: true,
  },
  {
    id: "scuml",
    title: "SCUML",
    icon: "shield-checkmark-outline",
    active: false,
  },
  {
    id: "trademark",
    title: "Trademark",
    icon: "ribbon-outline",
    active: false,
  },
  {
    id: "bidbond",
    title: "Bid Bond",
    icon: "briefcase-outline",
    active: false,
  },
  {
    id: "nsitf",
    title: "NSITF",
    icon: "shield-half-outline",
    active: false,
  },
  {
    id: "tax",
    title: "Tax Clearance",
    icon: "receipt-outline",
    active: false,
  },
  {
    id: "nepc",
    title: "NEPC",
    icon: "globe-outline",
    active: false,
  },
];

// =========================================================
// COMING SOON DESCRIPTIONS
// =========================================================

const COMING_SOON_TEXT = {
  cac: "CAC registration and corporate filing services are coming soon.",
  scuml: "SCUML compliance services are coming soon.",
  trademark: "Trademark registration and protection services are coming soon.",
  bidbond: "Bid bond services are coming soon.",
  nsitf: "NSITF registration and compliance services are coming soon.",
  tax: "Tax clearance services are coming soon.",
  nepc: "NEPC registration and export support services are coming soon.",
};

// =========================================================
// ALERT
// =========================================================

function showAlert(message) {
  Alert.alert("eVault", message);
}

// =========================================================
// SERVICES SCREEN
// =========================================================

export default function ServicesScreen() {
  const navigation = useNavigation();

  // =======================================================
  // SERVICE MODAL STATES
  // =======================================================

  const [
    airtimeVisible,
    setAirtimeVisible,
  ] = useState(false);

  const [
    dataVisible,
    setDataVisible,
  ] = useState(false);

  const [
    cableTvVisible,
    setCableTvVisible,
  ] = useState(false);

  // =======================================================
  // COMING SOON MODAL STATE
  // =======================================================

  const [
    comingSoonVisible,
    setComingSoonVisible,
  ] = useState(false);

  const [
    selectedComingSoon,
    setSelectedComingSoon,
  ] = useState(null);

  // =======================================================
  // OPEN COMING SOON
  // =======================================================

  const openComingSoon = (service) => {
    setSelectedComingSoon(service);
    setComingSoonVisible(true);
  };

  // =======================================================
  // CLOSE COMING SOON
  // =======================================================

  const closeComingSoon = () => {
    setComingSoonVisible(false);

    setTimeout(() => {
      setSelectedComingSoon(null);
    }, 200);
  };

  // =======================================================
  // HANDLE SERVICE PRESS
  // =======================================================

  const handleServicePress = (service) => {
    if (!service) {
      return;
    }

    switch (service.id) {
      // ---------------------------------------------------
      // AIRTIME
      // ---------------------------------------------------

      case "airtime":
        setAirtimeVisible(true);
        return;

      // ---------------------------------------------------
      // DATA
      // ---------------------------------------------------

      case "data":
        setDataVisible(true);
        return;

      // ---------------------------------------------------
      // CABLE TV
      // ---------------------------------------------------

      case "cable":
        setCableTvVisible(true);
        return;

      // ---------------------------------------------------
      // TIN REGISTRATION
      // ---------------------------------------------------

      case "tin":
        navigation.navigate("TinRegistration");
        return;

      // ---------------------------------------------------
      // OTHER SERVICES
      // ---------------------------------------------------

      default:
        openComingSoon(service);
    }
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}

          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageTitle}>
                Services
              </Text>

              <Text style={styles.pageSubtitle}>
                Everyday and business services
              </Text>
            </View>

            <View style={styles.headerIcon}>
              <Ionicons
                name="grid-outline"
                size={21}
                color={BRAND_COLOR}
              />
            </View>
          </View>

          {/* SERVICES CARD */}

          <View style={styles.serviceCard}>
            <Text style={styles.sectionTitle}>
              All Services
            </Text>

            <Text style={styles.sectionSubtitle}>
              Pay bills, manage business services and more
            </Text>

            {/* SERVICE GRID */}

            <View style={styles.serviceGrid}>
              {SERVICES.map((service) => (
                <Pressable
                  key={service.id}
                  onPress={() => handleServicePress(service)}
                  style={({ pressed }) => [
                    styles.serviceItem,
                    pressed && styles.serviceItemPressed,
                  ]}
                >
                  <View style={styles.serviceIconCircle}>
                    <Ionicons
                      name={service.icon}
                      size={22}
                      color={BRAND_COLOR}
                    />

                    {!service.active && (
                      <View style={styles.comingSoonDot} />
                    )}
                  </View>

                  <Text
                    style={styles.serviceLabel}
                    numberOfLines={2}
                  >
                    {service.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* INFORMATION CARD */}

          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={BRAND_COLOR}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                More services are coming
              </Text>

              <Text style={styles.infoText}>
                We are continuously adding more corporate,
                compliance and utility services to eVault.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* =================================================
            AIRTIME MODAL
        ================================================= */}

        <AirtimePurchaseModal
          visible={airtimeVisible}
          onClose={() => setAirtimeVisible(false)}
        />

        {/* =================================================
            DATA MODAL
        ================================================= */}

        <DataPurchaseModal
          visible={dataVisible}
          onClose={() => setDataVisible(false)}
        />

        {/* =================================================
            CABLE TV MODAL
        ================================================= */}

        <CableTVModal
          visible={cableTvVisible}
          onClose={() => setCableTvVisible(false)}
        />

        {/* =================================================
            COMING SOON MODAL
        ================================================= */}

        <Modal
          transparent
          visible={comingSoonVisible}
          animationType="fade"
          onRequestClose={closeComingSoon}
        >
          <View style={styles.comingSoonOverlay}>
            {/* DISMISS BACKGROUND */}

            <Pressable
              style={styles.dismissArea}
              onPress={closeComingSoon}
            />

            {/* MODAL CONTENT */}

            <View style={styles.comingSoonModal}>
              <View style={styles.comingSoonLargeIcon}>
                <Ionicons
                  name="time-outline"
                  size={32}
                  color={BRAND_COLOR}
                />
              </View>

              <Text style={styles.comingSoonTitle}>
                Coming Soon
              </Text>

              <Text style={styles.comingSoonService}>
                {selectedComingSoon?.title || "This service"}
              </Text>

              <Text style={styles.comingSoonDescription}>
                {COMING_SOON_TEXT[
                  selectedComingSoon?.id
                ] ||
                  "This service is being prepared and will be available soon."}
              </Text>

              <Pressable
                style={({ pressed }) => [
                  styles.comingSoonButton,
                  pressed && styles.comingSoonButtonPressed,
                ]}
                onPress={closeComingSoon}
              >
                <Text style={styles.comingSoonButtonText}>
                  Okay
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 35,
  },

  // HEADER

  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingHorizontal: 2,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },

  pageSubtitle: {
    marginTop: 3,
    fontSize: 11.5,
    color: "#64748B",
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND_LIGHT,
    justifyContent: "center",
    alignItems: "center",
  },

  // SERVICE CARD

  serviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingTop: 17,
    paddingHorizontal: 9,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 7,
    elevation: 2,
  },

  sectionTitle: {
    paddingHorizontal: 7,
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
  },

  sectionSubtitle: {
    paddingHorizontal: 7,
    marginTop: 3,
    marginBottom: 15,
    fontSize: 10.5,
    color: "#94A3B8",
  },

  // SERVICE GRID

  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  serviceItem: {
    width: "25%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingTop: 7,
    paddingBottom: 13,
    borderRadius: 12,
  },

  serviceItemPressed: {
    backgroundColor: "#F8FAFF",
    transform: [
      {
        scale: 0.96,
      },
    ],
  },

  // SERVICE ICON

  serviceIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BRAND_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: 7,
  },

  comingSoonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F59E0B",
    position: "absolute",
    top: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  // SERVICE LABEL

  serviceLabel: {
    width: "100%",
    minHeight: 27,
    textAlign: "center",
    fontSize: 10.5,
    lineHeight: 13,
    fontWeight: "600",
    color: "#334155",
  },

  // INFORMATION CARD

  infoCard: {
    marginTop: 13,
    padding: 13,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BRAND_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
  },

  infoText: {
    marginTop: 3,
    fontSize: 10.5,
    lineHeight: 16,
    color: "#64748B",
  },

  // COMING SOON MODAL

  comingSoonOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.38)",
    paddingHorizontal: 25,
  },

  dismissArea: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  comingSoonModal: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
    zIndex: 10,
  },

  comingSoonLargeIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: BRAND_LIGHT,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 13,
  },

  comingSoonTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  comingSoonService: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: BRAND_COLOR,
  },

  comingSoonDescription: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 11.5,
    lineHeight: 18,
    color: "#64748B",
    paddingHorizontal: 8,
  },

  comingSoonButton: {
    width: "100%",
    minHeight: 44,
    marginTop: 19,
    borderRadius: 13,
    backgroundColor: BRAND_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },

  comingSoonButtonPressed: {
    opacity: 0.88,
    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  comingSoonButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
});