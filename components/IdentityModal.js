// components/IdentityModal.js

import {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function IdentityModal({
  visible,
  identity,
  saving,
  onClose,
  onSubmit,
}) {
  const [
    bvn,
    setBvn,
  ] = useState("");

  const [
    nin,
    setNin,
  ] = useState("");

  /**
   * Populate existing identity
   * when modal opens.
   */
  useEffect(() => {
    if (visible) {
      setBvn(identity?.bvn || "");
      setNin(identity?.nin || "");
    }
  }, [
    visible,
    identity,
  ]);

  /**
   * Submit identity
   */
  async function handleSubmit() {
    const cleanBvn =
      bvn.trim();

    const cleanNin =
      nin.trim();

    if (
      !cleanBvn &&
      !cleanNin
    ) {
      return;
    }

    await onSubmit({
      bvn: cleanBvn || null,
      nin: cleanNin || null,
    });
  }

  const hasExistingIdentity =
    Boolean(
      identity?.bvn ||
      identity?.nin
    );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>

        <View style={styles.modal}>

          {/* HEADER */}
          <View style={styles.header}>

            <View>
              <Text style={styles.title}>
                Identity Verification
              </Text>

              <Text style={styles.subtitle}>
                Submit your BVN or NIN
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>
                ×
              </Text>
            </Pressable>

          </View>

          {/* EXISTING IDENTITY */}
          {hasExistingIdentity ? (
            <View style={styles.statusBox}>

              <Text style={styles.statusTitle}>
                Identity Submitted
              </Text>

              <Text style={styles.statusText}>
                Your identity information has already
                been submitted for verification.
              </Text>

              {identity?.bvn ? (
                <Text style={styles.masked}>
                  BVN: ******{
                    identity.bvn.slice(-4)
                  }
                </Text>
              ) : null}

              {identity?.nin ? (
                <Text style={styles.masked}>
                  NIN: ******{
                    identity.nin.slice(-4)
                  }
                </Text>
              ) : null}

            </View>
          ) : (
            <>
              {/* BVN */}
              <Text style={styles.label}>
                BVN
              </Text>

              <TextInput
                value={bvn}
                onChangeText={setBvn}
                placeholder="Enter 11-digit BVN"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                maxLength={11}
                style={styles.input}
              />

              {/* NIN */}
              <Text style={styles.label}>
                NIN
              </Text>

              <TextInput
                value={nin}
                onChangeText={setNin}
                placeholder="Enter 11-digit NIN"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                maxLength={11}
                style={styles.input}
              />

              <Text style={styles.helper}>
                You only need to provide BVN or NIN.
              </Text>

              {/* SAVE */}
              <Pressable
                style={[
                  styles.submitButton,
                  saving &&
                    styles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={
                  saving ||
                  (!bvn.trim() &&
                    !nin.trim())
                }
              >
                {saving ? (
                  <ActivityIndicator
                    color="#fff"
                  />
                ) : (
                  <Text style={styles.submitText}>
                    Submit Identity
                  </Text>
                )}
              </Pressable>
            </>
          )}

          {/* CLOSE */}
          <Pressable
            onPress={onClose}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>
              Close
            </Text>
          </Pressable>

        </View>

      </View>
    </Modal>
  );
}

const styles =
  StyleSheet.create({

    overlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor:
        "rgba(0,0,0,0.55)",
    },

    modal: {
      backgroundColor: "#fff",
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 22,
      paddingBottom: 30,
    },

    header: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      marginBottom: 22,
    },

    title: {
      fontSize: 21,
      fontWeight: "800",
      color: "#222",
    },

    subtitle: {
      fontSize: 13,
      color: "#777",
      marginTop: 4,
    },

    closeButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: "#f1f1f1",
      alignItems: "center",
      justifyContent: "center",
    },

    closeText: {
      fontSize: 25,
      color: "#555",
      lineHeight: 27,
    },

    label: {
      fontSize: 13,
      fontWeight: "700",
      color: "#333",
      marginBottom: 7,
      marginTop: 10,
    },

    input: {
      height: 50,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 12,
      paddingHorizontal: 14,
      fontSize: 16,
      color: "#222",
      backgroundColor: "#fafafa",
    },

    helper: {
      color: "#777",
      fontSize: 12,
      marginTop: 8,
      marginBottom: 18,
    },

    statusBox: {
      backgroundColor: "#eef6ff",
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
    },

    statusTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: "#2A5FD3",
    },

    statusText: {
      fontSize: 13,
      color: "#555",
      lineHeight: 19,
      marginTop: 5,
    },

    masked: {
      fontSize: 13,
      fontWeight: "700",
      color: "#333",
      marginTop: 8,
    },

    submitButton: {
      height: 50,
      borderRadius: 12,
      backgroundColor: "#2A5FD3",
      alignItems: "center",
      justifyContent: "center",
    },

    disabledButton: {
      opacity: 0.6,
    },

    submitText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "800",
    },

    cancelButton: {
      alignItems: "center",
      paddingVertical: 14,
    },

    cancelText: {
      color: "#666",
      fontSize: 14,
      fontWeight: "600",
    },
  });