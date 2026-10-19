
// components/AirtimePurchaseModal.js

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Keyboard,
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

import Ionicons from "@expo/vector-icons/Ionicons";

import useAirtime from "../hooks/useAirtime";

import TransactionReceipt from "./TransactionReceipt";

const BRAND_COLOR = "#2a5fd3";

const NETWORKS = [
  {
    id: "mtn",
    name: "MTN",
    short: "MTN",
    color: "#FFCC00",
    textColor: "#111827",
  },
  {
    id: "airtel",
    name: "Airtel",
    short: "AIRTEL",
    color: "#E50914",
    textColor: "#FFFFFF",
  },
  {
    id: "glo",
    name: "Glo",
    short: "GLO",
    color: "#16803A",
    textColor: "#FFFFFF",
  },
  {
    id: "9mobile",
    name: "9mobile",
    short: "9MOBILE",
    color: "#006B54",
    textColor: "#FFFFFF",
  },
];

const QUICK_AMOUNTS = [
  100,
  200,
  500,
  1000,
  2000,
  5000,
];

export default function AirtimePurchaseModal({
  visible,
  onClose,
  onWalletRefresh,
  onNotificationRefresh,
}) {
  const {
    buyAirtime,
    loading,
    error,
  } = useAirtime();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [transactionPin, setTransactionPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [step, setStep] = useState("form");
  const [transactionResult, setTransactionResult] = useState(null);

  const pinInputRef = useRef(null);
  const pinFocusTimeoutRef = useRef(null);

  // =======================================================
  // PHONE NORMALIZATION
  // =======================================================

  const normalizePhoneNumber = useCallback((value) => {
    let phone = String(value || "")
      .replace(/\s+/g, "")
      .trim();

    if (phone.startsWith("+234")) {
      phone = "0" + phone.slice(4);
    } else if (phone.startsWith("234")) {
      phone = "0" + phone.slice(3);
    }

    return phone;
  }, []);

  // =======================================================
  // RESET
  // =======================================================

  const resetForm = useCallback(() => {
    if (pinFocusTimeoutRef.current) {
      clearTimeout(pinFocusTimeoutRef.current);
      pinFocusTimeoutRef.current = null;
    }

    setPhoneNumber("");
    setAmount("");
    setSelectedNetwork(null);
    setTransactionPin("");
    setShowPin(false);
    setStep("form");
    setTransactionResult(null);
  }, []);

  // =======================================================
  // CLOSE
  // =======================================================

  const handleClose = useCallback(() => {
    if (loading) {
      return;
    }

    Keyboard.dismiss();
    resetForm();

    if (typeof onClose === "function") {
      onClose();
    }
  }, [loading, onClose, resetForm]);

  // =======================================================
  // CLEANUP PIN FOCUS TIMER
  // =======================================================

  React.useEffect(() => {
    return () => {
      if (pinFocusTimeoutRef.current) {
        clearTimeout(pinFocusTimeoutRef.current);
      }
    };
  }, []);

  // =======================================================
  // PHONE INPUT
  // =======================================================

  const handlePhoneChange = (value) => {
    let clean = String(value || "")
      .replace(/[^\d+]/g, "");

    if (clean.startsWith("+234")) {
      clean = "0" + clean.slice(4);
    } else if (clean.startsWith("234")) {
      clean = "0" + clean.slice(3);
    }

    clean = clean.replace(/\D/g, "").slice(0, 11);

    setPhoneNumber(clean);
  };

  // =======================================================
  // AMOUNT INPUT
  // =======================================================

  const handleAmountChange = (value) => {
    setAmount(
      String(value || "").replace(/\D/g, "")
    );
  };

  // =======================================================
  // PIN INPUT
  // =======================================================

  const handlePinChange = (value) => {
    setTransactionPin(
      String(value || "")
        .replace(/\D/g, "")
        .slice(0, 4)
    );
  };

  // =======================================================
  // VALIDATE FORM
  // =======================================================

  const validateForm = () => {
    const phone = normalizePhoneNumber(phoneNumber);
    const numericAmount = Number(amount);

    if (!selectedNetwork) {
      Alert.alert(
        "Select Network",
        "Please select your mobile network."
      );
      return false;
    }

    if (!/^0\d{10}$/.test(phone)) {
      Alert.alert(
        "Invalid Number",
        "Enter a valid 11-digit Nigerian phone number."
      );
      return false;
    }

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount < 50
    ) {
      Alert.alert(
        "Invalid Amount",
        "Enter an airtime amount of at least ₦50."
      );
      return false;
    }

    return true;
  };

  // =======================================================
  // CONTINUE
  // =======================================================

  const handleContinue = () => {
    if (!validateForm()) {
      return;
    }

    Keyboard.dismiss();
    setTransactionPin("");
    setShowPin(false);
    setStep("checkout");
  };

  // =======================================================
  // GO TO PIN
  // =======================================================

  const handleGoToPin = () => {
    Keyboard.dismiss();
    setTransactionPin("");
    setShowPin(false);
    setStep("pin");

    if (pinFocusTimeoutRef.current) {
      clearTimeout(pinFocusTimeoutRef.current);
    }

    pinFocusTimeoutRef.current = setTimeout(() => {
      pinInputRef.current?.focus();
      pinFocusTimeoutRef.current = null;
    }, 300);
  };

  // =======================================================
  // REFRESH RELATED DATA
  // =======================================================

  const refreshRelatedData = async () => {
    if (typeof onWalletRefresh === "function") {
      try {
        await onWalletRefresh();
      } catch (walletError) {
        console.log(
          "[AIRTIME] Wallet refresh failed:",
          walletError?.message || walletError
        );
      }
    }

    if (typeof onNotificationRefresh === "function") {
      try {
        await onNotificationRefresh();
      } catch (notificationError) {
        console.log(
          "[AIRTIME] Notification refresh failed:",
          notificationError?.message || notificationError
        );
      }
    }
  };

  // =======================================================
  // CONFIRM AIRTIME PURCHASE
  // =======================================================

  const handleConfirm = async () => {
    if (loading) {
      return;
    }

    const cleanPin = String(transactionPin || "")
      .replace(/\D/g, "")
      .slice(0, 4);

    if (!/^\d{4}$/.test(cleanPin)) {
      Alert.alert(
        "PIN Required",
        "Please enter your complete 4-digit transaction PIN."
      );

      pinInputRef.current?.focus();
      return;
    }

    Keyboard.dismiss();

    try {
      const normalizedPhone =
        normalizePhoneNumber(phoneNumber);

      const numericAmount = Number(amount);

      const result = await buyAirtime({
        network: selectedNetwork.id,
        phoneNumber: normalizedPhone,
        amount: numericAmount,
        transactionPin: cleanPin,
      });

      if (!result || result.success === false) {
        Alert.alert(
          "Purchase Failed",
          result?.message ||
            "Airtime purchase failed."
        );
        return;
      }

      // Keep the complete backend response for the receipt.
      setTransactionResult(result);

      // Clear the PIN from the form state.
      setTransactionPin("");
      setShowPin(false);

      // Update wallet and notifications after a successful purchase.
      await refreshRelatedData();

      // Open the receipt modal as a separate modal.
      setStep("success");
    } catch (purchaseError) {
      console.error(
        "[AIRTIME] Purchase error:",
        purchaseError?.response?.data ||
          purchaseError?.message ||
          purchaseError
      );

      Alert.alert(
        "Airtime Purchase Failed",
        purchaseError?.response?.data?.message ||
          purchaseError?.message ||
          error ||
          "Airtime purchase could not be completed."
      );
    }
  };

  // =======================================================
  // BACK
  // =======================================================

  const handleBack = () => {
    if (loading) {
      return;
    }

    if (step === "checkout") {
      setStep("form");
      return;
    }

    if (step === "pin") {
      setTransactionPin("");
      setShowPin(false);
      setStep("checkout");
    }
  };

  // =======================================================
  // DISPLAY VALUES
  // =======================================================

  const numericAmount = Number(amount || 0);

  const formattedAmount = numericAmount.toLocaleString(
    "en-NG"
  );

  const networkName = selectedNetwork?.name || "";

  const pinDots = useMemo(
    () =>
      [0, 1, 2, 3].map(
        (index) => index < transactionPin.length
      ),
    [transactionPin.length]
  );

  // =======================================================
  // RECEIPT DATA
  // =======================================================

  const receiptData =
    transactionResult?.data &&
    typeof transactionResult.data === "object"
      ? transactionResult.data
      : transactionResult || {};

  const receiptReference =
    receiptData?.reference ||
    receiptData?.transactionReference ||
    receiptData?.transaction_reference ||
    receiptData?.providerReference ||
    receiptData?.provider_reference ||
    receiptData?.transaction?.reference ||
    receiptData?.transaction?.transaction_reference ||
    "";

  const receiptDate =
    receiptData?.createdAt ||
    receiptData?.created_at ||
    receiptData?.date ||
    receiptData?.transactionDate ||
    receiptData?.transaction_date ||
    receiptData?.transaction?.created_at ||
    receiptData?.transaction?.createdAt ||
    new Date();

  const receiptAmount =
    receiptData?.amount ??
    receiptData?.airtime?.amount ??
    numericAmount;

  const receiptNetwork =
    receiptData?.airtime?.network ||
    receiptData?.networkName ||
    receiptData?.network_name ||
    selectedNetwork?.name ||
    "";

  const receiptRecipient =
    receiptData?.airtime?.phoneNumber ||
    receiptData?.phoneNumber ||
    receiptData?.phone_number ||
    normalizePhoneNumber(phoneNumber);

  const receiptStatus =
    receiptData?.status ||
    receiptData?.transaction?.status ||
    "SUCCESS";

  // =======================================================
  // HEADER TITLE
  // =======================================================

  const getTitle = () => {
    if (step === "checkout") {
      return "Confirm Airtime";
    }

    if (step === "pin") {
      return "Authorize Payment";
    }

    return "Buy Airtime";
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <>
      {/* ===================================================
          AIRTIME FORM MODAL

          It is hidden while the separate receipt modal opens.
      =================================================== */}

      <Modal
        visible={Boolean(visible && step !== "success")}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {(step === "checkout" || step === "pin") && (
                <Pressable
                  onPress={handleBack}
                  disabled={loading}
                  style={styles.iconButton}
                >
                  <Ionicons
                    name="arrow-back"
                    size={21}
                    color="#111827"
                  />
                </Pressable>
              )}

              <View>
                <Text style={styles.headerTitle}>
                  {getTitle()}
                </Text>

                {step === "form" && (
                  <Text style={styles.headerSubtitle}>
                    Recharge any Nigerian network
                  </Text>
                )}
              </View>
            </View>

            <Pressable
              onPress={handleClose}
              disabled={loading}
              style={styles.iconButton}
            >
              <Ionicons
                name="close"
                size={23}
                color="#111827"
              />
            </Pressable>
          </View>

          {/* ===============================================
              FORM
          =============================================== */}

          {step === "form" && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.content}
            >
              <View style={styles.heroCard}>
                <View style={styles.heroIcon}>
                  <Ionicons
                    name="phone-portrait-outline"
                    size={28}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.heroText}>
                  <Text style={styles.heroTitle}>
                    Instant Airtime
                  </Text>

                  <Text style={styles.heroSubtitle}>
                    Fast, secure and convenient
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>
                Select Network
              </Text>

              <View style={styles.networkGrid}>
                {NETWORKS.map((network) => {
                  const selected =
                    selectedNetwork?.id === network.id;

                  return (
                    <Pressable
                      key={network.id}
                      onPress={() =>
                        setSelectedNetwork(network)
                      }
                      style={[
                        styles.networkCard,
                        selected && styles.networkCardSelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.networkLogo,
                          {
                            backgroundColor: network.color,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.networkLogoText,
                            { color: network.textColor },
                          ]}
                        >
                          {network.short.charAt(0)}
                        </Text>
                      </View>

                      <Text style={styles.networkName}>
                        {network.name}
                      </Text>

                      {selected && (
                        <View style={styles.networkCheck}>
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color="#FFFFFF"
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.label}>
                Phone Number
              </Text>

              <View style={styles.inputBox}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color="#64748B"
                />

                <TextInput
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  placeholder="08012345678"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  maxLength={11}
                  style={styles.input}
                />

                {phoneNumber.length === 11 && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#16A34A"
                  />
                )}
              </View>

              <Text style={styles.label}>
                Airtime Amount
              </Text>

              <View style={styles.amountBox}>
                <Text style={styles.naira}>₦</Text>

                <TextInput
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="Enter amount"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  style={styles.amountInput}
                />
              </View>

              <Text style={styles.quickLabel}>
                Quick amount
              </Text>

              <View style={styles.quickGrid}>
                {QUICK_AMOUNTS.map((value) => {
                  const selected = numericAmount === value;

                  return (
                    <Pressable
                      key={value}
                      onPress={() => setAmount(String(value))}
                      style={[
                        styles.quickButton,
                        selected && styles.quickButtonSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.quickText,
                          selected && styles.quickTextSelected,
                        ]}
                      >
                        ₦{value.toLocaleString()}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                onPress={handleContinue}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>
                  Continue
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#FFFFFF"
                />
              </Pressable>
            </ScrollView>
          )}

          {/* ===============================================
              CHECKOUT
          =============================================== */}

          {step === "checkout" && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.content}
            >
              <View style={styles.purchaseCard}>
                <View style={styles.purchaseHeader}>
                  <View
                    style={[
                      styles.networkMiniLogo,
                      {
                        backgroundColor:
                          selectedNetwork?.color || BRAND_COLOR,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.networkMiniText,
                        {
                          color:
                            selectedNetwork?.textColor ||
                            "#FFFFFF",
                        },
                      ]}
                    >
                      {selectedNetwork?.short?.charAt(0)}
                    </Text>
                  </View>

                  <View style={styles.purchaseInfo}>
                    <Text style={styles.purchaseNetwork}>
                      {selectedNetwork?.name}
                    </Text>

                    <Text style={styles.purchasePhone}>
                      {normalizePhoneNumber(phoneNumber)}
                    </Text>
                  </View>

                  <Text style={styles.purchaseAmount}>
                    ₦{formattedAmount}
                  </Text>
                </View>

                <View style={styles.divider} />

                <InfoRow label="Service" value="Airtime" />

                <InfoRow
                  label="Network"
                  value={selectedNetwork?.name}
                />

                <InfoRow
                  label="Recipient"
                  value={normalizePhoneNumber(phoneNumber)}
                />

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>
                    Total
                  </Text>

                  <Text style={styles.totalValue}>
                    ₦{formattedAmount}
                  </Text>
                </View>
              </View>

              <View style={styles.walletNotice}>
                <View style={styles.walletNoticeIcon}>
                  <Ionicons
                    name="wallet-outline"
                    size={20}
                    color={BRAND_COLOR}
                  />
                </View>

                <View style={styles.walletNoticeText}>
                  <Text style={styles.walletNoticeTitle}>
                    Pay from Wallet
                  </Text>

                  <Text style={styles.walletNoticeSubtitle}>
                    Your eVault wallet will be debited after PIN authorization.
                  </Text>
                </View>
              </View>

              <View style={styles.noteBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color="#64748B"
                  style={{ marginRight: 7 }}
                />

                <Text style={styles.noteText}>
                  Please confirm the recipient number and network.
                  Airtime purchases cannot be recalled after completion.
                </Text>
              </View>

              <Pressable
                onPress={handleGoToPin}
                style={styles.primaryButton}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />

                <Text style={styles.primaryButtonText}>
                  Continue to Payment
                </Text>
              </Pressable>
            </ScrollView>
          )}

          {/* ===============================================
              TRANSACTION PIN
          =============================================== */}

          {step === "pin" && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.pinContainer}
            >
              <View style={styles.pinIconWrapper}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={42}
                  color={BRAND_COLOR}
                />
              </View>

              <Text style={styles.pinTitle}>
                Authorize Payment
              </Text>

              <Text style={styles.pinSubtitle}>
                Enter your 4-digit transaction PIN to authorize
                this airtime purchase.
              </Text>

              <View style={styles.pinAmountCard}>
                <Text style={styles.pinAmountLabel}>
                  You're paying
                </Text>

                <Text style={styles.pinAmountValue}>
                  ₦{formattedAmount}
                </Text>

                <Text style={styles.pinRecipient}>
                  {networkName} •{" "}
                  {normalizePhoneNumber(phoneNumber)}
                </Text>
              </View>

              <Pressable
                onPress={() => pinInputRef.current?.focus()}
                style={[
                  styles.pinBox,
                  transactionPin.length === 4 &&
                    styles.pinBoxComplete,
                ]}
              >
                <View style={styles.pinIcon}>
                  <Ionicons
                    name="lock-closed"
                    size={19}
                    color="#475569"
                  />
                </View>

                <View style={styles.pinDots}>
                  {pinDots.map((filled, index) => (
                    <View
                      key={index}
                      style={[
                        styles.pinDot,
                        filled && styles.pinDotFilled,
                      ]}
                    />
                  ))}
                </View>
              </Pressable>

              <TextInput
                ref={pinInputRef}
                value={transactionPin}
                onChangeText={handlePinChange}
                keyboardType="number-pad"
                secureTextEntry={!showPin}
                maxLength={4}
                autoFocus
                style={styles.hiddenPinInput}
                accessibilityLabel="Four digit transaction PIN"
              />

              <Pressable
                onPress={() =>
                  setShowPin((current) => !current)
                }
                style={styles.showPinButton}
              >
                <Ionicons
                  name={
                    showPin
                      ? "eye-off-outline"
                      : "eye-outline"
                  }
                  size={18}
                  color="#64748B"
                />

                <Text style={styles.showPinText}>
                  {showPin ? "Hide PIN" : "Show PIN"}
                </Text>
              </Pressable>

              <Text style={styles.pinHint}>
                Your PIN is securely verified by eVault.
              </Text>

              <Pressable
                style={[
                  styles.primaryButton,
                  (
                    transactionPin.length !== 4 ||
                    loading
                  ) && styles.disabledButton,
                ]}
                disabled={
                  transactionPin.length !== 4 ||
                  loading
                }
                onPress={handleConfirm}
              >
                {loading ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" />

                    <Text
                      style={[
                        styles.primaryButtonText,
                        { marginLeft: 9 },
                      ]}
                    >
                      Processing...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={19}
                      color="#FFFFFF"
                      style={{ marginRight: 8 }}
                    />

                    <Text style={styles.primaryButtonText}>
                      Authorize Payment
                    </Text>
                  </>
                )}
              </Pressable>
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </Modal>

      {/* ===================================================
          SEPARATE RECEIPT MODAL

          IMPORTANT:
          This component must be outside the airtime Modal.
          It also needs its own visible prop.
      =================================================== */}

      <TransactionReceipt
        visible={Boolean(visible && step === "success")}
        type="AIRTIME"
        title="Airtime Purchase Successful"
        subtitle={`₦${numericAmount.toLocaleString(
          "en-NG"
        )} airtime has been sent successfully.`}
        amount={receiptAmount}
        network={receiptNetwork}
        recipient={receiptRecipient}
        service="Airtime"
        reference={receiptReference}
        status={receiptStatus}
        date={receiptDate}
        onDone={handleClose}
        onClose={handleClose}
      />
    </>
  );
}

// =========================================================
// REUSABLE CHECKOUT ROW
// =========================================================

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={styles.infoValue}>
        {String(value ?? "")}
      </Text>
    </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 45,
  },

  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BRAND_COLOR,
    borderRadius: 20,
    padding: 18,
    marginBottom: 22,
  },

  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  heroText: {
    flex: 1,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  heroSubtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    marginTop: 4,
  },

  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 9,
    marginTop: 5,
  },

  networkGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  networkCard: {
    width: "23.5%",
    minHeight: 91,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    position: "relative",
  },

  networkCardSelected: {
    borderColor: BRAND_COLOR,
    backgroundColor: "#F0F4FF",
    borderWidth: 2,
  },

  networkLogo: {
    width: 39,
    height: 39,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },

  networkLogoText: {
    fontSize: 14,
    fontWeight: "900",
  },

  networkName: {
    fontSize: 10,
    fontWeight: "700",
    color: "#334155",
  },

  networkCheck: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: BRAND_COLOR,
    justifyContent: "center",
    alignItems: "center",
  },

  inputBox: {
    height: 55,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 14,
  },

  input: {
    flex: 1,
    paddingHorizontal: 11,
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },

  amountBox: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 15,
  },

  naira: {
    fontSize: 25,
    fontWeight: "900",
    color: BRAND_COLOR,
    marginLeft: 17,
  },

  amountInput: {
    flex: 1,
    paddingHorizontal: 11,
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
  },

  quickLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    marginTop: 16,
    marginBottom: 9,
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  quickButton: {
    width: "31.5%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
    marginBottom: 9,
  },

  quickButtonSelected: {
    backgroundColor: BRAND_COLOR,
    borderColor: BRAND_COLOR,
  },

  quickText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },

  quickTextSelected: {
    color: "#FFFFFF",
  },

  primaryButton: {
    minHeight: 56,
    borderRadius: 15,
    backgroundColor: BRAND_COLOR,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 25,
    elevation: 3,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.55,
  },

  purchaseCard: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 18,
  },

  purchaseHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  networkMiniLogo: {
    width: 48,
    height: 48,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  networkMiniText: {
    fontSize: 16,
    fontWeight: "900",
  },

  purchaseInfo: {
    flex: 1,
  },

  purchaseNetwork: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  purchasePhone: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
  },

  purchaseAmount: {
    fontSize: 16,
    fontWeight: "900",
    color: BRAND_COLOR,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
  },

  infoLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },

  infoValue: {
    maxWidth: "60%",
    textAlign: "right",
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "700",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 9,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  totalLabel: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "700",
  },

  totalValue: {
    fontSize: 20,
    color: "#0F172A",
    fontWeight: "900",
  },

  walletNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    borderWidth: 1,
    borderColor: "#DCE6FF",
    borderRadius: 15,
    padding: 14,
    marginTop: 17,
  },

  walletNoticeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
  },

  walletNoticeText: {
    flex: 1,
  },

  walletNoticeTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
  },

  walletNoticeSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
    marginTop: 3,
  },

  noteBox: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 13,
    padding: 13,
    marginTop: 14,
    alignItems: "flex-start",
  },

  noteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
    color: "#64748B",
  },

  pinContainer: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 34,
    paddingBottom: 45,
  },

  pinIconWrapper: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  pinTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },

  pinSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 18,
    marginBottom: 22,
  },

  pinAmountCard: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    paddingVertical: 19,
    alignItems: "center",
    marginBottom: 18,
  },

  pinAmountLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },

  pinAmountValue: {
    fontSize: 28,
    color: "#0F172A",
    fontWeight: "900",
    marginTop: 4,
  },

  pinRecipient: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginTop: 6,
  },

  pinBox: {
    width: "100%",
    height: 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 15,
  },

  pinBoxComplete: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
  },

  pinIcon: {
    position: "absolute",
    left: 17,
  },

  pinDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  pinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#94A3B8",
    backgroundColor: "transparent",
  },

  pinDotFilled: {
    backgroundColor: BRAND_COLOR,
    borderColor: BRAND_COLOR,
  },

  hiddenPinInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },

  showPinButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 6,
  },

  showPinText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },

  pinHint: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 5,
  },
});
