// src/components/NinRecoveryModal.js

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
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

import { useNin } from "../hooks/useNin";

// ============================================================
// HELPERS
// ============================================================

function getRequestId(data) {
  if (!data || typeof data !== "object") {
    return null;
  }

  return (
    data.requestId ??
    data.request_id ??
    data.id ??
    data.request?.requestId ??
    data.request?.request_id ??
    data.request?.id ??
    data.result?.requestId ??
    data.result?.request_id ??
    data.result?.id ??
    data.data?.requestId ??
    data.data?.request_id ??
    data.data?.id ??
    null
  );
}

function getStatus(data) {
  if (!data || typeof data !== "object") {
    return null;
  }

  return (
    data.status ??
    data.requestStatus ??
    data.request_status ??
    data.result?.status ??
    data.request?.status ??
    data.data?.status ??
    null
  );
}

function getErrorMessage(error) {
  if (!error) {
    return "Something went wrong.";
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong."
  );
}

function normalizePhone(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .trim();
}

function hasPdf(data) {
  if (!data || typeof data !== "object") {
    return false;
  }

  const pdfBase64 =
    data.pdf_base64 ??
    data.pdfBase64 ??
    data.result?.pdf_base64 ??
    data.result?.pdfBase64 ??
    data.request?.pdf_base64 ??
    data.request?.pdfBase64 ??
    data.data?.pdf_base64 ??
    data.data?.pdfBase64 ??
    null;

  const hasPdfValue =
    data.has_pdf ??
    data.hasPdf ??
    data.result?.has_pdf ??
    data.result?.hasPdf ??
    data.request?.has_pdf ??
    data.request?.hasPdf ??
    data.data?.has_pdf ??
    data.data?.hasPdf ??
    false;

  if (hasPdfValue === true) {
    return true;
  }

  if (
    typeof pdfBase64 === "string" &&
    pdfBase64.trim().length > 0
  ) {
    return true;
  }

  return false;
}

// ============================================================
// COMPONENT
// ============================================================

export default function NinRecoveryModal({
  visible,
  onClose,
  onSuccess,
}) {
  const {
    request,
    loading,
    downloading,
    recoverNinByPhone,
    checkStatus,
    downloadNin,
    reset,
  } = useNin();

  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [phone, setPhone] = useState("");
  const [transactionPin, setTransactionPin] =
    useState("");

  const [cardType, setCardType] =
    useState("standard");

  // ==========================================================
  // SCREEN STATE
  // ==========================================================

  const [step, setStep] =
    useState("form");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [recoveryResult, setRecoveryResult] =
    useState(null);

  // ==========================================================
  // RESET MODAL
  // ==========================================================

  const resetModal = useCallback(() => {
    setPhone("");
    setTransactionPin("");
    setCardType("standard");
    setStep("form");
    setErrorMessage("");
    setRecoveryResult(null);

    reset();
  }, [reset]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setStep("form");
    setErrorMessage("");
    setRecoveryResult(null);
  }, [visible]);

  // ==========================================================
  // CLOSE
  // ==========================================================

  const handleClose = useCallback(() => {
    if (loading || downloading) {
      return;
    }

    resetModal();

    if (onClose) {
      onClose();
    }
  }, [
    loading,
    downloading,
    resetModal,
    onClose,
  ]);

  // ==========================================================
  // SUCCESS NOTIFICATION
  // ==========================================================

  const notifySuccess = useCallback(
    (result) => {
      setRecoveryResult(result);
      setStep("success");
      setErrorMessage("");

      try {
        if (onSuccess) {
          onSuccess(result);
        }
      } catch (callbackError) {
        console.warn(
          "[NinRecoveryModal] onSuccess callback error:",
          callbackError
        );
      }
    },
    [onSuccess]
  );

  // ==========================================================
  // SUBMIT RECOVERY
  // ==========================================================

  const submit = useCallback(
    async () => {
      setErrorMessage("");

      const cleanPhone =
        normalizePhone(phone);

      if (!cleanPhone) {
        setErrorMessage(
          "Please enter your phone number."
        );
        return;
      }

      if (cleanPhone.length < 10) {
        setErrorMessage(
          "Please enter a valid phone number."
        );
        return;
      }

      if (!transactionPin) {
        setErrorMessage(
          "Please enter your transaction PIN."
        );
        return;
      }

      if (
        !/^\d{4}$/.test(
          String(transactionPin)
        )
      ) {
        setErrorMessage(
          "Transaction PIN must be 4 digits."
        );
        return;
      }

      try {
        setStep("processing");

        console.log(
          "[NinRecoveryModal] Starting NIN phone recovery:",
          {
            phone: cleanPhone,
            cardType,
          }
        );

        const result =
          await recoverNinByPhone({
            phone: cleanPhone,
            cardType,
            card_type: cardType,
            transactionPin,
            transaction_pin: transactionPin,
          });

        console.log(
          "[NinRecoveryModal] Recovery result:",
          result
        );

        const status =
          getStatus(result);

        console.log(
          "[NinRecoveryModal] Recovery status:",
          status
        );

        if (
          status &&
          [
            "FAILED",
            "FAIL",
            "failed",
            "failure",
            "FAILED_REQUEST",
          ].includes(status)
        ) {
          throw new Error(
            getErrorMessage(result)
          );
        }

        notifySuccess(result);
      } catch (error) {
        console.error(
          "[NinRecoveryModal] Recovery error:",
          error
        );

        setStep("form");

        setErrorMessage(
          getErrorMessage(error)
        );
      }
    },
    [
      phone,
      transactionPin,
      cardType,
      recoverNinByPhone,
      notifySuccess,
    ]
  );

  // ==========================================================
  // GET CURRENT REQUEST ID
  // ==========================================================

  const currentRequestId = useMemo(() => {
    return getRequestId(
      recoveryResult || request
    );
  }, [
    recoveryResult,
    request,
  ]);

  // ==========================================================
  // CHECK STATUS
  // ==========================================================

  const check = useCallback(
    async () => {
      setErrorMessage("");

      const requestId =
        getRequestId(
          recoveryResult || request
        );

      if (!requestId) {
        setErrorMessage(
          "NIN request ID is not available yet."
        );
        return;
      }

      try {
        console.log(
          "[NinRecoveryModal] Checking NIN request:",
          requestId
        );

        const result =
          await checkStatus(
            requestId
          );

        console.log(
          "[NinRecoveryModal] Status result:",
          result
        );

        setRecoveryResult(result);

        const status =
          getStatus(result);

        if (
          status &&
          [
            "SUCCESS",
            "successful",
            "success",
            "COMPLETED",
            "completed",
          ].includes(status)
        ) {
          notifySuccess(result);
          return;
        }

        if (
          status &&
          [
            "FAILED",
            "failed",
            "FAIL",
            "failure",
          ].includes(status)
        ) {
          setErrorMessage(
            getErrorMessage(result)
          );
          setStep("form");
          return;
        }

        setStep("processing");
      } catch (error) {
        console.error(
          "[NinRecoveryModal] Status check error:",
          error
        );

        setErrorMessage(
          getErrorMessage(error)
        );
      }
    },
    [
      recoveryResult,
      request,
      checkStatus,
      notifySuccess,
    ]
  );

  // ==========================================================
  // DOWNLOAD NIN SLIP
  // ==========================================================

  const handleDownload = useCallback(
    async () => {
      setErrorMessage("");

      const result =
        recoveryResult || request;

      const requestId =
        getRequestId(result);

      if (!requestId) {
        Alert.alert(
          "Download unavailable",
          "The NIN request ID is not available. Please try checking the status again."
        );
        return;
      }

      if (!hasPdf(result)) {
        Alert.alert(
          "No PDF attached",
          "There is no NIN PDF slip attached to this recovery request."
        );
        return;
      }

      try {
        console.log(
          "[NinRecoveryModal] Downloading NIN slip:",
          requestId
        );

        await downloadNin(
          requestId
        );
      } catch (error) {
        console.error(
          "[NinRecoveryModal] Download error:",
          error
        );

        Alert.alert(
          "Download failed",
          getErrorMessage(error)
        );
      }
    },
    [
      recoveryResult,
      request,
      downloadNin,
    ]
  );

  // ==========================================================
  // SUCCESS PDF STATE
  // ==========================================================

  const successHasPdf =
    hasPdf(
      recoveryResult || request
    );

  // ==========================================================
  // RENDER FORM
  // ==========================================================

  const renderForm = () => {
    return (
      <View style={styles.content}>
        <Text style={styles.title}>
          Recover NIN
        </Text>

        <Text style={styles.subtitle}>
          Recover your NIN using the phone number
          registered with your NIN.
        </Text>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        <Text style={styles.label}>
          Phone Number
        </Text>

        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
          autoCapitalize="none"
          style={styles.input}
          editable={!loading}
        />

        <Text style={styles.label}>
          Transaction PIN
        </Text>

        <TextInput
          value={transactionPin}
          onChangeText={setTransactionPin}
          placeholder="Enter 4-digit PIN"
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
          style={styles.input}
          editable={!loading}
        />

        <Text style={styles.label}>
          NIN Slip Type
        </Text>

        <View style={styles.cardTypeRow}>
          <Pressable
            onPress={() =>
              setCardType("standard")
            }
            style={[
              styles.cardTypeButton,
              cardType === "standard" &&
                styles.cardTypeButtonActive,
            ]}
            disabled={loading}
          >
            <Text
              style={[
                styles.cardTypeText,
                cardType === "standard" &&
                  styles.cardTypeTextActive,
              ]}
            >
              Standard
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setCardType("regular")
            }
            style={[
              styles.cardTypeButton,
              cardType === "regular" &&
                styles.cardTypeButtonActive,
            ]}
            disabled={loading}
          >
            <Text
              style={[
                styles.cardTypeText,
                cardType === "regular" &&
                  styles.cardTypeTextActive,
              ]}
            >
              Regular
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setCardType("premium")
            }
            style={[
              styles.cardTypeButton,
              cardType === "premium" &&
                styles.cardTypeButtonActive,
            ]}
            disabled={loading}
          >
            <Text
              style={[
                styles.cardTypeText,
                cardType === "premium" &&
                  styles.cardTypeTextActive,
              ]}
            >
              Premium
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={submit}
          style={[
            styles.primaryButton,
            loading &&
              styles.disabledButton,
          ]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text style={styles.primaryButtonText}>
              Recover NIN
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleClose}
          style={styles.cancelButton}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>
            Cancel
          </Text>
        </Pressable>
      </View>
    );
  };

  // ==========================================================
  // RENDER PROCESSING
  // ==========================================================

  const renderProcessing = () => {
    return (
      <View style={styles.content}>
        <View style={styles.loadingCircle}>
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />
        </View>

        <Text style={styles.title}>
          Recovery Submitted
        </Text>

        <Text style={styles.subtitle}>
          Your NIN recovery request has been
          submitted. You can check the current
          status below.
        </Text>

        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {currentRequestId ? (
          <Text style={styles.requestIdText}>
            Request ID: {currentRequestId}
          </Text>
        ) : null}

        <Pressable
          onPress={check}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            Check Status
          </Text>
        </Pressable>

        <Pressable
          onPress={handleClose}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelButtonText}>
            Close
          </Text>
        </Pressable>
      </View>
    );
  };

  // ==========================================================
  // RENDER SUCCESS
  // ==========================================================

  const renderSuccess = () => {
    return (
      <View style={styles.content}>
        <View style={styles.successCircle}>
          <Text style={styles.successIcon}>
            ✓
          </Text>
        </View>

        <Text style={styles.title}>
          NIN Recovery Successful
        </Text>

        <Text style={styles.subtitle}>
          Your NIN has been successfully recovered.
        </Text>

        {recoveryResult?.nin_number ? (
          <View style={styles.ninBox}>
            <Text style={styles.ninLabel}>
              NIN
            </Text>

            <Text style={styles.ninValue}>
              {recoveryResult.nin_number}
            </Text>
          </View>
        ) : null}

        {successHasPdf ? (
          <Pressable
            onPress={handleDownload}
            style={[
              styles.downloadButton,
              downloading &&
                styles.disabledButton,
            ]}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator
                color="#FFFFFF"
              />
            ) : (
              <Text
                style={styles.downloadButtonText}
              >
                Download NIN Slip
              </Text>
            )}
          </Pressable>
        ) : (
          <View style={styles.noPdfBox}>
            <Text style={styles.noPdfText}>
              No PDF attached
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleClose}
          style={styles.primaryButton}
          disabled={downloading}
        >
          <Text style={styles.primaryButtonText}>
            Done
          </Text>
        </Pressable>
      </View>
    );
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.modalContainer}>
          <ScrollView
            contentContainerStyle={
              styles.scrollContent
            }
            keyboardShouldPersistTaps="handled"
          >
            {step === "form" &&
              renderForm()}

            {step === "processing" &&
              renderProcessing()}

            {step === "success" &&
              renderSuccess()}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============================================================
// BLUE EVAULT STYLE
// ============================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor:
      "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    width: "100%",
    maxHeight: "92%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: "hidden",
  },

  scrollContent: {
    flexGrow: 1,
  },

  content: {
    padding: 24,
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#0F172A",
    marginBottom: 18,
    backgroundColor: "#F8FAFC",
  },

  cardTypeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },

  cardTypeButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
  },

  cardTypeButtonActive: {
    borderColor: "#2563EB",
    backgroundColor: "#2563EB",
  },

  cardTypeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },

  cardTypeTextActive: {
    color: "#FFFFFF",
  },

  primaryButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },

  secondaryButtonText: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "700",
  },

  downloadButton: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  downloadButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  cancelButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },

  cancelButtonText: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "600",
  },

  disabledButton: {
    opacity: 0.55,
  },

  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },

  errorText: {
    color: "#DC2626",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },

  loadingCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    marginBottom: 20,
  },

  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    marginBottom: 20,
  },

  successIcon: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "700",
  },

  requestIdText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 12,
  },

  ninBox: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },

  ninLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 5,
  },

  ninValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1D4ED8",
    letterSpacing: 1,
  },

  noPdfBox: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },

  noPdfText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
});