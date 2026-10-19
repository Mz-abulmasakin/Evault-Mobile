// src/screens/LoginScreen.jsx

import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import { useAuth } from "../context/AuthContext";
import useLogin from "../hooks/useLogin";
import api from "../services/api";

const topLogo = require("../assets/evault-logo.png");

const BRAND = "#264BC5";
const BRAND_DARK = "#1D3CA0";
const BRAND_LIGHT = "#EEF3FF";

function showAlert(message) {
  if (Platform.OS === "web") {
    window.alert(message);
  } else {
    Alert.alert("eVault", message);
  }
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export default function LoginScreen({ navigation }) {
  // =====================================================
  // LOGIN STATE
  // =====================================================

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login: loginService, loading } = useLogin();
  const { login } = useAuth();

  // =====================================================
  // FORGOT PASSWORD STATE
  // =====================================================

  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState("details");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [identityType, setIdentityType] = useState("NIN");
  const [identityNumber, setIdentityNumber] = useState("");

  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");

  // =====================================================
  // LOGIN — EXISTING BEHAVIOUR PRESERVED
  // =====================================================

  const handleLogin = async () => {
    if (!identifier.trim()) {
      showAlert("Please enter email or phone number.");
      return;
    }

    if (!password.trim()) {
      showAlert("Please enter your password.");
      return;
    }

    try {
      const result = await loginService(
        identifier,
        password
      );

      const token =
        result?.data?.token ||
        result?.data?.data?.token;

      const user =
        result?.data?.user ||
        result?.data?.data?.user;

      if (!token || !user) {
        throw new Error(
          "Invalid login response from server."
        );
      }

      await login(token, user);

      showAlert("Login Successful!");
      navigation.replace("HomeScreen");
    } catch (error) {
      console.log(
        "LOGIN ERROR:",
        error.response?.data || error.message
      );

      showAlert(
        getErrorMessage(error, "Login failed.")
      );
    }
  };

  // =====================================================
  // FORGOT PASSWORD — OPEN / CLOSE
  // =====================================================

  const openForgotPassword = () => {
    setStep("details");
    setPhoneNumber("");
    setIdentityType("NIN");
    setIdentityNumber("");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setRecoveryError("");
    setModalVisible(true);
  };

  const closeForgotPassword = () => {
    if (recoveryLoading) return;

    setModalVisible(false);
    setStep("details");
    setResetToken("");
    setNewPassword("");
    setConfirmPassword("");
    setRecoveryError("");
  };

  // =====================================================
  // STEP 1 — VERIFY PHONE + IDENTITY
  // =====================================================

  const handleVerifyDetails = async () => {
    setRecoveryError("");

    const phone = phoneNumber.trim();
    const identity = identityNumber.trim();

    if (!/^0\d{10}$/.test(phone)) {
      setRecoveryError(
        "Enter a valid 11-digit Nigerian phone number beginning with 0."
      );
      return;
    }

    if (!/^\d{11}$/.test(identity)) {
      setRecoveryError(
        `${identityType} must contain exactly 11 digits.`
      );
      return;
    }

    try {
      setRecoveryLoading(true);

      const response = await api.post(
        "/auth/forgot-password/verify-details",
        {
          phoneNumber: phone,
          identityType,
          identityNumber: identity,
        }
      );

      const token =
        response?.data?.data?.resetToken;

      if (!token) {
        throw new Error(
          "The server did not authorize the password reset."
        );
      }

      setResetToken(token);
      setRecoveryError("");
      setStep("password");
    } catch (error) {
      setRecoveryError(
        getErrorMessage(
          error,
          "The phone number and identity number could not be verified."
        )
      );
    } finally {
      setRecoveryLoading(false);
    }
  };

  // =====================================================
  // STEP 2 — SAVE NEW PASSWORD
  // =====================================================

  const handleResetPassword = async () => {
    setRecoveryError("");

    if (!resetToken) {
      setRecoveryError(
        "Your recovery session is missing. Please verify your details again."
      );

      setStep("details");
      return;
    }

    if (
      newPassword.length < 8 ||
      new TextEncoder().encode(newPassword).length > 72
    ) {
      setRecoveryError(
        "Use at least 8 characters and no more than 72 UTF-8 bytes."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setRecoveryError("The passwords do not match.");
      return;
    }

    try {
      setRecoveryLoading(true);

      await api.post(
        "/auth/forgot-password/reset",
        {
          resetToken,
          newPassword,
          confirmPassword,
        }
      );

      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setRecoveryError("");
      setStep("success");
    } catch (error) {
      setRecoveryError(
        getErrorMessage(
          error,
          "Unable to update the password. Please try again."
        )
      );
    } finally {
      setRecoveryLoading(false);
    }
  };

  // =====================================================
  // RETURN TO LOGIN
  // =====================================================

  const returnToLogin = () => {
    const phone = phoneNumber.trim();

    setIdentifier(phone);
    setPassword("");
    setModalVisible(false);
    setStep("details");
    setPhoneNumber("");
    setIdentityNumber("");
    setResetToken("");
    setRecoveryError("");
  };

  // =====================================================
  // REUSABLE PASSWORD INPUT
  // =====================================================

  const renderPasswordInput = ({
    label,
    value,
    onChangeText,
    visible,
    onToggleVisibility,
    placeholder,
  }) => (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
      </Text>

      <View style={styles.passwordBox}>
        <TextInput
          style={styles.passwordInput}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          underlineColorAndroid="transparent"
          textAlignVertical="center"
          selectionColor={BRAND}
          accessibilityLabel={label}
        />

        <Pressable
          onPress={onToggleVisibility}
          hitSlop={10}
          style={styles.eyeButton}
          accessibilityRole="button"
          accessibilityLabel={
            visible ? "Hide password" : "Show password"
          }
        >
          <Ionicons
            name={
              visible
                ? "eye-off-outline"
                : "eye-outline"
            }
            size={21}
            color="#64748B"
          />
        </Pressable>
      </View>
    </View>
  );

  // =====================================================
  // SCREEN
  // =====================================================

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : "height"
          }
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* LOGO */}

            <View style={styles.logoContainer}>
              <Image
                source={topLogo}
                style={styles.logo}
              />
            </View>

            {/* TITLE */}

            <Text style={styles.title}>
              Welcome Back!
            </Text>

            <Text style={styles.subtitle}>
              Sign in to eVault Corporate
            </Text>

            {/* LOGIN FORM */}

            <View style={styles.formCard}>
              <Text style={styles.label}>
                Email or Phone Number
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Email or phone number"
                placeholderTextColor="#94A3B8"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                keyboardType="email-address"
                returnKeyType="next"
                maxFontSizeMultiplier={1.2}
                underlineColorAndroid="transparent"
                textAlignVertical="center"
                selectionColor={BRAND}
                accessibilityLabel="Email or phone number"
              />

              {renderPasswordInput({
                label: "Password",
                value: password,
                onChangeText: setPassword,
                visible: showPassword,
                onToggleVisibility: () =>
                  setShowPassword((value) => !value),
                placeholder: "Enter password",
              })}

              {/* FORGOT PASSWORD */}

              <Pressable
                onPress={openForgotPassword}
                style={styles.forgotButton}
                accessibilityRole="button"
                accessibilityLabel="Forgot Password"
                hitSlop={8}
              >
                <Text style={styles.forgotText}>
                  Forgot Password?
                </Text>
              </Pressable>

              {/* LOGIN BUTTON */}

              <Pressable
                onPress={handleLogin}
                disabled={loading}
                style={({ pressed }) => [
                  styles.primaryButton,
                  loading && styles.buttonDisabled,
                  pressed &&
                    !loading &&
                    styles.primaryButtonPressed,
                ]}
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>
                      Login
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </Pressable>
            </View>

            {/* REGISTER LINK */}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                New to eVault Corporate?
              </Text>

              <Pressable
                onPress={() =>
                  navigation?.navigate("Register")
                }
                style={styles.registerButton}
                accessibilityRole="button"
              >
                <Text style={styles.registerText}>
                  Create an Account
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* =================================================
            FORGOT PASSWORD MODAL
        ================================================== */}

        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={closeForgotPassword}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={styles.backdrop}
              onPress={closeForgotPassword}
              disabled={recoveryLoading}
            />

            <KeyboardAvoidingView
              style={styles.modalWrapper}
              behavior={
                Platform.OS === "ios"
                  ? "padding"
                  : undefined
              }
            >
              <View style={styles.modalCard}>
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.modalContent}
                >
                  {/* MODAL HEADER */}

                  <View style={styles.modalHeader}>
                    <View style={styles.modalHeaderLeft}>
                      <View style={styles.modalIcon}>
                        <Ionicons
                          name="lock-open-outline"
                          size={23}
                          color={BRAND}
                        />
                      </View>

                      <View style={styles.modalHeading}>
                        <Text style={styles.modalTitle}>
                          Forgot Password?
                        </Text>

                        <Text style={styles.modalSubtitle}>
                          eVault account recovery
                        </Text>
                      </View>
                    </View>

                    <Pressable
                      onPress={closeForgotPassword}
                      disabled={recoveryLoading}
                      hitSlop={10}
                      style={styles.closeButton}
                      accessibilityRole="button"
                      accessibilityLabel="Close password recovery"
                    >
                      <Ionicons
                        name="close"
                        size={23}
                        color="#64748B"
                      />
                    </Pressable>
                  </View>

                  {/* ERROR MESSAGE */}

                  {recoveryError ? (
                    <View style={styles.errorBox}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={20}
                        color="#B91C1C"
                      />

                      <Text style={styles.errorText}>
                        {recoveryError}
                      </Text>
                    </View>
                  ) : null}

                  {/* STEP 1: VERIFY DETAILS */}

                  {step === "details" && (
                    <>
                      <Text style={styles.description}>
                        Enter your registered phone number
                        and the NIN or BVN attached to your
                        eVault account.
                      </Text>

                      <View style={styles.field}>
                        <Text style={styles.label}>
                          Registered Phone Number
                        </Text>

                        <TextInput
                          style={styles.input}
                          placeholder="08012345678"
                          placeholderTextColor="#94A3B8"
                          value={phoneNumber}
                          onChangeText={(value) =>
                            setPhoneNumber(
                              value.replace(/\D/g, "").slice(0, 11)
                            )
                          }
                          keyboardType="phone-pad"
                          maxLength={11}
                          autoComplete="tel"
                          returnKeyType="next"
                          underlineColorAndroid="transparent"
                          textAlignVertical="center"
                          selectionColor={BRAND}
                        />
                      </View>

                      <View style={styles.field}>
                        <Text style={styles.label}>
                          Identity Type
                        </Text>

                        <View style={styles.identityRow}>
                          {["NIN", "BVN"].map((type) => {
                            const selected =
                              identityType === type;

                            return (
                              <Pressable
                                key={type}
                                onPress={() => {
                                  setIdentityType(type);
                                  setIdentityNumber("");
                                  setRecoveryError("");
                                }}
                                style={({ pressed }) => [
                                  styles.identityOption,
                                  selected &&
                                    styles.identityOptionSelected,
                                  pressed &&
                                    styles.identityOptionPressed,
                                ]}
                                accessibilityRole="button"
                                accessibilityState={{ selected }}
                              >
                                <Ionicons
                                  name={
                                    type === "NIN"
                                      ? "id-card-outline"
                                      : "shield-checkmark-outline"
                                  }
                                  size={19}
                                  color={
                                    selected
                                      ? BRAND
                                      : "#64748B"
                                  }
                                />

                                <Text
                                  style={[
                                    styles.identityText,
                                    selected &&
                                      styles.identityTextSelected,
                                  ]}
                                >
                                  {type}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>

                      <View style={styles.field}>
                        <Text style={styles.label}>
                          {identityType} Number
                        </Text>

                        <TextInput
                          style={styles.input}
                          placeholder={`Enter 11-digit ${identityType}`}
                          placeholderTextColor="#94A3B8"
                          value={identityNumber}
                          onChangeText={(value) =>
                            setIdentityNumber(
                              value.replace(/\D/g, "").slice(0, 11)
                            )
                          }
                          keyboardType="number-pad"
                          maxLength={11}
                          returnKeyType="done"
                          underlineColorAndroid="transparent"
                          textAlignVertical="center"
                          selectionColor={BRAND}
                        />
                      </View>

                      <Pressable
                        onPress={handleVerifyDetails}
                        disabled={recoveryLoading}
                        style={({ pressed }) => [
                          styles.primaryButton,
                          recoveryLoading &&
                            styles.buttonDisabled,
                          pressed &&
                            !recoveryLoading &&
                            styles.primaryButtonPressed,
                        ]}
                        accessibilityRole="button"
                      >
                        {recoveryLoading ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <>
                            <Text style={styles.primaryButtonText}>
                              Verify Details
                            </Text>

                            <Ionicons
                              name="arrow-forward"
                              size={18}
                              color="#FFFFFF"
                            />
                          </>
                        )}
                      </Pressable>
                    </>
                  )}

                  {/* STEP 2: NEW PASSWORD */}

                  {step === "password" && (
                    <>
                      <View style={styles.successMiniIcon}>
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={27}
                          color={BRAND}
                        />
                      </View>

                      <Text style={styles.passwordStepTitle}>
                        Account Details Verified
                      </Text>

                      <Text style={styles.description}>
                        Create and confirm your new password.
                      </Text>

                      {renderPasswordInput({
                        label: "New Password",
                        value: newPassword,
                        onChangeText: setNewPassword,
                        visible: showNewPassword,
                        onToggleVisibility: () =>
                          setShowNewPassword(
                            (value) => !value
                          ),
                        placeholder: "At least 8 characters",
                      })}

                      {renderPasswordInput({
                        label: "Confirm New Password",
                        value: confirmPassword,
                        onChangeText: setConfirmPassword,
                        visible: showConfirmPassword,
                        onToggleVisibility: () =>
                          setShowConfirmPassword(
                            (value) => !value
                          ),
                        placeholder: "Re-enter new password",
                      })}

                      <Pressable
                        onPress={handleResetPassword}
                        disabled={recoveryLoading}
                        style={({ pressed }) => [
                          styles.primaryButton,
                          recoveryLoading &&
                            styles.buttonDisabled,
                          pressed &&
                            !recoveryLoading &&
                            styles.primaryButtonPressed,
                        ]}
                        accessibilityRole="button"
                      >
                        {recoveryLoading ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <>
                            <Text style={styles.primaryButtonText}>
                              Update Password
                            </Text>

                            <Ionicons
                              name="arrow-forward"
                              size={18}
                              color="#FFFFFF"
                            />
                          </>
                        )}
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          setStep("details");
                          setResetToken("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setRecoveryError("");
                        }}
                        disabled={recoveryLoading}
                        style={styles.backButton}
                      >
                        <Ionicons
                          name="arrow-back"
                          size={16}
                          color="#475569"
                        />

                        <Text style={styles.backButtonText}>
                          Back to account details
                        </Text>
                      </Pressable>
                    </>
                  )}

                  {/* STEP 3: SUCCESS */}

                  {step === "success" && (
                    <View style={styles.successContainer}>
                      <View style={styles.successIcon}>
                        <Ionicons
                          name="checkmark"
                          size={39}
                          color="#15803D"
                        />
                      </View>

                      <Text style={styles.successTitle}>
                        Password Changed
                      </Text>

                      <Text style={styles.description}>
                        Your password has been updated
                        successfully. You can now log in
                        with your new password.
                      </Text>

                      <Pressable
                        onPress={returnToLogin}
                        style={styles.primaryButton}
                        accessibilityRole="button"
                      >
                        <Text style={styles.primaryButtonText}>
                          Return to Login
                        </Text>
                      </Pressable>
                    </View>
                  )}

                  <Text style={styles.modalFooter}>
                    Keep your account details private.
                  </Text>
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: "#F5F7FC",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  // LOGO

  logoContainer: {
    width: 76,
    height: 76,
    marginBottom: 17,
    padding: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND,
    borderRadius: 23,
    shadowColor: BRAND,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 5,
  },

  logo: {
    width: 53,
    height: 53,
    resizeMode: "contain",
  },

  // TITLE

  title: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    marginTop: 5,
    marginBottom: 23,
    textAlign: "center",
  },

  // LOGIN FORM

  formCard: {
    width: "100%",
    maxWidth: 440,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E8EDF5",
    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.055,
    shadowRadius: 12,
    elevation: 3,
  },

  field: {
    width: "100%",
    minWidth: 0,
    marginBottom: 13,
  },

  label: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 7,
  },

  // REGULAR TEXT INPUT
  // Compact text and centered vertical alignment help
  // prevent clipping on smaller Android devices.

  input: {
    width: "100%",
    minWidth: 0,
    height: 49,
    paddingHorizontal: 12,
    paddingVertical: 0,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 14,
    lineHeight: 19,
    color: "#0F172A",
    includeFontPadding: false,
    textAlignVertical: "center",
  },

  // PASSWORD INPUT

  passwordBox: {
    width: "100%",
    minWidth: 0,
    height: 49,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    paddingRight: 7,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  passwordInput: {
    flex: 1,
    minWidth: 0,
    height: 47,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: 14,
    lineHeight: 19,
    color: "#0F172A",
    includeFontPadding: false,
    textAlignVertical: "center",
  },

  eyeButton: {
    width: 37,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },

  // FORGOT PASSWORD

  forgotButton: {
    alignSelf: "flex-end",
    paddingVertical: 9,
    paddingHorizontal: 2,
    marginTop: -2,
    marginBottom: 8,
  },

  forgotText: {
    color: BRAND,
    fontSize: 12,
    fontWeight: "700",
  },

  // PRIMARY BUTTON

  primaryButton: {
    width: "100%",
    minHeight: 49,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 9,
    marginTop: 8,
    shadowColor: BRAND,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.14,
    shadowRadius: 5,
    elevation: 2,
  },

  primaryButtonPressed: {
    backgroundColor: BRAND_DARK,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  // REGISTRATION FOOTER

  footer: {
    alignItems: "center",
    width: "100%",
  },

  footerText: {
    fontSize: 12,
    color: "#64748B",
  },

  registerButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 2,
  },

  registerText: {
    color: BRAND,
    fontSize: 13,
    fontWeight: "800",
  },

  // MODAL

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
    paddingVertical: 20,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  modalWrapper: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "100%",
    justifyContent: "center",
  },

  modalCard: {
    width: "100%",
    maxHeight: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 21,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8EDF5",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },

  modalContent: {
    paddingHorizontal: 19,
    paddingTop: 19,
    paddingBottom: 22,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },

  modalHeaderLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
  },

  modalIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: BRAND_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  modalHeading: {
    flex: 1,
    minWidth: 0,
  },

  modalTitle: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
    color: "#0F172A",
  },

  modalSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
    marginTop: 2,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 7,
  },

  description: {
    fontSize: 12,
    lineHeight: 19,
    color: "#64748B",
    marginBottom: 12,
  },

  // IDENTITY SELECTOR

  identityRow: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
  },

  identityOption: {
    flex: 1,
    minWidth: 0,
    minHeight: 45,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 11,
  },

  identityOptionSelected: {
    borderColor: BRAND,
    backgroundColor: BRAND_LIGHT,
  },

  identityOptionPressed: {
    opacity: 0.8,
  },

  identityText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  identityTextSelected: {
    color: BRAND,
    fontWeight: "800",
  },

  // ERROR MESSAGE

  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    padding: 11,
    borderRadius: 11,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 14,
  },

  errorText: {
    flex: 1,
    minWidth: 0,
    color: "#B91C1C",
    fontSize: 12,
    lineHeight: 18,
  },

  // PASSWORD STEP

  successMiniIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND_LIGHT,
    marginTop: 5,
    marginBottom: 12,
  },

  passwordStepTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 9,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
  },

  backButtonText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 12,
  },

  // SUCCESS STATE

  successContainer: {
    alignItems: "center",
    paddingVertical: 13,
  },

  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  successTitle: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 9,
  },

  modalFooter: {
    fontSize: 10,
    lineHeight: 16,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 15,
  },
});