// src/components/BvnValidationModal.js

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

import { useBvn } from "../hooks/useBvn";

// ============================================================
// COLORS
// ============================================================

const COLORS = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#EFF6FF",
  primaryBorder: "#BFDBFE",

  background: "#FFFFFF",
  surface: "#F8FAFC",
  border: "#E2E8F0",

  text: "#0F172A",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",

  success: "#16A34A",
  successLight: "#F0FDF4",
  successBorder: "#BBF7D0",

  danger: "#DC2626",
  dangerLight: "#FEF2F2",
  dangerBorder: "#FECACA",

  warning: "#D97706",
  warningLight: "#FFFBEB",
  warningBorder: "#FDE68A",

  white: "#FFFFFF",
};

// ============================================================
// BVN PACKAGES
// ============================================================

const DEFAULT_PACKAGES = {
  standard: {
    name: "Standard BVN Slip",
    description:
      "Standard BVN validation result for identity verification.",
    price: 230,
  },

  premium: {
    name: "Premium BVN Slip",
    description:
      "Premium BVN validation document.",
    price: 240,
  },
};

// ============================================================
// HELPERS
// ============================================================

function cleanBvn(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, 11);
}

function formatNaira(value) {
  const amount = Number(value);

  if (
    !Number.isFinite(amount)
  ) {
    return "₦0.00";
  }

  return `₦${amount.toLocaleString(
    "en-NG",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

function getRequestId(data) {
  return (
    data?.requestId ??
    data?.id ??
    data?.request?.requestId ??
    data?.request?.id ??
    data?.data?.requestId ??
    data?.data?.id ??
    null
  );
}

function getRequestStatus(data) {
  return String(
    data?.status ??
      data?.request?.status ??
      data?.data?.status ??
      ""
  ).toUpperCase();
}

function hasPdf(data) {
  return Boolean(
    data?.hasPdf ??
      data?.has_pdf ??
      data?.request?.hasPdf ??
      data?.request?.has_pdf ??
      data?.data?.hasPdf ??
      data?.data?.has_pdf ??
      data?.result?.hasPdf ??
      data?.result?.has_pdf ??
      data?.result?.data?.pdf_base64 ??
      data?.result?.pdf_base64
  );
}

// ============================================================
// COMPONENT
// ============================================================

export default function BvnValidationModal({
  visible,
  onClose,
  onSuccess,
}) {
  const {
    service,
    request,
    loading,
    serviceLoading,
    checkingStatus,
    downloading,
    error,

    loadService,
    submitBvn,
    checkStatus,
    downloadBvn,
    reset,
  } = useBvn();

  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [
    bvn,
    setBvn,
  ] = useState("");

  const [
    transactionPin,
    setTransactionPin,
  ] = useState("");

  const [
    cardType,
    setCardType,
  ] = useState("standard");

  const [
    ownershipConfirmed,
    setOwnershipConfirmed,
  ] = useState(false);

  const [
    step,
    setStep,
  ] = useState("form");

  const [
    localError,
    setLocalError,
  ] = useState(null);

  // ==========================================================
  // LOAD SERVICE
  // ==========================================================

  useEffect(() => {
    if (!visible) {
      return;
    }

    let mounted = true;

    async function load() {
      try {
        await loadService();
      } catch (err) {
        if (!mounted) {
          return;
        }

        console.error(
          "[BvnValidationModal] service load error:",
          err
        );
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [
    visible,
    loadService,
  ]);

  // ==========================================================
  // RESET WHEN CLOSED
  // ==========================================================

  useEffect(() => {
    if (visible) {
      return;
    }

    setBvn("");
    setTransactionPin("");
    setCardType("standard");
    setOwnershipConfirmed(false);
    setStep("form");
    setLocalError(null);

    reset();
  }, [
    visible,
    reset,
  ]);

  // ==========================================================
  // SERVICE PRICES
  // ==========================================================

  const packages = useMemo(() => {
    const servicePrices =
      service?.prices ||
      service?.data?.prices ||
      {};

    return {
      standard: {
        ...DEFAULT_PACKAGES.standard,

        price:
          Number(
            servicePrices.standard
          ) > 0
            ? Number(
                servicePrices.standard
              )
            : DEFAULT_PACKAGES
                .standard.price,
      },

      premium: {
        ...DEFAULT_PACKAGES.premium,

        price:
          Number(
            servicePrices.premium
          ) > 0
            ? Number(
                servicePrices.premium
              )
            : DEFAULT_PACKAGES
                .premium.price,
      },
    };
  }, [
    service,
  ]);

  const selectedPackage =
    packages[
      cardType
    ] ||
    packages.standard;

  // ==========================================================
  // REQUEST STATUS WATCHER
  // ==========================================================

  useEffect(() => {
    if (!request) {
      return;
    }

    const status =
      getRequestStatus(
        request
      );

    if (
      status === "SUCCESS"
    ) {
      setStep("success");
      return;
    }

    if (
      status === "FAILED"
    ) {
      setStep("failed");
      return;
    }

    if (
      status === "PROCESSING" ||
      status === "PENDING"
    ) {
      setStep("processing");
    }
  }, [
    request,
  ]);

  // ==========================================================
  // RESET FORM
  // ==========================================================

  const handleReset = useCallback(() => {
    setBvn("");
    setTransactionPin("");
    setCardType("standard");
    setOwnershipConfirmed(false);
    setLocalError(null);
    setStep("form");

    reset();
  }, [
    reset,
  ]);

  // ==========================================================
  // CLOSE
  // ==========================================================

  const handleClose = useCallback(() => {
    if (
      loading ||
      downloading
    ) {
      return;
    }

    handleReset();

    if (onClose) {
      onClose();
    }
  }, [
    loading,
    downloading,
    handleReset,
    onClose,
  ]);

  // ==========================================================
  // SUBMIT BVN
  // ==========================================================

  const handleSubmit = useCallback(
    async () => {
      setLocalError(null);

      const cleanValue =
        cleanBvn(bvn);

      // ------------------------------------------------------
      // BVN VALIDATION
      // ------------------------------------------------------

      if (
        cleanValue.length !==
        11
      ) {
        setLocalError(
          "Please enter a valid 11-digit BVN."
        );

        return;
      }

      // ------------------------------------------------------
      // TRANSACTION PIN
      // ------------------------------------------------------

      const pin =
        String(
          transactionPin || ""
        ).trim();

      if (
        !/^\d{4}$/.test(pin)
      ) {
        setLocalError(
          "Transaction PIN must contain exactly 4 digits."
        );

        return;
      }

      // ------------------------------------------------------
      // OWNERSHIP
      // ------------------------------------------------------

      if (
        !ownershipConfirmed
      ) {
        setLocalError(
          "Please confirm that this BVN belongs to you."
        );

        return;
      }

      try {
        setStep(
          "processing"
        );

        const result =
          await submitBvn({
            bvn:
              cleanValue,

            cardType:
              cardType,

            slipType:
              cardType,

            transactionPin:
              pin,

            ownershipConfirmed:
              true,
          });

        const status =
          getRequestStatus(
            result
          );

        if (
          status ===
          "SUCCESS" ||
          result?.success ===
            true
        ) {
          setStep(
            "success"
          );

          if (
            onSuccess
          ) {
            onSuccess(
              result
            );
          }

          return;
        }

        if (
          status ===
          "FAILED"
        ) {
          setStep(
            "failed"
          );

          return;
        }

        setStep(
          "processing"
        );
      } catch (
        err
      ) {
        console.error(
          "[BvnValidationModal] submit error:",
          err
        );

        const message =
          err?.response
            ?.data?.message ||
          err?.message ||
          "BVN validation failed.";

        setLocalError(
          message
        );

        setStep(
          "form"
        );
      }
    },
    [
      bvn,
      transactionPin,
      ownershipConfirmed,
      cardType,
      submitBvn,
      onSuccess,
    ]
  );

  // ==========================================================
  // CHECK STATUS
  // ==========================================================

  const handleCheckStatus =
    useCallback(
      async () => {
        const requestId =
          getRequestId(
            request
          );

        if (
          !requestId
        ) {
          Alert.alert(
            "BVN Validation",
            "BVN request ID is not available yet."
          );

          return;
        }

        try {
          setLocalError(null);

          const result =
            await checkStatus(
              requestId
            );

          const status =
            getRequestStatus(
              result
            );

          if (
            status ===
            "SUCCESS"
          ) {
            setStep(
              "success"
            );

            return;
          }

          if (
            status ===
            "FAILED"
          ) {
            setStep(
              "failed"
            );

            return;
          }

          setStep(
            "processing"
          );

          Alert.alert(
            "BVN Validation",
            "Your BVN validation is still being processed. Please check again shortly."
          );
        } catch (
          err
        ) {
          console.error(
            "[BvnValidationModal] status error:",
            err
          );

          Alert.alert(
            "Unable to Check Status",
            err?.message ||
              "Unable to check BVN validation status."
          );
        }
      },
      [
        request,
        checkStatus,
      ]
    );

  // ==========================================================
  // DOWNLOAD BVN SLIP
  // ==========================================================

  const handleDownload =
    useCallback(
      async () => {
        const requestId =
          getRequestId(
            request
          );

        if (
          !requestId
        ) {
          Alert.alert(
            "BVN Slip",
            "BVN request ID is not available."
          );

          return;
        }

        try {
          setLocalError(null);

          await downloadBvn(
            requestId
          );
        } catch (
          err
        ) {
          console.error(
            "[BvnValidationModal] download error:",
            err
          );

          Alert.alert(
            "Download Failed",
            err?.message ||
              "Unable to download BVN slip."
          );
        }
      },
      [
        request,
        downloadBvn,
      ]
    );

  // ==========================================================
  // ERROR MESSAGE
  // ==========================================================

  const displayedError =
    localError ||
    error ||
    null;

  // ==========================================================
  // FORM
  // ==========================================================

  const renderForm =
    () => (
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* HEADER */}
        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.headerIcon
            }
          >
            <Text
              style={
                styles.headerIconText
              }
            >
              B
            </Text>
          </View>

          <View
            style={
              styles.headerTextContainer
            }
          >
            <Text
              style={
                styles.title
              }
            >
              BVN Validation
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Validate your BVN and obtain your BVN slip.
            </Text>
          </View>

          <Pressable
            onPress={
              handleClose
            }
            style={
              styles.closeButton
            }
          >
            <Text
              style={
                styles.closeButtonText
              }
            >
              ×
            </Text>
          </Pressable>
        </View>

        {/* INFORMATION CARD */}
        <View
          style={
            styles.infoCard
          }
        >
          <View
            style={
              styles.infoIcon
            }
          >
            <Text
              style={
                styles.infoIconText
            }
            >
              i
            </Text>
          </View>

          <View
            style={
              styles.infoContent
            }
          >
            <Text
              style={
                styles.infoTitle
              }
            >
              BVN Validation
            </Text>

            <Text
              style={
                styles.infoText
              }
            >
              Your BVN is securely submitted through eVault to the validation provider. Provider credentials are never exposed to the app.
            </Text>

            <Text
              style={
                styles.infoText
              }
            >
              The selected BVN slip fee is deducted from your eVault wallet only when the request is submitted.
            </Text>
          </View>
        </View>

        {/* SERVICE LOADING */}
        {serviceLoading && (
          <View
            style={
              styles.serviceLoading
            }
          >
            <ActivityIndicator
              size="small"
              color={
                COLORS.primary
              }
            />

            <Text
              style={
                styles.serviceLoadingText
              }
            >
              Loading BVN service...
            </Text>
          </View>
        )}

        {/* BVN INPUT */}
        <View
          style={
            styles.field
          }
        >
          <Text
            style={
              styles.label
            }
          >
            BVN
          </Text>

          <TextInput
            value={
              bvn
            }
            onChangeText={
              (value) => {
                setBvn(
                  cleanBvn(
                    value
                  )
                );

                setLocalError(
                  null
                );
              }
            }
            placeholder="Enter your 11-digit BVN"
            placeholderTextColor={
              COLORS.textMuted
            }
            keyboardType="number-pad"
            maxLength={
              11
            }
            style={
              styles.input
            }
            editable={
              !loading
            }
          />

          <Text
            style={
              styles.helperText
            }
          >
            {bvn.length}/11 digits
          </Text>
        </View>

        {/* SLIP TYPE */}
        <View
          style={
            styles.field
          }
        >
          <Text
            style={
              styles.label
            }
          >
            Choose BVN slip
          </Text>

          <View
            style={
              styles.packageContainer
            }
          >
            {Object.keys(
              packages
            ).map(
              (
                type
              ) => {
                const item =
                  packages[
                    type
                  ];

                const selected =
                  cardType ===
                  type;

                return (
                  <Pressable
                    key={
                      type
                    }
                    onPress={() => {
                      setCardType(
                        type
                      );

                      setLocalError(
                        null
                      );
                    }}
                    disabled={
                      loading
                    }
                    style={[
                      styles.packageCard,
                      selected &&
                        styles.packageCardSelected,
                    ]}
                  >
                    <View
                      style={
                        styles.packageTopRow
                      }
                    >
                      <View
                        style={[
                          styles.radioOuter,
                          selected &&
                            styles.radioOuterSelected,
                        ]}
                      >
                        {selected && (
                          <View
                            style={
                              styles.radioInner
                            }
                          />
                        )}
                      </View>

                      <View
                        style={
                          styles.packageMain
                        }
                      >
                        <Text
                          style={[
                            styles.packageName,
                            selected &&
                              styles.packageNameSelected,
                          ]}
                        >
                          {
                            item.name
                          }
                        </Text>

                        <Text
                          style={
                            styles.packageDescription
                          }
                        >
                          {
                            item.description
                          }
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.packagePrice,
                          selected &&
                            styles.packagePriceSelected,
                        ]}
                      >
                        {formatNaira(
                          item.price
                        )}
                      </Text>
                    </View>
                  </Pressable>
                );
              }
            )}
          </View>
        </View>

        {/* PIN */}
        <View
          style={
            styles.field
          }
        >
          <Text
            style={
              styles.label
            }
          >
            Transaction PIN
          </Text>

          <TextInput
            value={
              transactionPin
            }
            onChangeText={
              (value) => {
                setTransactionPin(
                  String(
                    value
                  )
                    .replace(
                      /\D/g,
                      ""
                    )
                    .slice(
                      0,
                      4
                    )
                );

                setLocalError(
                  null
                );
              }
            }
            placeholder="Enter your 4-digit transaction PIN"
            placeholderTextColor={
              COLORS.textMuted
            }
            keyboardType="number-pad"
            secureTextEntry
            maxLength={
              4
            }
            style={
              styles.input
            }
            editable={
              !loading
            }
          />
        </View>

        {/* OWNERSHIP */}
        <Pressable
          onPress={() =>
            setOwnershipConfirmed(
              (
                value
              ) =>
                !value
            )
          }
          disabled={
            loading
          }
          style={
            styles.checkboxRow
          }
        >
          <View
            style={[
              styles.checkbox,
              ownershipConfirmed &&
                styles.checkboxSelected,
            ]}
          >
            {ownershipConfirmed && (
              <Text
                style={
                  styles.checkmark
                }
              >
                ✓
              </Text>
            )}
          </View>

          <Text
            style={
              styles.checkboxText
            }
          >
            I confirm that this BVN belongs to me and I am authorized to request its validation.
          </Text>
        </Pressable>

        {/* ERROR */}
        {displayedError && (
          <View
            style={
              styles.errorBox
            }
          >
            <Text
              style={
                styles.errorTitle
              }
            >
              Unable to continue
            </Text>

            <Text
              style={
                styles.errorText
              }
            >
              {
                displayedError
              }
            </Text>
          </View>
        )}

        {/* SUMMARY */}
        <View
          style={
            styles.summary
          }
        >
          <Text
            style={
              styles.summaryLabel
            }
          >
            Validation fee
          </Text>

          <Text
            style={
              styles.summaryAmount
            }
          >
            {formatNaira(
              selectedPackage.price
            )}
          </Text>
        </View>

        {/* SUBMIT */}
        <Pressable
          onPress={
            handleSubmit
          }
          disabled={
            loading ||
            serviceLoading
          }
          style={[
            styles.primaryButton,
            (loading ||
              serviceLoading) &&
              styles.buttonDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              color={
                COLORS.white
            }
          />
          ) : (
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Validate BVN —{" "}
              {formatNaira(
                selectedPackage.price
              )}
            </Text>
          )}
        </Pressable>

        <Text
          style={
            styles.bottomNote
          }
        >
          If the provider fails after your wallet has been charged, eVault will automatically process a refund.
        </Text>
      </ScrollView>
    );

  // ==========================================================
  // PROCESSING
  // ==========================================================

  const renderProcessing =
    () => (
      <View
        style={
          styles.stateContainer
        }
      >
        <View
          style={
            styles.processingCircle
          }
        >
          <ActivityIndicator
            size="large"
            color={
              COLORS.primary
            }
          />
        </View>

        <Text
          style={
            styles.stateTitle
          }
        >
          BVN Validation in progress
        </Text>

        <Text
          style={
            styles.stateText
          }
        >
          Your BVN is being securely validated. Please do not close the app while the request is being processed.
        </Text>

        {request && (
          <View
            style={
              styles.requestBox
            }
          >
            <Text
              style={
                styles.requestLabel
              }
            >
              Request ID
            </Text>

            <Text
              style={
                styles.requestValue
              }
              numberOfLines={
                1
              }
            >
              {getRequestId(
                request
              ) ||
                "Processing..."}
            </Text>
          </View>
        )}

        <Pressable
          onPress={
            handleCheckStatus
          }
          disabled={
            checkingStatus
          }
          style={[
            styles.secondaryButton,
            checkingStatus &&
              styles.buttonDisabled,
          ]}
        >
          {checkingStatus ? (
            <ActivityIndicator
              color={
                COLORS.primary
              }
            />
          ) : (
            <Text
              style={
                styles.secondaryButtonText
              }
            >
              Check Status
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={
            handleClose
          }
          disabled={
            checkingStatus
          }
          style={
            styles.textButton
          }
        >
          <Text
            style={
              styles.textButtonText
            }
          >
            Close
          </Text>
        </Pressable>
      </View>
    );

  // ==========================================================
  // SUCCESS
  // ==========================================================

  const renderSuccess =
    () => {
      const requestId =
        getRequestId(
          request
        );

      const pdfAvailable =
        hasPdf(
          request
        );

      return (
        <View
          style={
            styles.stateContainer
          }
        >
          <View
            style={
              styles.successCircle
            }
          >
            <Text
              style={
                styles.successCheck
              }
            >
              ✓
            </Text>
          </View>

          <Text
            style={
              styles.stateTitle
            }
          >
            BVN Validated Successfully
          </Text>

          <Text
            style={
              styles.stateText
            }
          >
            Your BVN validation has been completed successfully.
          </Text>

          <View
            style={
              styles.successBox
            }
          >
            <Text
              style={
                styles.successBoxTitle
              }
            >
              BVN validation complete
            </Text>

            <Text
              style={
                styles.successBoxText
              }
            >
              Your validation request was completed and the result has been saved to your eVault account.
            </Text>
          </View>

          {pdfAvailable ? (
            <Pressable
              onPress={
                handleDownload
              }
              disabled={
                downloading
              }
              style={[
                styles.primaryButton,
                downloading &&
                  styles.buttonDisabled,
              ]}
            >
              {downloading ? (
                <ActivityIndicator
                  color={
                    COLORS.white
                  }
                />
              ) : (
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Download BVN Slip
                </Text>
              )}
            </Pressable>
          ) : (
            <View
              style={
                styles.noPdfBox
              }
            >
              <Text
                style={
                  styles.noPdfTitle
                }
              >
                No PDF attached
              </Text>

              <Text
                style={
                  styles.noPdfText
                }
              >
                Your BVN validation is complete, but the provider did not attach a PDF document to this result.
              </Text>
            </View>
          )}

          {requestId && (
            <View
              style={
                styles.requestBox
              }
            >
              <Text
                style={
                  styles.requestLabel
                }
              >
                Request ID
              </Text>

              <Text
                style={
                  styles.requestValue
                }
              >
                {requestId}
              </Text>
            </View>
          )}

          <Pressable
            onPress={
              handleClose
            }
            disabled={
              downloading
            }
            style={
              styles.textButton
            }
          >
            <Text
              style={
                styles.textButtonText
              }
            >
              Done
            </Text>
          </Pressable>
        </View>
      );
    };

  // ==========================================================
  // FAILED
  // ==========================================================

  const renderFailed =
    () => (
      <View
        style={
          styles.stateContainer
        }
      >
        <View
          style={
            styles.failedCircle
          }
        >
          <Text
            style={
              styles.failedIcon
            }
          >
            !
          </Text>
        </View>

        <Text
          style={
            styles.stateTitle
          }
        >
          BVN Validation Failed
        </Text>

        <Text
          style={
            styles.stateText
          }
        >
          The BVN validation could not be completed.
        </Text>

        <View
          style={
            styles.refundBox
          }
        >
          <Text
            style={
              styles.refundTitle
            }
          >
            Wallet protection
          </Text>

          <Text
            style={
              styles.refundText
            }
          >
            If the provider failed after your wallet was charged, eVault will automatically refund the BVN validation fee.
          </Text>
        </View>

        {displayedError && (
          <View
            style={
              styles.errorBox
            }
          >
            <Text
              style={
                styles.errorTitle
            }
            >
              Reason
            </Text>

            <Text
              style={
                styles.errorText
              }
            >
              {
                displayedError
              }
            </Text>
          </View>
        )}

        <Pressable
          onPress={
            handleReset
          }
          style={
            styles.primaryButton
          }
        >
          <Text
            style={
              styles.primaryButtonText
            }
          >
            Try Again
          </Text>
        </Pressable>

        <Pressable
          onPress={
            handleClose
          }
          style={
            styles.textButton
          }
        >
          <Text
            style={
              styles.textButtonText
            }
          >
            Close
          </Text>
        </Pressable>
      </View>
    );

  // ==========================================================
  // CONTENT
  // ==========================================================

  const renderContent =
    () => {
      switch (
        step
      ) {
        case "processing":
          return renderProcessing();

        case "success":
          return renderSuccess();

        case "failed":
          return renderFailed();

        case "form":
        default:
          return renderForm();
      }
    };

  // ==========================================================
  // MODAL
  // ==========================================================

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="slide"
      onRequestClose={
        handleClose
      }
    >
      <KeyboardAvoidingView
        style={
          styles.overlay
        }
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : undefined
        }
      >
        <View
          style={
            styles.modal
          }
        >
          {renderContent()}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles =
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor:
        "rgba(15, 23, 42, 0.55)",
      justifyContent:
        "flex-end",
    },

    modal: {
      width: "100%",
      maxHeight: "94%",
      backgroundColor:
        COLORS.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      overflow: "hidden",
    },

    scrollContent: {
      padding: 20,
      paddingBottom: 36,
    },

    // ========================================================
    // HEADER
    // ========================================================

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom: 20,
    },

    headerIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor:
        COLORS.primaryLight,
      borderWidth: 1,
      borderColor:
        COLORS.primaryBorder,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    headerIconText: {
      fontSize: 22,
      fontWeight: "800",
      color:
        COLORS.primary,
    },

    headerTextContainer: {
      flex: 1,
    },

    title: {
      fontSize: 22,
      fontWeight: "800",
      color:
        COLORS.text,
    },

    subtitle: {
      marginTop: 4,
      fontSize: 13,
      lineHeight: 19,
      color:
        COLORS.textSecondary,
    },

    closeButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor:
        COLORS.surface,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    closeButtonText: {
      fontSize: 26,
      lineHeight: 28,
      color:
        COLORS.textSecondary,
      fontWeight: "400",
    },

    // ========================================================
    // INFORMATION
    // ========================================================

    infoCard: {
      flexDirection:
        "row",
      backgroundColor:
        COLORS.primaryLight,
      borderWidth: 1,
      borderColor:
        COLORS.primaryBorder,
      borderRadius: 16,
      padding: 14,
      marginBottom: 20,
    },

    infoIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor:
        COLORS.primary,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 10,
    },

    infoIconText: {
      color:
        COLORS.white,
      fontWeight: "800",
      fontSize: 16,
    },

    infoContent: {
      flex: 1,
    },

    infoTitle: {
      fontSize: 14,
      fontWeight: "800",
      color:
        COLORS.text,
      marginBottom: 5,
    },

    infoText: {
      fontSize: 12,
      lineHeight: 18,
      color:
        COLORS.textSecondary,
      marginBottom: 4,
    },

    // ========================================================
    // SERVICE LOADING
    // ========================================================

    serviceLoading: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom: 16,
    },

    serviceLoadingText: {
      marginLeft: 8,
      fontSize: 13,
      color:
        COLORS.textSecondary,
    },

    // ========================================================
    // FIELDS
    // ========================================================

    field: {
      marginBottom: 20,
    },

    label: {
      fontSize: 14,
      fontWeight: "700",
      color:
        COLORS.text,
      marginBottom: 8,
    },

    input: {
      height: 52,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 12,
      paddingHorizontal: 15,
      backgroundColor:
        COLORS.surface,
      color:
        COLORS.text,
      fontSize: 16,
    },

    helperText: {
      marginTop: 6,
      fontSize: 12,
      color:
        COLORS.textMuted,
      textAlign: "right",
    },

    // ========================================================
    // PACKAGES
    // ========================================================

    packageContainer: {
      gap: 10,
    },

    packageCard: {
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 15,
      padding: 14,
      backgroundColor:
        COLORS.background,
    },

    packageCardSelected: {
      borderColor:
        COLORS.primary,
      backgroundColor:
        COLORS.primaryLight,
    },

    packageTopRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    radioOuter: {
      width: 21,
      height: 21,
      borderRadius: 11,
      borderWidth: 2,
      borderColor:
        COLORS.textMuted,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 11,
    },

    radioOuterSelected: {
      borderColor:
        COLORS.primary,
    },

    radioInner: {
      width: 11,
      height: 11,
      borderRadius: 6,
      backgroundColor:
        COLORS.primary,
    },

    packageMain: {
      flex: 1,
      paddingRight: 8,
    },

    packageName: {
      fontSize: 14,
      fontWeight: "800",
      color:
        COLORS.text,
    },

    packageNameSelected: {
      color:
        COLORS.primaryDark,
    },

    packageDescription: {
      marginTop: 3,
      fontSize: 12,
      lineHeight: 17,
      color:
        COLORS.textSecondary,
    },

    packagePrice: {
      fontSize: 14,
      fontWeight: "800",
      color:
        COLORS.text,
    },

    packagePriceSelected: {
      color:
        COLORS.primary,
    },

    // ========================================================
    // CHECKBOX
    // ========================================================

    checkboxRow: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      marginBottom: 18,
    },

    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor:
        COLORS.border,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 10,
      backgroundColor:
        COLORS.white,
    },

    checkboxSelected: {
      backgroundColor:
        COLORS.primary,
      borderColor:
        COLORS.primary,
    },

    checkmark: {
      color:
        COLORS.white,
      fontSize: 14,
      fontWeight: "800",
    },

    checkboxText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      color:
        COLORS.textSecondary,
    },

    // ========================================================
    // SUMMARY
    // ========================================================

    summary: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor:
        COLORS.border,
      paddingVertical: 15,
      marginBottom: 16,
    },

    summaryLabel: {
      fontSize: 14,
      color:
        COLORS.textSecondary,
    },

    summaryAmount: {
      fontSize: 19,
      fontWeight: "800",
      color:
        COLORS.text,
    },

    // ========================================================
    // BUTTONS
    // ========================================================

    primaryButton: {
      minHeight: 52,
      borderRadius: 13,
      backgroundColor:
        COLORS.primary,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 18,
    },

    primaryButtonText: {
      color:
        COLORS.white,
      fontSize: 15,
      fontWeight: "800",
    },

    secondaryButton: {
      minHeight: 50,
      width: "100%",
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        COLORS.primaryBorder,
      backgroundColor:
        COLORS.primaryLight,
      alignItems:
        "center",
      justifyContent:
        "center",
      paddingHorizontal: 18,
      marginTop: 18,
    },

    secondaryButtonText: {
      color:
        COLORS.primary,
      fontSize: 15,
      fontWeight: "800",
    },

    buttonDisabled: {
      opacity: 0.55,
    },

    textButton: {
      minHeight: 44,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 8,
    },

    textButtonText: {
      color:
        COLORS.textSecondary,
      fontSize: 14,
      fontWeight: "700",
    },

    bottomNote: {
      textAlign: "center",
      fontSize: 11,
      lineHeight: 17,
      color:
        COLORS.textMuted,
      marginTop: 12,
    },

    // ========================================================
    // ERROR
    // ========================================================

    errorBox: {
      backgroundColor:
        COLORS.dangerLight,
      borderWidth: 1,
      borderColor:
        COLORS.dangerBorder,
      borderRadius: 13,
      padding: 13,
      marginBottom: 16,
    },

    errorTitle: {
      fontSize: 13,
      fontWeight: "800",
      color:
        COLORS.danger,
      marginBottom: 4,
    },

    errorText: {
      fontSize: 12,
      lineHeight: 18,
      color:
        COLORS.textSecondary,
    },

    // ========================================================
    // STATE SCREENS
    // ========================================================

    stateContainer: {
      padding: 24,
      paddingBottom: 36,
      alignItems:
        "center",
    },

    processingCircle: {
      width: 86,
      height: 86,
      borderRadius: 43,
      backgroundColor:
        COLORS.primaryLight,
      borderWidth: 1,
      borderColor:
        COLORS.primaryBorder,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginBottom: 22,
    },

    successCircle: {
      width: 86,
      height: 86,
      borderRadius: 43,
      backgroundColor:
        COLORS.successLight,
      borderWidth: 1,
      borderColor:
        COLORS.successBorder,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginBottom: 22,
    },

    successCheck: {
      fontSize: 42,
      fontWeight: "800",
      color:
        COLORS.success,
    },

    failedCircle: {
      width: 86,
      height: 86,
      borderRadius: 43,
      backgroundColor:
        COLORS.dangerLight,
      borderWidth: 1,
      borderColor:
        COLORS.dangerBorder,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginBottom: 22,
    },

    failedIcon: {
      fontSize: 42,
      fontWeight: "800",
      color:
        COLORS.danger,
    },

    stateTitle: {
      fontSize: 22,
      lineHeight: 29,
      fontWeight: "800",
      color:
        COLORS.text,
      textAlign: "center",
    },

    stateText: {
      marginTop: 10,
      fontSize: 14,
      lineHeight: 21,
      color:
        COLORS.textSecondary,
      textAlign: "center",
      maxWidth: 390,
    },

    // ========================================================
    // REQUEST BOX
    // ========================================================

    requestBox: {
      width: "100%",
      backgroundColor:
        COLORS.surface,
      borderWidth: 1,
      borderColor:
        COLORS.border,
      borderRadius: 13,
      padding: 13,
      marginTop: 18,
    },

    requestLabel: {
      fontSize: 11,
      color:
        COLORS.textMuted,
      textTransform:
        "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    },

    requestValue: {
      fontSize: 12,
      color:
        COLORS.text,
      fontWeight: "700",
    },

    // ========================================================
    // SUCCESS BOX
    // ========================================================

    successBox: {
      width: "100%",
      backgroundColor:
        COLORS.successLight,
      borderWidth: 1,
      borderColor:
        COLORS.successBorder,
      borderRadius: 14,
      padding: 14,
      marginTop: 20,
      marginBottom: 16,
    },

    successBoxTitle: {
      fontSize: 14,
      fontWeight: "800",
      color:
        COLORS.success,
      marginBottom: 5,
    },

    successBoxText: {
      fontSize: 12,
      lineHeight: 18,
      color:
        COLORS.textSecondary,
    },

    // ========================================================
    // NO PDF
    // ========================================================

    noPdfBox: {
      width: "100%",
      backgroundColor:
        COLORS.warningLight,
      borderWidth: 1,
      borderColor:
        COLORS.warningBorder,
      borderRadius: 14,
      padding: 14,
      marginTop: 20,
    },

    noPdfTitle: {
      fontSize: 14,
      fontWeight: "800",
      color:
        COLORS.warning,
      marginBottom: 5,
    },

    noPdfText: {
      fontSize: 12,
      lineHeight: 18,
      color:
        COLORS.textSecondary,
    },

    // ========================================================
    // REFUND
    // ========================================================

    refundBox: {
      width: "100%",
      backgroundColor:
        COLORS.primaryLight,
      borderWidth: 1,
      borderColor:
        COLORS.primaryBorder,
      borderRadius: 14,
      padding: 14,
      marginTop: 20,
      marginBottom: 16,
    },

    refundTitle: {
      fontSize: 14,
      fontWeight: "800",
      color:
        COLORS.primary,
      marginBottom: 5,
    },

    refundText: {
      fontSize: 12,
      lineHeight: 18,
      color:
        COLORS.textSecondary,
    },
  });