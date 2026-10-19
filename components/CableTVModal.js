/**
 * =========================================================
 * eVAULT CABLE TV MODAL
 * eVault VERSION
 * =========================================================
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  useCable,
} from "../hooks/useCable";

const BRAND_COLOR =
  "#2a5fd3";

/**
 * =========================================================
 * FORMAT NAIRA
 * =========================================================
 */

function formatNaira(
  amount
) {
  const value =
    Number(amount);

  if (
    !Number.isFinite(
      value
    )
  ) {
    return "₦0.00";
  }

  return `₦${value.toLocaleString(
    "en-NG",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}

/**
 * =========================================================
 * PROVIDER ICON
 * =========================================================
 */

function getProviderIcon(
  name
) {
  const value =
    String(
      name || ""
    ).toLowerCase();

  if (
    value.includes("dstv")
  ) {
    return "tv-outline";
  }

  if (
    value.includes("gotv")
  ) {
    return "play-circle-outline";
  }

  if (
    value.includes("startimes")
  ) {
    return "radio-outline";
  }

  return "tv-outline";
}

/**
 * =========================================================
 * PROVIDER ID
 * =========================================================
 */

function getProviderId(
  provider
) {
  return (
    provider?.serviceId ??
    provider?.service_id ??
    provider?.providerId ??
    provider?.provider_id ??
    provider?.id ??
    null
  );
}

/**
 * =========================================================
 * VERIFICATION DATA
 * =========================================================
 */

function getVerificationData(
  verification
) {
  return (
    verification?.data ??
    verification?.verification ??
    verification ??
    {}
  );
}

/**
 * =========================================================
 * NORMALIZE PHONE
 * =========================================================
 */

function normalizePhone(
  value
) {
  let phone =
    String(
      value || ""
    );

  phone =
    phone.replace(
      /[^\d+]/g,
      ""
    );

  if (
    phone.startsWith(
      "+234"
    )
  ) {
    phone =
      "0" +
      phone.slice(4);
  }

  if (
    phone.startsWith(
      "234"
    )
  ) {
    phone =
      "0" +
      phone.slice(3);
  }

  return phone
    .replace(
      /\D/g,
      ""
    )
    .slice(
      0,
      11
    );
}

/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function CableTVModal({
  visible = false,
  onClose,
  onWalletRefresh,
  onNotificationRefresh,
}) {
  const {
    providers,
    selectedProviderPlans,
    verification,

    providersLoading,
    verificationLoading,
    purchaseLoading,

    error,

    loadProviders,
    verifySmartcard,
    buyCable,

    clearError,
    clearVerification,
  } =
    useCable();

  const [
    selectedProvider,
    setSelectedProvider,
  ] =
    useState(null);

  const [
    phoneNumber,
    setPhoneNumber,
  ] =
    useState("");

  const [
    smartCardNumber,
    setSmartCardNumber,
  ] =
    useState("");

  const [
    selectedPlan,
    setSelectedPlan,
  ] =
    useState(null);

  const [
    transactionPin,
    setTransactionPin,
  ] =
    useState("");

  const [
    step,
    setStep,
  ] =
    useState("provider");

  const [
    localError,
    setLocalError,
  ] =
    useState("");

  const [
    transactionResult,
    setTransactionResult,
  ] =
    useState(null);

  const pinInputRef =
    useRef(null);

  /**
   * =======================================================
   * ACTIVE PLANS
   * =======================================================
   */

  const activePlans =
    useMemo(
      () =>
        selectedProviderPlans ||
        [],
      [
        selectedProviderPlans,
      ]
    );

  /**
   * =======================================================
   * CUSTOMER NAME
   * =======================================================
   */

  const customerName =
    useMemo(
      () => {
        const data =
          getVerificationData(
            verification
          );

        return (
          data?.smartcard_name ??
          data?.smartcardName ??
          data?.customer_name ??
          data?.customerName ??
          data?.name ??
          data?.customer ??
          ""
        );
      },
      [
        verification,
      ]
    );

  /**
   * =======================================================
   * VERIFIED SMARTCARD
   * =======================================================
   */

  const verifiedSmartcard =
    useMemo(
      () => {
        const data =
          getVerificationData(
            verification
          );

        return (
          data?.smartcard_number ??
          data?.smartcardNumber ??
          data?.smart_card_number ??
          smartCardNumber
        );
      },
      [
        verification,
        smartCardNumber,
      ]
    );

  /**
   * =======================================================
   * RESET
   * =======================================================
   */

  const resetModal =
    useCallback(
      () => {
        setSelectedProvider(
          null
        );

        setPhoneNumber(
          ""
        );

        setSmartCardNumber(
          ""
        );

        setSelectedPlan(
          null
        );

        setTransactionPin(
          ""
        );

        setTransactionResult(
          null
        );

        setStep(
          "provider"
        );

        setLocalError(
          ""
        );

        clearError?.();
        clearVerification?.();
      },
      [
        clearError,
        clearVerification,
      ]
    );

  /**
   * =======================================================
   * LOAD PROVIDERS
   * =======================================================
   */

  useEffect(
    () => {
      if (!visible) {
        return;
      }

      loadProviders().catch(
        () => {}
      );
    },
    [
      visible,
      loadProviders,
    ]
  );

  /**
   * =======================================================
   * PROVIDER SELECT
   * =======================================================
   */

  const handleProviderSelect =
    useCallback(
      (
        provider
      ) => {
        const serviceId =
          getProviderId(
            provider
          );

        if (!serviceId) {
          setLocalError(
            "This cable provider has an invalid service ID."
          );

          return;
        }

        setSelectedProvider(
          provider
        );

        setSelectedPlan(
          null
        );

        setSmartCardNumber(
          ""
        );

        setLocalError(
          ""
        );

        clearError?.();
        clearVerification?.();

        setStep(
          "smartcard"
        );
      },
      [
        clearError,
        clearVerification,
      ]
    );

  /**
   * =======================================================
   * PHONE CHANGE
   * =======================================================
   */

  const handlePhoneChange =
    useCallback(
      (
        value
      ) => {
        setPhoneNumber(
          normalizePhone(
            value
          )
        );

        setLocalError(
          ""
        );
      },
      []
    );

  /**
   * =======================================================
   * SMARTCARD CHANGE
   * =======================================================
   */

  const handleSmartcardChange =
    useCallback(
      (
        value
      ) => {
        const clean =
          String(
            value || ""
          )
            .replace(
              /\D/g,
              ""
            )
            .slice(
              0,
              20
            );

        setSmartCardNumber(
          clean
        );

        clearVerification?.();

        setLocalError(
          ""
        );
      },
      [
        clearVerification,
      ]
    );

  /**
   * =======================================================
   * VERIFY
   * =======================================================
   */

  const handleVerify =
    useCallback(
      async () => {
        setLocalError(
          ""
        );

        clearError?.();

        const cleanPhone =
          normalizePhone(
            phoneNumber
          );

        const cleanCard =
          String(
            smartCardNumber ||
              ""
          )
            .replace(
              /\D/g,
              ""
            );

        const serviceId =
          getProviderId(
            selectedProvider
          );

        if (
          !selectedProvider ||
          !serviceId
        ) {
          setLocalError(
            "Please select your cable provider."
          );

          return;
        }

        if (
          !/^0\d{10}$/.test(
            cleanPhone
          )
        ) {
          setLocalError(
            "Enter a valid 11-digit Nigerian phone number."
          );

          return;
        }

        if (
          cleanCard.length <
          5
        ) {
          setLocalError(
            "Enter a valid smartcard number."
          );

          return;
        }

        try {
          await verifySmartcard(
            {
              serviceId,

              providerId:
                serviceId,

              phone:
                cleanPhone,

              smartCardNumber:
                cleanCard,
            }
          );

          setStep(
            "plan"
          );
        } catch (err) {
          setLocalError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to verify smartcard."
          );
        }
      },
      [
        clearError,
        phoneNumber,
        selectedProvider,
        smartCardNumber,
        verifySmartcard,
      ]
    );

  /**
   * =======================================================
   * PLAN SELECT
   * =======================================================
   */

  const handlePlanSelect =
    useCallback(
      (
        plan
      ) => {
        const code =
          String(
            plan?.code ??
              plan?.planCode ??
              plan?.plan_code ??
              ""
          ).trim();

        const name =
          String(
            plan?.name ??
              plan?.planName ??
              plan?.plan_name ??
              plan?.title ??
              ""
          ).trim();

        const amount =
          Number(
            plan?.price ??
              plan?.amount ??
              0
          );

        if (
          !code ||
          !name ||
          !Number.isFinite(
            amount
          ) ||
          amount <= 0
        ) {
          setLocalError(
            "This plan is missing valid eVault plan information."
          );

          return;
        }

        setSelectedPlan(
          {
            ...plan,

            code,

            planCode:
              code,

            name,

            planName:
              name,

            price:
              amount,

            amount,
          }
        );

        setTransactionPin(
          ""
        );

        setLocalError(
          ""
        );

        setStep(
          "review"
        );
      },
      []
    );

  /**
   * =======================================================
   * PIN CHANGE
   * =======================================================
   */

  const handlePinChange =
    useCallback(
      (
        value
      ) => {
        const clean =
          String(
            value || ""
          )
            .replace(
              /\D/g,
              ""
            )
            .slice(
              0,
              4
            );

        setTransactionPin(
          clean
        );
      },
      []
    );

  /**
   * =======================================================
   * PURCHASE
   * =======================================================
   */

  const handlePurchase =
    useCallback(
      async () => {
        if (
          purchaseLoading
        ) {
          return;
        }

        const cleanPin =
          String(
            transactionPin ||
              ""
          )
            .replace(
              /\D/g,
              ""
            )
            .slice(
              0,
              4
            );

        if (
          !/^\d{4}$/.test(
            cleanPin
          )
        ) {
          Alert.alert(
            "PIN Required",
            "Enter your complete 4-digit transaction PIN."
          );

          setTimeout(
            () => {
              pinInputRef.current?.focus();
            },
            150
          );

          return;
        }

        const serviceId =
          getProviderId(
            selectedProvider
          );

        const amount =
          Number(
            selectedPlan?.price ??
              selectedPlan?.amount
          );

        const planCode =
          selectedPlan?.code ??
          selectedPlan?.planCode ??
          selectedPlan?.plan_code;

        const planName =
          selectedPlan?.name ??
          selectedPlan?.planName ??
          selectedPlan?.plan_name;

        try {
          const result =
            await buyCable(
              {
                transactionPin:
                  cleanPin,

                serviceId,

                phone:
                  normalizePhone(
                    phoneNumber
                  ),

                smartCardNumber:
                  String(
                    smartCardNumber
                  ).replace(
                    /\D/g,
                    ""
                  ),

                amount,

                planCode,

                planName,
              }
            );

          setTransactionResult(
            result
          );

          if (
            typeof onWalletRefresh ===
            "function"
          ) {
            try {
              await onWalletRefresh();
            } catch (error) {
              console.log(
                "Cable wallet refresh failed:",
                error
              );
            }
          }

          if (
            typeof onNotificationRefresh ===
            "function"
          ) {
            try {
              await onNotificationRefresh();
            } catch (error) {
              console.log(
                "Cable notification refresh failed:",
                error
              );
            }
          }

          setStep(
            "success"
          );
        } catch (err) {
          Alert.alert(
            "Cable Purchase Failed",
            err?.response?.data?.message ||
              err?.message ||
              "Cable TV purchase failed. If your wallet was debited, the backend will automatically refund it when eVault reports failure."
          );
        }
      },
      [
        buyCable,
        onNotificationRefresh,
        onWalletRefresh,
        phoneNumber,
        purchaseLoading,
        selectedPlan,
        selectedProvider,
        smartCardNumber,
        transactionPin,
      ]
    );

  /**
   * =======================================================
   * CLOSE
   * =======================================================
   */

  const handleClose =
    useCallback(
      () => {
        if (
          providersLoading ||
          verificationLoading ||
          purchaseLoading
        ) {
          return;
        }

        resetModal();

        onClose?.();
      },
      [
        onClose,
        purchaseLoading,
        providersLoading,
        resetModal,
        verificationLoading,
      ]
    );

  /**
   * =======================================================
   * BACK
   * =======================================================
   */

  const handleBack =
    useCallback(
      () => {
        setLocalError(
          ""
        );

        if (
          step ===
          "smartcard"
        ) {
          setStep(
            "provider"
          );

          return;
        }

        if (
          step ===
          "plan"
        ) {
          clearVerification?.();

          setStep(
            "smartcard"
          );

          return;
        }

        if (
          step ===
          "review"
        ) {
          setStep(
            "plan"
          );

          return;
        }
      },
      [
        clearVerification,
        step,
      ]
    );

  /**
   * =======================================================
   * HEADER TITLE
   * =======================================================
   */

  const headerTitle =
    (() => {
      switch (
        step
      ) {
        case "smartcard":
          return "Smartcard";

        case "plan":
          return "Choose Plan";

        case "review":
          return "Review";

        case "success":
          return "Payment Successful";

        default:
          return "Cable TV";
      }
    })();

  const displayedError =
    localError ||
    error;

  const providerServiceId =
    getProviderId(
      selectedProvider
    );

  const actualAmount =
    Number(
      transactionResult?.providerAmount ??
        transactionResult?.deductedAmount ??
        transactionResult?.amount ??
        selectedPlan?.amount ??
        selectedPlan?.price ??
        0
    );

  return (
    <Modal
      visible={
        visible
      }
      animationType="slide"
      transparent={
        false
      }
      onRequestClose={
        handleClose
      }
    >
      <KeyboardAvoidingView
        style={
          styles.container
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
            styles.header
          }
        >
          <View
            style={
              styles.headerLeft
            }
          >
            {step !==
              "provider" &&
              step !==
                "success" && (
              <Pressable
                style={
                  styles.backButton
                }
                onPress={
                  handleBack
                }
              >
                <Ionicons
                  name="arrow-back"
                  size={22}
                  color="#0F172A"
                />
              </Pressable>
            )}

            <View>
              <Text
                style={
                  styles.headerTitle
                }
              >
                {
                  headerTitle
                }
              </Text>

              <Text
                style={
                  styles.headerSubtitle
                }
              >
                {selectedProvider?.name ||
                  "eVault Cable TV"}
              </Text>
            </View>
          </View>

          <Pressable
            style={
              styles.closeButton
            }
            onPress={
              handleClose
            }
          >
            <Ionicons
              name="close"
              size={23}
              color="#475569"
            />
          </Pressable>
        </View>

        {step !==
          "success" && (
          <View
            style={
              styles.progressContainer
            }
          >
            {[
              "provider",
              "smartcard",
              "plan",
              "review",
            ].map(
              (
                item,
                index
              ) => {
                const indexMap =
                  [
                    "provider",
                    "smartcard",
                    "plan",
                    "review",
                  ];

                const currentIndex =
                  indexMap.indexOf(
                    step
                  );

                return (
                  <View
                    key={
                      item
                    }
                    style={[
                      styles.progressItem,

                      index <=
                        currentIndex &&
                        styles.progressItemActive,
                    ]}
                  />
                );
              }
            )}
          </View>
        )}

        <ScrollView
          style={
            styles.scroll
          }
          contentContainerStyle={
            styles.content
          }
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
        >
          {step ===
            "provider" && (
            <>
              <View
                style={
                  styles.introCard
                }
              >
                <View
                  style={
                    styles.introIcon
                  }
                >
                  <Ionicons
                    name="tv-outline"
                    size={26}
                    color={
                      BRAND_COLOR
                    }
                  />
                </View>

                <View
                  style={
                    styles.introText
                  }
                >
                  <Text
                    style={
                      styles.introTitle
                    }
                  >
                    Pay Cable TV
                  </Text>

                  <Text
                    style={
                      styles.introSubtitle
                    }
                  >
                    Select your TV provider
                    to continue.
                  </Text>
                </View>
              </View>

              {providersLoading ? (
                <View
                  style={
                    styles.loadingContainer
                  }
                >
                  <ActivityIndicator
                    size="large"
                    color={
                      BRAND_COLOR
                    }
                  />

                  <Text
                    style={
                      styles.loadingText
                    }
                  >
                    Loading providers...
                  </Text>
                </View>
              ) : (
                <View
                  style={
                    styles.providerList
                  }
                >
                  {providers.map(
                    (
                      provider,
                      index
                    ) => {
                      const id =
                        getProviderId(
                          provider
                        );

                      return (
                        <Pressable
                          key={
                            String(
                              id ??
                                index
                            )
                          }
                          style={
                            styles.providerCard
                          }
                          onPress={() =>
                            handleProviderSelect(
                              provider
                            )
                          }
                        >
                          <View
                            style={
                              styles.providerIcon
                            }
                          >
                            <Ionicons
                              name={getProviderIcon(
                                provider?.name
                              )}
                              size={
                                27
                              }
                              color={
                                BRAND_COLOR
                              }
                            />
                          </View>

                          <View
                            style={
                              styles.providerContent
                            }
                          >
                            <Text
                              style={
                                styles.providerName
                              }
                            >
                              {provider?.name ||
                                "Cable Provider"}
                            </Text>

                            <Text
                              style={
                                styles.providerHint
                              }
                            >
                              Enter phone and smartcard
                            </Text>
                          </View>

                          <Ionicons
                            name="chevron-forward"
                            size={20}
                            color="#94A3B8"
                          />
                        </Pressable>
                      );
                    }
                  )}
                </View>
              )}
            </>
          )}

          {step ===
            "smartcard" && (
            <View
              style={
                styles.sectionCard
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Account Information
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                eVault requires your phone
                number and smartcard number
                for verification.
              </Text>

              <Text
                style={
                  styles.inputLabel
                }
              >
                Phone Number
              </Text>

              <TextInput
                style={
                  styles.input
                }
                value={
                  phoneNumber
                }
                onChangeText={
                  handlePhoneChange
                }
                keyboardType="phone-pad"
                placeholder="08012345678"
                placeholderTextColor="#94A3B8"
                maxLength={
                  11
                }
                editable={
                  !verificationLoading
                }
              />

              <Text
                style={
                  styles.inputLabel
                }
              >
                Smartcard Number
              </Text>

              <TextInput
                style={
                  styles.input
                }
                value={
                  smartCardNumber
                }
                onChangeText={
                  handleSmartcardChange
                }
                keyboardType="numeric"
                placeholder="Smartcard number"
                placeholderTextColor="#94A3B8"
                maxLength={
                  20
                }
                editable={
                  !verificationLoading
                }
              />

              <Pressable
                style={[
                  styles.primaryButton,
                  verificationLoading &&
                    styles.disabledButton,
                ]}
                onPress={
                  handleVerify
                }
                disabled={
                  verificationLoading
                }
              >
                {verificationLoading ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="search-outline"
                      size={19}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Verify Smartcard
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          )}

          {step ===
            "plan" && (
            <>
              {verification && (
                <View
                  style={
                    styles.verifiedCard
                  }
                >
                  <View
                    style={
                      styles.verifiedIcon
                    }
                  >
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>

                  <View
                    style={
                      styles.verifiedText
                    }
                  >
                    <Text
                      style={
                        styles.verifiedLabel
                      }
                    >
                      Smartcard Verified
                    </Text>

                    <Text
                      style={
                        styles.verifiedName
                      }
                    >
                      {customerName ||
                        "Customer verified"}
                    </Text>

                    <Text
                      style={
                        styles.verifiedCardNumber
                      }
                    >
                      {verifiedSmartcard}
                    </Text>
                  </View>
                </View>
              )}

              <Text
                style={
                  styles.planSectionTitle
                }
              >
                Select Subscription
              </Text>

              {activePlans.length ===
              0 ? (
                <View
                  style={
                    styles.emptyCard
                  }
                >
                  <Ionicons
                    name="albums-outline"
                    size={35}
                    color="#94A3B8"
                  />

                  <Text
                    style={
                      styles.emptyTitle
                    }
                  >
                    No plans returned
                  </Text>

                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    eVault did not return subscription
                    plans for this verified smartcard.
                  </Text>
                </View>
              ) : (
                activePlans.map(
                  (
                    plan,
                    index
                  ) => {
                    const id =
                      plan?.id ??
                      plan?.planId ??
                      plan?.code ??
                      index;

                    const amount =
                      Number(
                        plan?.price ??
                          plan?.amount ??
                          0
                      );

                    const name =
                      plan?.name ??
                      plan?.planName ??
                      plan?.plan_name ??
                      plan?.title ??
                      "Cable Subscription";

                    return (
                      <Pressable
                        key={
                          String(
                            id
                          )
                        }
                        style={
                          styles.planCard
                        }
                        onPress={() =>
                          handlePlanSelect(
                            plan
                          )
                        }
                      >
                        <View
                          style={
                            styles.planInfo
                          }
                        >
                          <Text
                            style={
                              styles.planName
                            }
                          >
                            {
                              name
                            }
                          </Text>

                          {plan?.description ? (
                            <Text
                              style={
                                styles.planDescription
                              }
                            >
                              {
                                plan.description
                              }
                            </Text>
                          ) : null}
                        </View>

                        <View
                          style={
                            styles.planRight
                          }
                        >
                          <Text
                            style={
                              styles.planPrice
                            }
                          >
                            {formatNaira(
                              amount
                            )}
                          </Text>

                          <Ionicons
                            name="chevron-forward"
                            size={18}
                            color="#94A3B8"
                          />
                        </View>
                      </Pressable>
                    );
                  }
                )
              )}
            </>
          )}

          {step ===
            "review" && (
            <>
              <View
                style={
                  styles.reviewCard
                }
              >
                <View
                  style={
                    styles.reviewHeader
                  }
                >
                  <View
                    style={
                      styles.reviewIcon
                    }
                  >
                    <Ionicons
                      name="tv-outline"
                      size={25}
                      color={
                        BRAND_COLOR
                      }
                    />
                  </View>

                  <View>
                    <Text
                      style={
                        styles.reviewProvider
                      }
                    >
                      {selectedProvider?.name ||
                        "Cable TV"}
                    </Text>

                    <Text
                      style={
                        styles.reviewSubtitle
                      }
                    >
                      eVault subscription
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.detailRow
                  }
                >
                  <Text
                    style={
                      styles.detailLabel
                    }
                  >
                    Customer
                  </Text>

                  <Text
                    style={
                      styles.detailValue
                    }
                  >
                    {customerName ||
                      "Verified customer"}
                  </Text>
                </View>

                <View
                  style={
                    styles.detailRow
                  }
                >
                  <Text
                    style={
                      styles.detailLabel
                    }
                  >
                    Phone
                  </Text>

                  <Text
                    style={
                      styles.detailValue
                    }
                  >
                    {phoneNumber}
                  </Text>
                </View>

                <View
                  style={
                    styles.detailRow
                  }
                >
                  <Text
                    style={
                      styles.detailLabel
                    }
                  >
                    Smartcard
                  </Text>

                  <Text
                    style={
                      styles.detailValue
                    }
                  >
                    {verifiedSmartcard}
                  </Text>
                </View>

                <View
                  style={
                    styles.detailRow
                  }
                >
                  <Text
                    style={
                      styles.detailLabel
                    }
                  >
                    Plan
                  </Text>

                  <Text
                    style={
                      styles.detailValue
                    }
                  >
                    {selectedPlan?.name ||
                      selectedPlan?.planName}
                  </Text>
                </View>

                <View
                  style={
                    styles.amountRow
                  }
                >
                  <Text
                    style={
                      styles.amountLabel
                    }
                  >
                    Amount
                  </Text>

                  <Text
                    style={
                      styles.amountValue
                    }
                  >
                    {formatNaira(
                      selectedPlan?.price ??
                        selectedPlan?.amount
                    )}
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.pinCard
                }
              >
                <Text
                  style={
                    styles.pinTitle
                  }
                >
                  Transaction PIN
                </Text>

                <Text
                  style={
                    styles.pinSubtitle
                  }
                >
                  Enter your 4-digit PIN to authorize
                  this Cable TV payment.
                </Text>

                <TextInput
                  ref={
                    pinInputRef
                  }
                  style={
                    styles.pinInput
                  }
                  value={
                    transactionPin
                  }
                  onChangeText={
                    handlePinChange
                  }
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={
                    4
                  }
                  placeholder="••••"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View
                style={
                  styles.noticeCard
                }
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={22}
                  color={
                    BRAND_COLOR
                  }
                />

                <Text
                  style={
                    styles.noticeText
                  }
                >
                  Your eVault wallet will be debited
                  only for the selected plan. If eVault
                  reports a failed purchase, the backend
                  automatically refunds the deducted amount.
                </Text>
              </View>

              <Pressable
                style={[
                  styles.primaryButton,
                  purchaseLoading &&
                    styles.disabledButton,
                ]}
                onPress={
                  handlePurchase
                }
                disabled={
                  purchaseLoading
                }
              >
                {purchaseLoading ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="card-outline"
                      size={19}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Pay{" "}
                      {formatNaira(
                        selectedPlan?.price ??
                          selectedPlan?.amount
                      )}
                    </Text>
                  </>
                )}
              </Pressable>
            </>
          )}

          {step ===
            "success" && (
            <View
              style={
                styles.successContainer
              }
            >
              <View
                style={
                  styles.successIcon
                }
              >
                <Ionicons
                  name="checkmark"
                  size={44}
                  color="#FFFFFF"
                />
              </View>

              <Text
                style={
                  styles.successTitle
                }
              >
                Cable Payment Successful
              </Text>

              <Text
                style={
                  styles.successSubtitle
                }
              >
                Your Cable TV subscription request was
                successfully completed.
              </Text>

              <View
                style={
                  styles.successCard
                }
              >
                <View
                  style={
                    styles.detailRow
                  }
                >
                  <Text
                    style={
                      styles.detailLabel
                    }
                  >
                    Provider
                  </Text>

                  <Text
                    style={
                      styles.detailValue
                    }
                  >
                    {selectedProvider?.name ||
                      "Cable TV"}
                  </Text>
                </View>

                <View
                  style={
                    styles.detailRow
                  }
                >
                  <Text
                    style={
                      styles.detailLabel
                    }
                  >
                    Plan
                  </Text>

                  <Text
                    style={
                      styles.detailValue
                    }
                  >
                    {selectedPlan?.name ||
                      selectedPlan?.planName}
                  </Text>
                </View>

                <View
                  style={
                    styles.detailRow
                  }
                >
                  <Text
                    style={
                      styles.detailLabel
                    }
                  >
                    Amount Deducted
                  </Text>

                  <Text
                    style={
                      styles.detailValue
                    }
                  >
                    {formatNaira(
                      actualAmount
                    )}
                  </Text>
                </View>

                <View
                  style={
                    styles.detailRow
                  }
                >
                  <Text
                    style={
                      styles.detailLabel
                    }
                  >
                    Reference
                  </Text>

                  <Text
                    style={
                      styles.detailValue
                    }
                  >
                    {transactionResult?.reference ||
                      "Completed"}
                  </Text>
                </View>

                {transactionResult
                  ?.provider
                  ?.external_reference ? (
                  <View
                    style={
                      styles.detailRow
                    }
                  >
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Provider Reference
                    </Text>

                    <Text
                      style={
                        styles.detailValue
                      }
                    >
                      {
                        transactionResult
                          .provider
                          .external_reference
                      }
                    </Text>
                  </View>
                ) : null}
              </View>

              <Pressable
                style={
                  styles.primaryButton
                }
                onPress={
                  handleClose
                }
              >
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Done
                </Text>
              </Pressable>
            </View>
          )}

          {displayedError ? (
            <View
              style={
                styles.errorCard
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color="#DC2626"
              />

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
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/**
 * =========================================================
 * STYLES
 * =========================================================
 */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#F8FAFC",
    },

    header: {
      minHeight: 76,
      paddingHorizontal: 18,
      paddingTop: 14,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor:
        "#E2E8F0",
    },

    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },

    backButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 6,
    },

    headerTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: "#0F172A",
    },

    headerSubtitle: {
      marginTop: 2,
      fontSize: 12,
      color: "#64748B",
    },

    closeButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },

    progressContainer: {
      height: 4,
      flexDirection: "row",
      gap: 4,
      paddingHorizontal: 16,
      backgroundColor: "#FFFFFF",
    },

    progressItem: {
      flex: 1,
      height: 4,
      borderRadius: 4,
      backgroundColor:
        "#E2E8F0",
    },

    progressItemActive: {
      backgroundColor:
        BRAND_COLOR,
    },

    scroll: {
      flex: 1,
    },

    content: {
      padding: 18,
      paddingBottom: 40,
    },

    introCard: {
      padding: 16,
      borderRadius: 18,
      backgroundColor:
        "#EFF6FF",
      borderWidth: 1,
      borderColor:
        "#DBEAFE",
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom: 18,
    },

    introIcon: {
      width: 50,
      height: 50,
      borderRadius: 15,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#FFFFFF",
    },

    introText: {
      flex: 1,
      marginLeft: 13,
    },

    introTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: "#0F172A",
    },

    introSubtitle: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      color: "#64748B",
    },

    providerList: {
      gap: 11,
    },

    providerCard: {
      padding: 15,
      borderRadius: 17,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    providerIcon: {
      width: 50,
      height: 50,
      borderRadius: 15,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#EFF6FF",
    },

    providerContent: {
      flex: 1,
      marginLeft: 13,
    },

    providerName: {
      fontSize: 15,
      fontWeight: "800",
      color: "#0F172A",
    },

    providerHint: {
      marginTop: 4,
      fontSize: 12,
      color: "#64748B",
    },

    sectionCard: {
      padding: 17,
      borderRadius: 19,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: "#0F172A",
    },

    sectionSubtitle: {
      marginTop: 6,
      fontSize: 12,
      lineHeight: 18,
      color: "#64748B",
    },

    inputLabel: {
      marginTop: 17,
      marginBottom: 7,
      fontSize: 12,
      fontWeight: "800",
      color: "#475569",
    },

    input: {
      height: 53,
      paddingHorizontal: 15,
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        "#CBD5E1",
      backgroundColor:
        "#F8FAFC",
      fontSize: 16,
      fontWeight: "700",
      color: "#0F172A",
    },

    primaryButton: {
      minHeight: 52,
      marginTop: 15,
      borderRadius: 14,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        BRAND_COLOR,
      gap: 8,
    },

    disabledButton: {
      opacity: 0.65,
    },

    primaryButtonText: {
      fontSize: 14,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    verifiedCard: {
      padding: 15,
      borderRadius: 17,
      backgroundColor:
        "#F0FDF4",
      borderWidth: 1,
      borderColor:
        "#BBF7D0",
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom: 18,
    },

    verifiedIcon: {
      width: 41,
      height: 41,
      borderRadius: 13,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#16A34A",
    },

    verifiedText: {
      flex: 1,
      marginLeft: 11,
    },

    verifiedLabel: {
      fontSize: 11,
      color: "#16A34A",
      fontWeight: "800",
    },

    verifiedName: {
      marginTop: 2,
      fontSize: 14,
      fontWeight: "800",
      color: "#14532D",
    },

    verifiedCardNumber: {
      marginTop: 2,
      fontSize: 12,
      color: "#166534",
    },

    planSectionTitle: {
      marginBottom: 10,
      fontSize: 16,
      fontWeight: "800",
      color: "#0F172A",
    },

    planCard: {
      minHeight: 82,
      marginBottom: 10,
      padding: 14,
      borderRadius: 17,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    planInfo: {
      flex: 1,
      paddingRight: 12,
    },

    planName: {
      fontSize: 14,
      fontWeight: "800",
      color: "#0F172A",
    },

    planDescription: {
      marginTop: 4,
      fontSize: 11,
      lineHeight: 16,
      color: "#64748B",
    },

    planRight: {
      alignItems:
        "flex-end",
    },

    planPrice: {
      marginBottom: 7,
      fontSize: 14,
      fontWeight: "900",
      color: BRAND_COLOR,
    },

    reviewCard: {
      padding: 17,
      borderRadius: 19,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    reviewHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingBottom: 15,
      marginBottom: 4,
      borderBottomWidth: 1,
      borderBottomColor:
        "#E2E8F0",
    },

    reviewIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#EFF6FF",
    },

    reviewProvider: {
      marginLeft: 12,
      fontSize: 16,
      fontWeight: "800",
      color: "#0F172A",
    },

    reviewSubtitle: {
      marginLeft: 12,
      marginTop: 3,
      fontSize: 11,
      color: "#64748B",
    },

    detailRow: {
      paddingVertical: 13,
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      gap: 15,
      borderBottomWidth: 1,
      borderBottomColor:
        "#F1F5F9",
    },

    detailLabel: {
      fontSize: 12,
      color: "#64748B",
    },

    detailValue: {
      flex: 1,
      textAlign:
        "right",
      fontSize: 12,
      fontWeight: "800",
      color: "#0F172A",
    },

    amountRow: {
      paddingTop: 16,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    amountLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: "#475569",
    },

    amountValue: {
      fontSize: 20,
      fontWeight: "900",
      color: BRAND_COLOR,
    },

    pinCard: {
      marginTop: 15,
      padding: 17,
      borderRadius: 19,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    pinTitle: {
      fontSize: 16,
      fontWeight: "800",
      color: "#0F172A",
    },

    pinSubtitle: {
      marginTop: 5,
      fontSize: 12,
      lineHeight: 18,
      color: "#64748B",
    },

    pinInput: {
      height: 58,
      marginTop: 15,
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        "#CBD5E1",
      backgroundColor:
        "#F8FAFC",
      textAlign:
        "center",
      fontSize: 25,
      fontWeight: "900",
      letterSpacing: 12,
      color: "#0F172A",
    },

    noticeCard: {
      marginTop: 15,
      padding: 14,
      borderRadius: 15,
      backgroundColor:
        "#EFF6FF",
      borderWidth: 1,
      borderColor:
        "#BFDBFE",
      flexDirection:
        "row",
      alignItems:
        "flex-start",
    },

    noticeText: {
      flex: 1,
      marginLeft: 9,
      fontSize: 12,
      lineHeight: 18,
      color: "#334155",
    },

    successContainer: {
      alignItems:
        "center",
      paddingTop: 35,
    },

    successIcon: {
      width: 82,
      height: 82,
      borderRadius: 41,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#16A34A",
    },

    successTitle: {
      marginTop: 18,
      fontSize: 21,
      fontWeight: "900",
      color: "#0F172A",
      textAlign:
        "center",
    },

    successSubtitle: {
      marginTop: 7,
      paddingHorizontal: 15,
      fontSize: 12,
      lineHeight: 18,
      color: "#64748B",
      textAlign:
        "center",
    },

    successCard: {
      width: "100%",
      marginTop: 22,
      padding: 17,
      borderRadius: 19,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    errorCard: {
      marginTop: 15,
      padding: 13,
      borderRadius: 14,
      backgroundColor:
        "#FEF2F2",
      borderWidth: 1,
      borderColor:
        "#FECACA",
      flexDirection:
        "row",
      alignItems:
        "flex-start",
    },

    errorText: {
      flex: 1,
      marginLeft: 8,
      fontSize: 12,
      lineHeight: 18,
      color: "#B91C1C",
    },

    loadingContainer: {
      paddingVertical: 50,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 12,
      fontSize: 13,
      color: "#64748B",
    },

    emptyCard: {
      paddingVertical: 50,
      paddingHorizontal: 20,
      alignItems:
        "center",
      justifyContent:
        "center",
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    emptyTitle: {
      marginTop: 10,
      fontSize: 16,
      fontWeight: "800",
      color: "#334155",
      textAlign:
        "center",
    },

    emptyText: {
      marginTop: 5,
      textAlign:
        "center",
      fontSize: 12,
      lineHeight: 18,
      color: "#64748B",
    },
  });