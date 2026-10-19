
import React, { useState } from "react";

import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../context/AuthContext";
import useFunding from "../hooks/useFunding";
import useIdentity from "../hooks/useIdentity";
import useWallet from "../hooks/useWallet";

import IdentityModal from "./IdentityModal";

const BRAND = "#2A5FD3";

function getIdentityValue(identity, type) {
  if (!identity) return null;

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
      ? ["bvn", "bvnNumber", "bvn_number", "bvnIdentifier", "bvn_identifier"]
      : ["nin", "ninNumber", "nin_number", "ninIdentifier", "nin_identifier"];

  for (const source of sources) {
    if (!source || typeof source !== "object") continue;

    for (const key of keys) {
      const value = source?.[key];

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

export default function UserCard() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const { wallet, loading: walletLoading } = useWallet();

  const {
    account,
    loading: accountLoading,
    generating,
    generateAccount,
  } = useFunding();

  const {
    identity,
    saving: identitySaving,
    saveIdentity,
  } = useIdentity();

  const [showBalance, setShowBalance] = useState(false);
  const [showIdentityModal, setShowIdentityModal] = useState(false);

  const balance = Number(wallet?.available_balance ?? 0);
  const firstName = user?.fullName?.split(" ")[0] || "User";

  const bvn = getIdentityValue(identity, "bvn");
  const nin = getIdentityValue(identity, "nin");
  const hasIdentity = Boolean(bvn || nin);

  async function handleIdentitySubmit(data) {
    try {
      await saveIdentity(data);
      setShowIdentityModal(false);

      Alert.alert(
        "Identity Submitted",
        "Your identity information has been saved successfully."
      );
    } catch (error) {
      console.error(
        "Save Identity Error:",
        error?.response?.data || error?.message || error
      );

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to save identity."
      );
    }
  }

  async function handleGenerate() {
    if (!hasIdentity) {
      setShowIdentityModal(true);
      return;
    }

    try {
      await generateAccount();

      Alert.alert(
        "Success",
        "Dedicated funding account created successfully."
      );
    } catch (error) {
      console.error(
        "Generate Account Error:",
        error?.response?.data || error?.message || error
      );

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to create dedicated funding account."
      );
    }
  }

  function openHistory() {
    navigation.navigate("StatutoryHistoryScreen");
  }

  function openPendingWork() {
    navigation.navigate("WorksScreen");
  }

  return (
    <>
      <View style={styles.card}>
        {/* GREETING */}
        <Text style={styles.greeting}>Hello, {firstName}</Text>

        {/* BALANCE */}
        <View style={styles.balanceRow}>
          <View style={styles.balanceContent}>
            <Text style={styles.balanceLabel}>Available Balance</Text>

            <Text
              style={styles.balance}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {walletLoading
                ? "Loading..."
                : showBalance
                ? `₦${balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "₦••••••••"}
            </Text>
          </View>

          <Pressable
            style={styles.balanceToggle}
            onPress={() => setShowBalance((previous) => !previous)}
            accessibilityRole="button"
            accessibilityLabel={
              showBalance ? "Hide balance" : "Show balance"
            }
          >
            <Ionicons
              name={showBalance ? "eye-off-outline" : "eye-outline"}
              size={15}
              color="#FFFFFF"
            />

            <Text style={styles.balanceToggleText}>
              {showBalance ? "Hide" : "Show"}
            </Text>
          </Pressable>
        </View>

        {/* FUNDING ACCOUNT */}
        <View style={styles.fundingBlock}>
          <View style={styles.fundingContent}>
            <Text style={styles.fundingLabel}>Funding Account</Text>

            {accountLoading ? (
              <Text style={styles.fundingValue}>Loading...</Text>
            ) : account ? (
              <>
                <Text
                  style={styles.fundingValue}
                  numberOfLines={1}
                >
                  {account.bank_name}
                </Text>

                <Text
                  style={styles.accountNumber}
                  numberOfLines={1}
                >
                  {account.account_number}
                </Text>
              </>
            ) : (
              <Text style={styles.fundingMuted}>
                No dedicated account
              </Text>
            )}
          </View>

          {!account && !accountLoading && (
            <TouchableOpacity
              style={styles.generateButton}
              onPress={handleGenerate}
              disabled={generating}
              activeOpacity={0.8}
            >
              <Text style={styles.generateText}>
                {generating ? "Creating..." : "Generate"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* IDENTITY */}
        {!hasIdentity && (
          <Pressable
            style={styles.identityPrompt}
            onPress={() => setShowIdentityModal(true)}
          >
            <View style={styles.identityPromptText}>
              <Text style={styles.identityPromptTitle}>
                Add your identity
              </Text>

              <Text style={styles.identityPromptSubtitle}>
                Add BVN or NIN to your account
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={16}
              color="#FFFFFF"
            />
          </Pressable>
        )}

        {/* HISTORY + PENDING */}
        <View style={styles.actionsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionPressed,
            ]}
            onPress={openHistory}
          >
            <Ionicons
              name="time-outline"
              size={17}
              color="#FFFFFF"
            />

            <Text style={styles.actionText}>History</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionPressed,
            ]}
            onPress={openPendingWork}
          >
            <Ionicons
              name="briefcase-outline"
              size={17}
              color="#FFFFFF"
            />

            <Text style={styles.actionText}>Pending Work</Text>
          </Pressable>
        </View>
      </View>

      <IdentityModal
        visible={showIdentityModal}
        identity={identity}
        saving={identitySaving}
        onClose={() => setShowIdentityModal(false)}
        onSubmit={handleIdentitySubmit}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "92%",
    alignSelf: "center",
    marginTop: 3,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 10,
    borderRadius: 17,
    backgroundColor: BRAND,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  greeting: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 7,
  },

  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  balanceContent: {
    flex: 1,
    minWidth: 0,
  },

  balanceLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 10,
    fontWeight: "600",
  },

  balance: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    marginTop: 1,
    letterSpacing: -0.6,
  },

  balanceToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.13)",
    marginLeft: 8,
  },

  balanceToggleText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },

  fundingBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  fundingContent: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },

  fundingLabel: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 9,
    fontWeight: "600",
  },

  fundingValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },

  accountNumber: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 1,
  },

  fundingMuted: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 10,
    marginTop: 2,
  },

  generateButton: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },

  generateText: {
    color: BRAND,
    fontSize: 10,
    fontWeight: "800",
  },

  identityPrompt: {
    minHeight: 38,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  identityPromptText: {
    flex: 1,
  },

  identityPromptTitle: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  identityPromptSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 9,
    marginTop: 1,
  },

  actionsRow: {
    flexDirection: "row",
    width: "100%",
    gap: 8,
  },

  actionButton: {
    flex: 1,
    minHeight: 34,
    paddingHorizontal: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.13)",
  },

  actionText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 5,
  },

  actionPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
