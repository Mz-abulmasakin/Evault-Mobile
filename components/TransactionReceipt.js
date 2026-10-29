
 // components/TransactionReceipt.js

import React, { useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

const BRAND = "#2A5FD3";

// =========================================================
// FORMAT VALUES
// =========================================================

function formatAmount(value) {
  const amount = Number(value ?? 0);

  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleString("en-NG");
  }

  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// =========================================================
// BROWSER DOWNLOAD HELPER
// =========================================================

function downloadReceiptImage(imageDataUri, fileName) {
  if (
    typeof document === "undefined" ||
    typeof window === "undefined"
  ) {
    throw new Error(
      "The browser download environment is unavailable."
    );
  }

  if (
    typeof imageDataUri !== "string" ||
    !imageDataUri.startsWith("data:image/")
  ) {
    throw new Error(
      "The receipt image could not be generated for download."
    );
  }

  const link = document.createElement("a");

  link.href = imageDataUri;
  link.download = fileName;
  link.style.display = "none";

  document.body.appendChild(link);

  try {
    link.click();
  } finally {
    link.remove();
  }
}

// =========================================================
// RECEIPT COMPONENT
// =========================================================

export default function TransactionReceipt({
  visible = false,
  onClose,
  onDone,
  notification = null,
  transaction = null,

  type = "TRANSACTION",
  title = "Transaction Successful",
  subtitle = "Your transaction has been completed successfully.",

  amount,
  network = "",
  recipient = "",
  service = "",
  dataPlan = "",
  validity = "",
  reference = "",
  status,
  date,
}) {
  const [sharing, setSharing] = useState(false);

  // Capture only the receipt card, not the action buttons.
  const receiptImageRef = useRef(null);

  // =======================================================
  // RECEIPT DATA
  // =======================================================

  const metadata =
    notification?.metadata ||
    notification?.data ||
    transaction?.metadata ||
    transaction?.data ||
    {};

  const receiptAmount =
    amount ??
    transaction?.amount ??
    metadata?.amount ??
    metadata?.price ??
    notification?.amount ??
    0;

  const receiptNetwork =
    network ||
    transaction?.network ||
    transaction?.network_name ||
    metadata?.network ||
    metadata?.network_name ||
    "";

  const receiptRecipient =
    recipient ||
    transaction?.phoneNumber ||
    transaction?.phone_number ||
    metadata?.recipient ||
    metadata?.mobile_number ||
    metadata?.phone_number ||
    metadata?.phone ||
    "";

  const receiptService =
    service ||
    transaction?.service ||
    metadata?.service ||
    "";

  const receiptDataPlan =
    dataPlan ||
    transaction?.planName ||
    transaction?.plan_name ||
    metadata?.dataPlan ||
    metadata?.data_plan ||
    metadata?.bundle ||
    metadata?.plan ||
    "";

  const receiptValidity =
    validity ||
    transaction?.validity ||
    metadata?.validity ||
    "";

  const receiptReference =
    reference ||
    transaction?.reference ||
    transaction?.transactionReference ||
    transaction?.transaction_reference ||
    metadata?.reference ||
    metadata?.transaction_reference ||
    metadata?.transactionReference ||
    notification?.reference ||
    "";

  const receiptStatus =
    status ||
    transaction?.status ||
    metadata?.status ||
    "Completed";

  const receiptDate =
    date ||
    transaction?.created_at ||
    transaction?.createdAt ||
    notification?.created_at ||
    metadata?.created_at ||
    new Date();

  const receiptType =
    type ||
    transaction?.type ||
    metadata?.type ||
    notification?.type ||
    "TRANSACTION";

  const receiptTitle =
    notification?.title || title;

  const receiptSubtitle =
    notification?.description ||
    notification?.message ||
    subtitle;

  // =======================================================
  // SHARE OR DOWNLOAD RECEIPT IMAGE
  // =======================================================

  const handleShareReceipt = async () => {
    if (sharing) {
      return;
    }

    setSharing(true);

    try {
      if (!receiptImageRef.current) {
        throw new Error(
          "The receipt is not ready yet. Please try again."
        );
      }

      const isWeb = Platform.OS === "web";

      // Native platforms use Expo Sharing.
      // Web uses a browser download instead.
      if (!isWeb) {
        const available =
          await Sharing.isAvailableAsync();

        if (!available) {
          throw new Error(
            "Image sharing is unavailable on this device."
          );
        }
      }

      console.log(
        "[EVAULT RECEIPT] Capturing receipt image..."
      );

      const imageUri = await captureRef(
        receiptImageRef,
        {
          format: "png",
          quality: 1,

          // Web must use a data URI.
          // Native platforms use a temporary file.
          result: isWeb ? "data-uri" : "tmpfile",
        }
      );

      if (!imageUri) {
        throw new Error(
          "The receipt image could not be created."
        );
      }

      console.log(
        "[EVAULT RECEIPT] Receipt image created."
      );

      // ---------------------------------------------------
      // WEB: DOWNLOAD PNG DIRECTLY TO THE COMPUTER
      // ---------------------------------------------------

      if (isWeb) {
        const safeReference = String(
          receiptReference || "transaction"
        )
          .replace(/[^a-zA-Z0-9_-]/g, "-")
          .slice(0, 60);

        const fileName =
          `eVault-Receipt-${safeReference}.png`;

        downloadReceiptImage(
          imageUri,
          fileName
        );

        console.log(
          "[EVAULT RECEIPT] Browser download initiated:",
          fileName
        );

        return;
      }

      // ---------------------------------------------------
      // ANDROID / IOS: SHARE THE IMAGE FILE
      // ---------------------------------------------------

      await Sharing.shareAsync(imageUri, {
        mimeType: "image/png",
        dialogTitle: "Share eVault Receipt",
        UTI: "public.png",
      });

    } catch (error) {
      console.error(
        "[EVAULT RECEIPT] Image operation failed:",
        error?.message || error
      );

      const message =
        error?.message ||
        "Could not process the receipt image. Please try again.";

      if (
        Platform.OS === "web" &&
        typeof window !== "undefined"
      ) {
        window.alert(
          `Unable to download receipt: ${message}`
        );
      } else {
        Alert.alert(
          "Unable to Share Receipt",
          message
        );
      }
    } finally {
      // Reset whether the user shares, cancels, or downloads.
      setSharing(false);
    }
  };

  // =======================================================
  // CLOSE
  // =======================================================

  const handleDone = () => {
    if (sharing) {
      return;
    }

    if (typeof onDone === "function") {
      onDone();
    } else if (typeof onClose === "function") {
      onClose();
    }
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={handleDone}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>

          {/* HEADER */}

          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.headerIcon}>
                <Ionicons
                  name="receipt-outline"
                  size={21}
                  color={BRAND}
                />
              </View>

              <Text style={styles.headerTitle}>
                Transaction Receipt
              </Text>
            </View>

            <Pressable
              onPress={handleDone}
              disabled={sharing}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close receipt"
            >
              <Ionicons
                name="close"
                size={23}
                color="#475569"
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* RECEIPT IMAGE CONTENT */}

            <View
              ref={receiptImageRef}
              collapsable={false}
              style={styles.receiptCard}
            >
              {/* BRAND */}

              <View style={styles.brandSection}>
                <View style={styles.brandMark}>
                  <Text style={styles.brandMarkText}>
                    e
                  </Text>
                </View>

                <Text style={styles.brandName}>
                  eVault
                </Text>

                <Text style={styles.brandSubtitle}>
                  ELECTRONIC VAULT
                </Text>
              </View>

              <View style={styles.topDivider} />

              {/* SUCCESS */}

              <View style={styles.successSection}>
                <View style={styles.successIcon}>
                  <Ionicons
                    name="checkmark"
                    size={31}
                    color="#FFFFFF"
                  />
                </View>

                <Text style={styles.receiptTitle}>
                  {receiptTitle}
                </Text>

                <Text style={styles.receiptSubtitle}>
                  {receiptSubtitle}
                </Text>
              </View>

              {/* AMOUNT */}

              <View style={styles.amountPanel}>
                <Text style={styles.amountLabel}>
                  AMOUNT CHARGED
                </Text>

                <Text style={styles.amountValue}>
                  {formatAmount(receiptAmount)}
                </Text>
              </View>

              {/* DETAILS */}

              <Text style={styles.detailsHeading}>
                TRANSACTION DETAILS
              </Text>

              <View style={styles.detailsCard}>
                <ReceiptRow
                  label="Service"
                  value={receiptService || receiptType}
                />

                {receiptNetwork ? (
                  <ReceiptRow
                    label="Network"
                    value={receiptNetwork}
                  />
                ) : null}

                {receiptRecipient ? (
                  <ReceiptRow
                    label="Recipient"
                    value={receiptRecipient}
                  />
                ) : null}

                {receiptDataPlan ? (
                  <ReceiptRow
                    label="Data Plan"
                    value={receiptDataPlan}
                  />
                ) : null}

                {receiptValidity ? (
                  <ReceiptRow
                    label="Validity"
                    value={receiptValidity}
                  />
                ) : null}

                <ReceiptRow
                  label="Payment Method"
                  value="Wallet Balance"
                />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>
                    Status
                  </Text>

                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>
                      {String(receiptStatus)}
                    </Text>
                  </View>
                </View>

                {receiptReference ? (
                  <ReceiptRow
                    label="Reference"
                    value={receiptReference}
                    reference
                  />
                ) : null}

                <ReceiptRow
                  label="Date"
                  value={formatDate(receiptDate)}
                  last
                />
              </View>

              {/* FOOTER */}

              <View style={styles.receiptFooter}>
                <Text style={styles.footerMessage}>
                  Thank you for using eVault.
                </Text>

                <Text style={styles.footerSmall}>
                  Please keep this receipt for your records.
                </Text>

                <Text style={styles.footerBrand}>
                  eVault • Secure. Simple. Convenient.
                </Text>
              </View>
            </View>

            {/* ACTIONS: OUTSIDE THE CAPTURED RECEIPT */}

            <Pressable
              style={[
                styles.shareButton,
                sharing && styles.disabledButton,
              ]}
              disabled={sharing}
              onPress={handleShareReceipt}
              accessibilityRole="button"
            >
              {sharing ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Ionicons
                  name={
                    Platform.OS === "web"
                      ? "download-outline"
                      : "image-outline"
                  }
                  size={21}
                  color="#FFFFFF"
                />
              )}

              <Text style={styles.shareButtonText}>
                {sharing
                  ? "Preparing Image..."
                  : Platform.OS === "web"
                    ? "Download Receipt Image"
                    : "Share Receipt Image"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.doneButton}
              onPress={handleDone}
              disabled={sharing}
              accessibilityRole="button"
            >
              <Text style={styles.doneButtonText}>
                Done
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// =========================================================
// RECEIPT DETAIL ROW
// =========================================================

function ReceiptRow({
  label,
  value,
  reference = false,
  last = false,
}) {
  return (
    <View
      style={[
        styles.detailRow,
        last && styles.lastDetailRow,
      ]}
    >
      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.detailValue,
          reference && styles.referenceValue,
        ]}
        selectable={reference}
      >
        {String(value ?? "—")}
      </Text>
    </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },

  modal: {
    maxHeight: "95%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    overflow: "hidden",
  },

  header: {
    minHeight: 62,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },

  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#EDF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  scrollView: {
    flexGrow: 0,
    backgroundColor: "#F1F5F9",
  },

  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 17,
    paddingTop: 18,
    paddingBottom: 30,
  },

  receiptCard: {
    width: "100%",
    maxWidth: 480,
    paddingHorizontal: 19,
    paddingTop: 25,
    paddingBottom: 22,
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  brandSection: {
    alignItems: "center",
    paddingBottom: 17,
  },

  brandMark: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: BRAND,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  brandMarkText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    fontStyle: "italic",
  },

  brandName: {
    fontSize: 23,
    fontWeight: "900",
    color: BRAND,
    letterSpacing: 0.4,
  },

  brandSubtitle: {
    color: "#94A3B8",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 3,
  },

  topDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 21,
  },

  successSection: {
    alignItems: "center",
    marginBottom: 19,
  },

  successIcon: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  receiptTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
  },

  receiptSubtitle: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
    textAlign: "center",
  },

  amountPanel: {
    alignItems: "center",
    backgroundColor: "#F1F6FF",
    borderWidth: 1,
    borderColor: "#DCE7FF",
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 10,
    marginBottom: 20,
  },

  amountLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#64748B",
  },

  amountValue: {
    color: BRAND,
    fontSize: 29,
    lineHeight: 37,
    fontWeight: "900",
    marginTop: 5,
  },

  detailsHeading: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 8,
  },

  detailsCard: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 13,
    paddingHorizontal: 13,
    backgroundColor: "#FFFFFF",
  },

  detailRow: {
    minHeight: 43,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF0F5",
  },

  lastDetailRow: {
    borderBottomWidth: 0,
  },

  detailLabel: {
    flex: 1,
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    marginRight: 8,
  },

  detailValue: {
    flex: 1.5,
    fontSize: 11,
    color: "#1E293B",
    fontWeight: "800",
    textAlign: "right",
  },

  referenceValue: {
    fontSize: 9,
  },

  statusPill: {
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  statusText: {
    color: "#047857",
    fontSize: 10,
    fontWeight: "900",
  },

  receiptFooter: {
    alignItems: "center",
    marginTop: 20,
  },

  footerMessage: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },

  footerSmall: {
    color: "#94A3B8",
    fontSize: 9,
    textAlign: "center",
    marginTop: 5,
  },

  footerBrand: {
    color: BRAND,
    fontSize: 9,
    fontWeight: "800",
    marginTop: 10,
  },

  shareButton: {
    width: "100%",
    maxWidth: 480,
    minHeight: 53,
    borderRadius: 15,
    backgroundColor: BRAND,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingHorizontal: 12,
  },

  shareButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    marginLeft: 9,
  },

  disabledButton: {
    opacity: 0.65,
  },

  doneButton: {
    width: "100%",
    maxWidth: 480,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  doneButtonText: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "800",
  },
});
