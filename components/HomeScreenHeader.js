import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import {
  useNotificationDropdown,
} from "../hooks/useNotificationDropdown";

import {
  downloadNinFromNotification,
  getNinDownloadIdentifier,
  shouldShowNinDownload,
} from "../utils/notificationNinDownload";

import {
  downloadBvnPdf,
} from "../utils/downloadBvnPdf";

const topLogo = require("../assets/evault-logo.png");

const BRAND_COLOR = "#2a5fd3";
const BRAND_LIGHT = "#edf4ff";

export default function HomeScreenHeader() {
  const navigation = useNavigation();

  const {
    isOpen,
    notifications,
    unreadCount,
    toggleDropdown,
    closeDropdown,
    markAllAsRead,
    handleNotificationPress,
    handleSeeAllPress,
  } = useNotificationDropdown();

  /*
   * INSTANT DROPDOWN VISIBILITY
   *
   * Local visibility lets the panel respond immediately,
   * even if the notification hook is still doing other work.
   */

  const [dropdownVisible, setDropdownVisible] =
    useState(Boolean(isOpen));

  const handleCloseDropdown = () => {
    // Hide the panel immediately.
    setDropdownVisible(false);

    // Keep the existing hook state in sync.
    closeDropdown();
  };

  const handleToggleDropdown = () => {
    if (dropdownVisible) {
      handleCloseDropdown();
      return;
    }

    // Show the panel immediately.
    setDropdownVisible(true);

    // Preserve the hook's existing notification behavior.
    toggleDropdown();
  };

  /*
   * DOWNLOAD STATES
   */

  const [downloadingKey, setDownloadingKey] =
    useState(null);

  const [bvnDownloadingKey, setBvnDownloadingKey] =
    useState(null);

  /*
   * LOGO ALTERNATION
   *
   * The logo animation is retained.
   * Only the notification-panel animation is removed.
   */

  const [showCorporateBrand, setShowCorporateBrand] =
    useState(false);

  const logoFade = useRef(
    new Animated.Value(1)
  ).current;

  useEffect(() => {
    let brandTimer;

    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(logoFade, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(logoFade, {
          toValue: 1,
          duration: 220,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      brandTimer = setTimeout(() => {
        setShowCorporateBrand((current) => !current);
      }, 180);
    }, 3000);

    return () => {
      clearInterval(interval);

      if (brandTimer) {
        clearTimeout(brandTimer);
      }
    };
  }, [logoFade]);

  /*
   * HISTORY NAVIGATION
   */

  const navigateToHistory = () => {
    handleCloseDropdown();

    navigation.navigate(
      "StatutoryHistoryScreen"
    );
  };

  /*
   * NIN DOWNLOAD
   */

  const handleNinDownload = async (notification) => {
    const identifier =
      getNinDownloadIdentifier(notification);

    if (!identifier) {
      Alert.alert(
        "NIN Download",
        "The successful NIN notification does not contain a usable request reference."
      );

      return;
    }

    const key =
      `${notification?.id || "notification"}:${identifier.value}`;

    setDownloadingKey(key);

    try {
      await downloadNinFromNotification(
        notification
      );
    } catch (error) {
      console.error(
        "[NIN NOTIFICATION DOWNLOAD] failed:",
        error?.message || error
      );

      Alert.alert(
        "NIN Download Failed",
        error?.message ||
          "Unable to download the NIN slip."
      );
    } finally {
      setDownloadingKey(null);
    }
  };

  /*
   * BVN REQUEST ID EXTRACTION
   */

  const getBvnRequestIdFromNotification = (
    notification
  ) => {
    if (!notification) {
      return null;
    }

    const visited = new Set();

    const preferredKeys = [
      "bvnRequestId",
      "bvn_request_id",
      "identityRequestId",
      "identity_request_id",
      "requestId",
      "request_id",
    ];

    const walk = (value) => {
      if (
        value === null ||
        value === undefined ||
        typeof value !== "object"
      ) {
        return null;
      }

      if (visited.has(value)) {
        return null;
      }

      visited.add(value);

      for (const key of preferredKeys) {
        const candidate = value?.[key];

        if (
          candidate !== null &&
          candidate !== undefined &&
          String(candidate).trim() !== ""
        ) {
          return String(candidate).trim();
        }
      }

      for (const key of Object.keys(value)) {
        const result = walk(value[key]);

        if (result) {
          return result;
        }
      }

      return null;
    };

    return walk(notification);
  };

  /*
   * BVN NOTIFICATION DETECTION
   */

  const isSuccessfulBvnNotification = (
    notification
  ) => {
    if (!notification) {
      return false;
    }

    const metadata =
      notification?.metadata ||
      notification?.meta ||
      {};

    const identityType = String(
      metadata?.identityType ||
        metadata?.identity_type ||
        notification?.identityType ||
        notification?.identity_type ||
        ""
    )
      .trim()
      .toUpperCase();

    const status = String(
      metadata?.status ||
        metadata?.identityStatus ||
        metadata?.identity_status ||
        notification?.status ||
        ""
    )
      .trim()
      .toUpperCase();

    const title = String(
      notification?.title || ""
    ).toLowerCase();

    const description = String(
      notification?.description ||
        notification?.message ||
        ""
    ).toLowerCase();

    const combinedText =
      `${title} ${description}`.toLowerCase();

    const isBvn =
      identityType === "BVN" ||
      combinedText.includes("bvn") ||
      combinedText.includes(
        "bank verification number"
      );

    if (!isBvn) {
      return false;
    }

    const failed =
      status === "FAILED" ||
      status === "FAILURE" ||
      status === "REFUNDED" ||
      combinedText.includes("failed") ||
      combinedText.includes("failure") ||
      combinedText.includes("refunded") ||
      combinedText.includes("refund");

    if (failed) {
      return false;
    }

    const successful =
      status === "SUCCESS" ||
      status === "COMPLETED" ||
      status === "VERIFIED" ||
      combinedText.includes("successful") ||
      combinedText.includes("successfully") ||
      combinedText.includes("completed") ||
      combinedText.includes("verified") ||
      combinedText.includes(
        "validation successful"
      );

    return successful;
  };

  /*
   * BVN DOWNLOAD
   */

  const handleBvnDownload = async (
    notification
  ) => {
    const requestId =
      getBvnRequestIdFromNotification(
        notification
      );

    if (!requestId) {
      Alert.alert(
        "BVN Download",
        "The successful BVN notification does not contain a usable request reference."
      );

      return;
    }

    const key =
      `${notification?.id || "notification"}:${requestId}`;

    if (bvnDownloadingKey === key) {
      return;
    }

    setBvnDownloadingKey(key);

    try {
      await downloadBvnPdf(
        requestId,
        {
          fileName: `BVN-${requestId}.pdf`,
        }
      );
    } catch (error) {
      console.error(
        "[BVN NOTIFICATION DOWNLOAD] failed:",
        error?.response?.data ||
          error?.message ||
          error
      );

      Alert.alert(
        "BVN Download Failed",
        error?.message ||
          "Unable to download the BVN slip."
      );
    } finally {
      setBvnDownloadingKey(null);
    }
  };

  /*
   * HEADER
   */

  return (
    <View style={styles.outerContainer}>
      <View style={styles.headerShell}>
        <View style={styles.headerLogoWrapper}>
          <Animated.View
            style={[
              styles.headerLeft,
              {
                opacity: logoFade,
              },
            ]}
          >
            {!showCorporateBrand ? (
              <View style={styles.eLogoCircle}>
                <Text style={styles.eLogoText}>
                  e
                </Text>
              </View>
            ) : (
              <>
                <Image
                  style={styles.headerLogo}
                  source={topLogo}
                />

                <Text style={styles.headerTitle}>
                  eVault Corporate
                </Text>
              </>
            )}
          </Animated.View>

          <Pressable
            style={styles.bellButton}
            onPress={handleToggleDropdown}
            accessibilityRole="button"
            accessibilityLabel="Open notifications panel"
          >
            <Ionicons
              name={
                dropdownVisible
                  ? "notifications"
                  : "notifications-outline"
              }
              size={23}
              color="#ffffff"
            />

            {unreadCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text
                  style={styles.badgeText}
                  numberOfLines={1}
                >
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* NOTIFICATION MODAL */}

      <Modal
        animationType="none"
        transparent
        visible={dropdownVisible}
        onRequestClose={handleCloseDropdown}
      >
        <View style={styles.modalRoot}>
          {/* BACKDROP */}

          <View
            pointerEvents="none"
            style={styles.backdrop}
          />

          {/* TAP OUTSIDE TO CLOSE */}

          <Pressable
            style={styles.dismissAbsoluteContainer}
            onPress={handleCloseDropdown}
          />

          {/* NOTIFICATION PANEL
              Plain View means no fade-in, scaling,
              spring animation, or slide-in delay.
          */}

          <View style={styles.modalCard}>
            <View style={styles.topAccent} />

            {/* MODAL HEADER */}

            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View
                  style={styles.notificationHeaderIcon}
                >
                  <Ionicons
                    name="notifications"
                    size={17}
                    color={BRAND_COLOR}
                  />
                </View>

                <View>
                  <Text style={styles.modalTitle}>
                    Notifications
                  </Text>

                  <Text style={styles.modalSubtitle}>
                    Recent account activity
                  </Text>
                </View>
              </View>

              {unreadCount > 0 && (
                <Pressable
                  onPress={markAllAsRead}
                  style={styles.markReadButton}
                >
                  <Text style={styles.markReadText}>
                    Mark all
                  </Text>
                </Pressable>
              )}
            </View>

            {/* NOTIFICATION LIST */}

            <ScrollView
              style={styles.listScroll}
              contentContainerStyle={
                notifications.length === 0
                  ? styles.emptyContent
                  : styles.listContent
              }
              showsVerticalScrollIndicator={false}
            >
              {notifications.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      name="notifications-off-outline"
                      size={28}
                      color="#94A3B8"
                    />
                  </View>

                  <Text style={styles.emptyTitle}>
                    No notifications
                  </Text>

                  <Text
                    style={styles.emptyDescription}
                  >
                    You are all caught up.
                  </Text>
                </View>
              ) : (
                notifications.map((item) => {
                  const showNinDownload =
                    shouldShowNinDownload(item);

                  const identifier =
                    getNinDownloadIdentifier(item);

                  const downloadKey = identifier
                    ? `${item?.id || "notification"}:${identifier.value}`
                    : null;

                  const downloading = Boolean(
                    downloadKey &&
                      downloadingKey === downloadKey
                  );

                  const bvnRequestId =
                    getBvnRequestIdFromNotification(
                      item
                    );

                  const showBvnDownload =
                    isSuccessfulBvnNotification(
                      item
                    ) &&
                    Boolean(bvnRequestId);

                  const bvnDownloadKey =
                    bvnRequestId
                      ? `${item?.id || "notification"}:${bvnRequestId}`
                      : null;

                  const bvnDownloading = Boolean(
                    bvnDownloadKey &&
                      bvnDownloadingKey ===
                        bvnDownloadKey
                  );

                  return (
                    <View
                      key={String(item.id)}
                      style={[
                        styles.notificationItem,
                        item.unread &&
                          styles.unreadBackground,
                      ]}
                    >
                      <View style={styles.itemRow}>
                        <Pressable
                          style={styles.itemPressArea}
                          onPress={() => {
                            handleNotificationPress(
                              item
                            );

                            navigateToHistory();
                          }}
                        >
                          <View
                            style={[
                              styles.iconWrapper,
                              {
                                backgroundColor:
                                  item.unread
                                    ? BRAND_LIGHT
                                    : "#F8FAFC",
                              },
                            ]}
                          >
                            <Ionicons
                              name={
                                item.icon ||
                                "information-circle-outline"
                              }
                              size={19}
                              color={
                                item.unread
                                  ? BRAND_COLOR
                                  : "#64748B"
                              }
                            />
                          </View>

                          <View
                            style={styles.textContainer}
                          >
                            <View
                              style={styles.titleRow}
                            >
                              <Text
                                style={[
                                  styles.itemTitle,
                                  item.unread &&
                                    styles.boldText,
                                ]}
                                numberOfLines={2}
                              >
                                {item.title ||
                                  "Notification"}
                              </Text>

                              {item.unread && (
                                <View
                                  style={
                                    styles.inlineUnreadDot
                                  }
                                />
                              )}
                            </View>

                            <Text
                              style={
                                styles.itemDescription
                              }
                              numberOfLines={3}
                            >
                              {item.description ||
                                item.message ||
                                ""}
                            </Text>

                            <Text style={styles.itemTime}>
                              {item.time || ""}
                            </Text>
                          </View>
                        </Pressable>
                      </View>

                      {/* NIN DOWNLOAD */}

                      {showNinDownload && (
                        <View style={styles.downloadArea}>
                          <Pressable
                            disabled={downloading}
                            onPress={() =>
                              handleNinDownload(item)
                            }
                            style={[
                              styles.downloadButton,
                              downloading &&
                                styles.downloadButtonDisabled,
                            ]}
                            android_ripple={{
                              color: "#D7E4FF",
                            }}
                          >
                            {downloading ? (
                              <ActivityIndicator
                                size="small"
                                color={BRAND_COLOR}
                              />
                            ) : (
                              <Ionicons
                                name="download-outline"
                                size={17}
                                color={BRAND_COLOR}
                              />
                            )}

                            <Text
                              style={styles.downloadText}
                            >
                              {downloading
                                ? "Downloading..."
                                : "Download NIN Slip"}
                            </Text>

                            {!downloading && (
                              <Ionicons
                                name="chevron-forward"
                                size={15}
                                color={BRAND_COLOR}
                              />
                            )}
                          </Pressable>
                        </View>
                      )}

                      {/* BVN DOWNLOAD */}

                      {showBvnDownload && (
                        <View style={styles.downloadArea}>
                          <Pressable
                            disabled={bvnDownloading}
                            onPress={() =>
                              handleBvnDownload(item)
                            }
                            style={[
                              styles.downloadButton,
                              bvnDownloading &&
                                styles.downloadButtonDisabled,
                            ]}
                            android_ripple={{
                              color: "#D7E4FF",
                            }}
                          >
                            {bvnDownloading ? (
                              <ActivityIndicator
                                size="small"
                                color={BRAND_COLOR}
                              />
                            ) : (
                              <Ionicons
                                name="download-outline"
                                size={17}
                                color={BRAND_COLOR}
                              />
                            )}

                            <Text
                              style={styles.downloadText}
                            >
                              {bvnDownloading
                                ? "Downloading..."
                                : "Download BVN Slip"}
                            </Text>

                            {!bvnDownloading && (
                              <Ionicons
                                name="chevron-forward"
                                size={15}
                                color={BRAND_COLOR}
                              />
                            )}
                          </Pressable>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>

            {/* FOOTER */}

            <Pressable
              style={styles.modalFooter}
              onPress={() => {
                handleSeeAllPress();
                navigateToHistory();
              }}
            >
              <Text style={styles.footerText}>
                See all notifications
              </Text>

              <View style={styles.footerArrow}>
                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color="#ffffff"
                />
              </View>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles = StyleSheet.create({
  outerContainer: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingTop: 12,
  },

  headerShell: {
    width: "92%",
  },

  headerLogoWrapper: {
    width: "100%",
    minHeight: 58,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: BRAND_COLOR,
    borderRadius: 17,
    shadowColor: BRAND_COLOR,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.16,
    shadowRadius: 9,
    elevation: 5,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  eLogoCircle: {
    width: 31,
    height: 31,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginRight: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  eLogoText: {
    color: BRAND_COLOR,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 23,
    fontStyle: "italic",
  },

  headerLogo: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    marginRight: 9,
    tintColor: "#FFFFFF",
  },

  headerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.15,
  },

  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    position: "relative",
  },

  badgeContainer: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: BRAND_COLOR,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "900",
    textAlign: "center",
  },

  /*
   * MODAL
   */

  modalRoot: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 82,
    paddingHorizontal: 14,
  },

  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.14)",
  },

  dismissAbsoluteContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  modalCard: {
    width: "92%",
    maxWidth: 390,
    maxHeight: "76%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 16,
    zIndex: 20,
  },

  topAccent: {
    height: 3,
    backgroundColor: BRAND_COLOR,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  modalHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    flex: 1,
  },

  notificationHeaderIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BRAND_LIGHT,
    marginRight: 10,
  },

  modalTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  modalSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: "#94A3B8",
  },

  markReadButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: BRAND_LIGHT,
  },

  markReadText: {
    fontSize: 11,
    color: BRAND_COLOR,
    fontWeight: "800",
  },

  /*
   * NOTIFICATION LIST
   */

  listScroll: {
    flexGrow: 0,
  },

  listContent: {
    paddingVertical: 3,
  },

  emptyContent: {
    flexGrow: 1,
  },

  notificationItem: {
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F8FAFC",
    backgroundColor: "#FFFFFF",
  },

  unreadBackground: {
    backgroundColor: "#F9FBFF",
  },

  itemRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
  },

  itemPressArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    minWidth: 0,
  },

  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 11,
    marginTop: 1,
    flexShrink: 0,
  },

  textContainer: {
    flex: 1,
    paddingRight: 5,
    minWidth: 0,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 4,
  },

  itemTitle: {
    flex: 1,
    fontSize: 13,
    color: "#334155",
    lineHeight: 18,
    marginBottom: 2,
  },

  boldText: {
    fontWeight: "800",
    color: "#0F172A",
  },

  inlineUnreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BRAND_COLOR,
    marginLeft: 6,
    marginBottom: 4,
  },

  itemDescription: {
    fontSize: 11.5,
    color: "#64748B",
    lineHeight: 16,
    marginBottom: 4,
  },

  itemTime: {
    fontSize: 9.5,
    color: "#94A3B8",
  },

  /*
   * DOWNLOAD BUTTONS
   */

  downloadArea: {
    width: "100%",
    paddingLeft: 49,
    paddingTop: 10,
    paddingBottom: 1,
  },

  downloadButton: {
    alignSelf: "flex-start",
    minHeight: 37,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#C9D9FA",
    backgroundColor: "#F7FAFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  downloadButtonDisabled: {
    opacity: 0.6,
  },

  downloadText: {
    color: BRAND_COLOR,
    fontSize: 11,
    fontWeight: "800",
  },

  /*
   * EMPTY STATE
   */

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#334155",
    marginBottom: 4,
  },

  emptyDescription: {
    fontSize: 11,
    color: "#94A3B8",
  },

  /*
   * FOOTER
   */

  modalFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },

  footerText: {
    fontSize: 11.5,
    fontWeight: "800",
    color: BRAND_COLOR,
    marginRight: 8,
  },

  footerArrow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BRAND_COLOR,
  },
});