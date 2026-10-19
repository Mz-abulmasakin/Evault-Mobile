/**
 * =========================================================
 * eVAULT EXAMINATION RESULT PIN MODAL
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
  useEducation,
} from "../hooks/useEducation";


const BRAND_COLOR =
  "#2a5fd3";


/**
 * =========================================================
 * PRICE
 * =========================================================
 */

function formatNaira(
  amount
) {
  const number =
    Number(amount);


  if (
    !Number.isFinite(
      number
    )
  ) {
    return "₦0.00";
  }


  return (
    `₦${number.toLocaleString(
      "en-NG",
      {
        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2,
      }
    )}`
  );
}


/**
 * =========================================================
 * SERVICE NAME
 * =========================================================
 */

function getServiceName(
  service
) {
  return (
    service?.name ||
    service?.service_name ||
    service?.serviceName ||
    service?.title ||
    "Examination Result PIN"
  );
}


/**
 * =========================================================
 * SERVICE ID
 * =========================================================
 */

function getServiceId(
  service
) {
  return (
    service?.id ??
    service?.serviceId ??
    service?.service_id
  );
}


/**
 * =========================================================
 * EXAM ICON
 * =========================================================
 */

function getExamIcon(
  name
) {
  const value =
    String(
      name || ""
    ).toLowerCase();


  if (
    value.includes("waec")
  ) {
    return "school-outline";
  }


  if (
    value.includes("neco")
  ) {
    return "book-outline";
  }


  if (
    value.includes("jamb")
  ) {
    return "document-text-outline";
  }


  if (
    value.includes("nabteb")
  ) {
    return "ribbon-outline";
  }


  return "school-outline";
}


/**
 * =========================================================
 * PINS
 * =========================================================
 */

function normalizePins(
  value
) {
  if (
    Array.isArray(
      value
    )
  ) {
    return value
      .map(
        (item) =>
          String(item)
      )
      .filter(Boolean);
  }


  if (
    value !== null &&
    value !== undefined &&
    value !== ""
  ) {
    return [
      String(value)
    ];
  }


  return [];
}


/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function ExaminationResultPinModal({
  visible = false,
  onClose,
  onWalletRefresh,
  onNotificationRefresh,
}) {
  const {
    services,
    pricing,
    purchaseResult,

    servicesLoading,
    pricingLoading,
    purchaseLoading,

    error,

    loadServices,
    loadPrice,
    buyEducationPin,

    clearError,
    clearPurchase,
  } =
    useEducation();


  const [
    selectedService,
    setSelectedService,
  ] = useState(null);


  const [
    quantity,
    setQuantity,
  ] = useState(1);


  const [
    transactionPin,
    setTransactionPin,
  ] = useState("");


  const [
    showPin,
    setShowPin,
  ] = useState(false);


  const [
    step,
    setStep,
  ] = useState(
    "service"
  );


  const [
    localError,
    setLocalError,
  ] = useState("");


  const pinInputRef =
    useRef(null);


  /**
   * =======================================================
   * LOAD SERVICES
   * =======================================================
   */

  useEffect(() => {
    if (!visible) {
      return;
    }


    clearPurchase?.();

    setSelectedService(
      null
    );

    setQuantity(
      1
    );

    setTransactionPin(
      ""
    );

    setShowPin(
      false
    );

    setLocalError(
      ""
    );

    setStep(
      "service"
    );


    loadServices().catch(
      () => {}
    );
  }, [
    visible,
    loadServices,
    clearPurchase,
  ]);


  /**
   * =======================================================
   * SERVICES
   * =======================================================
   */

  const educationServices =
    useMemo(
      () => {
        return Array.isArray(
          services
        )
          ? services
          : [];
      },
      [services]
    );


  /**
   * =======================================================
   * SELECT SERVICE
   * =======================================================
   */

  const handleServiceSelect =
    useCallback(
      async (
        service
      ) => {
        setLocalError(
          ""
        );

        clearError?.();

        setSelectedService(
          service
        );

        setQuantity(
          1
        );

        setTransactionPin(
          ""
        );

        try {
          await loadPrice(
            {
              serviceId:
                getServiceId(
                  service
                ),

              quantity:
                1,
            }
          );

          setStep(
            "review"
          );

        } catch (error) {

          setLocalError(
            error?.response
              ?.data?.message ||
            error?.message ||
            "Unable to load the examination PIN price."
          );
        }
      },
      [
        clearError,
        loadPrice,
      ]
    );


  /**
   * =======================================================
   * REFRESH PRICE
   * =======================================================
   */

  const refreshPrice =
    useCallback(
      async (
        nextQuantity
      ) => {
        if (
          !selectedService
        ) {
          return;
        }


        setLocalError(
          ""
        );

        clearError?.();


        try {
          await loadPrice(
            {
              serviceId:
                getServiceId(
                  selectedService
                ),

              quantity:
                nextQuantity,
            }
          );

        } catch (error) {

          setLocalError(
            error?.response
              ?.data?.message ||
            error?.message ||
            "Unable to update the price."
          );
        }
      },
      [
        selectedService,
        clearError,
        loadPrice,
      ]
    );


  /**
   * =======================================================
   * QUANTITY
   * =======================================================
   */

  const decreaseQuantity =
    useCallback(
      () => {
        const next =
          Math.max(
            1,
            quantity - 1
          );

        setQuantity(
          next
        );

        refreshPrice(
          next
        );
      },
      [
        quantity,
        refreshPrice,
      ]
    );


  const increaseQuantity =
    useCallback(
      () => {
        const next =
          Math.min(
            20,
            quantity + 1
          );

        setQuantity(
          next
        );

        refreshPrice(
          next
        );
      },
      [
        quantity,
        refreshPrice,
      ]
    );


  /**
   * =======================================================
   * PIN
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


        if (
          localError
        ) {
          setLocalError(
            ""
          );
        }
      },
      [localError]
    );


  /**
   * =======================================================
   * CONTINUE TO PIN
   * =======================================================
   */

  const handleContinue =
    useCallback(
      () => {
        const price =
          Number(
            pricing?.totalPrice ??
              pricing?.amount ??
              pricing?.price ??
              0
          );


        if (
          !Number.isFinite(
            price
          ) ||
          price <= 0
        ) {
          Alert.alert(
            "Price unavailable",
            "The examination PIN price could not be determined."
          );

          return;
        }


        setTransactionPin(
          ""
        );

        setLocalError(
          ""
        );

        setStep(
          "pin"
        );


        setTimeout(
          () => {
            pinInputRef.current?.focus();
          },
          200
        );
      },
      [
        pricing,
      ]
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
            transactionPin || ""
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
            "Transaction PIN Required",
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


        if (
          !selectedService
        ) {
          Alert.alert(
            "Service Required",
            "Select an examination result PIN."
          );

          return;
        }


        try {
          setLocalError(
            ""
          );

          clearError?.();


          const result =
            await buyEducationPin(
              {
                serviceId:
                  getServiceId(
                    selectedService
                  ),

                quantity,

                transactionPin:
                  cleanPin,
              }
            );


          if (
            result?.success ===
            false
          ) {
            throw new Error(
              result?.message ||
                "Examination Result PIN purchase failed."
            );
          }


          try {
            await onWalletRefresh?.();
          } catch (
            walletError
          ) {
            console.log(
              "Education wallet refresh failed:",
              walletError
            );
          }


          try {
            await onNotificationRefresh?.();
          } catch (
            notificationError
          ) {
            console.log(
              "Education notification refresh failed:",
              notificationError
            );
          }


          setStep(
            "success"
          );

        } catch (error) {

          const message =
            error?.response
              ?.data?.message ||
            error?.message ||
            "Examination Result PIN purchase failed.";


          setLocalError(
            message
          );
        }
      },
      [
        buyEducationPin,
        clearError,
        onNotificationRefresh,
        onWalletRefresh,
        purchaseLoading,
        quantity,
        selectedService,
        transactionPin,
      ]
    );


  /**
   * =======================================================
   * PINS
   * =======================================================
   */

  const pins =
    useMemo(
      () => {
        return normalizePins(
          purchaseResult?.pins
        );
      },
      [
        purchaseResult,
      ]
    );


  /**
   * =======================================================
   * AMOUNT
   * =======================================================
   */

  const totalAmount =
    Number(
      pricing?.totalPrice ??
        pricing?.amount ??
        pricing?.price ??
        purchaseResult?.deductedAmount ??
        purchaseResult?.amount ??
        0
    );


  /**
   * =======================================================
   * BACK
   * =======================================================
   */

  const handleBack =
    useCallback(
      () => {
        if (
          servicesLoading ||
          pricingLoading ||
          purchaseLoading
        ) {
          return;
        }


        if (
          step === "pin"
        ) {
          setTransactionPin(
            ""
          );

          setStep(
            "review"
          );

          return;
        }


        if (
          step === "review"
        ) {
          setStep(
            "service"
          );

          setSelectedService(
            null
          );

          clearPurchase?.();
        }
      },
      [
        clearPurchase,
        pricingLoading,
        purchaseLoading,
        servicesLoading,
        step,
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
          purchaseLoading
        ) {
          return;
        }


        clearPurchase?.();

        setSelectedService(
          null
        );

        setQuantity(
          1
        );

        setTransactionPin(
          ""
        );

        setShowPin(
          false
        );

        setLocalError(
          ""
        );

        setStep(
          "service"
        );


        onClose?.();
      },
      [
        clearPurchase,
        onClose,
        purchaseLoading,
      ]
    );


  const displayedError =
    localError ||
    error ||
    "";


  /**
   * =======================================================
   * HEADER TITLE
   * =======================================================
   */

  const headerTitle =
    step === "service"
      ? "Exam Result PIN"
      : step === "review"
        ? "Review Purchase"
        : step === "pin"
          ? "Transaction PIN"
          : "PIN Purchase Successful";


  /**
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={
        handleClose
      }
    >
      <KeyboardAvoidingView
        style={
          styles.container
        }
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >

        {/* =================================================
            HEADER
        ================================================= */}

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

            {(
              step === "review" ||
              step === "pin"
            ) && (
              <Pressable
                onPress={
                  handleBack
                }
                disabled={
                  purchaseLoading
                }
                style={
                  styles.backButton
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
                {headerTitle}
              </Text>

              <Text
                style={
                  styles.headerSubtitle
                }
              >
                WAEC, NECO, JAMB & NABTEB
              </Text>
            </View>
          </View>


          <Pressable
            onPress={
              handleClose
            }
            disabled={
              purchaseLoading
            }
            style={
              styles.closeButton
            }
          >
            <Ionicons
              name="close"
              size={24}
              color="#475569"
            />
          </Pressable>
        </View>


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

          {/* =================================================
              SERVICE
          ================================================= */}

          {step === "service" && (
            <View>

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
                    name="school-outline"
                    size={27}
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
                    Buy Examination PIN
                  </Text>

                  <Text
                    style={
                      styles.introSubtitle
                    }
                  >
                    Select the examination result service you need.
                  </Text>
                </View>
              </View>


              {servicesLoading ? (
                <View
                  style={
                    styles.loadingCard
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
                    Loading examination services...
                  </Text>
                </View>

              ) : educationServices.length === 0 ? (

                <View
                  style={
                    styles.emptyCard
                  }
                >
                  <Ionicons
                    name="school-outline"
                    size={40}
                    color="#94A3B8"
                  />

                  <Text
                    style={
                      styles.emptyTitle
                    }
                  >
                    No examination services found
                  </Text>

                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    VTUGATE did not return any active examination result PIN services.
                  </Text>
                </View>

              ) : (

                <View>

                  {educationServices.map(
                    (
                      service,
                      index
                    ) => {
                      const id =
                        getServiceId(
                          service
                        );

                      const name =
                        getServiceName(
                          service
                        );

                      const price =
                        Number(
                          service?.price ??
                            service?.amount ??
                            0
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
                            styles.serviceCard
                          }
                          onPress={() =>
                            handleServiceSelect(
                              service
                            )
                          }
                        >

                          <View
                            style={
                              styles.serviceIcon
                            }
                          >
                            <Ionicons
                              name={
                                getExamIcon(
                                  name
                                )
                              }
                              size={24}
                              color={
                                BRAND_COLOR
                              }
                            />
                          </View>


                          <View
                            style={
                              styles.serviceInfo
                            }
                          >
                            <Text
                              style={
                                styles.serviceName
                              }
                              numberOfLines={
                                2
                              }
                            >
                              {name}
                            </Text>

                            {price >
                              0 && (
                              <Text
                                style={
                                  styles.servicePrice
                                }
                              >
                                {formatNaira(
                                  price
                                )}
                              </Text>
                            )}
                          </View>


                          <Ionicons
                            name="chevron-forward"
                            size={19}
                            color="#94A3B8"
                          />

                        </Pressable>
                      );
                    }
                  )}

                </View>
              )}

            </View>
          )}


          {/* =================================================
              REVIEW
          ================================================= */}

          {step === "review" && (
            <View>

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
                      name={
                        getExamIcon(
                          getServiceName(
                            selectedService
                          )
                        )
                      }
                      size={25}
                      color={
                        BRAND_COLOR
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.reviewHeaderText
                    }
                  >
                    <Text
                      style={
                        styles.reviewTitle
                      }
                    >
                      {getServiceName(
                        selectedService
                      )}
                    </Text>

                    <Text
                      style={
                        styles.reviewSubtitle
                      }
                    >
                      Examination PIN purchase
                    </Text>
                  </View>
                </View>


                <View
                  style={
                    styles.quantityRow
                  }
                >
                  <Text
                    style={
                      styles.quantityLabel
                    }
                  >
                    Quantity
                  </Text>

                  <View
                    style={
                      styles.quantityControl
                    }
                  >

                    <Pressable
                      onPress={
                        decreaseQuantity
                      }
                      disabled={
                        quantity <=
                        1 ||
                        pricingLoading
                      }
                      style={
                        styles.quantityButton
                      }
                    >
                      <Ionicons
                        name="remove"
                        size={18}
                        color={
                          quantity <=
                          1
                            ? "#CBD5E1"
                            : "#0F172A"
                        }
                      />
                    </Pressable>


                    <Text
                      style={
                        styles.quantityValue
                      }
                    >
                      {quantity}
                    </Text>


                    <Pressable
                      onPress={
                        increaseQuantity
                      }
                      disabled={
                        quantity >=
                          20 ||
                        pricingLoading
                      }
                      style={
                        styles.quantityButton
                      }
                    >
                      <Ionicons
                        name="add"
                        size={18}
                        color={
                          quantity >=
                          20
                            ? "#CBD5E1"
                            : "#0F172A"
                        }
                      />
                    </Pressable>

                  </View>
                </View>


                <View
                  style={
                    styles.divider
                  }
                />


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
                    Exam service
                  </Text>

                  <Text
                    style={
                      styles.detailValue
                    }
                  >
                    {getServiceName(
                      selectedService
                    )}
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

                  {pricingLoading ? (
                    <ActivityIndicator
                      color={
                        BRAND_COLOR
                      }
                    />
                  ) : (
                    <Text
                      style={
                        styles.amountValue
                      }
                    >
                      {formatNaira(
                        totalAmount
                      )}
                    </Text>
                  )}
                </View>

              </View>


              <View
                style={
                  styles.infoCard
                }
              >
                <Ionicons
                  name="information-circle-outline"
                  size={21}
                  color={
                    BRAND_COLOR
                  }
                />

                <Text
                  style={
                    styles.infoText
                  }
                >
                  Your wallet will only be charged after the examination PIN price has been confirmed.
                </Text>
              </View>


              <Pressable
                style={[
                  styles.primaryButton,
                  (
                    pricingLoading ||
                    totalAmount <=
                      0
                  ) &&
                    styles.disabledButton,
                ]}
                onPress={
                  handleContinue
                }
                disabled={
                  pricingLoading ||
                  totalAmount <=
                    0
                }
              >
                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Continue
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={19}
                  color="#FFFFFF"
                />
              </Pressable>

            </View>
          )}


          {/* =================================================
              PIN
          ================================================= */}

          {step === "pin" && (
            <View>

              <View
                style={
                  styles.pinCard
                }
              >

                <View
                  style={
                    styles.pinIcon
                  }
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={28}
                    color={
                      BRAND_COLOR
                    }
                  />
                </View>


                <Text
                  style={
                    styles.pinTitle
                  }
                >
                  Enter Transaction PIN
                </Text>


                <Text
                  style={
                    styles.pinSubtitle
                  }
                >
                  Enter your 4-digit eVault transaction PIN to authorize this purchase.
                </Text>


                <View
                  style={
                    styles.pinInputWrapper
                  }
                >

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
                    secureTextEntry={
                      !showPin
                    }
                    keyboardType="numeric"
                    maxLength={
                      4
                    }
                    placeholder="••••"
                    placeholderTextColor="#CBD5E1"
                    textAlign="center"
                  />


                  <Pressable
                    onPress={() =>
                      setShowPin(
                        (current) =>
                          !current
                      )
                    }
                    style={
                      styles.eyeButton
                    }
                  >
                    <Ionicons
                      name={
                        showPin
                          ? "eye-off-outline"
                          : "eye-outline"
                      }
                      size={21}
                      color="#64748B"
                    />
                  </Pressable>

                </View>


                <View
                  style={
                    styles.pinDots
                  }
                >
                  {[0, 1, 2, 3].map(
                    (
                      index
                    ) => (
                      <View
                        key={
                          index
                        }
                        style={[
                          styles.pinDot,
                          index <
                            transactionPin.length &&
                            styles.pinDotActive,
                        ]}
                      />
                    )
                  )}
                </View>

              </View>


              <View
                style={
                  styles.reviewMini
                }
              >
                <Text
                  style={
                    styles.reviewMiniLabel
                  }
                >
                  Purchase
                </Text>

                <Text
                  style={
                    styles.reviewMiniValue
                  }
                  numberOfLines={
                    1
                  }
                >
                  {getServiceName(
                    selectedService
                  )}
                </Text>


                <Text
                  style={
                    styles.reviewMiniLabel
                  }
                >
                  Quantity
                </Text>

                <Text
                  style={
                    styles.reviewMiniValue
                  }
                >
                  {quantity}
                </Text>


                <Text
                  style={
                    styles.reviewMiniLabel
                  }
                >
                  Amount deducted
                </Text>

                <Text
                  style={
                    styles.reviewMiniAmount
                  }
                >
                  {formatNaira(
                    totalAmount
                  )}
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
                  <>
                    <ActivityIndicator
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Processing...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={19}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Confirm Purchase
                    </Text>
                  </>
                )}
              </Pressable>

            </View>
          )}


          {/* =================================================
              SUCCESS
          ================================================= */}

          {step === "success" && (
            <View>

              <View
                style={
                  styles.successCard
                }
              >
                <View
                  style={
                    styles.successIcon
                  }
                >
                  <Ionicons
                    name="checkmark"
                    size={32}
                    color="#FFFFFF"
                  />
                </View>


                <Text
                  style={
                    styles.successTitle
                  }
                >
                  Purchase Successful
                </Text>


                <Text
                  style={
                    styles.successSubtitle
                  }
                >
                  Your examination result PIN purchase was completed successfully.
                </Text>


                <View
                  style={
                    styles.successAmount
                  }
                >
                  <Text
                    style={
                      styles.successAmountLabel
                    }
                  >
                    Amount Deducted
                  </Text>

                  <Text
                    style={
                      styles.successAmountValue
                    }
                  >
                    {formatNaira(
                      purchaseResult?.deductedAmount ??
                        purchaseResult?.amount ??
                        totalAmount
                    )}
                  </Text>
                </View>

              </View>


              {pins.length >
                0 ? (
                <View
                  style={
                    styles.pinResultCard
                  }
                >

                  <Text
                    style={
                      styles.pinResultTitle
                    }
                  >
                    Your Result PIN
                  </Text>


                  {pins.map(
                    (
                      pin,
                      index
                    ) => (
                      <View
                        key={
                          `${pin}-${index}`
                        }
                        style={
                          styles.pinResultRow
                        }
                      >
                        <View
                          style={
                            styles.pinBadge
                          }
                        >
                          <Text
                            style={
                              styles.pinBadgeText
                            }
                          >
                            {index +
                              1}
                          </Text>
                        </View>

                        <Text
                          style={
                            styles.pinResultValue
                          }
                          selectable
                        >
                          {pin}
                        </Text>
                      </View>
                    )
                  )}

                </View>
              ) : (

                <View
                  style={
                    styles.infoCard
                  }
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={21}
                    color={
                      BRAND_COLOR
                    }
                  />

                  <Text
                    style={
                      styles.infoText
                    }
                  >
                    The purchase was successful, but the provider did not return the PIN in this response. The transaction reference has been recorded.
                  </Text>
                </View>
              )}


              {purchaseResult
                ?.providerReference ? (
                <View
                  style={
                    styles.referenceCard
                  }
                >
                  <Text
                    style={
                      styles.referenceLabel
                    }
                  >
                    Provider Reference
                  </Text>

                  <Text
                    style={
                      styles.referenceValue
                    }
                    selectable
                  >
                    {
                      purchaseResult.providerReference
                    }
                  </Text>
                </View>
              ) : null}


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

                <Ionicons
                  name="checkmark-circle-outline"
                  size={19}
                  color="#FFFFFF"
                />
              </Pressable>

            </View>
          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {displayedError ? (
            <View
              style={
                styles.errorCard
              }
            >
              <Ionicons
                name="alert-circle-outline"
                size={21}
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
      minHeight: 78,
      paddingHorizontal: 18,
      paddingTop: 13,
      paddingBottom: 11,
      backgroundColor:
        "#FFFFFF",
      borderBottomWidth: 1,
      borderBottomColor:
        "#E2E8F0",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    headerLeft: {
      flex: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    backButton: {
      width: 40,
      height: 40,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 4,
    },

    closeButton: {
      width: 40,
      height: 40,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    headerTitle: {
      fontSize: 19,
      fontWeight: "900",
      color: "#0F172A",
    },

    headerSubtitle: {
      marginTop: 2,
      fontSize: 11,
      color: "#64748B",
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
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom: 15,
    },

    introIcon: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    introText: {
      flex: 1,
    },

    introTitle: {
      fontSize: 16,
      fontWeight: "900",
      color: "#0F172A",
    },

    introSubtitle: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      color: "#64748B",
    },

    serviceCard: {
      minHeight: 76,
      paddingHorizontal: 14,
      paddingVertical: 12,
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
      marginBottom: 10,
    },

    serviceIcon: {
      width: 45,
      height: 45,
      borderRadius: 14,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 12,
    },

    serviceInfo: {
      flex: 1,
    },

    serviceName: {
      fontSize: 14,
      fontWeight: "800",
      color: "#0F172A",
    },

    servicePrice: {
      marginTop: 5,
      fontSize: 12,
      fontWeight: "700",
      color: BRAND_COLOR,
    },

    reviewCard: {
      padding: 17,
      borderRadius: 18,
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
    },

    reviewIcon: {
      width: 49,
      height: 49,
      borderRadius: 15,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 11,
    },

    reviewHeaderText: {
      flex: 1,
    },

    reviewTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: "#0F172A",
    },

    reviewSubtitle: {
      marginTop: 3,
      fontSize: 11,
      color: "#64748B",
    },

    quantityRow: {
      marginTop: 23,
      paddingVertical: 14,
      borderTopWidth: 1,
      borderTopColor:
        "#F1F5F9",
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    quantityLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: "#475569",
    },

    quantityControl: {
      flexDirection:
        "row",
      alignItems:
        "center",
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      overflow: "hidden",
    },

    quantityButton: {
      width: 41,
      height: 40,
      alignItems:
        "center",
      justifyContent:
        "center",
      backgroundColor:
        "#F8FAFC",
    },

    quantityValue: {
      minWidth: 43,
      textAlign:
        "center",
      fontSize: 14,
      fontWeight: "900",
      color: "#0F172A",
    },

    divider: {
      height: 1,
      backgroundColor:
        "#F1F5F9",
    },

    detailRow: {
      paddingVertical: 13,
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      gap: 12,
    },

    detailLabel: {
      fontSize: 12,
      color: "#64748B",
    },

    detailValue: {
      flex: 1,
      textAlign: "right",
      fontSize: 12,
      fontWeight: "800",
      color: "#0F172A",
    },

    amountRow: {
      paddingTop: 15,
      marginTop: 4,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
    },

    amountLabel: {
      fontSize: 13,
      fontWeight: "800",
      color: "#334155",
    },

    amountValue: {
      fontSize: 20,
      fontWeight: "900",
      color: BRAND_COLOR,
    },

    infoCard: {
      marginTop: 14,
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

    infoText: {
      flex: 1,
      marginLeft: 9,
      fontSize: 12,
      lineHeight: 18,
      color: "#334155",
    },

    primaryButton: {
      minHeight: 53,
      marginTop: 16,
      borderRadius: 15,
      backgroundColor:
        BRAND_COLOR,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
    },

    disabledButton: {
      opacity: 0.55,
    },

    primaryButtonText: {
      fontSize: 14,
      fontWeight: "900",
      color: "#FFFFFF",
    },

    pinCard: {
      padding: 20,
      borderRadius: 19,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      alignItems:
        "center",
    },

    pinIcon: {
      width: 59,
      height: 59,
      borderRadius: 19,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    pinTitle: {
      marginTop: 15,
      fontSize: 19,
      fontWeight: "900",
      color: "#0F172A",
      textAlign:
        "center",
    },

    pinSubtitle: {
      marginTop: 7,
      maxWidth: 310,
      fontSize: 12,
      lineHeight: 19,
      color: "#64748B",
      textAlign:
        "center",
    },

    pinInputWrapper: {
      width: "100%",
      maxWidth: 250,
      marginTop: 20,
      position: "relative",
    },

    pinInput: {
      height: 57,
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#CBD5E1",
      backgroundColor:
        "#F8FAFC",
      fontSize: 26,
      fontWeight: "900",
      color: "#0F172A",
      paddingHorizontal: 58,
      letterSpacing: 11,
    },

    eyeButton: {
      position: "absolute",
      right: 13,
      top: 17,
    },

    pinDots: {
      marginTop: 15,
      flexDirection:
        "row",
      gap: 9,
    },

    pinDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor:
        "#CBD5E1",
    },

    pinDotActive: {
      backgroundColor:
        BRAND_COLOR,
    },

    reviewMini: {
      marginTop: 14,
      padding: 16,
      borderRadius: 16,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    reviewMiniLabel: {
      marginTop: 5,
      fontSize: 11,
      color: "#64748B",
    },

    reviewMiniValue: {
      marginTop: 2,
      fontSize: 13,
      fontWeight: "800",
      color: "#0F172A",
    },

    reviewMiniAmount: {
      marginTop: 3,
      fontSize: 18,
      fontWeight: "900",
      color: BRAND_COLOR,
    },

    successCard: {
      padding: 22,
      borderRadius: 20,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      alignItems:
        "center",
    },

    successIcon: {
      width: 69,
      height: 69,
      borderRadius: 35,
      backgroundColor:
        "#16A34A",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    successTitle: {
      marginTop: 15,
      fontSize: 20,
      fontWeight: "900",
      color: "#0F172A",
    },

    successSubtitle: {
      marginTop: 6,
      fontSize: 12,
      lineHeight: 19,
      color: "#64748B",
      textAlign:
        "center",
    },

    successAmount: {
      width: "100%",
      marginTop: 18,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor:
        "#F1F5F9",
      alignItems:
        "center",
    },

    successAmountLabel: {
      fontSize: 11,
      color: "#64748B",
    },

    successAmountValue: {
      marginTop: 4,
      fontSize: 23,
      fontWeight: "900",
      color: BRAND_COLOR,
    },

    pinResultCard: {
      marginTop: 14,
      padding: 16,
      borderRadius: 17,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    pinResultTitle: {
      fontSize: 15,
      fontWeight: "900",
      color: "#0F172A",
      marginBottom: 10,
    },

    pinResultRow: {
      minHeight: 51,
      paddingHorizontal: 11,
      marginBottom: 8,
      borderRadius: 13,
      backgroundColor:
        "#F8FAFC",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      flexDirection:
        "row",
      alignItems:
        "center",
    },

    pinBadge: {
      width: 30,
      height: 30,
      borderRadius: 10,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 10,
    },

    pinBadgeText: {
      fontSize: 12,
      fontWeight: "900",
      color: BRAND_COLOR,
    },

    pinResultValue: {
      flex: 1,
      fontSize: 14,
      fontWeight: "900",
      color: "#0F172A",
      letterSpacing: 1,
    },

    referenceCard: {
      marginTop: 12,
      padding: 14,
      borderRadius: 15,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    referenceLabel: {
      fontSize: 11,
      color: "#64748B",
    },

    referenceValue: {
      marginTop: 5,
      fontSize: 12,
      fontWeight: "800",
      color: "#0F172A",
    },

    loadingCard: {
      minHeight: 250,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    loadingText: {
      marginTop: 11,
      fontSize: 13,
      color: "#64748B",
    },

    emptyCard: {
      minHeight: 250,
      padding: 25,
      borderRadius: 18,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    emptyTitle: {
      marginTop: 11,
      fontSize: 16,
      fontWeight: "900",
      color: "#334155",
      textAlign:
        "center",
    },

    emptyText: {
      marginTop: 6,
      maxWidth: 290,
      fontSize: 12,
      lineHeight: 18,
      color: "#64748B",
      textAlign:
        "center",
    },

    errorCard: {
      marginTop: 14,
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
  });