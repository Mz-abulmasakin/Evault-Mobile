// src/screens/RegisterScreen.jsx

import React, { useState } from "react";

import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import useRegister from "../hooks/useRegister";

const topLogo = require("../assets/evault-logo.png");

const BRAND = "#264BC5";
const BRAND_DARK = "#1D3CA0";
const BRAND_LIGHT = "#EEF3FF";

export default function Register({ navigation }) {
  const {
    username,
    setUsername,

    fullName,
    setFullName,

    password,
    setPassword,

    email,
    setEmail,

    phoneNumber,
    setPhoneNumber,

    loading,

    handleRegister,
  } = useRegister(navigation);

  const [showPassword, setShowPassword] = useState(false);

  // =====================================================
  // REUSABLE INPUT FIELD
  // =====================================================

  const renderInput = ({
    label,
    icon,
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    autoCapitalize = "none",
    autoComplete,
    autoCorrect = false,
    secureTextEntry = false,
    rightAction,
    returnKeyType = "next",
    maxLength,
  }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label}
      </Text>

      <View style={styles.inputWrapper}>
        <Ionicons
          name={icon}
          size={19}
          color="#8492A8"
          style={styles.inputIcon}
        />

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9AA6B8"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          secureTextEntry={secureTextEntry}
          returnKeyType={returnKeyType}
          maxLength={maxLength}
          underlineColorAndroid="transparent"
          textAlignVertical="center"
          selectionColor={BRAND}
          editable={!loading}
        />

        {rightAction || null}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "left", "right"]}
    >
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        style={styles.container}
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
          {/* BRAND HEADER */}

          <View style={styles.brandHeader}>
            <View style={styles.logoContainer}>
              <Image
                style={styles.logo}
                source={topLogo}
              />
            </View>

            <Text style={styles.brandTitle}>
              eVault Corporate
            </Text>

            <Text style={styles.brandSubtitle}>
              Business services, made simpler.
            </Text>
          </View>

          {/* REGISTRATION FORM */}

          <View style={styles.formCard}>
            <View style={styles.formHeading}>
              <Text style={styles.formTitle}>
                Create your account
              </Text>

              <Text style={styles.formSubtitle}>
                Enter your details to get started.
              </Text>
            </View>

            {/* USERNAME */}

            {renderInput({
              label: "Username",
              icon: "person-outline",
              value: username,
              onChangeText: setUsername,
              placeholder: "Choose a username",
              autoCapitalize: "none",
              autoComplete: "username",
            })}

            {/* FULL NAME */}

            {renderInput({
              label: "Full Name",
              icon: "person-circle-outline",
              value: fullName,
              onChangeText: setFullName,
              placeholder: "Enter your full name",
              autoCapitalize: "words",
              autoComplete: "name",
            })}

            {/* PASSWORD */}

            {renderInput({
              label: "Password",
              icon: "lock-closed-outline",
              value: password,
              onChangeText: setPassword,
              placeholder: "Create a password",
              autoCapitalize: "none",
              autoComplete: "new-password",
              secureTextEntry: !showPassword,
              returnKeyType: "next",

              rightAction: (
                <Pressable
                  style={styles.passwordToggle}
                  onPress={() =>
                    setShowPassword((current) => !current)
                  }
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={20}
                    color="#64748B"
                  />
                </Pressable>
              ),
            })}

            {/* EMAIL */}

            {renderInput({
              label: "Email Address",
              icon: "mail-outline",
              value: email,
              onChangeText: setEmail,
              placeholder: "Enter your email address",
              keyboardType: "email-address",
              autoCapitalize: "none",
              autoComplete: "email",
              returnKeyType: "next",
            })}

            {/* PHONE */}

            {renderInput({
              label: "Phone Number",
              icon: "logo-whatsapp",
              value: phoneNumber,
              onChangeText: setPhoneNumber,
              placeholder: "WhatsApp-active phone number",
              keyboardType: "phone-pad",
              autoCapitalize: "none",
              autoComplete: "tel",
              returnKeyType: "done",
            })}

            <Text style={styles.phoneHint}>
              Use the phone number where you can receive
              WhatsApp messages.
            </Text>

            {/* REGISTER BUTTON */}

            <Pressable
              disabled={loading}
              onPress={handleRegister}
              accessibilityRole="button"
              accessibilityLabel="Create eVault account"
              style={({ pressed }) => [
                styles.primaryButton,
                loading && styles.buttonDisabled,
                pressed &&
                  !loading &&
                  styles.primaryButtonPressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator
                  color="#FFFFFF"
                  size="small"
                />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>
                    Create Account
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={19}
                    color="#FFFFFF"
                  />
                </>
              )}
            </Pressable>

            <View style={styles.secureNote}>
              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color="#64748B"
              />

              <Text style={styles.secureNoteText}>
                Your account details are handled securely.
              </Text>
            </View>
          </View>

          {/* SIGN-IN FOOTER */}

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Already registered?
            </Text>

            <Pressable
              onPress={() =>
                navigation?.navigate("LoginScreen")
              }
              style={({ pressed }) => [
                styles.signInButton,
                pressed && styles.signInButtonPressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.signInText}>
                Sign in to your account
              </Text>
            </Pressable>
          </View>

          <Text style={styles.footerBrand}>
            eVault Corporate
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FC",
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 19,
    paddingTop: 18,
    paddingBottom: 25,
  },

  // BRAND HEADER

  brandHeader: {
    width: "100%",
    maxWidth: 440,
    alignItems: "center",
    marginBottom: 22,
  },

  logoContainer: {
    width: 66,
    height: 66,
    borderRadius: 21,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,

    shadowColor: BRAND,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.17,
    shadowRadius: 9,
    elevation: 5,
  },

  logo: {
    width: 47,
    height: 47,
    resizeMode: "contain",
  },

  brandTitle: {
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
    color: "#111B35",
    textAlign: "center",
    letterSpacing: -0.45,
  },

  brandSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: "#718096",
    textAlign: "center",
    marginTop: 3,
  },

  // FORM CARD

  formCard: {
    width: "100%",
    maxWidth: 440,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 17,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EDF5",

    shadowColor: "#15264B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.055,
    shadowRadius: 13,
    elevation: 3,
  },

  formHeading: {
    marginBottom: 16,
  },

  formTitle: {
    fontSize: 19,
    lineHeight: 25,
    color: "#16213A",
    fontWeight: "900",
  },

  formSubtitle: {
    fontSize: 11.5,
    lineHeight: 17,
    color: "#7B8799",
    marginTop: 3,
  },

  // INPUTS

  inputGroup: {
    width: "100%",
    minWidth: 0,
    marginBottom: 12,
  },

  inputLabel: {
    fontSize: 12,
    lineHeight: 17,
    color: "#334155",
    fontWeight: "800",
    marginBottom: 6,
    paddingLeft: 1,
  },

  inputWrapper: {
    width: "100%",
    minWidth: 0,
    height: 49,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 12,
    paddingRight: 7,
    borderRadius: 12,
    backgroundColor: "#F8FAFD",
    borderWidth: 1,
    borderColor: "#E1E7F0",
  },

  inputIcon: {
    width: 23,
    marginRight: 8,
    textAlign: "center",
  },

  input: {
    flex: 1,
    minWidth: 0,
    height: 47,
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: 13,
    lineHeight: 18,
    color: "#172033",
    includeFontPadding: false,
    textAlignVertical: "center",
  },

  passwordToggle: {
    width: 35,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 3,
  },

  phoneHint: {
    fontSize: 10,
    lineHeight: 15,
    color: "#8290A3",
    marginTop: -5,
    marginBottom: 7,
    paddingLeft: 2,
  },

  // REGISTER BUTTON

  primaryButton: {
    width: "100%",
    minHeight: 49,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 13,
    backgroundColor: BRAND,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 6,

    shadowColor: BRAND,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },

  primaryButtonPressed: {
    backgroundColor: BRAND_DARK,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  primaryButtonText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  // SECURITY NOTE

  secureNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 13,
  },

  secureNoteText: {
    fontSize: 9.5,
    lineHeight: 14,
    color: "#8490A1",
  },

  // FOOTER

  footerContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 19,
  },

  footerText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#718096",
  },

  signInButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    marginTop: 1,
  },

  signInButtonPressed: {
    backgroundColor: BRAND_LIGHT,
  },

  signInText: {
    color: BRAND,
    fontSize: 12,
    fontWeight: "900",
  },

  footerBrand: {
    fontSize: 9,
    color: "#A0AABC",
    marginTop: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
});