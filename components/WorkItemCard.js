// components/WorkItemCard.jsx

import React from "react";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

const BRAND_COLOR =
  "#2a5fd3";

/**
 * =========================================================
 * STATUS CONFIG
 * =========================================================
 */

function getStatusConfig(
  status
) {
  switch (
    String(status || "")
      .trim()
      .toLowerCase()
  ) {
    case "submitted":
      return {
        label: "SUBMITTED",
        background: "#EFF6FF",
        text: "#2563EB",
        icon: "paper-plane-outline",
      };

    case "ongoing":
      return {
        label: "IN PROGRESS",
        background: "#FFF7ED",
        text: "#C2410C",
        icon: "time-outline",
      };

    case "completed":
      return {
        label: "COMPLETED",
        background: "#ECFDF5",
        text: "#15803D",
        icon: "checkmark-circle-outline",
      };

    case "failed":
      return {
        label: "FAILED",
        background: "#FEF2F2",
        text: "#DC2626",
        icon: "close-circle-outline",
      };

    default:
      return {
        label:
          String(
            status || "UNKNOWN"
          ).toUpperCase(),
        background: "#F1F5F9",
        text: "#475569",
        icon: "ellipse-outline",
      };
  }
}

/**
 * =========================================================
 * CARD
 * =========================================================
 */

export function WorkItemCard({
  work,
}) {
  const statusConfig =
    getStatusConfig(
      work?.status
    );

  return (
    <View
      style={styles.card}
    >
      {/* ===================================================
          TOP ROW
          =================================================== */}

      <View
        style={styles.headerRow}
      >
        <View
          style={
            styles.identityBlock
          }
        >
          <Text
            style={
              styles.serviceLabel
            }
          >
            {work?.service ||
              "SERVICE"}
          </Text>

          <Text
            style={styles.workId}
            numberOfLines={1}
          >
            {work?.reference ||
              work?.id ||
              "—"}
          </Text>
        </View>

        {/* STATUS BADGE */}

        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                statusConfig.background,
            },
          ]}
        >
          <Ionicons
            name={
              statusConfig.icon
            }
            size={14}
            color={
              statusConfig.text
            }
          />

          <Text
            style={[
              styles.badgeText,
              {
                color:
                  statusConfig.text,
              },
            ]}
          >
            {
              statusConfig.label
            }
          </Text>
        </View>
      </View>

      {/* ===================================================
          TITLE
          =================================================== */}

      <Text
        style={styles.title}
        numberOfLines={2}
      >
        {work?.title ||
          "Service Request"}
      </Text>

      {/* ===================================================
          CATEGORY
          =================================================== */}

      <Text
        style={styles.category}
        numberOfLines={1}
      >
        {work?.category ||
          "Service Operation"}
      </Text>

      {/* ===================================================
          OPTIONAL PROVIDER REFERENCE
          =================================================== */}

      {work?.providerReference ? (
        <View
          style={
            styles.referenceRow
          }
        >
          <Text
            style={
              styles.referenceLabel
            }
          >
            PROVIDER REF
          </Text>

          <Text
            style={
              styles.referenceValue
            }
            numberOfLines={1}
          >
            {
              work.providerReference
            }
          </Text>
        </View>
      ) : null}

      {/* ===================================================
          FOOTER
          =================================================== */}

      <View
        style={styles.footerRow}
      >
        <View
          style={
            styles.footerColumn
          }
        >
          <Text
            style={styles.label}
          >
            AMOUNT
          </Text>

          <Text
            style={styles.value}
          >
            {work?.amount ||
              "—"}
          </Text>
        </View>

        <View
          style={[
            styles.footerColumn,
            styles.rightAlign,
          ]}
        >
          <Text
            style={styles.label}
          >
            LAST UPDATED
          </Text>

          <Text
            style={styles.value}
            numberOfLines={2}
          >
            {work?.date ||
              "—"}
          </Text>
        </View>
      </View>
    </View>
  );
}

/**
 * =========================================================
 * STYLES
 * =========================================================
 */

const styles =
  StyleSheet.create({
    card: {
      backgroundColor:
        "#FFFFFF",

      borderRadius: 14,

      borderWidth: 1,

      borderColor:
        "#E5E7EB",

      padding: 16,

      marginBottom: 12,

      shadowColor:
        "#000000",

      shadowOffset: {
        width: 0,
        height: 2,
      },

      shadowOpacity:
        0.05,

      shadowRadius: 6,

      elevation: 2,
    },

    headerRow: {
      flexDirection:
        "row",

      alignItems:
        "flex-start",

      justifyContent:
        "space-between",

      gap: 10,
    },

    identityBlock: {
      flex: 1,

      minWidth: 0,
    },

    serviceLabel: {
      fontSize: 11,

      fontWeight: "800",

      color:
        BRAND_COLOR,

      letterSpacing:
        0.6,

      marginBottom: 4,
    },

    workId: {
      fontSize: 12,

      fontWeight: "600",

      color: "#64748B",
    },

    badge: {
      flexDirection:
        "row",

      alignItems:
        "center",

      paddingHorizontal: 9,

      paddingVertical: 6,

      borderRadius: 20,

      gap: 5,

      flexShrink: 0,
    },

    badgeText: {
      fontSize: 10,

      fontWeight: "800",

      letterSpacing:
        0.35,
    },

    title: {
      marginTop: 14,

      fontSize: 16,

      fontWeight: "800",

      color: "#111827",

      lineHeight: 21,
    },

    category: {
      marginTop: 4,

      fontSize: 12,

      color: "#64748B",

      lineHeight: 17,
    },

    referenceRow: {
      marginTop: 12,

      paddingTop: 10,

      borderTopWidth: 1,

      borderTopColor:
        "#F1F5F9",
    },

    referenceLabel: {
      fontSize: 9,

      fontWeight: "800",

      color: "#94A3B8",

      letterSpacing:
        0.5,

      marginBottom: 3,
    },

    referenceValue: {
      fontSize: 11,

      fontWeight: "600",

      color: "#475569",
    },

    footerRow: {
      flexDirection:
        "row",

      justifyContent:
        "space-between",

      marginTop: 16,

      paddingTop: 12,

      borderTopWidth: 1,

      borderTopColor:
        "#F1F5F9",
    },

    footerColumn: {
      flex: 1,

      minWidth: 0,
    },

    rightAlign: {
      alignItems:
        "flex-end",

      textAlign:
        "right",
    },

    label: {
      fontSize: 9,

      fontWeight: "800",

      color: "#94A3B8",

      letterSpacing:
        0.5,

      marginBottom: 4,
    },

    value: {
      fontSize: 12,

      fontWeight: "700",

      color: "#1F2937",

      textAlign:
        "right",
    },
  });

export default WorkItemCard;