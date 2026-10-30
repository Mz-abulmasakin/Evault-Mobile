
// src/components/IdentityCard.jsx

import React, {
  useState,
} from "react";

import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  Ionicons,
} from "@expo/vector-icons";

import useIdentity from "../hooks/useIdentity";

import IdentityModal from "./IdentityModal";

const BRAND = "#2A5FD3";

/**
 * =========================================================
 * GET IDENTITY VALUE
 * =========================================================
 */
function getIdentityValue(
  identity,
  type
) {
  if (!identity) {
    return null;
  }

  const sources = [
    identity,
    identity?.data,
    identity?.identity,
    identity?.result,
    identity?.data?.data,
    identity?.data?.identity,
    identity?.result?.data,
    identity?.result?.identity,
  ];

  const keys =
    type === "bvn"
      ? [
          "bvn",
          "bvnNumber",
          "bvn_number",
          "bvnIdentifier",
          "bvn_identifier",
        ]
      : [
          "nin",
          "ninNumber",
          "nin_number",
          "ninIdentifier",
          "nin_identifier",
        ];

  for (const source of sources) {
    if (
      !source ||
      typeof source !== "object"
    ) {
      continue;
    }

    for (const key of keys) {
      const value =
        source?.[key];

      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }
  }

  return null;
}

export default function IdentityCard() {
  const {
    identity,
    loading,
    saving,
    saveIdentity,
  } = useIdentity();

  const [
    showIdentityModal,
    setShowIdentityModal,
  ] = useState(false);

  const bvn =
    getIdentityValue(
      identity,
      "bvn"
    );

  const nin =
    getIdentityValue(
      identity,
      "nin"
    );

  const hasIdentity =
    Boolean(
      bvn || nin
    );

  /**
   * =========================================================
   * SUBMIT IDENTITY
   * =========================================================
   */
  async function handleIdentitySubmit(
    data
  ) {
    try {
      await saveIdentity(
        data
      );

      setShowIdentityModal(
        false
      );

      Alert.alert(
        "Identity Submitted",
        "Your identity information has been saved and submitted for verification."
      );
    } catch (error) {
      console.error(
        "Identity Card Save Error:",
        error?.response?.data ||
          error?.message ||
          error
      );

      Alert.alert(
        "Error",
        error?.response?.data
          ?.message ||
          error?.message ||
          "Unable to save identity."
      );
    }
  }

  return (
    <>
      <View style={styles.card}>

        {/* =================================================
            HEADER
        ================================================== */}

        <View style={styles.header}>

          <View
            style={
              styles.headerIcon
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color="#FFFFFF"
            />
          </View>

          <View
            style={
              styles.headerText
            }
          >
            <Text
              style={
                styles.title
              }
            >
              Identity Details
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Your saved BVN and NIN
            </Text>
          </View>

          {hasIdentity && (
            <View
              style={
                styles.verifiedBadge
              }
            >
              <Ionicons
                name="checkmark"
                size={15}
                color="#FFFFFF"
              />
            </View>
          )}

        </View>


        {/* =================================================
            STATUS
        ================================================== */}

        <View
          style={
            styles.statusBox
          }
        >

          <View
            style={
              styles.statusIcon
            }
          >
            <Ionicons
              name={
                hasIdentity
                  ? "checkmark-circle"
                  : "alert-circle-outline"
              }
              size={19}
              color={BRAND}
            />
          </View>

          <View
            style={
              styles.statusContent
            }
          >

            <Text
              style={
                styles.statusTitle
              }
            >
              {loading
                ? "Loading identity..."
                : hasIdentity
                ? "Identity information available"
                : "Identity information required"}
            </Text>

            <Text
              style={
                styles.statusSubtitle
              }
            >
              {loading
                ? "Retrieving your saved details."
                : hasIdentity
                ? "Your BVN or NIN is saved on your account."
                : "Add your BVN or NIN to complete your profile."}
            </Text>

          </View>

        </View>


        {/* =================================================
            BVN + NIN
        ================================================== */}

        <View
          style={
            styles.identitiesRow
          }
        >

          {/* BVN */}

          <View
            style={
              styles.identityBox
            }
          >

            <Text
              style={
                styles.identityLabel
              }
            >
              BVN
            </Text>

            <Text
              style={
                styles.identityValue
              }
              numberOfLines={1}
            >
              {loading
                ? "..."
                : bvn ||
                  "Not added"}
            </Text>

          </View>


          {/* NIN */}

          <View
            style={
              styles.identityBox
            }
          >

            <Text
              style={
                styles.identityLabel
              }
            >
              NIN
            </Text>

            <Text
              style={
                styles.identityValue
              }
              numberOfLines={1}
            >
              {loading
                ? "..."
                : nin ||
                  "Not added"}
            </Text>

          </View>

        </View>


        {/* =================================================
            ACTION
        ================================================== */}

        <TouchableOpacity
          style={
            styles.actionButton
          }
          onPress={() =>
            setShowIdentityModal(
              true
            )
          }
          disabled={saving}
        >

          <Ionicons
            name={
              hasIdentity
                ? "create-outline"
                : "add-outline"
            }
            size={17}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.actionText
            }
          >
            {saving
              ? "Saving..."
              : hasIdentity
              ? "Update Identity"
              : "Add BVN / NIN"}
          </Text>

        </TouchableOpacity>

      </View>


      {/* =================================================
          IDENTITY MODAL
      ================================================== */}

      <IdentityModal
        visible={
          showIdentityModal
        }
        identity={
          identity
        }
        saving={
          saving
        }
        onClose={() =>
          setShowIdentityModal(
            false
          )
        }
        onSubmit={
          handleIdentitySubmit
        }
      />
    </>
  );
}


const styles =
  StyleSheet.create({

    card: {
      width: "92%",
      marginTop: 16,
      marginBottom: 22,
      padding: 14,
      borderRadius: 20,
      backgroundColor: "#FFFFFF",

      borderWidth: 1,
      borderColor: "#E5EAF2",

      shadowColor: "#000000",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.07,
      shadowRadius: 7,

      elevation: 2,
    },

    header: {
      flexDirection: "row",
      alignItems: "center",
    },

    headerIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: BRAND,
    },

    headerText: {
      flex: 1,
      marginLeft: 10,
    },

    title: {
      color: "#0F172A",
      fontSize: 15,
      fontWeight: "800",
    },

    subtitle: {
      color: "#64748B",
      fontSize: 10,
      marginTop: 2,
    },

    verifiedBadge: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#22C55E",
    },

    statusBox: {
      marginTop: 12,
      padding: 10,
      borderRadius: 12,
      backgroundColor: "#F1F5F9",
      flexDirection: "row",
      alignItems: "center",
    },

    statusIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#FFFFFF",
    },

    statusContent: {
      flex: 1,
      marginLeft: 9,
    },

    statusTitle: {
      color: "#0F172A",
      fontSize: 10,
      fontWeight: "800",
    },

    statusSubtitle: {
      color: "#64748B",
      fontSize: 9,
      lineHeight: 13,
      marginTop: 2,
    },

    identitiesRow: {
      flexDirection: "row",
      marginTop: 9,
      gap: 8,
    },

    identityBox: {
      flex: 1,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 11,
      backgroundColor: "#F8FAFC",
      borderWidth: 1,
      borderColor: "#EEF2F7",
    },

    identityLabel: {
      color: "#94A3B8",
      fontSize: 9,
      fontWeight: "700",
    },

    identityValue: {
      color: "#0F172A",
      fontSize: 11,
      fontWeight: "800",
      marginTop: 4,
    },

    actionButton: {
      marginTop: 10,
      minHeight: 39,
      borderRadius: 10,
      backgroundColor: BRAND,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },

    actionText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "800",
    },

  });
