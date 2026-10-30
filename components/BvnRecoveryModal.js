
// src/components/BvnRecoveryModal.js

import React, {
    useCallback,
    useEffect,
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
    getBvnPhoneRecoveryService,
    recoverBvnByPhone,
} from "../api/bvnApi";


const BRAND_COLOR =
  "#2a5fd3";


/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

function formatMoney(
  amount
) {
  const numeric =
    Number(amount);

  if (
    !Number.isFinite(
      numeric
    )
  ) {
    return "Unavailable";
  }

  return `₦${numeric.toLocaleString()}`;
}


function getResultData(
  result
) {
  return (
    result?.data ??
    result ??
    {}
  );
}


function getRecoveredBvn(
  result
) {
  const data =
    getResultData(
      result
    );

  return (
    data?.bvn ??
    data?.recoveredBvn ??
    data?.recovered_bvn ??
    data?.result?.bvn ??
    data?.result?.recoveredBvn ??
    null
  );
}


function getDetails(
  result
) {
  const data =
    getResultData(
      result
    );

  return (
    data?.details ??
    data?.result?.details ??
    {}
  );
}


function getDisplayName(
  details
) {
  const firstName =
    details?.firstName ||
    details?.firstname ||
    "";

  const middleName =
    details?.middleName ||
    details?.middlename ||
    "";

  const lastName =
    details?.lastName ||
    details?.surname ||
    details?.lastname ||
    "";

  return [
    firstName,
    middleName,
    lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}


/**
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function BvnRecoveryModal({
  visible,
  onClose,
  onSuccess,
}) {
  const [
    phoneNumber,
    setPhoneNumber,
  ] = useState("");

  const [
    transactionPin,
    setTransactionPin,
  ] = useState("");

  const [
    ownershipConfirmed,
    setOwnershipConfirmed,
  ] = useState(false);

  const [
    price,
    setPrice,
  ] = useState(null);

  const [
    loadingPrice,
    setLoadingPrice,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    step,
    setStep,
  ] = useState("form");

  const [
    result,
    setResult,
  ] = useState(null);

  const [
    localError,
    setLocalError,
  ] = useState("");


  /**
   * =======================================================
   * RESET
   * =======================================================
   */

  const resetModal =
    useCallback(() => {
      setPhoneNumber("");
      setTransactionPin("");
      setOwnershipConfirmed(
        false
      );
      setPrice(null);
      setLoadingPrice(false);
      setLoading(false);
      setStep("form");
      setResult(null);
      setLocalError("");
    }, []);


  /**
   * =======================================================
   * LOAD CUSTOMER PRICE
   * =======================================================
   */

  const loadPrice =
    useCallback(async () => {
      setLoadingPrice(
        true
      );

      setLocalError("");

      try {
        const service =
          await getBvnPhoneRecoveryService();

        const serviceData =
          service?.data ??
          service ??
          {};

        const configuredPrice =
          Number(
            serviceData?.price
          );

        if (
          !Number.isFinite(
            configuredPrice
          ) ||
          configuredPrice <= 0
        ) {
          setPrice(null);

          setLocalError(
            "BVN recovery price is not configured."
          );

          return;
        }

        setPrice(
          configuredPrice
        );

      } catch (error) {
        console.error(
          "BVN recovery price error:",
          error
        );

        setPrice(null);

        setLocalError(
          error?.response?.data
            ?.message ||
            error?.message ||
            "Unable to load BVN recovery price."
        );

      } finally {
        setLoadingPrice(
          false
        );
      }
    }, []);


  /**
   * =======================================================
   * OPEN
   * =======================================================
   */

  useEffect(() => {
    if (!visible) {
      return;
    }

    loadPrice();
  }, [
    visible,
    loadPrice,
  ]);


  /**
   * =======================================================
   * CLOSE
   * =======================================================
   */

  const handleClose =
    useCallback(() => {
      if (
        loading
      ) {
        return;
      }

      resetModal();

      onClose?.();
    }, [
      loading,
      resetModal,
      onClose,
    ]);


  /**
   * =======================================================
   * PHONE VALIDATION
   * =======================================================
   */

  const cleanPhone =
    phoneNumber
      .replace(/\D/g, "")
      .slice(0, 11);

  const validPhone =
    /^0\d{10}$/.test(
      cleanPhone
    );


  /**
   * =======================================================
   * SUBMIT
   * =======================================================
   */

  const handleRecover =
    async () => {
      setLocalError("");

      if (
        !validPhone
      ) {
        Alert.alert(
          "Invalid Phone Number",
          "Please enter a valid 11-digit Nigerian phone number."
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
        !ownershipConfirmed
      ) {
        Alert.alert(
          "Confirmation Required",
          "Please confirm that you are authorized to recover this BVN."
        );

        return;
      }

      if (
        !Number.isFinite(
          price
        ) ||
        price <= 0
      ) {
        Alert.alert(
          "Price Unavailable",
          "The eVault BVN recovery price is not configured."
        );

        return;
      }

      setLoading(
        true
      );

      setStep(
        "processing"
      );

      try {
        const response =
          await recoverBvnByPhone({
            phone:
              cleanPhone,

            phoneNumber:
              cleanPhone,

            transactionPin,

            ownershipConfirmed:
              true,
          });

        const data =
          getResultData(
            response
          );

        setResult(
          data
        );

        setStep(
          "success"
        );

        onSuccess?.(
          data
        );

      } catch (error) {
        console.error(
          "BVN recovery error:",
          error
        );

        const message =
          error?.response
            ?.data?.message ||
          error?.message ||
          "Unable to recover BVN.";

        setLocalError(
          message
        );

        setStep(
          "failed"
        );

      } finally {
        setLoading(
          false
        );
      }
    };


  /**
   * =======================================================
   * RESULT
   * =======================================================
   */

  const recoveredBvn =
    getRecoveredBvn(
      result
    );

  const details =
    getDetails(
      result
    );

  const displayName =
    getDisplayName(
      details
    );


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
        <Pressable
          style={
            StyleSheet.absoluteFillObject
          }
          onPress={
            loading
              ? undefined
              : handleClose
          }
        />

        <View
          style={
            styles.modal
          }
        >
          <View
            style={
              styles.header
            }
          >
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
                Recover BVN
              </Text>

              <Text
                style={
                  styles.subtitle
                }
              >
                Recover your BVN using the phone number linked to it.
              </Text>
            </View>

            <Pressable
              onPress={
                handleClose
              }
              disabled={
                loading
              }
              style={
                styles.closeButton
              }
            >
              <Text
                style={
                  styles.closeText
                }
              >
                ×
              </Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={
              styles.content
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={
              false
            }
          >
            {step ===
              "form" && (
              <>
                <View
                  style={
                    styles.infoCard
                  }
                >
                  <Text
                    style={
                      styles.infoTitle
                    }
                  >
                    BVN Phone Recovery
                  </Text>

                  <Text
                    style={
                      styles.infoText
                    }
                  >
                    Enter the phone number associated with your BVN. eVault will search the configured BVN recovery service.
                  </Text>

                  {loadingPrice ? (
                    <View
                      style={
                        styles.priceLoading
                      }
                    >
                      <ActivityIndicator
                        size="small"
                        color={
                          BRAND_COLOR
                        }
                      />

                      <Text
                        style={
                          styles.priceLoadingText
                        }
                      >
                        Loading price...
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={
                        styles.priceText
                      }
                    >
                      eVault price:{" "}
                      {price
                        ? formatMoney(
                            price
                          )
                        : "Unavailable"}
                    </Text>
                  )}
                </View>

                <Text
                  style={
                    styles.label
                  }
                >
                  Phone Number
                </Text>

                <TextInput
                  value={
                    phoneNumber
                  }
                  onChangeText={(
                    value
                  ) =>
                    setPhoneNumber(
                      value
                        .replace(
                          /\D/g,
                          ""
                        )
                        .slice(
                          0,
                          11
                        )
                    )
                  }
                  keyboardType="phone-pad"
                  maxLength={
                    11
                  }
                  placeholder="08012345678"
                  placeholderTextColor="#94A3B8"
                  style={
                    styles.input
                  }
                />

                <Text
                  style={
                    styles.counter
                  }
                >
                  {cleanPhone.length}/11
                </Text>

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
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={
                    4
                  }
                  placeholder="4-digit transaction PIN"
                  placeholderTextColor="#94A3B8"
                  style={
                    styles.input
                  }
                />

                <Pressable
                  onPress={() =>
                    setOwnershipConfirmed(
                      value =>
                        !value
                    )
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
                    I confirm that I am authorized to recover this BVN using this phone number.
                  </Text>
                </Pressable>

                {localError ? (
                  <View
                    style={
                      styles.errorBox
                    }
                  >
                    <Text
                      style={
                        styles.errorText
                      }
                    >
                      {localError}
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={
                    handleRecover
                  }
                  disabled={
                    loading ||
                    loadingPrice ||
                    !price
                  }
                  style={[
                    styles.primaryButton,
                    (loading ||
                      loadingPrice ||
                      !price) &&
                      styles.disabledButton,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator
                      color="#ffffff"
                    />
                  ) : (
                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Recover BVN
                      {price
                        ? ` — ${formatMoney(
                            price
                          )}`
                        : ""}
                    </Text>
                  )}
                </Pressable>
              </>
            )}

            {step ===
              "processing" && (
              <View
                style={
                  styles.centerState
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
                    styles.stateTitle
                  }
                >
                  Recovering BVN
                </Text>

                <Text
                  style={
                    styles.stateText
                  }
                >
                  We are searching for the BVN associated with your phone number.
                </Text>
              </View>
            )}

            {step ===
              "success" && (
              <View
                style={
                  styles.centerState
                }
              >
                <View
                  style={
                    styles.successCircle
                  }
                >
                  <Text
                    style={
                      styles.successIcon
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
                  BVN Recovery Successful
                </Text>

                {recoveredBvn ? (
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
                      BVN
                    </Text>

                    <Text
                      style={
                        styles.resultValue
                      }
                    >
                      {recoveredBvn}
                    </Text>

                    {displayName ? (
                      <>
                        <Text
                          style={
                            styles.resultLabel
                          }
                        >
                          Name
                        </Text>

                        <Text
                          style={
                            styles.resultValueSmall
                          }
                        >
                          {displayName}
                        </Text>
                      </>
                    ) : null}

                    {details?.phoneNumber ? (
                      <>
                        <Text
                          style={
                            styles.resultLabel
                          }
                        >
                          Phone
                        </Text>

                        <Text
                          style={
                            styles.resultValueSmall
                          }
                        >
                          {details.phoneNumber}
                        </Text>
                      </>
                    ) : null}

                    {details?.gender ? (
                      <>
                        <Text
                          style={
                            styles.resultLabel
                          }
                        >
                          Gender
                        </Text>

                        <Text
                          style={
                            styles.resultValueSmall
                          }
                        >
                          {details.gender}
                        </Text>
                      </>
                    ) : null}

                    {details?.birthday ? (
                      <>
                        <Text
                          style={
                            styles.resultLabel
                          }
                        >
                          Date of Birth
                        </Text>

                        <Text
                          style={
                            styles.resultValueSmall
                          }
                        >
                          {details.birthday}
                        </Text>
                      </>
                    ) : null}
                  </View>
                ) : (
                  <View
                    style={
                      styles.noBvnBox
                    }
                  >
                    <Text
                      style={
                        styles.noBvnText
                      }
                    >
                      The phone search completed successfully, but the provider did not return an unmasked BVN number.
                    </Text>
                  </View>
                )}

                <Text
                  style={
                    styles.stateText
                  }
                >
                  Your BVN recovery transaction has been completed.
                </Text>

                <Pressable
                  onPress={
                    handleClose
                  }
                  style={
                    styles.secondaryButton
                  }
                >
                  <Text
                    style={
                      styles.secondaryButtonText
                    }
                  >
                    Done
                  </Text>
                </Pressable>
              </View>
            )}

            {step ===
              "failed" && (
              <View
                style={
                  styles.centerState
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
                  BVN Recovery Failed
                </Text>

                <Text
                  style={
                    styles.stateText
                  }
                >
                  {localError ||
                    "The BVN could not be recovered using this phone number."}
                </Text>

                <Pressable
                  onPress={
                    resetModal
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
                    styles.secondaryButton
                  }
                >
                  <Text
                    style={
                      styles.secondaryButtonText
                    }
                  >
                    Close
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
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
    overlay: {
      flex: 1,
      backgroundColor:
        "rgba(0,0,0,0.55)",
      justifyContent:
        "flex-end",
    },

    modal: {
      maxHeight:
        "94%",
      backgroundColor:
        "#ffffff",
      borderTopLeftRadius:
        28,
      borderTopRightRadius:
        28,
      overflow:
        "hidden",
    },

    header: {
      paddingHorizontal:
        20,
      paddingTop:
        20,
      paddingBottom:
        14,
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "flex-start",
    },

    headerText: {
      flex: 1,
      paddingRight:
        12,
    },

    title: {
      fontSize:
        22,
      fontWeight:
        "800",
      color:
        "#0F172A",
    },

    subtitle: {
      marginTop:
        5,
      fontSize:
        13,
      color:
        "#64748B",
      lineHeight:
        19,
    },

    closeButton: {
      width:
        38,
      height:
        38,
      borderRadius:
        19,
      backgroundColor:
        "#F1F5F9",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    closeText: {
      fontSize:
        28,
      lineHeight:
        30,
      color:
        "#475569",
    },

    content: {
      padding:
        20,
      paddingBottom:
        40,
    },

    infoCard: {
      backgroundColor:
        "#EFF6FF",
      borderRadius:
        16,
      padding:
        16,
      marginBottom:
        18,
      borderWidth:
        1,
      borderColor:
        "#BFDBFE",
    },

    infoTitle: {
      fontSize:
        17,
      fontWeight:
        "800",
      color:
        "#1D4ED8",
    },

    infoText: {
      marginTop:
        7,
      color:
        "#475569",
      fontSize:
        13,
      lineHeight:
        19,
    },

    priceText: {
      marginTop:
        12,
      fontWeight:
        "800",
      fontSize:
        15,
      color:
        "#0F172A",
    },

    priceLoading: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginTop:
        12,
    },

    priceLoadingText: {
      marginLeft:
        8,
      fontSize:
        13,
      color:
        "#64748B",
    },

    label: {
      fontSize:
        14,
      fontWeight:
        "700",
      color:
        "#0F172A",
      marginBottom:
        8,
      marginTop:
        10,
    },

    input: {
      height:
        52,
      borderWidth:
        1,
      borderColor:
        "#CBD5E1",
      borderRadius:
        12,
      paddingHorizontal:
        15,
      fontSize:
        16,
      color:
        "#0F172A",
      backgroundColor:
        "#F8FAFC",
    },

    counter: {
      textAlign:
        "right",
      marginTop:
        5,
      fontSize:
        11,
      color:
        "#64748B",
    },

    checkboxRow: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      marginTop:
        14,
      marginBottom:
        12,
    },

    checkbox: {
      width:
        22,
      height:
        22,
      borderRadius:
        6,
      borderWidth:
        1.5,
      borderColor:
        "#94A3B8",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight:
        10,
    },

    checkboxSelected: {
      backgroundColor:
        BRAND_COLOR,
      borderColor:
        BRAND_COLOR,
    },

    checkmark: {
      color:
        "#ffffff",
      fontSize:
        14,
      fontWeight:
        "800",
    },

    checkboxText: {
      flex: 1,
      fontSize:
        12,
      lineHeight:
        18,
      color:
        "#475569",
    },

    primaryButton: {
      minHeight:
        52,
      borderRadius:
        13,
      backgroundColor:
        BRAND_COLOR,
      justifyContent:
        "center",
      alignItems:
        "center",
      paddingHorizontal:
        18,
      marginTop:
        15,
    },

    disabledButton: {
      opacity:
        0.5,
    },

    primaryButtonText: {
      color:
        "#ffffff",
      fontSize:
        15,
      fontWeight:
        "800",
    },

    secondaryButton: {
      minHeight:
        50,
      borderRadius:
        13,
      borderWidth:
        1,
      borderColor:
        "#BFDBFE",
      justifyContent:
        "center",
      alignItems:
        "center",
      paddingHorizontal:
        18,
      marginTop:
        12,
      backgroundColor:
        "#EFF6FF",
      width:
        "100%",
    },

    secondaryButtonText: {
      color:
        "#1D4ED8",
      fontSize:
        14,
      fontWeight:
        "700",
    },

    errorBox: {
      backgroundColor:
        "#FEF2F2",
      borderRadius:
        10,
      padding:
        12,
      marginTop:
        12,
    },

    errorText: {
      color:
        "#B91C1C",
      fontSize:
        13,
      lineHeight:
        18,
    },

    centerState: {
      alignItems:
        "center",
      paddingVertical:
        45,
    },

    stateTitle: {
      fontSize:
        21,
      fontWeight:
        "800",
      color:
        "#0F172A",
      textAlign:
        "center",
      marginTop:
        20,
    },

    stateText: {
      fontSize:
        14,
      color:
        "#64748B",
      textAlign:
        "center",
      lineHeight:
        21,
      marginTop:
        10,
    },

    successCircle: {
      width:
        76,
      height:
        76,
      borderRadius:
        38,
      backgroundColor:
        BRAND_COLOR,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    successIcon: {
      color:
        "#ffffff",
      fontSize:
        40,
      fontWeight:
        "800",
    },

    failedCircle: {
      width:
        76,
      height:
        76,
      borderRadius:
        38,
      backgroundColor:
        "#DBEAFE",
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    failedIcon: {
      color:
        "#1D4ED8",
      fontSize:
        40,
      fontWeight:
        "800",
    },

    resultCard: {
      width:
        "100%",
      marginTop:
        20,
      padding:
        16,
      borderRadius:
        16,
      backgroundColor:
        "#F8FAFC",
      borderWidth:
        1,
      borderColor:
        "#E2E8F0",
    },

    resultLabel: {
      marginTop:
        8,
      fontSize:
        12,
      fontWeight:
        "700",
      color:
        "#64748B",
    },

    resultValue: {
      marginTop:
        4,
      fontSize:
        22,
      fontWeight:
        "800",
      color:
        "#0F172A",
    },

    resultValueSmall: {
      marginTop:
        4,
      fontSize:
        15,
      fontWeight:
        "700",
      color:
        "#0F172A",
    },

    noBvnBox: {
      width:
        "100%",
      marginTop:
        20,
      padding:
        14,
      borderRadius:
        12,
      backgroundColor:
        "#FFF7ED",
      borderWidth:
        1,
      borderColor:
        "#FED7AA",
    },

    noBvnText: {
      fontSize:
        13,
      lineHeight:
        19,
      color:
        "#9A3412",
      textAlign:
        "center",
    },
  });
