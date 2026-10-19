// screens/StatutoryHistoryScreen.jsx

import React, {
  useMemo,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useNavigation,
} from "@react-navigation/native";

import {
  Ionicons,
} from "@expo/vector-icons";

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

const BRAND_BLUE = "#2a5fd3";

/**
 * =========================================================
 * GENERIC NOTIFICATION METADATA HELPERS
 * =========================================================
 */

function parseMetadata(value) {
  if (
    value &&
    typeof value === "object"
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    try {
      const parsed =
        JSON.parse(value);

      return parsed &&
        typeof parsed === "object"
        ? parsed
        : {};
    } catch {
      return {};
    }
  }

  return {};
}

function getNotificationMetadata(
  notification
) {
  const candidates = [
    notification?.metadata,
    notification?.data?.metadata,
    notification?.meta,
    notification?.data?.meta,
    notification?.payload?.metadata,
    notification?.data?.payload?.metadata,
  ];

  for (
    const candidate of candidates
  ) {
    const metadata =
      parseMetadata(candidate);

    if (
      Object.keys(
        metadata
      ).length > 0
    ) {
      return metadata;
    }
  }

  return {};
}

function firstNonEmpty(
  values
) {
  for (
    const value of values
  ) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(
        value
      ).trim();
    }
  }

  return null;
}

/**
 * =========================================================
 * BVN NOTIFICATION HELPERS
 * =========================================================
 *
 * BVN download endpoint requires:
 *
 * GET /identity/bvn/:requestId/download
 *
 * IMPORTANT:
 * requestId has priority.
 *
 * We also support the same identifier shape used by
 * the working NIN notification flow:
 *
 * {
 *   identifier: {
 *     kind: "requestId",
 *     value: "87"
 *   }
 * }
 */

function extractRequestIdFromIdentifier(
  value
) {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return null;
  }

  const kind =
    String(
      value.kind ||
        value.type ||
        ""
    )
      .trim()
      .toLowerCase();

  const identifierValue =
    firstNonEmpty([
      value.value,
      value.requestId,
      value.request_id,
    ]);

  if (
    identifierValue &&
    (
      !kind ||
      kind === "requestid" ||
      kind === "request_id" ||
      kind === "identityrequestid" ||
      kind === "identity_request_id"
    )
  ) {
    return identifierValue;
  }

  return null;
}

function getBvnDownloadIdentifier(
  notification
) {
  const metadata =
    getNotificationMetadata(
      notification
    );

  /**
   * -------------------------------------------------------
   * FIRST: explicit identifier objects
   * -------------------------------------------------------
   */

  const explicitIdentifier =
    firstNonEmpty([
      extractRequestIdFromIdentifier(
        notification?.identifier
      ),
      extractRequestIdFromIdentifier(
        notification?.data?.identifier
      ),
      extractRequestIdFromIdentifier(
        notification?.payload?.identifier
      ),
      extractRequestIdFromIdentifier(
        notification?.data?.payload?.identifier
      ),
      extractRequestIdFromIdentifier(
        metadata?.identifier
      ),
    ]);

  if (
    explicitIdentifier
  ) {
    return {
      value:
        explicitIdentifier,
      kind: "requestId",
    };
  }

  /**
   * -------------------------------------------------------
   * SECOND: direct request ID fields
   * -------------------------------------------------------
   */

  const requestId =
    firstNonEmpty([
      metadata.requestId,
      metadata.bvnRequestId,
      metadata.identityRequestId,
      metadata.request_id,
      metadata.bvn_request_id,
      metadata.identity_request_id,

      notification?.requestId,
      notification?.bvnRequestId,
      notification?.identityRequestId,
      notification?.request_id,
      notification?.bvn_request_id,
      notification?.identity_request_id,

      notification?.data?.requestId,
      notification?.data?.bvnRequestId,
      notification?.data?.identityRequestId,
      notification?.data?.request_id,
      notification?.data?.bvn_request_id,
      notification?.data?.identity_request_id,

      notification?.payload?.requestId,
      notification?.payload?.bvnRequestId,
      notification?.payload?.identityRequestId,

      notification?.data?.payload?.requestId,
      notification?.data?.payload?.bvnRequestId,
      notification?.data?.payload?.identityRequestId,
    ]);

  if (
    requestId
  ) {
    return {
      value: requestId,
      kind: "requestId",
    };
  }

  return null;
}

/**
 * =========================================================
 * DETERMINE SUCCESSFUL BVN VALIDATION
 * =========================================================
 *
 * We deliberately do NOT require the exact word
 * "validation".
 *
 * Valid examples include:
 *
 * - BVN validation successful
 * - BVN verification successful
 * - BVN verified successfully
 * - BVN validated successfully
 * - BVN slip generated successfully
 *
 * Recovery notifications are excluded.
 */

function isSuccessfulBvnNotification(
  notification
) {
  const title =
    String(
      notification?.title ||
        ""
    )
      .trim()
      .toLowerCase();

  const message =
    String(
      notification?.message ||
        notification?.description ||
        ""
    )
      .trim()
      .toLowerCase();

  const type =
    String(
      notification?.type ||
        ""
    )
      .trim()
      .toLowerCase();

  const combined =
    `${title} ${message} ${type}`;

  if (
    !combined.includes("bvn")
  ) {
    return false;
  }

  /**
   * -------------------------------------------------------
   * Exclude failed notifications.
   * -------------------------------------------------------
   */

  const failedWords = [
    "refund",
    "refunded",
    "failed",
    "failure",
    "could not",
    "unable",
    "error",
    "declined",
  ];

  if (
    failedWords.some(
      (word) =>
        combined.includes(
          word
        )
    )
  ) {
    return false;
  }

  /**
   * -------------------------------------------------------
   * Exclude BVN recovery notifications.
   * -------------------------------------------------------
   *
   * We only want the BVN validation/verification slip
   * download here.
   */

  const recoveryWords = [
    "recovery",
    "recover bvn",
    "bvn recovery",
    "recovering bvn",
    "bvn recovered",
  ];

  if (
    recoveryWords.some(
      (word) =>
        combined.includes(
          word
        )
    )
  ) {
    return false;
  }

  /**
   * -------------------------------------------------------
   * Require a recognizable success state.
   * -------------------------------------------------------
   */

  const successWords = [
    "successful",
    "successfully",
    "completed",
    "complete",
    "verified",
    "verification successful",
    "verification completed",
    "validation successful",
    "validation completed",
    "validated successfully",
    "slip generated",
    "bvn slip",
  ];

  const hasSuccessWord =
    successWords.some(
      (word) =>
        combined.includes(
          word
        )
    );

  if (
    !hasSuccessWord
  ) {
    return false;
  }

  /**
   * -------------------------------------------------------
   * Require a validation / verification context.
   * -------------------------------------------------------
   */

  const validationWords = [
    "validation",
    "validated",
    "verification",
    "verified",
    "bvn slip",
    "slip generated",
  ];

  return validationWords.some(
    (word) =>
      combined.includes(
        word
      )
  );
}

/**
 * =========================================================
 * BVN PDF STATE
 * =========================================================
 *
 * available:
 *   downloadAvailable === true
 *
 * unavailable:
 *   downloadAvailable === false
 *
 * unknown:
 *   old notification without PDF metadata
 *
 * Unknown still gets a download button.
 * The actual backend endpoint decides whether a PDF exists.
 */

function getBvnPdfState(
  notification
) {
  const metadata =
    getNotificationMetadata(
      notification
    );

  /**
   * Search metadata first, then direct notification data.
   * This keeps compatibility with both old and new
   * notification payloads.
   */

  const rawValue =
    metadata.downloadAvailable ??
    metadata.download_available ??
    metadata.hasPdf ??
    metadata.has_pdf ??
    metadata.pdfAvailable ??
    metadata.pdf_available ??
    notification?.downloadAvailable ??
    notification?.download_available ??
    notification?.hasPdf ??
    notification?.has_pdf ??
    notification?.data?.downloadAvailable ??
    notification?.data?.download_available ??
    notification?.data?.hasPdf ??
    notification?.data?.has_pdf ??
    notification?.data?.pdfAvailable ??
    notification?.data?.pdf_available;

  if (
    rawValue === true ||
    String(rawValue)
      .trim()
      .toLowerCase() ===
      "true"
  ) {
    return "available";
  }

  if (
    rawValue === false ||
    String(rawValue)
      .trim()
      .toLowerCase() ===
      "false"
  ) {
    return "unavailable";
  }

  return "unknown";
}

function shouldShowBvnDownload(
  notification
) {
  if (
    !isSuccessfulBvnNotification(
      notification
    )
  ) {
    return false;
  }

  if (
    getBvnPdfState(
      notification
    ) === "unavailable"
  ) {
    return false;
  }

  return Boolean(
    getBvnDownloadIdentifier(
      notification
    )
  );
}

function shouldShowBvnNoPdf(
  notification
) {
  return (
    isSuccessfulBvnNotification(
      notification
    ) &&
    getBvnPdfState(
      notification
    ) === "unavailable"
  );
}

/**
 * =========================================================
 * NOTIFICATION CARD
 * =========================================================
 */

function NotificationCard({
  item,
  onPress,
  onDownloadNin,
  onDownloadBvn,
  downloadingNotificationKey,
  downloadingBvnNotificationKey,
}) {
  const iconColor =
    item.unread
      ? BRAND_BLUE
      : "#64748B";

  /**
   * -------------------------------------------------------
   * NIN DOWNLOAD STATE
   * -------------------------------------------------------
   */

  const ninIdentifier =
    getNinDownloadIdentifier(
      item
    );

  const downloadNinKey =
    ninIdentifier
      ? `${item?.id || "notification"}:nin:${ninIdentifier.value}`
      : null;

  const showNinDownload =
    shouldShowNinDownload(
      item
    );

  const downloadingNin =
    Boolean(
      downloadNinKey &&
        downloadingNotificationKey ===
          downloadNinKey
    );

  /**
   * -------------------------------------------------------
   * BVN DOWNLOAD STATE
   * -------------------------------------------------------
   */

  const bvnIdentifier =
    getBvnDownloadIdentifier(
      item
    );

  const downloadBvnKey =
    bvnIdentifier
      ? `${item?.id || "notification"}:bvn:${bvnIdentifier.value}`
      : null;

  const showBvnDownload =
    shouldShowBvnDownload(
      item
    );

  const showBvnNoPdf =
    shouldShowBvnNoPdf(
      item
    );

  const downloadingBvn =
    Boolean(
      downloadBvnKey &&
        downloadingBvnNotificationKey ===
          downloadBvnKey
    );

  /**
   * -------------------------------------------------------
   * TEMPORARY BVN UI DEBUG
   * -------------------------------------------------------
   *
   * This helps confirm exactly what the screen sees.
   * It can remain while testing and can be removed later.
   */

  if (
    String(
      item?.title ||
        ""
    )
      .toLowerCase()
      .includes("bvn") ||
    String(
      item?.description ||
        item?.message ||
        ""
    )
      .toLowerCase()
      .includes("bvn")
  ) {
    console.log(
      "BVN STATUTORY SCREEN CHECK:",
      {
        notificationId:
          item?.id,
        title:
          item?.title,
        description:
          item?.description ||
          item?.message,
        identifier:
          item?.identifier,
        dataIdentifier:
          item?.data
            ?.identifier,
        requestId:
          item?.requestId,
        dataRequestId:
          item?.data
            ?.requestId,
        bvnIdentifier,
        bvnSuccess:
          isSuccessfulBvnNotification(
            item
          ),
        bvnPdfState:
          getBvnPdfState(
            item
          ),
        showBvnDownload,
        showBvnNoPdf,
      }
    );
  }

  return (
    <View
      style={[
        styles.notificationCard,
        item.unread &&
          styles.unreadNotificationCard,
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() =>
          onPress(item)
        }
        style={
          styles.notificationMainRow
        }
      >
        <View
          style={[
            styles.iconContainer,
            item.unread &&
              styles.unreadIconContainer,
          ]}
        >
          <Ionicons
            name={
              item.icon ||
              "information-circle"
            }
            size={23}
            color={iconColor}
          />
        </View>

        <View
          style={
            styles.notificationContent
          }
        >
          <View
            style={
              styles.notificationTitleRow
            }
          >
            <Text
              style={[
                styles.notificationTitle,
                item.unread &&
                  styles.unreadTitle,
              ]}
              numberOfLines={1}
            >
              {item.title ||
                "Notification"}
            </Text>

            {item.unread && (
              <View
                style={
                  styles.unreadDot
                }
              />
            )}
          </View>

          <Text
            style={
              styles.notificationDescription
            }
          >
            {item.description ||
              item.message ||
              ""}
          </Text>

          <View
            style={
              styles.notificationMeta
            }
          >
            <Text
              style={
                styles.notificationTime
              }
            >
              {item.time || ""}
            </Text>

            {item.type && (
              <View
                style={
                  styles.typeBadge
                }
              >
                <Text
                  style={
                    styles.typeBadgeText
                  }
                >
                  {String(
                    item.type
                  ).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {/* ===================================================
          NIN DOWNLOAD
          =================================================== */}

      {showNinDownload && (
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={downloadingNin}
          onPress={() =>
            onDownloadNin(item)
          }
          style={
            styles.ninDownloadButton
          }
        >
          {downloadingNin ? (
            <ActivityIndicator
              size="small"
              color={BRAND_BLUE}
            />
          ) : (
            <Ionicons
              name="download-outline"
              size={18}
              color={BRAND_BLUE}
            />
          )}

          <Text
            style={
              styles.ninDownloadButtonText
            }
          >
            {downloadingNin
              ? "Downloading..."
              : "Download NIN Slip"}
          </Text>
        </TouchableOpacity>
      )}

      {/* ===================================================
          BVN DOWNLOAD
          =================================================== */}

      {showBvnDownload && (
        <TouchableOpacity
          activeOpacity={0.75}
          disabled={downloadingBvn}
          onPress={() =>
            onDownloadBvn(item)
          }
          style={
            styles.bvnDownloadButton
          }
        >
          {downloadingBvn ? (
            <ActivityIndicator
              size="small"
              color={BRAND_BLUE}
            />
          ) : (
            <Ionicons
              name="download-outline"
              size={18}
              color={BRAND_BLUE}
            />
          )}

          <Text
            style={
              styles.bvnDownloadButtonText
            }
          >
            {downloadingBvn
              ? "Downloading..."
              : "Download BVN Slip"}
          </Text>
        </TouchableOpacity>
      )}

      {/* ===================================================
          BVN SUCCESS BUT NO PDF
          =================================================== */}

      {showBvnNoPdf && (
        <View
          style={
            styles.bvnNoPdfBox
          }
        >
          <Ionicons
            name="document-text-outline"
            size={17}
            color="#64748B"
          />

          <Text
            style={
              styles.bvnNoPdfText
            }
          >
            No PDF attached
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * =========================================================
 * MAIN NOTIFICATION SCREEN
 * =========================================================
 */

export default function StatutoryHistoryScreen() {
  const navigation =
    useNavigation();

  const {
    notifications,
    isLoading,
    isRefreshing,
    refreshNotifications,
    markAllAsRead,
    handleNotificationPress,
  } =
    useNotificationDropdown();

  const [
    searchQuery,
    setSearchQuery,
  ] = React.useState("");

  const [
    downloadingNotificationKey,
    setDownloadingNotificationKey,
  ] = React.useState(null);

  const [
    downloadingBvnNotificationKey,
    setDownloadingBvnNotificationKey,
  ] = React.useState(null);

  /**
   * =======================================================
   * NIN DOWNLOAD
   * =======================================================
   */

  const handleNinDownload =
    async (
      notification
    ) => {
      const identifier =
        getNinDownloadIdentifier(
          notification
        );

      if (!identifier) {
        Alert.alert(
          "NIN Download",
          "The successful NIN notification does not contain a usable request reference."
        );
        return;
      }

      const downloadKey =
        `${notification?.id || "notification"}:nin:${identifier.value}`;

      setDownloadingNotificationKey(
        downloadKey
      );

      try {
        await downloadNinFromNotification(
          notification
        );
      } catch (error) {
        Alert.alert(
          "NIN Download Failed",
          error?.message ||
            "Unable to download the NIN slip."
        );
      } finally {
        setDownloadingNotificationKey(
          null
        );
      }
    };

  /**
   * =======================================================
   * BVN DOWNLOAD
   * =======================================================
   */

  const handleBvnDownload =
    async (
      notification
    ) => {
      if (
        !isSuccessfulBvnNotification(
          notification
        )
      ) {
        Alert.alert(
          "BVN Download",
          "This notification does not contain a successful BVN validation."
        );
        return;
      }

      const identifier =
        getBvnDownloadIdentifier(
          notification
        );

      if (!identifier) {
        Alert.alert(
          "BVN Download",
          "The successful BVN notification does not contain a usable request ID."
        );
        return;
      }

      const downloadKey =
        `${notification?.id || "notification"}:bvn:${identifier.value}`;

      setDownloadingBvnNotificationKey(
        downloadKey
      );

      console.log(
        "[BVN STATUTORY DOWNLOAD] identifier:",
        identifier
      );

      setDownloadingBvnNotificationKey(
        downloadKey
      );

      try {
        await downloadBvnPdf(
          identifier.value
        );
      } catch (error) {
        const message =
          error?.response
            ?.data?.message ||
          error?.message ||
          "Unable to download the BVN slip.";

        const normalizedMessage =
          String(
            message
          ).toLowerCase();

        if (
          normalizedMessage.includes(
            "no pdf"
          ) ||
          normalizedMessage.includes(
            "pdf is attached"
          ) ||
          normalizedMessage.includes(
            "pdf attached"
          )
        ) {
          Alert.alert(
            "BVN Slip",
            "No PDF is attached to this BVN validation."
          );
        } else {
          Alert.alert(
            "BVN Download Failed",
            message
          );
        }
      } finally {
        setDownloadingBvnNotificationKey(
          null
        );
      }
    };

  /**
   * =======================================================
   * FILTER NOTIFICATIONS
   * =======================================================
   */

  const filteredNotifications =
    useMemo(() => {
      if (
        !searchQuery.trim()
      ) {
        return notifications;
      }

      const query =
        searchQuery
          .trim()
          .toLowerCase();

      return notifications.filter(
        (item) => {
          const title =
            String(
              item.title || ""
            ).toLowerCase();

          const description =
            String(
              item.description ||
                item.message ||
                ""
            ).toLowerCase();

          const type =
            String(
              item.type || ""
            ).toLowerCase();

          return (
            title.includes(
              query
            ) ||
            description.includes(
              query
            ) ||
            type.includes(
              query
            )
          );
        }
      );
    }, [
      notifications,
      searchQuery,
    ]);

  const unreadCount =
    notifications.filter(
      (item) =>
        item.unread
    ).length;

  return (
    <SafeAreaView
      style={
        styles.layoutContainer
      }
      edges={[
        "top",
        "left",
        "right",
      ]}
    >
      <View
        style={
          styles.headerBlock
        }
      >
        <View
          style={
            styles.headerRow
          }
        >
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              navigation.navigate(
                "HomeScreen"
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Go back to home screen"
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#0F172A"
            />
          </TouchableOpacity>

          <View
            style={
              styles.headerTitleContainer
            }
          >
            <Text
              style={
                styles.titleHeadline
              }
            >
              Notifications
            </Text>

            {unreadCount > 0 && (
              <View
                style={
                  styles.headerUnreadBadge
                }
              >
                <Text
                  style={
                    styles.headerUnreadText
                  }
                >
                  {unreadCount}
                </Text>
              </View>
            )}
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity
              style={
                styles.markAllButton
              }
              onPress={
                markAllAsRead
              }
              activeOpacity={0.7}
            >
              <Text
                style={
                  styles.markAllText
                }
              >
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View
          style={
            styles.searchBarBox
          }
        >
          <Ionicons
            name="search-outline"
            size={18}
            color="#64748B"
            style={
              styles.searchIcon
            }
          />

          <TextInput
            style={
              styles.textInputNode
            }
            value={searchQuery}
            onChangeText={
              setSearchQuery
            }
            placeholder="Search notifications..."
            placeholderTextColor="#94A3B8"
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {isLoading ? (
        <View
          style={
            styles.loadingCenter
          }
        >
          <ActivityIndicator
            size="large"
            color={BRAND_BLUE}
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading notifications...
          </Text>
        </View>
      ) : (
        <FlatList
          data={
            filteredNotifications
          }
          keyExtractor={(item) =>
            String(item.id)
          }
          renderItem={({
            item,
          }) => (
            <NotificationCard
              item={item}
              onPress={
                handleNotificationPress
              }
              onDownloadNin={
                handleNinDownload
              }
              onDownloadBvn={
                handleBvnDownload
              }
              downloadingNotificationKey={
                downloadingNotificationKey
              }
              downloadingBvnNotificationKey={
                downloadingBvnNotificationKey
              }
            />
          )}
          contentContainerStyle={[
            styles.scrollListPadding,
            filteredNotifications.length ===
              0 &&
              styles.emptyListContainer,
          ]}
          showsVerticalScrollIndicator={
            false
          }
          refreshControl={
            <RefreshControl
              refreshing={
                isRefreshing
              }
              onRefresh={
                refreshNotifications
              }
              colors={[
                BRAND_BLUE,
              ]}
              tintColor={
                BRAND_BLUE
              }
            />
          }
          ListHeaderComponent={
            notifications.length >
            0 ? (
              <View
                style={
                  styles.summaryContainer
                }
              >
                <Text
                  style={
                    styles.summaryText
                  }
                >
                  {notifications.length}{" "}
                  {notifications.length ===
                  1
                    ? "notification"
                    : "notifications"}
                </Text>

                {unreadCount >
                  0 && (
                  <Text
                    style={
                      styles.unreadSummary
                    }
                  >
                    {unreadCount} unread
                  </Text>
                )}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View
              style={
                styles.emptyViewCard
              }
            >
              <View
                style={
                  styles.emptyIconContainer
                }
              >
                <Ionicons
                  name={
                    searchQuery.trim()
                      ? "search-outline"
                      : "notifications-outline"
                  }
                  size={42}
                  color="#94A3B8"
                />
              </View>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                {searchQuery.trim()
                  ? "No notifications found"
                  : "No notifications yet"}
              </Text>

              <Text
                style={
                  styles.emptyLabel
                }
              >
                {searchQuery.trim()
                  ? "Try another search term."
                  : "Your wallet, airtime, funding and other transaction updates will appear here."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

/**
 * =========================================================
 * STYLES
 * =========================================================
 */

const styles =
  StyleSheet.create({
    layoutContainer: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    headerBlock: {
      backgroundColor:
        "#FFFFFF",
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderColor:
        "#E2E8F0",
      paddingTop: 8,
    },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      marginBottom: 12,
      minHeight: 40,
    },

    backButton: {
      padding: 4,
      marginRight: 8,
    },

    headerTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    titleHeadline: {
      fontSize: 22,
      fontWeight: "700",
      color: "#0F172A",
    },

    headerUnreadBadge: {
      minWidth: 22,
      height: 22,
      paddingHorizontal: 6,
      borderRadius: 11,
      backgroundColor:
        BRAND_BLUE,
      justifyContent:
        "center",
      alignItems: "center",
      marginLeft: 8,
    },

    headerUnreadText: {
      color: "#FFFFFF",
      fontSize: 11,
      fontWeight: "700",
    },

    markAllButton: {
      paddingVertical: 6,
      paddingHorizontal: 4,
    },

    markAllText: {
      color: BRAND_BLUE,
      fontSize: 12,
      fontWeight: "600",
    },

    searchBarBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        "#F1F5F9",
      marginHorizontal: 20,
      borderRadius: 10,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    searchIcon: {
      marginRight: 7,
    },

    textInputNode: {
      flex: 1,
      height: 40,
      fontSize: 13,
      color: "#0F172A",
      paddingVertical: 0,
    },

    summaryContainer: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems: "center",
      paddingHorizontal: 18,
      paddingBottom: 8,
    },

    summaryText: {
      fontSize: 12,
      color: "#64748B",
      fontWeight: "500",
    },

    unreadSummary: {
      fontSize: 12,
      color: BRAND_BLUE,
      fontWeight: "600",
    },

    notificationCard: {
      marginHorizontal: 14,
      marginVertical: 5,
      padding: 14,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    notificationMainRow: {
      flexDirection: "row",
      alignItems:
        "flex-start",
    },

    unreadNotificationCard: {
      backgroundColor:
        "#F8FBFF",
      borderColor:
        "#D7E4FF",
    },

    iconContainer: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor:
        "#F1F5F9",
      justifyContent:
        "center",
      alignItems: "center",
      marginRight: 12,
    },

    unreadIconContainer: {
      backgroundColor:
        "#E8F0FF",
    },

    notificationContent: {
      flex: 1,
    },

    notificationTitleRow: {
      flexDirection: "row",
      alignItems:
        "center",
      marginBottom: 5,
    },

    notificationTitle: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: "#334155",
    },

    unreadTitle: {
      color: "#0F172A",
      fontWeight: "700",
    },

    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor:
        BRAND_BLUE,
      marginLeft: 8,
    },

    notificationDescription: {
      fontSize: 13,
      lineHeight: 19,
      color: "#64748B",
    },

    notificationMeta: {
      flexDirection: "row",
      alignItems:
        "center",
      marginTop: 9,
    },

    notificationTime: {
      fontSize: 11,
      color: "#94A3B8",
    },

    typeBadge: {
      marginLeft: 8,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 5,
      backgroundColor:
        "#F1F5F9",
    },

    typeBadgeText: {
      fontSize: 8,
      fontWeight: "700",
      color: "#64748B",
    },

    ninDownloadButton: {
      marginTop: 12,
      marginLeft: 58,
      alignSelf:
        "flex-start",
      minHeight: 36,
      paddingHorizontal: 12,
      borderRadius: 9,
      borderWidth: 1,
      borderColor:
        "#D7E4FF",
      backgroundColor:
        "#F8FBFF",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
    },

    ninDownloadButtonText: {
      marginLeft: 7,
      color: BRAND_BLUE,
      fontSize: 12,
      fontWeight: "700",
    },

    bvnDownloadButton: {
      marginTop: 12,
      marginLeft: 58,
      alignSelf:
        "flex-start",
      minHeight: 36,
      paddingHorizontal: 12,
      borderRadius: 9,
      borderWidth: 1,
      borderColor:
        "#D7E4FF",
      backgroundColor:
        "#F8FBFF",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
    },

    bvnDownloadButtonText: {
      marginLeft: 7,
      color: BRAND_BLUE,
      fontSize: 12,
      fontWeight: "700",
    },

    bvnNoPdfBox: {
      marginTop: 12,
      marginLeft: 58,
      alignSelf:
        "flex-start",
      minHeight: 34,
      paddingHorizontal: 11,
      borderRadius: 8,
      backgroundColor:
        "#F1F5F9",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
    },

    bvnNoPdfText: {
      marginLeft: 6,
      color: "#64748B",
      fontSize: 12,
      fontWeight: "600",
    },

    scrollListPadding: {
      paddingTop: 12,
      paddingBottom: 30,
    },

    emptyListContainer: {
      flexGrow: 1,
    },

    loadingCenter: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
    },

    loadingText: {
      marginTop: 10,
      fontSize: 13,
      color: "#64748B",
    },

    emptyViewCard: {
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 30,
      flex: 1,
    },

    emptyIconContainer: {
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor:
        "#E2E8F0",
      justifyContent:
        "center",
      alignItems: "center",
      marginBottom: 16,
    },

    emptyTitle: {
      color: "#0F172A",
      fontSize: 16,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 7,
    },

    emptyLabel: {
      color: "#64748B",
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
      maxWidth: 320,
    },
  });