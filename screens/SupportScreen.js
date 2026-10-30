
// screens/SupportScreen.jsx

import React from "react";

import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FaqCard } from "../components/FaqCard";
import { ReferralCard } from "../components/ReferralCard";
import { useSupport } from "../hooks/useSupport";

import {
  FAQ_DATA,
  SOCIAL_PROFILES,
  WHATSAPP_CONFIG,
} from "../data/supportData";

// =========================================================
// THEME
// =========================================================

const BRAND_COLOR = "#2A5FD3";
const BRAND_DARK = "#1948A8";
const BRAND_LIGHT = "#EFF5FF";

const BACKGROUND_COLOR = "#F5F7FB";
const CARD_COLOR = "#FFFFFF";

const TEXT_DARK = "#172033";
const TEXT_MUTED = "#7B8497";
const BORDER_COLOR = "#E9EDF4";

const WHATSAPP_GREEN = "#16865B";

// =========================================================
// SUPPORT SCREEN
// =========================================================

export default function SupportScreen() {
  const navigation = useNavigation();

  const {
    expandedFaqId,
    isCopying,
    toggleFaq,
    openWhatsApp,
    openExternalUrl,
    copyToClipboard,
  } = useSupport();

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BACKGROUND_COLOR}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("HomeScreen")}
            accessibilityRole="button"
            accessibilityLabel="Go back to home screen"
            activeOpacity={0.75}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color={TEXT_DARK}
            />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.screenHeader}>
              Help & Support
            </Text>

            <Text style={styles.headerSubtitle}>
              We're here to help you
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="headset-outline"
              size={23}
              color={BRAND_COLOR}
            />
          </View>
        </View>

        {/* =================================================
            WELCOME BANNER
        ================================================= */}

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTextContainer}>
            <View style={styles.welcomeBadge}>
              <View style={styles.onlineDot} />

              <Text style={styles.welcomeBadgeText}>
                EVault SUPPORT
              </Text>
            </View>

            <Text style={styles.welcomeTitle}>
              How can we help?
            </Text>

            <Text style={styles.welcomeDescription}>
              Get answers, contact our team, or explore
              our frequently asked questions.
            </Text>
          </View>

          <View style={styles.welcomeIllustration}>
            <Ionicons
              name="chatbubbles"
              size={43}
              color="#FFFFFF"
            />

            <View style={styles.illustrationDotOne} />
            <View style={styles.illustrationDotTwo} />
          </View>

          <View style={styles.bannerCircleOne} />
          <View style={styles.bannerCircleTwo} />
        </View>

        {/* =================================================
            REFERRAL
        ================================================= */}

        <SectionHeader
          title="REFER & EARN"
          subtitle="Invite others to discover eVault"
          icon="gift-outline"
        />

        <View style={styles.referralContainer}>
          <ReferralCard
            referralCode="EVAULT50K"
            onCopy={copyToClipboard}
            isCopying={isCopying}
          />
        </View>

        {/* =================================================
            DIRECT SUPPORT
        ================================================= */}

        <SectionHeader
          title="DIRECT SUPPORT"
          subtitle="Speak with our support team"
          icon="chatbubble-ellipses-outline"
        />

        <View style={styles.groupCard}>
          <TouchableOpacity
            style={styles.whatsAppRow}
            onPress={() =>
              openWhatsApp(
                WHATSAPP_CONFIG.phoneNumber,
                WHATSAPP_CONFIG.defaultMessage
              )
            }
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Message eVault support on WhatsApp"
          >
            <View style={styles.whatsAppIconBox}>
              <Ionicons
                name="logo-whatsapp"
                size={26}
                color={WHATSAPP_GREEN}
              />
            </View>

            <View style={styles.whatsAppTextContainer}>
              <Text style={styles.whatsAppTitle}>
                Message Support
              </Text>

              <Text style={styles.whatsAppSubtitle}>
                Chat with our team on WhatsApp
              </Text>

              <View style={styles.availabilityRow}>
                <View style={styles.availabilityDot} />

                <Text style={styles.availabilityText}>
                  Contact support directly
                </Text>
              </View>
            </View>

            <View style={styles.actionChevron}>
              <Ionicons
                name="chevron-forward"
                size={19}
                color={BRAND_COLOR}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* =================================================
            FAQ
        ================================================= */}

        <SectionHeader
          title="FREQUENTLY ASKED QUESTIONS"
          subtitle="Quick answers to common questions"
          icon="help-circle-outline"
        />

        <View style={styles.faqCard}>
          {FAQ_DATA.map((faq, index) => (
            <View
              key={faq.id}
              style={
                index !== FAQ_DATA.length - 1
                  ? styles.faqItemDivider
                  : undefined
              }
            >
              <FaqCard
                item={faq}
                isExpanded={expandedFaqId === faq.id}
                onToggle={() => toggleFaq(faq.id)}
              />
            </View>
          ))}
        </View>

        {/* =================================================
            COMMUNITY
        ================================================= */}

        <SectionHeader
          title="JOIN OUR COMMUNITY"
          subtitle="Connect with eVault online"
          icon="people-outline"
        />

        <View style={styles.groupCard}>
          {SOCIAL_PROFILES.map((social, index) => (
            <TouchableOpacity
              key={social.id}
              style={[
                styles.socialRow,
                index !== SOCIAL_PROFILES.length - 1 &&
                  styles.socialRowDivider,
              ]}
              onPress={() => openExternalUrl(social.url)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={`Open eVault ${social.platform} page`}
            >
              <View style={styles.socialIconBox}>
                <Ionicons
                  name={getSocialIcon(social.platform)}
                  size={21}
                  color={BRAND_COLOR}
                />
              </View>

              <View style={styles.socialTextContainer}>
                <Text style={styles.socialPlatform}>
                  {social.platform}
                </Text>

                <Text
                  style={styles.socialHandle}
                  numberOfLines={1}
                >
                  {social.handle}
                </Text>
              </View>

              <View style={styles.socialArrow}>
                <Ionicons
                  name="open-outline"
                  size={17}
                  color="#8C97AA"
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* =================================================
            FOOTER
        ================================================= */}

        <View style={styles.footer}>
          <View style={styles.footerIcon}>
            <Ionicons
              name="shield-checkmark"
              size={19}
              color={BRAND_COLOR}
            />
          </View>

          <Text style={styles.footerTitle}>
            We're here for you
          </Text>

          <Text style={styles.footerDescription}>
            Thank you for being part of the eVault community.
          </Text>

          <Text style={styles.footerBrand}>
            eVault · Electronic Vault
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =========================================================
// SECTION HEADER COMPONENT
// =========================================================

function SectionHeader({
  title,
  subtitle,
  icon,
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionIconBox}>
        <Ionicons
          name={icon}
          size={18}
          color={BRAND_COLOR}
        />
      </View>

      <View style={styles.sectionHeaderText}>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        <Text style={styles.sectionSubtitle}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

// =========================================================
// SOCIAL ICON HELPER
// =========================================================

function getSocialIcon(platform) {
  const name = String(platform || "").toLowerCase();

  if (name.includes("instagram")) {
    return "logo-instagram";
  }

  if (
    name.includes("facebook") ||
    name.includes("meta")
  ) {
    return "logo-facebook";
  }

  if (
    name === "x" ||
    name.includes("twitter")
  ) {
    return "logo-twitter";
  }

  if (name.includes("youtube")) {
    return "logo-youtube";
  }

  if (name.includes("linkedin")) {
    return "logo-linkedin";
  }

  if (name.includes("telegram")) {
    return "paper-plane-outline";
  }

  if (name.includes("tiktok")) {
    return "musical-notes-outline";
  }

  if (name.includes("whatsapp")) {
    return "logo-whatsapp";
  }

  return "globe-outline";
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 38,
  },

  // ---------------- HEADER ----------------

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 19,
  },

  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: CARD_COLOR,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  headerTextContainer: {
    flex: 1,
  },

  screenHeader: {
    fontSize: 23,
    fontWeight: "800",
    color: TEXT_DARK,
    letterSpacing: -0.5,
  },

  headerSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 4,
  },

  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: BRAND_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  // ---------------- WELCOME BANNER ----------------

  welcomeCard: {
    minHeight: 174,
    borderRadius: 23,
    backgroundColor: BRAND_COLOR,
    padding: 20,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    marginBottom: 4,
  },

  welcomeTextContainer: {
    flex: 1,
    zIndex: 2,
    paddingRight: 5,
  },

  welcomeBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.16)",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },

  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#8CF0B0",
    marginRight: 6,
  },

  welcomeBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
  },

  welcomeTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },

  welcomeDescription: {
    fontSize: 11,
    color: "#E8F0FF",
    lineHeight: 17,
    marginTop: 7,
    maxWidth: 240,
  },

  welcomeIllustration: {
    width: 74,
    height: 74,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    zIndex: 2,
  },

  illustrationDotOne: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#95C0FF",
    position: "absolute",
    top: -3,
    right: 3,
  },

  illustrationDotTwo: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#B8F2CE",
    position: "absolute",
    bottom: 1,
    left: 2,
  },

  bannerCircleOne: {
    width: 155,
    height: 155,
    borderRadius: 78,
    backgroundColor: "rgba(255,255,255,0.055)",
    position: "absolute",
    right: -49,
    top: -61,
  },

  bannerCircleTwo: {
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    position: "absolute",
    right: 17,
    bottom: -77,
  },

  // ---------------- SECTION HEADERS ----------------

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    marginBottom: 12,
    paddingHorizontal: 2,
  },

  sectionIconBox: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: BRAND_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: TEXT_DARK,
    letterSpacing: 0.45,
  },

  sectionSubtitle: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 4,
  },

  // ---------------- REFERRAL ----------------

  referralContainer: {
    borderRadius: 19,
    overflow: "hidden",
  },

  // ---------------- CARDS ----------------

  groupCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: "hidden",
  },

  // ---------------- WHATSAPP ----------------

  whatsAppRow: {
    minHeight: 100,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 17,
  },

  whatsAppIconBox: {
    width: 49,
    height: 49,
    borderRadius: 16,
    backgroundColor: "#EAF8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  whatsAppTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  whatsAppTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: TEXT_DARK,
  },

  whatsAppSubtitle: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 5,
  },

  availabilityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  availabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: WHATSAPP_GREEN,
    marginRight: 6,
  },

  availabilityText: {
    fontSize: 10,
    fontWeight: "600",
    color: WHATSAPP_GREEN,
  },

  actionChevron: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: BRAND_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  // ---------------- FAQ ----------------

  faqCard: {
    backgroundColor: CARD_COLOR,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    overflow: "hidden",
    paddingHorizontal: 13,
    paddingVertical: 3,
  },

  faqItemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F7",
  },

  // ---------------- SOCIAL LINKS ----------------

  socialRow: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  socialRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F7",
  },

  socialIconBox: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: BRAND_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  socialTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  socialPlatform: {
    fontSize: 13,
    fontWeight: "800",
    color: TEXT_DARK,
  },

  socialHandle: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 5,
  },

  socialArrow: {
    width: 31,
    height: 31,
    borderRadius: 11,
    backgroundColor: "#F5F7FB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  // ---------------- FOOTER ----------------

  footer: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 5,
  },

  footerIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: BRAND_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },

  footerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: TEXT_DARK,
  },

  footerDescription: {
    fontSize: 11,
    lineHeight: 17,
    color: TEXT_MUTED,
    marginTop: 6,
    textAlign: "center",
  },

  footerBrand: {
    fontSize: 10,
    color: BRAND_COLOR,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: 12,
  },
});
