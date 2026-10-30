// src/components/ManualFundingBanner.js

import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

const BRAND_COLOR = "#2A5FD3";
const WHATSAPP_GREEN = "#25D366";

const FUNDING_ACCOUNT_NUMBER = "8140332887";
const FUNDING_ACCOUNT_NAME = "Mohammed Mohammed";
const RECEIPT_WHATSAPP_NUMBER = "07084382293";

export default function ManualFundingBanner() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.headingRow}>
          <View style={styles.headingIcon}>
            <Ionicons
              name="wallet-outline"
              size={15}
              color={BRAND_COLOR}
            />
          </View>

          <Text style={styles.heading}>
            Manual Funding Available
          </Text>

          
        </View>

        <View style={styles.accountRow}>
          <View style={styles.accountNumberWrap}>
            <Text style={styles.accountNumber}>
              {FUNDING_ACCOUNT_NUMBER}
            </Text>

            <Text style={styles.accountName}>
              {FUNDING_ACCOUNT_NAME}
            </Text>
          </View>

          <View style={styles.bankBadge}>
            <Ionicons
              name="business-outline"
              size={12}
              color={BRAND_COLOR}
            />

            <Text style={styles.bankName}>
              MONIEPOINT
            </Text>
          </View>
        </View>

        <View style={styles.receiptRow}>
          <Ionicons
            name="logo-whatsapp"
            size={14}
            color={WHATSAPP_GREEN}
          />

          <Text style={styles.receiptText}>
            After payment, send receipt to{" "}
            <Text style={styles.receiptNumber}>
              {RECEIPT_WHATSAPP_NUMBER}
            </Text>
            {" "}on WhatsApp for instant top-up.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "92%",
    alignSelf: "center",
    marginTop: 2,
    marginBottom: 5,
  },

  card: {
    width: "100%",
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE8FC",
    overflow: "hidden",
  },

  headingRow: {
    minHeight: 23,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },

  headingIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: "#EEF4FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },

  heading: {
    flex: 1,
    minWidth: 0,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "900",
    color: "#172554",
  },

  slideBadge: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    marginLeft: 4,
  },

  slideBadgeText: {
    fontSize: 7,
    fontWeight: "900",
    color: "#475569",
  },

  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#F7F9FF",
    borderWidth: 1,
    borderColor: "#E9EFFB",
  },

  accountNumberWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: 5,
  },

  accountNumber: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "900",
    letterSpacing: 0.5,
    color: "#0F172A",
  },

  accountName: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "800",
    color: "#475569",
    marginTop: 1,
  },

  bankBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: "#EAF1FF",
  },

  bankName: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.25,
    color: BRAND_COLOR,
  },

  receiptRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    marginTop: 5,
  },

  receiptText: {
    flex: 1,
    minWidth: 0,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "700",
    color: "#334155",
  },

  receiptNumber: {
    fontSize: 9,
    fontWeight: "900",
    color: "#166534",
  },
});