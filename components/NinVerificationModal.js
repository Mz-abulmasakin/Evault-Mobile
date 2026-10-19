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

import Ionicons from "@expo/vector-icons/Ionicons";

import { useNin } from "../hooks/useNin";


const PACKAGES = [
  {
    id: "standard",
    title: "Standard NIN",
    icon: "shield-checkmark-outline",
    description:
      "Standard NIN verification and the corresponding provider document.",
  },
  {
    id: "regular",
    title: "Regular NIN",
    icon: "document-text-outline",
    description:
      "Regular NIN verification and the corresponding provider document.",
  },
  {
    id: "premium",
    title: "Premium NIN",
    icon: "diamond-outline",
    description:
      "Premium NIN verification and the corresponding provider document.",
  },
  {
    id: "vnin_slip",
    title: "VNIN Slip",
    icon: "card-outline",
    description:
      "VNIN slip verification using the configured eVault Corporate service.",
  },
];


function normalizeStatus(
  value
) {
  return String(
    value || ""
  )
    .trim()
    .toUpperCase()
    .replace(
      /[\s-]+/g,
      "_"
    );
}


function isSuccessStatus(
  value
) {
  return [
    "SUCCESS",
    "SUCCESSFUL",
    "COMPLETED",
    "COMPLETE",
    "DONE",
    "VERIFIED",
    "APPROVED",
  ].includes(
    normalizeStatus(
      value
    )
  );
}


function isFailedStatus(
  value
) {
  return [
    "FAILED",
    "FAILURE",
    "ERROR",
    "REJECTED",
    "CANCELLED",
    "CANCELED",
  ].includes(
    normalizeStatus(
      value
    )
  );
}


function formatNin(
  value
) {
  return String(
    value || ""
  )
    .replace(
      /\D/g,
      ""
    )
    .slice(
      0,
      11
    );
}


function formatPrice(
  value
) {
  const amount =
    Number(
      value
    );

  if (
    !Number.isFinite(
      amount
    ) ||
    amount <= 0
  ) {
    return "Price not configured";
  }

  return `₦${amount.toLocaleString(
    "en-NG",
    {
      minimumFractionDigits:
        amount % 1 !== 0
          ? 2
          : 0,
      maximumFractionDigits:
        2,
    }
  )}`;
}


function getServicePrices(
  services
) {
  const prices =
    services?.prices;

  return prices &&
    typeof prices === "object"
    ? prices
    : {};
}


function getRequestId(
  request
) {
  return (
    request?.requestId ||
    request?.id ||
    request?.request?.requestId ||
    request?.request?.id ||
    null
  );
}


function getRequestStatus(
  request
) {
  return (
    request?.status ||
    request?.state ||
    request?.request?.status ||
    request?.request?.state ||
    request?.result?.status ||
    request?.request?.result?.status ||
    ""
  );
}


function requestHasPdf(
  request
) {
  return (
    request?.hasPdf === true ||
    request?.documentAvailable === true ||
    request?.result?.hasPdf === true ||
    request?.result?.has_pdf === true ||
    request?.request?.hasPdf === true ||
    request?.request?.result?.hasPdf === true ||
    request?.request?.result?.has_pdf === true
  );
}


function getErrorMessage(
  value,
  fallback
) {
  return (
    value?.response?.data
      ?.message ||
    value?.message ||
    fallback
  );
}


export default function NinVerificationModal({
  visible,
  onClose,
  onSuccess,
  onWalletRefresh,
  onNotificationRefresh,
}) {
  const {
    services,
    request,
    loading,
    servicesLoading,
    checkingStatus,
    downloading,
    loadServices,
    submitNin,
    checkStatus,
    downloadNin,
    reset,
  } = useNin();

  const [
    nin,
    setNin,
  ] = useState("");

  const [
    transactionPin,
    setTransactionPin,
  ] = useState("");

  const [
    slipType,
    setSlipType,
  ] = useState(
    "regular"
  );

  const [
    step,
    setStep,
  ] = useState(
    "form"
  );

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    polling,
    setPolling,
  ] = useState(
    false
  );

  const prices =
    useMemo(
      () =>
        getServicePrices(
          services
        ),
      [
        services,
      ]
    );

  const selectedPackage =
    useMemo(
      () =>
        PACKAGES.find(
          (item) =>
            item.id ===
            slipType
        ) ||
        PACKAGES[1],
      [
        slipType,
      ]
    );

  const selectedPrice =
    useMemo(
      () =>
        Number(
          prices[
            slipType
          ]
        ),
      [
        prices,
        slipType,
      ]
    );

  const selectedPriceConfigured =
    Number.isFinite(
      selectedPrice
    ) &&
    selectedPrice > 0;

  const currentRequestId =
    getRequestId(
      request
    );

  const hasPdf =
    requestHasPdf(
      request
    );


  useEffect(
    () => {
      if (!visible) {
        return;
      }

      loadServices().catch(
        () => {}
      );
    },
    [
      visible,
      loadServices,
    ]
  );


  const resetModal =
    useCallback(
      () => {
        setNin("");
        setTransactionPin("");
        setSlipType(
          "regular"
        );
        setStep(
          "form"
        );
        setErrorMessage("");
        setPolling(
          false
        );
        reset();
      },
      [
        reset,
      ]
    );


  const handleClose =
    useCallback(
      () => {
        if (
          loading ||
          downloading
        ) {
          return;
        }

        resetModal();
        onClose?.();
      },
      [
        downloading,
        loading,
        onClose,
        resetModal,
      ]
    );


  const handleSubmit =
    useCallback(
      async () => {
        const cleanedNin =
          formatNin(
            nin
          );

        if (
          cleanedNin.length !==
          11
        ) {
          Alert.alert(
            "Invalid NIN",
            "Enter your 11-digit NIN."
          );
          return;
        }

        if (
          !/^\d{4}$/.test(
            transactionPin
          )
        ) {
          Alert.alert(
            "Invalid Transaction PIN",
            "Your transaction PIN must contain exactly 4 digits."
          );
          return;
        }

        if (
          !selectedPriceConfigured
        ) {
          Alert.alert(
            "Price Not Configured",
            `The eVault price for ${selectedPackage.title} is not configured.`
          );
          return;
        }

        setErrorMessage("");
        setStep(
          "processing"
        );

        try {
          const result =
            await submitNin({
              nin:
                cleanedNin,

              validationType:
                "full",

              slipType:
                slipType,

              transactionPin:
                transactionPin,
            });

          const status =
            getRequestStatus(
              result
            );

          if (
            isSuccessStatus(
              status
            )
          ) {
            /*
             * The backend already stores the provider PDF
             * before returning success.
             *
             * Therefore the modal can immediately show
             * the download button when hasPdf is true.
             */
            setStep(
              "success"
            );

            try {
              await onWalletRefresh?.();
            } catch {}

            try {
              await onNotificationRefresh?.();
            } catch {}

            onSuccess?.(
              result
            );

            return;
          }

          if (
            isFailedStatus(
              status
            )
          ) {
            setErrorMessage(
              result?.message ||
                result?.errorMessage ||
                "The NIN verification failed."
            );

            setStep(
              "failed"
            );

            return;
          }
        } catch (
          error
        ) {
          setErrorMessage(
            getErrorMessage(
              error,
              "Unable to submit the NIN verification."
            )
          );

          setStep(
            "failed"
          );
        }
      },
      [
        nin,
        onNotificationRefresh,
        onSuccess,
        onWalletRefresh,
        selectedPackage.title,
        selectedPriceConfigured,
        slipType,
        submitNin,
        transactionPin,
      ]
    );


  const runStatusCheck =
    useCallback(
      async (
        showAlert = false
      ) => {
        if (
          !currentRequestId
        ) {
          if (
            showAlert
          ) {
            Alert.alert(
              "Request Not Found",
              "The NIN verification request ID is missing."
            );
          }

          return null;
        }

        try {
          setPolling(
            true
          );

          const result =
            await checkStatus(
              currentRequestId
            );

          const status =
            getRequestStatus(
              result
            );

          if (
            isSuccessStatus(
              status
            )
          ) {
            setStep(
              "success"
            );

            try {
              await onWalletRefresh?.();
            } catch {}

            try {
              await onNotificationRefresh?.();
            } catch {}

            onSuccess?.(
              result
            );

            return result;
          }

          if (
            isFailedStatus(
              status
            )
          ) {
            setErrorMessage(
              result?.message ||
                result?.errorMessage ||
                "The NIN verification failed."
            );

            setStep(
              "failed"
            );

            return result;
          }

          if (
            showAlert
          ) {
            Alert.alert(
              "Still Processing",
              "The NIN verification is still being processed."
            );
          }

          return result;
        } catch (
          error
        ) {
          if (
            showAlert
          ) {
            Alert.alert(
              "Status Check Failed",
              getErrorMessage(
                error,
                "Unable to check the NIN verification status."
              )
            );
          }

          return null;
        } finally {
          setPolling(
            false
          );
        }
      },
      [
        checkStatus,
        currentRequestId,
        onNotificationRefresh,
        onSuccess,
        onWalletRefresh,
      ]
    );


  useEffect(
    () => {
      if (
        step !==
          "processing" ||
        !currentRequestId
      ) {
        return undefined;
      }

      let cancelled =
        false;

      const poll =
        async () => {
          if (
            cancelled
          ) {
            return;
          }

          const result =
            await runStatusCheck(
              false
            );

          if (
            cancelled ||
            !result
          ) {
            return;
          }

          const status =
            getRequestStatus(
              result
            );

          if (
            isSuccessStatus(
              status
            ) ||
            isFailedStatus(
              status
            )
          ) {
            return;
          }
        };

      poll();

      const interval =
        setInterval(
          poll,
          30 *
            1000
        );

      return () => {
        cancelled =
          true;

        clearInterval(
          interval
        );
      };
    },
    [
      currentRequestId,
      runStatusCheck,
      step,
    ]
  );


  const handleDownload =
    useCallback(
      async () => {
        if (
          !currentRequestId
        ) {
          Alert.alert(
            "Download Error",
            "The NIN request ID is missing."
          );

          return;
        }

        if (
          !hasPdf
        ) {
          Alert.alert(
            "NIN Slip Not Available",
            "The verification succeeded, but the PDF document is not available in the stored request yet."
          );

          return;
        }

        try {
          await downloadNin(
            currentRequestId,
            {
              fileName:
                `NIN-${currentRequestId}.pdf`,
            }
          );
        } catch (
          error
        ) {
          Alert.alert(
            "Download Error",
            getErrorMessage(
              error,
              "Unable to download the NIN slip."
            )
          );
        }
      },
      [
        currentRequestId,
        downloadNin,
        hasPdf,
      ]
    );


  const renderForm =
    () => (
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={
            styles.headerRow
          }
        >
          <View
            style={
              styles.headerTextBlock
            }
          >
            <Text
              style={
                styles.title
              }
            >
              NIN Verification
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Verify your NIN with the eVault price configured on the backend.
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
            <Ionicons
              name="close"
              size={22}
              color="#475569"
            />
          </Pressable>
        </View>

        <View
          style={
            styles.noticeCard
          }
        >
          <Ionicons
            name="lock-closed-outline"
            size={22}
            color="#2563EB"
          />

          <View
            style={
              styles.noticeTextBlock
            }
          >
            <Text
              style={
                styles.noticeTitle
              }
            >
              Secure eVault pricing
            </Text>

            <Text
              style={
                styles.noticeText
              }
            >
              Verify and download your NIN Slip with ease 
            </Text>
          </View>
        </View>

        <Text
          style={
            styles.label
          }
        >
          NIN Number
        </Text>

        <View
          style={
            styles.inputRow
          }
        >
          <Ionicons
            name="card-outline"
            size={20}
            color="#94A3B8"
          />

          <TextInput
            value={
              nin
            }
            onChangeText={
              setNin
            }
            placeholder="Enter 11-digit NIN"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            maxLength={11}
            style={
              styles.input
            }
          />

          {nin.length ===
            11 && (
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#10B981"
            />
          )}
        </View>

        <View
          style={
            styles.sectionHeader
          }
        >
          <View>
            <Text
              style={
                styles.sectionTitle
              }
            >
              Choose Slip Type
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              The prices below are loaded.
            </Text>
          </View>

          {servicesLoading && (
            <ActivityIndicator
              size="small"
              color="#2563EB"
            />
          )}
        </View>

        <View
          style={
            styles.packageList
          }
        >
          {PACKAGES.map(
            (
              item
            ) => {
              const price =
                prices[
                  item.id
                ];

              const configured =
                Number.isFinite(
                  Number(
                    price
                  )
                ) &&
                Number(
                  price
                ) >
                  0;

              return (
                <Pressable
                  key={
                    item.id
                  }
                  onPress={() =>
                    setSlipType(
                      item.id
                    )
                  }
                  style={[
                    styles.packageCard,
                    slipType ===
                      item.id &&
                      styles.packageCardSelected,
                  ]}
                >
                  <View
                    style={
                      styles.packageTopRow
                    }
                  >
                    <View
                      style={
                        styles.packageIcon
                      }
                    >
                      <Ionicons
                        name={
                          item.icon
                        }
                        size={20}
                        color="#2563EB"
                      />
                    </View>

                    <View
                      style={
                        styles.packageTextBlock
                      }
                    >
                      <Text
                        style={
                          styles.packageTitle
                        }
                      >
                        {
                          item.title
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

                    <View
                      style={
                        styles.packagePriceBlock
                      }
                    >
                      <Text
                        style={
                          styles.packagePrice
                        }
                      >
                        {configured
                          ? formatPrice(
                              price
                            )
                          : "Not configured"}
                      </Text>

                      <View
                        style={[
                          styles.radio,
                          slipType ===
                            item.id &&
                            styles.radioSelected,
                        ]}
                      >
                        {slipType ===
                          item.id && (
                          <View
                            style={
                              styles.radioInner
                            }
                          />
                        )}
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            }
          )}
        </View>

        <Text
          style={
            styles.label
          }
        >
          Transaction PIN
        </Text>

        <View
          style={
            styles.inputRow
          }
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#94A3B8"
          />

          <TextInput
            value={
              transactionPin
            }
            onChangeText={(
              value
            ) =>
              setTransactionPin(
                value
                  .replace(
                    /\D/g,
                    ""
                  )
                  .slice(
                    0,
                    4
                  )
              )
            }
            placeholder="Enter 4-digit PIN"
            placeholderTextColor="#94A3B8"
            keyboardType="number-pad"
            secureTextEntry
            maxLength={4}
            style={
              styles.input
            }
          />
        </View>

        <View
          style={
            styles.summaryCard
          }
        >
          <View>
            <Text
              style={
                styles.summaryLabel
              }
            >
              Selected
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {
                selectedPackage.title
              }
            </Text>
          </View>

          <View
            style={
              styles.summaryRight
            }
          >
            <Text
              style={
                styles.summaryLabel
              }
            >
              eVault Price
            </Text>

            <Text
              style={
                styles.summaryPrice
              }
            >
              {formatPrice(
                selectedPrice
              )}
            </Text>
          </View>
        </View>

        {!selectedPriceConfigured && (
          <View
            style={
              styles.errorCard
            }
          >
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color="#DC2626"
            />

            <Text
              style={
                styles.errorText
              }
            >
              This slip type has no valid eVault price configured.
            </Text>
          </View>
        )}

        <Pressable
          onPress={
            handleSubmit
          }
          disabled={
            loading ||
            servicesLoading ||
            !selectedPriceConfigured
          }
          style={({
            pressed,
          }) => [
            styles.primaryButton,

            (!selectedPriceConfigured ||
              loading) &&
              styles.buttonDisabled,

            pressed &&
              selectedPriceConfigured &&
              !loading &&
              styles.buttonPressed,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <>
              <Ionicons
                name="shield-checkmark-outline"
                size={21}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.primaryButtonText
                }
              >
                Verify NIN •{" "}
                {formatPrice(
                  selectedPrice
                )}
              </Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    );


  const renderProcessing =
    () => (
      <View
        style={
          styles.resultScreen
        }
      >
        <View
          style={
            styles.resultIconBlue
          }
        >
          <ActivityIndicator
            size="large"
            color="#2563EB"
          />
        </View>

        <Text
          style={
            styles.resultTitle
          }
        >
          Verification Processing
        </Text>

        <Text
          style={
            styles.resultDescription
          }
        >
          Your NIN verification has been submitted. We are checking the provider response automatically.
        </Text>

        <View
          style={
            styles.resultCard
          }
        >
          <Text
            style={
              styles.resultLabel
            }
          >
            Slip
          </Text>

          <Text
            style={
              styles.resultValue
            }
          >
            {
              selectedPackage.title
            }
          </Text>

          <View
            style={
              styles.divider
            }
          />

          <Text
            style={
              styles.resultLabel
            }
          >
            Amount charged
          </Text>

          <Text
            style={
              styles.resultValue
            }
          >
            {formatPrice(
              request?.amount ??
                selectedPrice
            )}
          </Text>

          {currentRequestId && (
            <>
              <View
                style={
                  styles.divider
                }
              />

              <Text
                style={
                  styles.resultLabel
                }
              >
                Request ID
              </Text>

              <Text
                style={
                  styles.resultSmallValue
                }
              >
                {
                  currentRequestId
                }
              </Text>
            </>
          )}
        </View>

        <Pressable
          onPress={() =>
            runStatusCheck(
              true
            )
          }
          disabled={
            checkingStatus ||
            polling
          }
          style={[
            styles.secondaryButton,
            (checkingStatus ||
              polling) &&
              styles.buttonDisabledSecondary,
          ]}
        >
          {checkingStatus ||
          polling ? (
            <ActivityIndicator
              size="small"
              color="#2563EB"
            />
          ) : (
            <Ionicons
              name="refresh"
              size={20}
              color="#2563EB"
            />
          )}

          <Text
            style={
              styles.secondaryButtonText
            }
          >
            {checkingStatus ||
            polling
              ? "Checking..."
              : "Check Status Now"}
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


  const renderSuccess =
    () => (
      <View
        style={
          styles.resultScreen
        }
      >
        <View
          style={
            styles.resultIconGreen
          }
        >
          <Ionicons
            name="checkmark"
            size={46}
            color="#FFFFFF"
          />
        </View>

        <Text
          style={
            styles.resultTitle
          }
        >
          NIN Verified Successfully
        </Text>

        <Text
          style={
            styles.resultDescription
          }
        >
          Your NIN verification has been completed successfully.
        </Text>

        <View
          style={
            styles.resultCard
          }
        >
          <Text
            style={
              styles.resultLabel
            }
          >
            Slip
          </Text>

          <Text
            style={
              styles.resultValue
            }
          >
            {
              selectedPackage.title
            }
          </Text>

          <View
            style={
              styles.divider
            }
          />

          <Text
            style={
              styles.resultLabel
            }
          >
            Amount deducted
          </Text>

          <Text
            style={
              styles.resultValue
            }
          >
            {formatPrice(
              request?.amount ??
                selectedPrice
            )}
          </Text>
        </View>

        {hasPdf ? (
          <>
            <View
              style={
                styles.readyCard
              }
            >
              <Ionicons
                name="document-text"
                size={22}
                color="#059669"
              />

              <View
                style={
                  styles.readyTextBlock
                }
              >
                <Text
                  style={
                    styles.readyTitle
                  }
                >
                  NIN Slip Ready
                </Text>

                <Text
                  style={
                    styles.readyText
                  }
                >
                  The PDF was received and stored successfully. You can download it now.
                </Text>
              </View>
            </View>

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
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <Ionicons
                    name="download-outline"
                    size={21}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    Download NIN Slip
                  </Text>
                </>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <View
              style={
                styles.warningCard
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={22}
                color="#B45309"
              />

              <View
                style={
                  styles.readyTextBlock
                }
              >
                <Text
                  style={
                    styles.warningTitle
                  }
                >
                  Verification Complete
                </Text>

                <Text
                  style={
                    styles.warningText
                  }
                >
                  The verification succeeded, but eVault Cooperate did not return a PDF in this response contact support.
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() =>
                runStatusCheck(
                  true
                )
              }
              disabled={
                checkingStatus ||
                polling
              }
              style={
                styles.secondaryButton
              }
            >
              {checkingStatus ||
              polling ? (
                <ActivityIndicator
                  size="small"
                  color="#2563EB"
                />
              ) : (
                <Ionicons
                  name="refresh"
                  size={20}
                  color="#2563EB"
                />
              )}

              <Text
                style={
                  styles.secondaryButtonText
                }
              >
                Check for NIN Slip
              </Text>
            </Pressable>
          </>
        )}

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
            Done
          </Text>
        </Pressable>
      </View>
    );


  const renderFailed =
    () => (
      <View
        style={
          styles.resultScreen
        }
      >
        <View
          style={
            styles.resultIconRed
          }
        >
          <Ionicons
            name="close"
            size={46}
            color="#FFFFFF"
          />
        </View>

        <Text
          style={
            styles.resultTitle
          }
        >
          Verification Failed
        </Text>

        <Text
          style={
            styles.resultDescription
          }
        >
          Your wallet charge is handled by the backend transaction flow. If the provider request failed, the backend refund flow handles the refund.
        </Text>

        <View
          style={
            styles.errorCard
          }
        >
          <Ionicons
            name="alert-circle-outline"
            size={23}
            color="#DC2626"
          />

          <Text
            style={
              styles.errorText
            }
          >
            {errorMessage ||
              "The NIN verification could not be completed."}
          </Text>
        </View>

        <Pressable
          onPress={() => {
            setStep(
              "form"
            );

            setErrorMessage(
              ""
            );
          }}
          style={
            styles.primaryButton
          }
        >
          <Ionicons
            name="refresh"
            size={21}
            color="#FFFFFF"
          />

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


  return (
    <Modal
      visible={
        visible
      }
      animationType="slide"
      transparent
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
            styles.container
          }
        >
          {step ===
            "form" &&
            renderForm()}

          {step ===
            "processing" && (
            <ScrollView
              contentContainerStyle={
                styles.resultScroll
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              {
                renderProcessing()
              }
            </ScrollView>
          )}

          {step ===
            "success" && (
            <ScrollView
              contentContainerStyle={
                styles.resultScroll
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              {
                renderSuccess()
              }
            </ScrollView>
          )}

          {step ===
            "failed" && (
            <ScrollView
              contentContainerStyle={
                styles.resultScroll
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              {
                renderFailed()
              }
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}


const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor:
      "rgba(15, 23, 42, 0.55)",
    justifyContent:
      "flex-end",
  },

  container: {
    maxHeight:
      "94%",
    backgroundColor:
      "#FFFFFF",
    borderTopLeftRadius:
      28,
    borderTopRightRadius:
      28,
    overflow:
      "hidden",
  },

  scrollContent: {
    padding:
      20,
    paddingBottom:
      34,
  },

  resultScroll: {
    flexGrow:
      1,
    justifyContent:
      "center",
    padding:
      24,
    paddingBottom:
      40,
  },

  headerRow: {
    flexDirection:
      "row",
    alignItems:
      "flex-start",
    justifyContent:
      "space-between",
    marginBottom:
      20,
  },

  headerTextBlock: {
    flex:
      1,
    paddingRight:
      12,
  },

  title: {
    fontSize:
      25,
    fontWeight:
      "900",
    color:
      "#0F172A",
  },

  subtitle: {
    marginTop:
      6,
    fontSize:
      12,
    lineHeight:
      18,
    color:
      "#64748B",
  },

  closeButton: {
    width:
      40,
    height:
      40,
    borderRadius:
      20,
    backgroundColor:
      "#F1F5F9",
    alignItems:
      "center",
    justifyContent:
      "center",
  },

  noticeCard: {
    flexDirection:
      "row",
    alignItems:
      "flex-start",
    padding:
      14,
    borderRadius:
      16,
    backgroundColor:
      "#EFF6FF",
    borderWidth:
      1,
    borderColor:
      "#BFDBFE",
    marginBottom:
      20,
  },

  noticeTextBlock: {
    flex:
      1,
    marginLeft:
      10,
  },

  noticeTitle: {
    fontSize:
      13,
    fontWeight:
      "900",
    color:
      "#1E3A8A",
  },

  noticeText: {
    marginTop:
      4,
    fontSize:
      11,
    lineHeight:
      17,
    color:
      "#475569",
  },

  label: {
    fontSize:
      13,
    fontWeight:
      "800",
    color:
      "#334155",
    marginBottom:
      8,
  },

  inputRow: {
    minHeight:
      54,
    borderWidth:
      1,
    borderColor:
      "#CBD5E1",
    borderRadius:
      14,
    paddingHorizontal:
      14,
    flexDirection:
      "row",
    alignItems:
      "center",
    backgroundColor:
      "#FFFFFF",
    marginBottom:
      18,
  },

  input: {
    flex:
      1,
    marginLeft:
      10,
    fontSize:
      16,
    color:
      "#0F172A",
    fontWeight:
      "600",
  },

  sectionHeader: {
    flexDirection:
      "row",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    marginBottom:
      12,
  },

  sectionTitle: {
    fontSize:
      18,
    fontWeight:
      "900",
    color:
      "#0F172A",
  },

  sectionSubtitle: {
    marginTop:
      3,
    fontSize:
      11,
    color:
      "#64748B",
  },

  packageList: {
    gap:
      10,
    marginBottom:
      20,
  },

  packageCard: {
    borderWidth:
      1.5,
    borderColor:
      "#E2E8F0",
    borderRadius:
      17,
    padding:
      13,
    backgroundColor:
      "#FFFFFF",
  },

  packageCardSelected: {
    borderColor:
      "#2563EB",
    backgroundColor:
      "#EFF6FF",
  },

  packageTopRow: {
    flexDirection:
      "row",
    alignItems:
      "center",
  },

  packageIcon: {
    width:
      43,
    height:
      43,
    borderRadius:
      13,
    backgroundColor:
      "#DBEAFE",
    alignItems:
      "center",
    justifyContent:
      "center",
  },

  packageTextBlock: {
    flex:
      1,
    marginLeft:
      10,
    paddingRight:
      8,
  },

  packageTitle: {
    fontSize:
      14,
    fontWeight:
      "900",
    color:
      "#0F172A",
  },

  packageDescription: {
    marginTop:
      3,
    fontSize:
      10,
    lineHeight:
      15,
    color:
      "#64748B",
  },

  packagePriceBlock: {
    alignItems:
      "flex-end",
  },

  packagePrice: {
    fontSize:
      12,
    fontWeight:
      "900",
    color:
      "#2563EB",
    marginBottom:
      8,
  },

  radio: {
    width:
      21,
    height:
      21,
    borderRadius:
      11,
    borderWidth:
      2,
    borderColor:
      "#CBD5E1",
    alignItems:
      "center",
    justifyContent:
      "center",
  },

  radioSelected: {
    borderColor:
      "#2563EB",
  },

  radioInner: {
    width:
      10,
    height:
      10,
    borderRadius:
      5,
    backgroundColor:
      "#2563EB",
  },

  summaryCard: {
    flexDirection:
      "row",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    padding:
      15,
    borderRadius:
      16,
    backgroundColor:
      "#F8FAFC",
    borderWidth:
      1,
    borderColor:
      "#E2E8F0",
    marginBottom:
      12,
  },

  summaryLabel: {
    fontSize:
      10,
    color:
      "#94A3B8",
  },

  summaryValue: {
    marginTop:
      3,
    fontSize:
      14,
    fontWeight:
      "900",
    color:
      "#0F172A",
  },

  summaryRight: {
    alignItems:
      "flex-end",
  },

  summaryPrice: {
    marginTop:
      2,
    fontSize:
      20,
    fontWeight:
      "900",
    color:
      "#2563EB",
  },

  primaryButton: {
    minHeight:
      54,
    borderRadius:
      15,
    paddingHorizontal:
      16,
    backgroundColor:
      "#2563EB",
    flexDirection:
      "row",
    alignItems:
      "center",
    justifyContent:
      "center",
    gap:
      8,
    marginTop:
      4,
  },

  primaryButtonText: {
    color:
      "#FFFFFF",
    fontSize:
      14,
    fontWeight:
      "900",
  },

  buttonDisabled: {
    opacity:
      0.5,
  },

  buttonPressed: {
    opacity:
      0.86,
  },

  secondaryButton: {
    minHeight:
      52,
    borderRadius:
      15,
    borderWidth:
      1.5,
    borderColor:
      "#BFDBFE",
    backgroundColor:
      "#EFF6FF",
    flexDirection:
      "row",
    alignItems:
      "center",
    justifyContent:
      "center",
    gap:
      8,
    width:
      "100%",
    marginTop:
      3,
  },

  buttonDisabledSecondary: {
    opacity:
      0.6,
  },

  secondaryButtonText: {
    color:
      "#2563EB",
    fontSize:
      14,
    fontWeight:
      "900",
  },

  textButton: {
    paddingVertical:
      14,
    alignItems:
      "center",
  },

  textButtonText: {
    color:
      "#64748B",
    fontSize:
      14,
    fontWeight:
      "800",
  },

  errorCard: {
    width:
      "100%",
    flexDirection:
      "row",
    alignItems:
      "flex-start",
    gap:
      9,
    padding:
      14,
    borderRadius:
      14,
    borderWidth:
      1,
    borderColor:
      "#FECACA",
    backgroundColor:
      "#FEF2F2",
    marginBottom:
      16,
  },

  errorText: {
    flex:
      1,
    fontSize:
      12,
    lineHeight:
      18,
    color:
      "#991B1B",
  },

  readyCard: {
    width:
      "100%",
    flexDirection:
      "row",
    alignItems:
      "flex-start",
    gap:
      9,
    padding:
      14,
    borderRadius:
      14,
    borderWidth:
      1,
    borderColor:
      "#A7F3D0",
    backgroundColor:
      "#ECFDF5",
    marginBottom:
      16,
  },

  readyTextBlock: {
    flex:
      1,
  },

  readyTitle: {
    fontSize:
      13,
    fontWeight:
      "900",
    color:
      "#047857",
  },

  readyText: {
    marginTop:
      4,
    fontSize:
      11,
    lineHeight:
      17,
    color:
      "#475569",
  },

  warningCard: {
    width:
      "100%",
    flexDirection:
      "row",
    alignItems:
      "flex-start",
    gap:
      9,
    padding:
      14,
    borderRadius:
      14,
    borderWidth:
      1,
    borderColor:
      "#FCD34D",
    backgroundColor:
      "#FFFBEB",
    marginBottom:
      16,
  },

  warningTitle: {
    fontSize:
      13,
    fontWeight:
      "900",
    color:
      "#92400E",
  },

  warningText: {
    marginTop:
      4,
    fontSize:
      11,
    lineHeight:
      17,
    color:
      "#78350F",
  },

  resultScreen: {
    alignItems:
      "center",
  },

  resultIconBlue: {
    width:
      88,
    height:
      88,
    borderRadius:
      44,
    backgroundColor:
      "#EFF6FF",
    alignItems:
      "center",
    justifyContent:
      "center",
    marginBottom:
      18,
  },

  resultIconGreen: {
    width:
      88,
    height:
      88,
    borderRadius:
      44,
    backgroundColor:
      "#10B981",
    alignItems:
      "center",
    justifyContent:
      "center",
    marginBottom:
      18,
  },

  resultIconRed: {
    width:
      88,
    height:
      88,
    borderRadius:
      44,
    backgroundColor:
      "#DC2626",
    alignItems:
      "center",
    justifyContent:
      "center",
    marginBottom:
      18,
  },

  resultTitle: {
    textAlign:
      "center",
    fontSize:
      23,
    fontWeight:
      "900",
    color:
      "#0F172A",
  },

  resultDescription: {
    textAlign:
      "center",
    marginTop:
      7,
    marginBottom:
      20,
    fontSize:
      12,
    lineHeight:
      18,
    color:
      "#64748B",
  },

  resultCard: {
    width:
      "100%",
    padding:
      15,
    borderRadius:
      16,
    backgroundColor:
      "#F8FAFC",
    borderWidth:
      1,
    borderColor:
      "#E2E8F0",
    marginBottom:
      16,
  },

  resultLabel: {
    fontSize:
      11,
    color:
      "#64748B",
  },

  resultValue: {
    marginTop:
      3,
    fontSize:
      14,
    fontWeight:
      "900",
    color:
      "#0F172A",
    textAlign:
      "right",
  },

  resultSmallValue: {
    marginTop:
      3,
    fontSize:
      10,
    fontWeight:
      "700",
    color:
      "#334155",
  },

  divider: {
    height:
      1,
    backgroundColor:
      "#E2E8F0",
    marginVertical:
      12,
  },
});