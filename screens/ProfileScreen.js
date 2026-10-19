// screens/ProfileScreen.jsx

import React, { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CustomModal } from "../components/CustomModal";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { useAuth } from "../context/AuthContext";
import useCreatePin from "../hooks/useCreatePin";

// =========================================================
// THEME
// =========================================================

const BRAND_COLOR = "#2A5FD3";
const BRAND_MUTED = "#EFF5FF";
const BACKGROUND = "#F5F7FB";
const TEXT_DARK = "#172033";
const TEXT_MUTED = "#7B8497";
const BORDER = "#E9EDF4";
const SUCCESS = "#16865B";
const DANGER = "#D94848";

// =========================================================
// PROFILE SCREEN
// =========================================================

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();

  const {
    createPin,
    changePin,
    loadPinStatus,
    hasTransactionPin,
    loading,
    statusLoading,
  } = useCreatePin();

  const [pinModal, setPinModal] = useState(false);
  const [pinMode, setPinMode] = useState("create");

  const [loginPassword, setLoginPassword] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const currentUser = user || {};

  const fullName =
    currentUser.fullName ||
    currentUser.full_name ||
    currentUser.name ||
    "eVault User";

  const email =
    currentUser.email ||
    currentUser.emailAddress ||
    currentUser.email_address ||
    "";

  const phoneNumber =
    currentUser.phoneNumber ||
    currentUser.phone_number ||
    currentUser.phone ||
    "";

  const username =
    currentUser.username ||
    currentUser.userName ||
    "";

  const userKey = String(
    currentUser.id ||
      currentUser.userId ||
      currentUser.user_id ||
      currentUser.email ||
      currentUser.phoneNumber ||
      currentUser.phone_number ||
      ""
  );

  // =======================================================
  // LOAD SAVED STATUS WHEN THE SCREEN OPENS
  // =======================================================

  useEffect(() => {
    if (userKey) {
      loadPinStatus();
    }
  }, [userKey, loadPinStatus]);

  // =======================================================
  // RESET FORM
  // =======================================================

  const resetPinForm = useCallback(() => {
    setLoginPassword("");
    setCurrentPin("");
    setPin("");
    setConfirmPin("");
    setShowPassword(false);
    setShowCurrentPin(false);
  }, []);

  const closePinModal = () => {
    if (loading) {
      return;
    }

    setPinModal(false);
    resetPinForm();
  };

  // =======================================================
  // CREATE OR CHANGE PIN
  // =======================================================

  const handlePinAction = async () => {
    // Never guess when the server could not provide the status.
    let savedStatus = hasTransactionPin;

    if (savedStatus === null) {
      savedStatus = await loadPinStatus();
    }

    if (savedStatus === null) {
      Alert.alert(
        "PIN Status Unavailable",
        "We couldn't check your transaction PIN status. Check your connection and try again."
      );

      return;
    }

    setPinMode(savedStatus ? "change" : "create");
    resetPinForm();
    setPinModal(true);
  };

  const handleSavePin = async () => {
    const newPin = pin;
    const repeatedPin = confirmPin;

    if (pinMode === "create" && !loginPassword) {
      Alert.alert(
        "Password Required",
        "Enter your login password to create a transaction PIN."
      );

      return;
    }

    if (pinMode === "change" && !currentPin) {
      Alert.alert(
        "Current PIN Required",
        "Enter your existing transaction PIN."
      );

      return;
    }

    if (!/^\d{4}$/.test(newPin)) {
      Alert.alert(
        "Invalid PIN",
        "Your new transaction PIN must contain exactly four digits."
      );

      return;
    }

    if (!/^\d{4}$/.test(repeatedPin)) {
      Alert.alert(
        "Invalid Confirmation",
        "Your confirmation PIN must contain exactly four digits."
      );

      return;
    }

    if (newPin !== repeatedPin) {
      Alert.alert(
        "PIN Mismatch",
        "Your new PIN and confirmation PIN do not match."
      );

      return;
    }

    // Avoid calling the creation endpoint when the server says
    // that a PIN already exists.
    if (pinMode === "create" && hasTransactionPin === true) {
      Alert.alert(
        "PIN Already Exists",
        "Your account already has a transaction PIN. Please use Change Transaction PIN."
      );

      return;
    }

    try {
      let result;

      if (pinMode === "create") {
        result = await createPin(loginPassword, newPin);
      } else {
        result = await changePin(currentPin, newPin);
      }

      // A successful API response updates the hook's local state.
      // The hook only does this when the request reports success.
      setPinModal(false);
      resetPinForm();

      Alert.alert(
        "Success",
        result?.message ||
          (pinMode === "create"
            ? "Transaction PIN created successfully."
            : "Transaction PIN changed successfully.")
      );
    } catch (error) {
      console.error(
        pinMode === "create"
          ? "CREATE TRANSACTION PIN ERROR:"
          : "CHANGE TRANSACTION PIN ERROR:",
        error?.response?.data || error?.message || error
      );

      Alert.alert(
        pinMode === "create"
          ? "Unable to Create PIN"
          : "Unable to Change PIN",
        error?.response?.data?.message ||
          error?.message ||
          "Your transaction PIN could not be updated. Please try again."
      );
    }
  };

  // =======================================================
  // LOGOUT
  // =======================================================

  const performLogout = async () => {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);
      await logout();
      navigation.replace("LoginScreen");
    } catch (error) {
      console.error("EVault LOGOUT ERROR:", error);

      setLoggingOut(false);

      Alert.alert(
        "Logout Failed",
        error?.message || "Unable to log out. Please try again."
      );
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your eVault account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: performLogout,
        },
      ]
    );
  };

  // =======================================================
  // NO SESSION
  // =======================================================

  if (!user) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={BACKGROUND}
        />

        <View style={styles.emptyLogo}>
          <Text style={styles.emptyLogoText}>e</Text>
        </View>

        <Text style={styles.emptyTitle}>
          No user session found
        </Text>

        <Text style={styles.emptyDescription}>
          Please sign in to view your eVault profile.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.replace("LoginScreen")}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>
            Sign In
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // =======================================================
  // MAIN SCREEN
  // =======================================================

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BACKGROUND}
      />

      <View style={styles.topBar}>
        <View>
          <Text style={styles.screenTitle}>My Profile</Text>

          <Text style={styles.screenSubtitle}>
            Manage your account and security
          </Text>
        </View>

        <View style={styles.brandIcon}>
          <Text style={styles.brandIconText}>e</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* PROFILE CARD */}

        <View style={styles.profileCard}>
          <View style={styles.profileAccent} />

          <View style={styles.avatarRing}>
            <ProfileAvatar name={fullName} />
          </View>

          <Text style={styles.profileName}>{fullName}</Text>

          <Text style={styles.profileEmail}>
            {email || "Add your email address"}
          </Text>

          <View style={styles.accountBadge}>
            <Ionicons
              name="shield-checkmark"
              size={15}
              color={BRAND_COLOR}
            />

            <Text style={styles.accountBadgeText}>
              eVault Account
            </Text>
          </View>

          <View style={styles.profileDivider} />

          <View style={styles.profileFooter}>
            <View style={styles.profileFooterItem}>
              <View style={styles.footerIconBox}>
                <Ionicons
                  name="person-outline"
                  size={17}
                  color={BRAND_COLOR}
                />
              </View>

              <View style={styles.footerTextBox}>
                <Text style={styles.footerLabel}>Profile</Text>

                <Text style={styles.footerValue}>
                  Personal account
                </Text>
              </View>
            </View>

            <View style={styles.footerVerticalDivider} />

            <View style={styles.profileFooterItem}>
              <View style={styles.securityFooterIcon}>
                <Ionicons
                  name="lock-closed-outline"
                  size={17}
                  color={SUCCESS}
                />
              </View>

              <View style={styles.footerTextBox}>
                <Text style={styles.footerLabel}>Security</Text>

                <Text style={styles.footerValue}>
                  {statusLoading
                    ? "Checking status..."
                    : hasTransactionPin === true
                      ? "PIN configured"
                      : hasTransactionPin === false
                        ? "PIN not set"
                        : "Status unavailable"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* PERSONAL INFORMATION */}

        <SectionHeader
          title="Personal Information"
          subtitle="Your registered account details"
        />

        <View style={styles.groupCard}>
          <DetailRow
            icon="person-outline"
            label="Full Name"
            value={fullName}
          />

          <DetailRow
            icon="mail-outline"
            label="Email Address"
            value={email || "Not provided"}
          />

          <DetailRow
            icon="call-outline"
            label="Phone Number"
            value={phoneNumber || "Not provided"}
          />

          <DetailRow
            icon="at-outline"
            label="Username"
            value={
              username
                ? `@${String(username).replace(/^@/, "")}`
                : "Not provided"
            }
            last
          />
        </View>

        {/* SECURITY */}

        <SectionHeader
          title="Security"
          subtitle="Keep your transactions protected"
        />

        <View style={styles.groupCard}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handlePinAction}
            activeOpacity={0.75}
          >
            <View style={styles.actionIconBox}>
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color={BRAND_COLOR}
              />
            </View>

            <View style={styles.actionTextContainer}>
              <Text style={styles.actionTitle}>
                {statusLoading
                  ? "Checking Transaction PIN..."
                  : hasTransactionPin === true
                    ? "Change Transaction PIN"
                    : hasTransactionPin === false
                      ? "Create Transaction PIN"
                      : "Retry PIN Status Check"}
              </Text>

              <Text style={styles.actionDescription}>
                {statusLoading
                  ? "Checking your saved account security status"
                  : hasTransactionPin === true
                    ? "Update the PIN used to authorize transactions"
                    : hasTransactionPin === false
                      ? "Set a secure 4-digit transaction PIN"
                      : "We couldn't retrieve your saved PIN status"}
              </Text>
            </View>

            {statusLoading ? (
              <ActivityIndicator color={BRAND_COLOR} />
            ) : (
              <View style={styles.actionTrailing}>
                <View
                  style={[
                    styles.statusDot,
                    hasTransactionPin === true
                      ? styles.statusDotGreen
                      : hasTransactionPin === false
                        ? styles.statusDotOrange
                        : styles.statusDotGray,
                  ]}
                />

                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color="#A3ACBC"
                />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* ACCOUNT */}

        <SectionHeader
          title="Account"
          subtitle="Manage your current session"
        />

        <View style={styles.groupCard}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleLogout}
            disabled={loggingOut}
            activeOpacity={0.75}
          >
            <View style={styles.destructiveIconBox}>
              <Ionicons
                name="log-out-outline"
                size={21}
                color={DANGER}
              />
            </View>

            <View style={styles.actionTextContainer}>
              <Text style={styles.destructiveTitle}>
                {loggingOut ? "Logging Out..." : "Log Out"}
              </Text>

              <Text style={styles.actionDescription}>
                Sign out of your eVault account
              </Text>
            </View>

            {loggingOut ? (
              <ActivityIndicator color={DANGER} />
            ) : (
              <Ionicons
                name="chevron-forward"
                size={19}
                color="#A3ACBC"
              />
            )}
          </TouchableOpacity>
        </View>

        {/* FOOTER */}

        <View style={styles.bottomFooter}>
          <View style={styles.footerBrandMark}>
            <Text style={styles.footerBrandMarkText}>e</Text>
          </View>

          <Text style={styles.footerBrandName}>eVault</Text>

          <Text style={styles.footerTagline}>
            Your money. Your services. Your control.
          </Text>
        </View>
      </ScrollView>

      {/* CREATE / CHANGE PIN MODAL */}

      <CustomModal
        isVisible={pinModal}
        onClose={closePinModal}
        title={
          pinMode === "create"
            ? "Create Transaction PIN"
            : "Change Transaction PIN"
        }
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalIntro}>
            <View style={styles.modalIconBox}>
              <Ionicons
                name="lock-closed"
                size={24}
                color={BRAND_COLOR}
              />
            </View>

            <Text style={styles.modalDescription}>
              {pinMode === "create"
                ? "Create a secure 4-digit PIN to authorize transactions."
                : "Enter your current PIN and choose a new secure 4-digit PIN."}
            </Text>
          </View>

          {/* PASSWORD IS REQUIRED FOR CREATION */}

          {pinMode === "create" ? (
            <>
              <Text style={styles.inputLabel}>Login Password</Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color="#8A94A6"
                />

                <TextInput
                  style={styles.textInput}
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Enter your login password"
                  placeholderTextColor="#A0A9B8"
                  editable={!loading}
                  returnKeyType="next"
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowPassword((previous) => !previous)
                  }
                  disabled={loading}
                  style={styles.visibilityButton}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={20}
                    color="#7B8497"
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.inputLabel}>
                Current Transaction PIN
              </Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="keypad-outline"
                  size={19}
                  color="#8A94A6"
                />

                <TextInput
                  style={[styles.textInput, styles.pinTextInput]}
                  value={currentPin}
                  onChangeText={(value) =>
                    setCurrentPin(
                      value.replace(/\D/g, "").slice(0, 4)
                    )
                  }
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry={!showCurrentPin}
                  placeholder="Enter current PIN"
                  placeholderTextColor="#A0A9B8"
                  editable={!loading}
                  returnKeyType="next"
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowCurrentPin((previous) => !previous)
                  }
                  disabled={loading}
                  style={styles.visibilityButton}
                >
                  <Ionicons
                    name={
                      showCurrentPin
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={20}
                    color="#7B8497"
                  />
                </TouchableOpacity>
              </View>
            </>
          )}

          <Text style={styles.inputLabel}>New Transaction PIN</Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="keypad-outline"
              size={19}
              color="#8A94A6"
            />

            <TextInput
              style={[styles.textInput, styles.pinTextInput]}
              value={pin}
              onChangeText={(value) =>
                setPin(value.replace(/\D/g, "").slice(0, 4))
              }
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="Enter 4-digit PIN"
              placeholderTextColor="#A0A9B8"
              editable={!loading}
              returnKeyType="next"
            />

            <Text style={styles.pinCounter}>{pin.length}/4</Text>
          </View>

          <Text style={styles.inputLabel}>
            Confirm New PIN
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons
              name="checkmark-circle-outline"
              size={19}
              color="#8A94A6"
            />

            <TextInput
              style={[styles.textInput, styles.pinTextInput]}
              value={confirmPin}
              onChangeText={(value) =>
                setConfirmPin(
                  value.replace(/\D/g, "").slice(0, 4)
                )
              }
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              placeholder="Re-enter new PIN"
              placeholderTextColor="#A0A9B8"
              editable={!loading}
              returnKeyType="done"
            />

            <Ionicons
              name={
                confirmPin.length === 4 && confirmPin === pin
                  ? "checkmark-circle"
                  : "ellipse-outline"
              }
              size={19}
              color={
                confirmPin.length === 4 && confirmPin === pin
                  ? SUCCESS
                  : "#C5CBD6"
              }
            />
          </View>

          <View style={styles.securityNotice}>
            <Ionicons
              name="information-circle-outline"
              size={19}
              color={BRAND_COLOR}
            />

            <Text style={styles.securityNoticeText}>
              Never share your transaction PIN with anyone.
            </Text>
          </View>

          <View style={styles.modalActionRow}>
            <TouchableOpacity
              style={styles.cancelAction}
              disabled={loading}
              onPress={closePinModal}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelActionText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveAction,
                loading && styles.disabledButton,
              ]}
              disabled={loading}
              onPress={handleSavePin}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.saveText}>
                    {pinMode === "create"
                      ? "Create PIN"
                      : "Change PIN"}
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={17}
                    color="#FFFFFF"
                    style={styles.saveIcon}
                  />
                </>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </CustomModal>
    </SafeAreaView>
  );
}

// =========================================================
// SECTION HEADER
// =========================================================

function SectionHeader({ title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

// =========================================================
// ACCOUNT DETAIL ROW
// =========================================================

function DetailRow({ icon, label, value, last = false }) {
  return (
    <View
      style={[
        styles.detailRow,
        !last && styles.rowDivider,
      ]}
    >
      <View style={styles.detailIconBox}>
        <Ionicons name={icon} size={19} color={BRAND_COLOR} />
      </View>

      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  topBar: {
    paddingHorizontal: 21,
    paddingTop: 12,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  screenTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: TEXT_DARK,
    letterSpacing: -0.7,
  },

  screenSubtitle: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 5,
  },

  brandIcon: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: BRAND_COLOR,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  brandIconText: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 35,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    alignItems: "center",
    paddingTop: 25,
    paddingHorizontal: 17,
    paddingBottom: 17,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EDF0F6",
    elevation: 2,
  },

  profileAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: BRAND_COLOR,
  },

  avatarRing: {
    width: 91,
    height: 91,
    borderRadius: 46,
    backgroundColor: BRAND_MUTED,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 13,
  },

  profileName: {
    color: TEXT_DARK,
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
  },

  profileEmail: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 6,
    textAlign: "center",
  },

  accountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BRAND_MUTED,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 13,
  },

  accountBadgeText: {
    marginLeft: 6,
    color: BRAND_COLOR,
    fontWeight: "700",
    fontSize: 11,
  },

  profileDivider: {
    height: 1,
    alignSelf: "stretch",
    backgroundColor: BORDER,
    marginTop: 21,
    marginBottom: 15,
  },

  profileFooter: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "space-between",
  },

  profileFooterItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
  },

  footerIconBox: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: BRAND_MUTED,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  securityFooterIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: "#EAF8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  footerTextBox: {
    flexShrink: 1,
  },

  footerLabel: {
    fontSize: 10,
    color: TEXT_MUTED,
    marginBottom: 3,
  },

  footerValue: {
    fontSize: 11,
    fontWeight: "700",
    color: TEXT_DARK,
  },

  footerVerticalDivider: {
    width: 1,
    height: 34,
    backgroundColor: BORDER,
    marginHorizontal: 8,
  },

  sectionHeader: {
    marginTop: 25,
    marginBottom: 11,
    paddingHorizontal: 3,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: TEXT_DARK,
  },

  sectionSubtitle: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 4,
  },

  groupCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#EAEFF6",
    elevation: 1,
  },

  detailRow: {
    minHeight: 75,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },

  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F7",
  },

  detailIconBox: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#F0F5FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  detailTextContainer: {
    flex: 1,
    minWidth: 0,
  },

  detailLabel: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginBottom: 5,
  },

  detailValue: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_DARK,
  },

  actionRow: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
  },

  actionIconBox: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: BRAND_MUTED,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  destructiveIconBox: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFF0F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  actionTextContainer: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },

  actionTitle: {
    fontSize: 13,
    color: TEXT_DARK,
    fontWeight: "800",
  },

  destructiveTitle: {
    fontSize: 13,
    color: DANGER,
    fontWeight: "800",
  },

  actionDescription: {
    fontSize: 10,
    color: TEXT_MUTED,
    marginTop: 5,
    lineHeight: 15,
  },

  actionTrailing: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },

  statusDotGreen: {
    backgroundColor: SUCCESS,
  },

  statusDotOrange: {
    backgroundColor: "#E3A03D",
  },

  statusDotGray: {
    backgroundColor: "#9CA3AF",
  },

  bottomFooter: {
    alignItems: "center",
    paddingTop: 28,
    paddingBottom: 10,
  },

  footerBrandMark: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: BRAND_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },

  footerBrandMarkText: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
  },

  footerBrandName: {
    color: BRAND_COLOR,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 8,
    letterSpacing: 1,
  },

  footerTagline: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 5,
    textAlign: "center",
  },

  emptyContainer: {
    flex: 1,
    backgroundColor: BACKGROUND,
    justifyContent: "center",
    alignItems: "center",
    padding: 28,
  },

  emptyLogo: {
    width: 67,
    height: 67,
    borderRadius: 21,
    backgroundColor: BRAND_COLOR,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 19,
  },

  emptyLogoText: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: TEXT_DARK,
    textAlign: "center",
  },

  emptyDescription: {
    fontSize: 13,
    color: TEXT_MUTED,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 23,
  },

  primaryButton: {
    minWidth: 180,
    height: 49,
    borderRadius: 13,
    backgroundColor: BRAND_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },

  modalIntro: {
    alignItems: "center",
    marginBottom: 17,
  },

  modalIconBox: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: BRAND_MUTED,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  modalDescription: {
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 19,
    textAlign: "center",
    paddingHorizontal: 4,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: TEXT_DARK,
    marginBottom: 8,
    marginTop: 13,
  },

  inputContainer: {
    minHeight: 51,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 13,
    backgroundColor: "#FAFBFD",
    paddingHorizontal: 13,
  },

  textInput: {
    flex: 1,
    height: 49,
    marginLeft: 10,
    paddingVertical: 0,
    fontSize: 13,
    color: TEXT_DARK,
  },

  pinTextInput: {
    fontSize: 14,
    letterSpacing: 3,
  },

  visibilityButton: {
    paddingHorizontal: 4,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },

  pinCounter: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: "700",
  },

  securityNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: BRAND_MUTED,
    borderRadius: 12,
    padding: 12,
    marginTop: 17,
  },

  securityNoticeText: {
    flex: 1,
    fontSize: 10,
    color: "#49618A",
    lineHeight: 16,
    marginLeft: 8,
  },

  modalActionRow: {
    flexDirection: "row",
    gap: 11,
    marginTop: 23,
    marginBottom: 4,
  },

  cancelAction: {
    flex: 1,
    minHeight: 49,
    borderRadius: 13,
    backgroundColor: "#F1F4F8",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelActionText: {
    color: "#475166",
    fontSize: 13,
    fontWeight: "800",
  },

  saveAction: {
    flex: 1.35,
    minHeight: 49,
    borderRadius: 13,
    backgroundColor: BRAND_COLOR,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },

  saveIcon: {
    marginLeft: 7,
  },

  disabledButton: {
    opacity: 0.65,
  },
});