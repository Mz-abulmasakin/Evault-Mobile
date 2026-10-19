// components/NinValidationModal.js

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useNin from "../hooks/useNin";

const BRAND_BLUE = "#2A5FD3";

const PACKAGES = {
  basic: {
    name: "Basic Slip",
    description: "Basic NIN validation result.",
    price: 1200,
  },
  regular: {
    name: "Regular Slip",
    description:
      "Standard validation result for everyday identity validation.",
    price: 1200,
  },
  standard: {
    name: "Standard Slip",
    description: "More detailed NIN validation document.",
    price: 1200,
  },
  premium: {
    name: "Premium Slip",
    description: "Premium NIN validation document.",
    price: 1200,
  },
};

function formatMoney(amount) {
  return `₦${Number(amount || 0).toLocaleString()}`;
}

function statusText(status) {
  const value = String(status || "").toUpperCase();

  if (value === "SUCCESS") {
    return "Validation completed";
  }

  if (value === "FAILED") {
    return "Validation failed";
  }

  if (value === "PROCESSING") {
    return "Processing validation...";
  }

  return "Submitting validation...";
}

export default function NinVerificationModal({
  visible,
  onClose,
  onSuccess,
}) {
  const {
    service,
    request,
    loading,
    servicesLoading,
    error,
    loadServices,
    submitNin,
    checkStatus,
    startPolling,
    getDownload,
    reset,
  } = useNin();

  const [nin, setNin] = useState("");
  const [transactionPin, setTransactionPin] = useState("");
  const [slipType, setSlipType] = useState("regular");
  const [ownershipConfirmed, setOwnershipConfirmed] =
    useState(false);
  const [step, setStep] = useState("form");
  const [localError, setLocalError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const selectedPackage = useMemo(
    () => PACKAGES[slipType] || PACKAGES.regular,
    [slipType]
  );

  const price = Number(
    service?.price ||
      selectedPackage.price ||
      1200
  );

  useEffect(() => {
    if (!visible) {
      return;
    }

    loadServices().catch(() => {});
  }, [visible, loadServices]);

  const resetModal = useCallback(() => {
    setNin("");
    setTransactionPin("");
    setSlipType("regular");
    setOwnershipConfirmed(false);
    setStep("form");
    setLocalError("");
    setDownloading(false);
    reset();
  }, [reset]);

  const handleClose = useCallback(() => {
    if (loading) {
      return;
    }

    resetModal();
    onClose?.();
  }, [loading, resetModal, onClose]);

  const handleSubmit = async () => {
    const cleanNin = nin.replace(/\D/g, "");

    setLocalError("");

    if (cleanNin.length !== 11) {
      Alert.alert(
        "Invalid NIN",
        "Please enter your 11-digit NIN."
      );

      return;
    }

    if (!/^\d{4}$/.test(transactionPin)) {
      Alert.alert(
        "Invalid Transaction PIN",
        "Your transaction PIN must contain exactly 4 digits."
      );

      return;
    }

    if (!ownershipConfirmed) {
      Alert.alert(
        "Confirmation required",
        "Please confirm that you own the NIN being validated."
      );

      return;
    }

    setStep("processing");

    try {
      const result = await submitNin({
        nin: cleanNin,
        validationType: "full",
        slipType,
        transactionPin,
        ownershipConfirmed: true,
      });

      const status = String(
        result?.status || ""
      ).toUpperCase();

      if (status === "SUCCESS") {
        setStep("success");
        onSuccess?.(result);
        return;
      }

      if (status === "FAILED") {
        setStep("failed");
        return;
      }

      setStep("processing");

      if (result?.id) {
        startPolling(result.id);
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        error ||
        "NIN validation failed.";

      setLocalError(message);
      setStep("failed");
    }
  };

  useEffect(() => {
    if (!request) {
      return;
    }

    const status = String(
      request.status || ""
    ).toUpperCase();

    if (status === "SUCCESS") {
      setStep("success");
      onSuccess?.(request);
    }

    if (status === "FAILED") {
      setStep("failed");
    }
  }, [request, onSuccess]);

  const handleCheckStatus = async () => {
    if (!request?.id) {
      return;
    }

    try {
      const result = await checkStatus(request.id);

      const status = String(
        result?.status || ""
      ).toUpperCase();

      if (status === "SUCCESS") {
        setStep("success");
      } else if (status === "FAILED") {
        setStep("failed");
      }
    } catch (err) {
      Alert.alert(
        "Status check failed",
        err?.message ||
          "Unable to check validation status."
      );
    }
  };

  const handleDownload = async () => {
    if (!request?.id) {
      return;
    }

    setDownloading(true);

    try {
      const result = await getDownload(request.id);

      const url =
        result?.documentUrl ||
        result?.document_url;

      if (!url) {
        throw new Error(
          "The NIN document is not available yet."
        );
      }

      await Linking.openURL(url);
    } catch (err) {
      Alert.alert(
        "Document unavailable",
        err?.message ||
          "Unable to open the NIN document."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={25}
                  color={BRAND_BLUE}
                />
              </View>

              <View style={styles.headerText}>
                <Text style={styles.brandEyebrow}>
                  EVAULT  •  IDENTITY SERVICES
                </Text>

                <Text style={styles.title}>
                  NIN Validation
                </Text>

                <Text style={styles.subtitle}>
                  Validate your NIN and obtain your
                  validation document securely.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleClose}
              disabled={loading}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close NIN validation"
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {step === "form" && (
              <>
                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>
                    NIN Validation
                  </Text>

                  <Text style={styles.infoText}>
                    Your NIN is securely submitted
                    through Evault to the validation
                    provider. Your provider credentials
                    are never exposed to the app.
                  </Text>

                  <Text style={styles.priceText}>
                    Validation fee:{" "}
                    {formatMoney(price)}
                  </Text>
                </View>

                <Text style={styles.label}>
                  NIN
                </Text>

                <TextInput
                  value={nin}
                  onChangeText={(value) =>
                    setNin(
                      value
                        .replace(/\D/g, "")
                        .slice(0, 11)
                    )
                  }
                  keyboardType="number-pad"
                  maxLength={11}
                  placeholder="Enter your 11-digit NIN"
                  placeholderTextColor="#8795AA"
                  style={styles.input}
                />

                <Text style={styles.counter}>
                  {nin.length}/11
                </Text>

                <Text style={styles.label}>
                  Choose validation slip
                </Text>

                <View style={styles.packageList}>
                  {Object.entries(PACKAGES).map(
                    ([key, item]) => {
                      const selected =
                        slipType === key;

                      return (
                        <Pressable
                          key={key}
                          onPress={() =>
                            setSlipType(key)
                          }
                          style={[
                            styles.package,
                            selected &&
                              styles.packageSelected,
                          ]}
                        >
                          <View
                            style={[
                              styles.radio,
                              selected &&
                                styles.radioSelected,
                            ]}
                          >
                            {selected && (
                              <View
                                style={styles.radioInner}
                              />
                            )}
                          </View>

                          <View style={styles.packageBody}>
                            <View style={styles.packageTop}>
                              <Text
                                style={styles.packageName}
                              >
                                {item.name}
                              </Text>

                              <Text
                                style={styles.packagePrice}
                              >
                                {formatMoney(price)}
                              </Text>
                            </View>

                            <Text
                              style={styles.packageDescription}
                            >
                              {item.description}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    }
                  )}
                </View>

                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedTitle}>
                    Selected: {selectedPackage.name}
                  </Text>

                  <Text
                    style={styles.selectedDescription}
                  >
                    {selectedPackage.description}
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    setOwnershipConfirmed(
                      (value) => !value
                    )
                  }
                  style={styles.checkboxRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      ownershipConfirmed &&
                        styles.checkboxSelected,
                    ]}
                  >
                    {ownershipConfirmed && (
                      <Text style={styles.checkmark}>
                        ✓
                      </Text>
                    )}
                  </View>

                  <Text style={styles.checkboxText}>
                    I confirm that this NIN belongs
                    to me and I am authorized to
                    request its validation.
                  </Text>
                </Pressable>

                <Text style={styles.label}>
                  Transaction PIN
                </Text>

                <TextInput
                  value={transactionPin}
                  onChangeText={(value) =>
                    setTransactionPin(
                      value
                        .replace(/\D/g, "")
                        .slice(0, 4)
                    )
                  }
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                  placeholder="4-digit transaction PIN"
                  placeholderTextColor="#8795AA"
                  style={styles.input}
                />

                {(localError || error) && (
                  <View style={styles.errorBox}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={19}
                      color="#B42335"
                    />

                    <Text style={styles.errorText}>
                      {localError || error}
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={handleSubmit}
                  disabled={loading || servicesLoading}
                  style={[
                    styles.primaryButton,
                    (loading || servicesLoading) &&
                      styles.disabledButton,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={19}
                        color="#FFFFFF"
                      />

                      <Text style={styles.primaryButtonText}>
                        Validate NIN — {formatMoney(price)}
                      </Text>
                    </>
                  )}
                </Pressable>

                <Text style={styles.secureNote}>
                  <Ionicons
                    name="lock-closed"
                    size={12}
                    color="#607795"
                  />{" "}
                  Your identity request is securely processed.
                </Text>
              </>
            )}

            {step === "processing" && (
              <View style={styles.centerState}>
                <View style={styles.processingCircle}>
                  <ActivityIndicator
                    size="large"
                    color={BRAND_BLUE}
                  />
                </View>

                <Text style={styles.stateTitle}>
                  Validation in progress
                </Text>

                <Text style={styles.stateText}>
                  We have received your request.
                  The provider may take a little
                  time to complete the validation.
                </Text>

                {request?.provider_status && (
                  <Text style={styles.providerStatus}>
                    Provider status:{" "}
                    {request.provider_status}
                  </Text>
                )}

                <Pressable
                  onPress={handleCheckStatus}
                  style={styles.secondaryButton}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={18}
                    color={BRAND_BLUE}
                  />

                  <Text style={styles.secondaryButtonText}>
                    Check Status
                  </Text>
                </Pressable>
              </View>
            )}

            {step === "success" && (
              <View style={styles.centerState}>
                <View style={styles.successCircle}>
                  <Text style={styles.successIcon}>
                    ✓
                  </Text>
                </View>

                <Text style={styles.stateTitle}>
                  NIN Validated Successfully
                </Text>

                <Text style={styles.stateText}>
                  Your NIN validation has been
                  completed successfully.
                </Text>

                {request?.provider_reference && (
                  <Text style={styles.reference}>
                    Reference:{" "}
                    {request.provider_reference}
                  </Text>
                )}

                {request?.document_url ? (
                  <Pressable
                    onPress={handleDownload}
                    disabled={downloading}
                    style={styles.primaryButton}
                  >
                    {downloading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons
                          name="download-outline"
                          size={20}
                          color="#FFFFFF"
                        />

                        <Text style={styles.primaryButtonText}>
                          Open Validation Document
                        </Text>
                      </>
                    )}
                  </Pressable>
                ) : (
                  <Text style={styles.stateText}>
                    Your validation is complete.
                    The document is being prepared.
                  </Text>
                )}

                <Pressable
                  onPress={handleClose}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>
                    Done
                  </Text>
                </Pressable>
              </View>
            )}

            {step === "failed" && (
              <View style={styles.centerState}>
                <View style={styles.failedCircle}>
                  <Ionicons
                    name="close"
                    size={38}
                    color="#B42335"
                  />
                </View>

                <Text style={styles.stateTitle}>
                  Validation Failed
                </Text>

                <Text style={styles.stateText}>
                  {request?.error_message ||
                    localError ||
                    error ||
                    "The NIN validation could not be completed."}
                </Text>

                <View style={styles.refundInfo}>
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color={BRAND_BLUE}
                  />

                  <Text style={styles.refundText}>
                    If the provider failed after your
                    wallet was charged, Evault will
                    automatically refund the validation
                    fee.
                  </Text>
                </View>

                <Pressable
                  onPress={resetModal}
                  style={styles.primaryButton}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text style={styles.primaryButtonText}>
                    Try Again
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleClose}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>
                    Close
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.60)",
    justifyContent: "flex-end",
  },

  modal: {
    maxHeight: "94%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    shadowColor: "#102A56",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 15,
  },

  header: {
    backgroundColor: BRAND_BLUE,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },

  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  brandEyebrow: {
    color: "#DCE8FF",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.05,
    marginBottom: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 12,
    color: "#E7EEFF",
    maxWidth: 290,
    lineHeight: 18,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 1,
  },

  closeText: {
    fontSize: 27,
    lineHeight: 30,
    color: BRAND_BLUE,
    fontWeight: "500",
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    backgroundColor: "#F7F9FE",
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE7FA",
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#23477D",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  infoTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#142B50",
  },

  infoText: {
    marginTop: 7,
    color: "#5F6F86",
    fontSize: 13,
    lineHeight: 20,
  },

  priceText: {
    marginTop: 14,
    fontWeight: "800",
    fontSize: 15,
    color: BRAND_BLUE,
  },

  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1A2F50",
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: "#D2DFF2",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "500",
    color: "#12213A",
    backgroundColor: "#FFFFFF",
  },

  counter: {
    textAlign: "right",
    marginTop: 6,
    fontSize: 11,
    color: "#7B8BA3",
  },

  packageList: {
    marginTop: 5,
  },

  package: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#DFE7F3",
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
  },

  packageSelected: {
    borderColor: BRAND_BLUE,
    backgroundColor: "#EEF4FF",
    shadowColor: BRAND_BLUE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },

  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#A7B7CD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },

  radioSelected: {
    borderColor: BRAND_BLUE,
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: BRAND_BLUE,
  },

  packageBody: {
    flex: 1,
  },

  packageTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  packageName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: "#142B50",
    marginRight: 8,
  },

  packagePrice: {
    fontSize: 14,
    fontWeight: "800",
    color: BRAND_BLUE,
  },

  packageDescription: {
    marginTop: 6,
    color: "#687991",
    fontSize: 12,
    lineHeight: 18,
  },

  selectedInfo: {
    backgroundColor: "#EDF4FF",
    borderWidth: 1,
    borderColor: "#D9E6FF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },

  selectedTitle: {
    fontWeight: "800",
    fontSize: 13,
    color: "#173765",
  },

  selectedDescription: {
    marginTop: 5,
    fontSize: 12,
    color: "#526987",
    lineHeight: 18,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
    marginBottom: 12,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#A7B7CD",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  checkboxSelected: {
    backgroundColor: BRAND_BLUE,
    borderColor: BRAND_BLUE,
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  checkboxText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    color: "#53647C",
  },

  primaryButton: {
    minHeight: 54,
    borderRadius: 15,
    backgroundColor: BRAND_BLUE,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    marginTop: 16,
    shadowColor: BRAND_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },

  disabledButton: {
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  secondaryButton: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C8D8F5",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    marginTop: 12,
  },

  secondaryButtonText: {
    color: BRAND_BLUE,
    fontSize: 14,
    fontWeight: "800",
  },

  errorBox: {
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    borderRadius: 12,
    padding: 13,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  errorText: {
    flex: 1,
    color: "#B42335",
    fontSize: 13,
    lineHeight: 19,
  },

  secureNote: {
    textAlign: "center",
    color: "#607795",
    fontSize: 11,
    lineHeight: 18,
    marginTop: 14,
    marginBottom: 6,
  },

  centerState: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 42,
  },

  stateTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#13294B",
    textAlign: "center",
    marginTop: 20,
  },

  stateText: {
    fontSize: 14,
    color: "#5E6F87",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
  },

  providerStatus: {
    marginTop: 14,
    fontSize: 12,
    color: "#71819A",
  },

  processingCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#D9E6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  successCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },

  successIcon: {
    color: "#FFFFFF",
    fontSize: 40,
    fontWeight: "800",
  },

  failedCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    justifyContent: "center",
    alignItems: "center",
  },

  refundInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#D9E6FF",
    borderRadius: 14,
    padding: 13,
    marginTop: 18,
  },

  failedIcon: {
    color: "#B42335",
    fontSize: 40,
    fontWeight: "800",
  },

  reference: {
    marginTop: 15,
    fontSize: 12,
    color: "#687991",
    textAlign: "center",
  },

  refundText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 19,
    color: "#526987",
  },
});