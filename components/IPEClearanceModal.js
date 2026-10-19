// src/components/IPEClearanceModal.js

import React, {
    useCallback,
    useEffect,
    useState
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

import useIpe from "../hooks/useIpe";


const EVAULT_IPE_PRICE =
  550;


/**
 * =========================================================
 * STATUS HELPERS
 * =========================================================
 */
function getStatus(
  response
) {
  return String(
    response?.status ||
    response?.data?.status ||
    ""
  ).toUpperCase();
}


/**
 * =========================================================
 * MAIN COMPONENT
 * =========================================================
 */
export default function IPEClearanceModal({
  visible,
  onClose,
  onSuccess,
}) {

  const {
    service,

    request,

    loading,

    serviceLoading,

    error,

    loadService,

    submitIpe,

    checkStatus,

    reset,
  } = useIpe();


  /**
   * =======================================================
   * FORM
   * =======================================================
   */

  const [
    trackingId,
    setTrackingId,
  ] = useState("");

  const [
    oldTrackingId,
    setOldTrackingId,
  ] = useState("");

  const [
    nin,
    setNin,
  ] = useState("");

  const [
    fullName,
    setFullName,
  ] = useState("");

  const [
    phoneNumber,
    setPhoneNumber,
  ] = useState("");

  const [
    note,
    setNote,
  ] = useState("");

  const [
    transactionPin,
    setTransactionPin,
  ] = useState("");

  const [
    ownershipConfirmed,
    setOwnershipConfirmed,
  ] = useState(false);


  /**
   * =======================================================
   * UI STATE
   * =======================================================
   */

  const [
    step,
    setStep,
  ] = useState("form");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    checkingStatus,
    setCheckingStatus,
  ] = useState(false);


  /**
   * =======================================================
   * PRICE
   * =======================================================
   */

  const price =
    Number(
      service?.amount ||
      EVAULT_IPE_PRICE
    );


  const formattedPrice =
    price.toLocaleString(
      "en-NG"
    );


  /**
   * =======================================================
   * LOAD SERVICE
   * =======================================================
   */

  useEffect(
    () => {

      if (!visible) {
        return;
      }

      loadService?.()
        .catch(() => {});

    },
    [
      visible,
      loadService,
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

        setTrackingId("");

        setOldTrackingId("");

        setNin("");

        setFullName("");

        setPhoneNumber("");

        setNote("");

        setTransactionPin("");

        setOwnershipConfirmed(
          false
        );

        setStep(
          "form"
        );

        setErrorMessage("");

        setCheckingStatus(
          false
        );

        reset?.();

      },
      [
        reset,
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

        if (loading) {
          return;
        }

        resetModal();

        onClose?.();

      },
      [
        loading,
        resetModal,
        onClose,
      ]
    );


  /**
   * =======================================================
   * SUBMIT
   * =======================================================
   */

  const handleSubmit =
    async () => {

      const cleanTracking =
        trackingId
          .trim()
          .replace(
            /\s+/g,
            ""
          );


      const cleanOldTracking =
        oldTrackingId
          .trim()
          .replace(
            /\s+/g,
            ""
          );


      const cleanNin =
        nin
          .replace(
            /\D/g,
            ""
          );


      /**
       * Tracking ID.
       */
      if (!cleanTracking) {

        Alert.alert(
          "Tracking ID Required",
          "Please enter the Tracking ID printed on your NIMC enrolment slip."
        );

        return;
      }


      /**
       * NIN if supplied.
       */
      if (
        cleanNin &&
        cleanNin.length !== 11
      ) {

        Alert.alert(
          "Invalid NIN",
          "If you provide a NIN, it must contain exactly 11 digits."
        );

        return;
      }


      /**
       * PIN.
       */
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


      /**
       * Ownership.
       */
      if (
        !ownershipConfirmed
      ) {

        Alert.alert(
          "Confirmation Required",
          "Please confirm that this Tracking ID belongs to you."
        );

        return;
      }


      setErrorMessage("");

      setStep(
        "processing"
      );


      try {

        const result =
          await submitIpe({
            trackingId:
              cleanTracking,

            oldTrackingId:
              cleanOldTracking ||
              null,

            nin:
              cleanNin ||
              null,

            fullName:
              fullName.trim() ||
              null,

            phoneNumber:
              phoneNumber.trim() ||
              null,

            note:
              note.trim() ||
              null,

            transactionPin,

            ownershipConfirmed:
              true,
          });


        const status =
          getStatus(
            result
          );


        if (
          status ===
          "SUCCESS"
        ) {

          setStep(
            "success"
          );

          onSuccess?.(
            result
          );

          return;
        }


        if (
          status ===
          "FAILED"
        ) {

          setErrorMessage(
            result?.error_message ||
            result?.message ||
            "IPE Clearance failed."
          );

          setStep(
            "failed"
          );

          return;
        }


        /**
         * IPE is asynchronous.
         */
        setStep(
          "processing"
        );

      } catch (err) {

        console.log(
          "IPE Clearance error:",
          err
        );

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to submit IPE Clearance.";

        setErrorMessage(
          message
        );

        setStep(
          "failed"
        );
      }
    };


  /**
   * =======================================================
   * CHECK STATUS
   * =======================================================
   */

  const handleCheckStatus =
    useCallback(
      async () => {

        if (
          !request?.id
        ) {

          Alert.alert(
            "Request Not Found",
            "We could not find your IPE Clearance request."
          );

          return;
        }


        if (
          checkingStatus
        ) {
          return;
        }


        try {

          setCheckingStatus(
            true
          );


          const result =
            await checkStatus(
              request.id
            );


          const status =
            getStatus(
              result
            );


          if (
            status ===
            "SUCCESS"
          ) {

            setStep(
              "success"
            );

            onSuccess?.(
              result
            );

            return;
          }


          if (
            status ===
            "FAILED"
          ) {

            setErrorMessage(
              result?.error_message ||
              result?.message ||
              "IPE Clearance failed."
            );

            setStep(
              "failed"
            );

            return;
          }


          Alert.alert(
            "Still Processing",
            "Your IPE Clearance is still being processed. Please check again later."
          );

        } catch (err) {

          Alert.alert(
            "Status Check Failed",
            err?.message ||
            "Unable to check the IPE status."
          );

        } finally {

          setCheckingStatus(
            false
          );
        }

      },
      [
        request,
        checkingStatus,
        checkStatus,
        onSuccess,
      ]
    );


  /**
   * =======================================================
   * DOCUMENT URL
   * =======================================================
   */

  const documentUrl =
    request?.document_url ||
    request?.result?.download ||
    request?.result?.document_url ||
    null;


  /**
   * =======================================================
   * RENDER
   * =======================================================
 */

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={
        handleClose
      }
    >

      <View
        style={
          styles.overlay
        }
      >

        <KeyboardAvoidingView
          behavior={
            Platform.OS ===
            "ios"
              ? "padding"
              : undefined
          }
          style={
            styles.keyboard
          }
        >

          <View
            style={
              styles.modal
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
                  styles.headerIcon
                }
              >

                <Ionicons
                  name="shield-checkmark-outline"
                  size={25}
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
                  IPE Clearance
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  Clear your NIMC enrolment error
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

                <Ionicons
                  name="close"
                  size={24}
                  color="#64748B"
                />

              </Pressable>

            </View>


            {/* =================================================
                FORM
            ================================================= */}

            {step === "form" && (

              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={
                  styles.content
                }
              >

                {/* INFO */}

                <View
                  style={
                    styles.infoBox
                  }
                >

                  <Ionicons
                    name="information-circle-outline"
                    size={22}
                    color="#2563EB"
                  />

                  <Text
                    style={
                      styles.infoText
                    }
                  >
                    IPE Clearance helps resolve an
                    Ineligible Person Error on a NIMC
                    enrolment and can provide a new
                    Tracking ID and NIN.
                  </Text>

                </View>


                {/* TRACKING ID */}

                <Text
                  style={
                    styles.label
                  }
                >
                  Tracking ID *
                </Text>

                <TextInput
                  value={
                    trackingId
                  }
                  onChangeText={
                    setTrackingId
                  }
                  placeholder="Enter your Tracking ID"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                  style={
                    styles.input
                  }
                />


                {/* OLD TRACKING ID */}

                <Text
                  style={
                    styles.label
                  }
                >
                  Old Tracking ID
                  <Text
                    style={
                      styles.optional
                    }
                  >
                    {" "}
                    (Optional)
                  </Text>
                </Text>

                <TextInput
                  value={
                    oldTrackingId
                  }
                  onChangeText={
                    setOldTrackingId
                  }
                  placeholder="Enter previous Tracking ID"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                  style={
                    styles.input
                  }
                />


                {/* NIN */}

                <Text
                  style={
                    styles.label
                  }
                >
                  NIN
                  <Text
                    style={
                      styles.optional
                    }
                  >
                    {" "}
                    (Optional)
                  </Text>
                </Text>

                <TextInput
                  value={
                    nin
                  }
                  onChangeText={
                    text =>
                      setNin(
                        text.replace(
                          /\D/g,
                          ""
                        )
                      )
                  }
                  placeholder="11-digit NIN if already known"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={11}
                  style={
                    styles.input
                  }
                />


                {/* FULL NAME */}

                <Text
                  style={
                    styles.label
                  }
                >
                  Full Name
                  <Text
                    style={
                      styles.optional
                    }
                  >
                    {" "}
                    (Optional)
                  </Text>
                </Text>

                <TextInput
                  value={
                    fullName
                  }
                  onChangeText={
                    setFullName
                  }
                  placeholder="Name on your enrolment"
                  placeholderTextColor="#94A3B8"
                  style={
                    styles.input
                  }
                />


                {/* PHONE */}

                <Text
                  style={
                    styles.label
                  }
                >
                  Phone Number
                  <Text
                    style={
                      styles.optional
                    }
                  >
                    {" "}
                    (Optional)
                  </Text>
                </Text>

                <TextInput
                  value={
                    phoneNumber
                  }
                  onChangeText={
                    setPhoneNumber
                  }
                  placeholder="08012345678"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  style={
                    styles.input
                  }
                />


                {/* NOTE */}

                <Text
                  style={
                    styles.label
                  }
                >
                  Note
                  <Text
                    style={
                      styles.optional
                    }
                  >
                    {" "}
                    (Optional)
                  </Text>
                </Text>

                <TextInput
                  value={
                    note
                  }
                  onChangeText={
                    setNote
                  }
                  placeholder="Describe the issue if necessary"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.input,
                    styles.textArea,
                  ]}
                />


                {/* PRICE */}

                <View
                  style={
                    styles.priceCard
                  }
                >

                  <View>

                    <Text
                      style={
                        styles.priceLabel
                      }
                    >
                      IPE Clearance
                    </Text>

                    <Text
                      style={
                        styles.priceDescription
                      }
                    >
                      Processing fee
                    </Text>

                  </View>

                  <Text
                    style={
                      styles.price
                    }
                  >
                    ₦{formattedPrice}
                  </Text>

                </View>


                {/* OWNERSHIP */}

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
                        styles.checkboxActive,
                    ]}
                  >

                    {ownershipConfirmed && (

                      <Ionicons
                        name="checkmark"
                        size={17}
                        color="#FFFFFF"
                      />

                    )}

                  </View>

                  <Text
                    style={
                      styles.checkboxText
                    }
                  >
                    I confirm that the Tracking ID
                    belongs to me and I authorize
                    Evault to submit this IPE Clearance
                    request.
                  </Text>

                </Pressable>


                {/* PIN */}

                <Text
                  style={
                    styles.label
                  }
                >
                  Transaction PIN *
                </Text>

                <TextInput
                  value={
                    transactionPin
                  }
                  onChangeText={
                    text =>
                      setTransactionPin(
                        text.replace(
                          /\D/g,
                          ""
                        )
                      )
                  }
                  placeholder="••••"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={4}
                  style={
                    styles.pinInput
                  }
                />


                {/* SECURITY */}

                <View
                  style={
                    styles.securityRow
                  }
                >

                  <Ionicons
                    name="lock-closed-outline"
                    size={17}
                    color="#64748B"
                  />

                  <Text
                    style={
                      styles.securityText
                    }
                  >
                    Your transaction PIN is encrypted
                    and never displayed.
                  </Text>

                </View>


                {/* ERROR */}

                {(error ||
                  errorMessage) && (

                  <View
                    style={
                      styles.errorBox
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
                      {errorMessage ||
                        error}
                    </Text>

                  </View>

                )}


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
                      styles.disabledButton,
                  ]}
                >

                  {loading ? (

                    <ActivityIndicator
                      color="#FFFFFF"
                    />

                  ) : (

                    <>
                      <Text
                        style={
                          styles.primaryButtonText
                        }
                      >
                        Submit IPE Clearance
                      </Text>

                      <Ionicons
                        name="arrow-forward"
                        size={20}
                        color="#FFFFFF"
                      />
                    </>

                  )}

                </Pressable>

              </ScrollView>
            )}


            {/* =================================================
                PROCESSING
            ================================================= */}

            {step ===
              "processing" && (

              <ScrollView
                contentContainerStyle={
                  styles.processingContent
                }
              >

                <View
                  style={
                    styles.processingCircle
                  }
                >

                  <ActivityIndicator
                    size="large"
                    color="#2563EB"
                  />

                </View>

                <Text
                  style={
                    styles.processingTitle
                  }
                >
                  IPE Clearance Submitted
                </Text>

                <Text
                  style={
                    styles.processingText
                  }
                >
                  Your request has been submitted
                  successfully and is being processed.
                </Text>


                <View
                  style={
                    styles.statusCard
                  }
                >

                  <View
                    style={
                      styles.statusRow
                    }
                  >

                    <Text
                      style={
                        styles.statusLabel
                      }
                    >
                      Amount
                    </Text>

                    <Text
                      style={
                        styles.statusValue
                      }
                    >
                      ₦{formattedPrice}
                    </Text>

                  </View>


                  {request?.id && (

                    <View
                      style={
                        styles.statusRow
                      }
                    >

                      <Text
                        style={
                          styles.statusLabel
                        }
                      >
                        Request ID
                      </Text>

                      <Text
                        style={
                          styles.statusValueSmall
                        }
                        numberOfLines={1}
                      >
                        {request.id}
                      </Text>

                    </View>

                  )}

                </View>


                <Text
                  style={
                    styles.processingHint
                  }
                >
                  IPE Clearance is processed
                  asynchronously. You can check the
                  status again later.
                </Text>


                <Pressable
                  onPress={
                    handleCheckStatus
                  }
                  disabled={
                    checkingStatus
                  }
                  style={
                    styles.primaryButton
                  }
                >

                  {checkingStatus ? (

                    <ActivityIndicator
                      color="#FFFFFF"
                    />

                  ) : (

                    <>
                      <Text
                        style={
                          styles.primaryButtonText
                        }
                      >
                        Check Status
                      </Text>

                      <Ionicons
                        name="refresh-outline"
                        size={20}
                        color="#FFFFFF"
                      />
                    </>

                  )}

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

              </ScrollView>

            )}


            {/* =================================================
                SUCCESS
            ================================================= */}

            {step ===
              "success" && (

              <ScrollView
                contentContainerStyle={
                  styles.successContent
                }
              >

                <View
                  style={
                    styles.successCircle
                  }
                >

                  <Ionicons
                    name="checkmark"
                    size={48}
                    color="#FFFFFF"
                  />

                </View>

                <Text
                  style={
                    styles.successTitle
                  }
                >
                  IPE Clearance Complete
                </Text>

                <Text
                  style={
                    styles.successSubtitle
                  }
                >
                  Your IPE Clearance has been completed
                  successfully.
                </Text>


                <View
                  style={
                    styles.resultCard
                  }
                >

                  {request?.result
                    ?.new_tracking_id && (

                    <View
                      style={
                        styles.resultRow
                      }
                    >

                      <Text
                        style={
                          styles.resultLabel
                        }
                      >
                        New Tracking ID
                      </Text>

                      <Text
                        style={
                          styles.resultValue
                        }
                      >
                        {
                          request.result
                            .new_tracking_id
                        }
                      </Text>

                    </View>

                  )}


                  {request?.result
                    ?.nin && (

                    <View
                      style={
                        styles.resultRow
                      }
                    >

                      <Text
                        style={
                          styles.resultLabel
                        }
                      >
                        NIN
                      </Text>

                      <Text
                        style={
                          styles.resultValue
                        }
                      >
                        {
                          request.result.nin
                        }
                      </Text>

                    </View>

                  )}


                  {request?.provider_reference && (

                    <View
                      style={
                        styles.resultRow
                      }
                    >

                      <Text
                        style={
                          styles.resultLabel
                        }
                      >
                        Provider Reference
                      </Text>

                      <Text
                        style={
                          styles.resultValueSmall
                        }
                      >
                        {
                          request.provider_reference
                        }
                      </Text>

                    </View>

                  )}

                </View>


                {documentUrl && (

                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        "Document Ready",
                        "The IPE Clearance document is available through the secure download endpoint."
                      )
                    }
                    style={
                      styles.downloadButton
                    }
                  >

                    <Ionicons
                      name="download-outline"
                      size={21}
                      color="#2563EB"
                    />

                    <Text
                      style={
                        styles.downloadText
                      }
                    >
                      Download Clearance Slip
                    </Text>

                  </Pressable>

                )}


                <Pressable
                  onPress={
                    handleClose
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
                    Done
                  </Text>

                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color="#FFFFFF"
                  />

                </Pressable>

              </ScrollView>

            )}


            {/* =================================================
                FAILED
            ================================================= */}

            {step ===
              "failed" && (

              <ScrollView
                contentContainerStyle={
                  styles.failedContent
                }
              >

                <View
                  style={
                    styles.failedCircle
                  }
                >

                  <Ionicons
                    name="close"
                    size={45}
                    color="#FFFFFF"
                  />

                </View>

                <Text
                  style={
                    styles.failedTitle
                  }
                >
                  IPE Clearance Failed
                </Text>

                <Text
                  style={
                    styles.failedSubtitle
                  }
                >
                  {errorMessage ||
                    "The IPE Clearance request could not be completed."}
                </Text>


                <View
                  style={
                    styles.refundNotice
                  }
                >

                  <Ionicons
                    name="wallet-outline"
                    size={22}
                    color="#2563EB"
                  />

                  <Text
                    style={
                      styles.refundText
                    }
                  >
                    If Evault has already charged your wallet
                    for this request, the failed request is
                    automatically refunded.
                  </Text>

                </View>


                <Pressable
                  onPress={
                    handleClose
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
                    Done
                  </Text>

                </Pressable>

              </ScrollView>

            )}

          </View>

        </KeyboardAvoidingView>

      </View>

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
        "rgba(15, 23, 42, 0.55)",
      justifyContent:
        "flex-end",
    },

    keyboard: {
      width: "100%",
    },

    modal: {
      backgroundColor:
        "#F8FAFC",
      borderTopLeftRadius:
        28,
      borderTopRightRadius:
        28,
      maxHeight:
        "94%",
      minHeight:
        "60%",
      overflow:
        "hidden",
    },

    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      backgroundColor:
        "#FFFFFF",
      paddingHorizontal:
        20,
      paddingVertical:
        17,
      borderBottomWidth:
        1,
      borderBottomColor:
        "#E2E8F0",
    },

    headerIcon: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor:
        "#2563EB",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    headerText: {
      flex: 1,
      marginLeft:
        12,
    },

    title: {
      fontSize: 19,
      fontWeight: "800",
      color:
        "#0F172A",
    },

    subtitle: {
      fontSize: 12,
      color:
        "#64748B",
      marginTop: 3,
    },

    closeButton: {
      padding: 6,
    },

    content: {
      padding: 20,
      paddingBottom: 35,
    },

    infoBox: {
      flexDirection:
        "row",
      padding: 14,
      borderRadius: 15,
      backgroundColor:
        "#EFF6FF",
      marginBottom: 20,
      gap: 10,
    },

    infoText: {
      flex: 1,
      color:
        "#334155",
      fontSize: 13,
      lineHeight: 19,
    },

    label: {
      fontSize: 13,
      fontWeight: "700",
      color:
        "#334155",
      marginBottom: 8,
      marginTop: 7,
    },

    optional: {
      color:
        "#94A3B8",
      fontWeight:
        "500",
    },

    input: {
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#CBD5E1",
      borderRadius: 13,
      paddingHorizontal:
        15,
      paddingVertical:
        13,
      fontSize: 15,
      color:
        "#0F172A",
    },

    textArea: {
      minHeight: 90,
      textAlignVertical:
        "top",
    },

    pinInput: {
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#CBD5E1",
      borderRadius: 13,
      paddingHorizontal:
        15,
      paddingVertical:
        14,
      fontSize: 21,
      letterSpacing: 8,
      color:
        "#0F172A",
      textAlign:
        "center",
    },

    priceCard: {
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 16,
      padding: 17,
      marginTop: 18,
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    priceLabel: {
      fontSize: 15,
      fontWeight: "800",
      color:
        "#0F172A",
    },

    priceDescription: {
      fontSize: 12,
      color:
        "#64748B",
      marginTop: 3,
    },

    price: {
      fontSize: 20,
      fontWeight: "900",
      color:
        "#2563EB",
    },

    checkboxRow: {
      flexDirection:
        "row",
      alignItems:
        "flex-start",
      marginTop: 18,
      gap: 10,
    },

    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 2,
      borderColor:
        "#CBD5E1",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    checkboxActive: {
      backgroundColor:
        "#2563EB",
      borderColor:
        "#2563EB",
    },

    checkboxText: {
      flex: 1,
      fontSize: 12,
      color:
        "#475569",
      lineHeight: 18,
    },

    securityRow: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginTop: 12,
      gap: 8,
    },

    securityText: {
      fontSize: 11,
      color:
        "#64748B",
    },

    errorBox: {
      flexDirection:
        "row",
      backgroundColor:
        "#FEF2F2",
      borderWidth: 1,
      borderColor:
        "#FECACA",
      borderRadius: 13,
      padding: 12,
      marginTop: 16,
      gap: 8,
    },

    errorText: {
      flex: 1,
      color:
        "#B91C1C",
      fontSize: 13,
      lineHeight: 18,
    },

    primaryButton: {
      minHeight: 52,
      borderRadius: 15,
      backgroundColor:
        "#2563EB",
      alignItems:
        "center",
      justifyContent:
        "center",
      flexDirection:
        "row",
      gap: 10,
      marginTop: 20,
    },

    disabledButton: {
      opacity: 0.6,
    },

    primaryButtonText: {
      color:
        "#FFFFFF",
      fontSize: 15,
      fontWeight: "800",
    },

    secondaryButton: {
      minHeight: 50,
      borderRadius: 15,
      backgroundColor:
        "#FFFFFF",
      borderWidth: 1,
      borderColor:
        "#CBD5E1",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 12,
    },

    secondaryButtonText: {
      color:
        "#334155",
      fontSize: 15,
      fontWeight: "700",
    },

    processingContent: {
      padding: 30,
      alignItems:
        "center",
      justifyContent:
        "center",
      flexGrow: 1,
    },

    processingCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    processingTitle: {
      fontSize: 22,
      fontWeight: "900",
      color:
        "#0F172A",
      marginTop: 22,
      textAlign:
        "center",
    },

    processingText: {
      fontSize: 14,
      color:
        "#64748B",
      textAlign:
        "center",
      lineHeight: 21,
      marginTop: 10,
      maxWidth: 330,
    },

    statusCard: {
      width: "100%",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 17,
      padding: 17,
      marginTop: 25,
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    statusRow: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      paddingVertical:
        7,
    },

    statusLabel: {
      color:
        "#64748B",
      fontSize: 13,
    },

    statusValue: {
      color:
        "#0F172A",
      fontWeight: "800",
      fontSize: 14,
    },

    statusValueSmall: {
      color:
        "#0F172A",
      fontWeight: "700",
      fontSize: 11,
      maxWidth: 180,
    },

    processingHint: {
      textAlign:
        "center",
      color:
        "#64748B",
      fontSize: 12,
      lineHeight: 18,
      marginTop: 20,
    },

    successContent: {
      padding: 30,
      alignItems:
        "center",
      flexGrow: 1,
    },

    successCircle: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor:
        "#16A34A",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 15,
    },

    successTitle: {
      fontSize: 23,
      fontWeight: "900",
      color:
        "#0F172A",
      marginTop: 20,
      textAlign:
        "center",
    },

    successSubtitle: {
      fontSize: 14,
      color:
        "#64748B",
      textAlign:
        "center",
      lineHeight: 21,
      marginTop: 8,
    },

    resultCard: {
      width: "100%",
      backgroundColor:
        "#FFFFFF",
      borderRadius: 17,
      padding: 18,
      marginTop: 24,
      borderWidth: 1,
      borderColor:
        "#E2E8F0",
    },

    resultRow: {
      paddingVertical: 9,
      borderBottomWidth: 1,
      borderBottomColor:
        "#F1F5F9",
    },

    resultLabel: {
      color:
        "#64748B",
      fontSize: 12,
      marginBottom: 4,
    },

    resultValue: {
      color:
        "#0F172A",
      fontSize: 15,
      fontWeight: "800",
    },

    resultValueSmall: {
      color:
        "#0F172A",
      fontSize: 11,
      fontWeight: "700",
    },

    downloadButton: {
      width: "100%",
      minHeight: 50,
      borderRadius: 14,
      backgroundColor:
        "#EFF6FF",
      alignItems:
        "center",
      justifyContent:
        "center",
      flexDirection:
        "row",
      gap: 8,
      marginTop: 16,
    },

    downloadText: {
      color:
        "#2563EB",
      fontWeight: "800",
      fontSize: 14,
    },

    failedContent: {
      padding: 30,
      alignItems:
        "center",
      flexGrow: 1,
    },

    failedCircle: {
      width: 86,
      height: 86,
      borderRadius: 43,
      backgroundColor:
        "#DC2626",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 20,
    },

    failedTitle: {
      fontSize: 22,
      fontWeight: "900",
      color:
        "#0F172A",
      marginTop: 20,
      textAlign:
        "center",
    },

    failedSubtitle: {
      fontSize: 14,
      color:
        "#64748B",
      textAlign:
        "center",
      lineHeight: 21,
      marginTop: 9,
    },

    refundNotice: {
      flexDirection:
        "row",
      width: "100%",
      backgroundColor:
        "#EFF6FF",
      borderRadius: 15,
      padding: 15,
      marginTop: 22,
      gap: 10,
    },

    refundText: {
      flex: 1,
      color:
        "#334155",
      fontSize: 12,
      lineHeight: 18,
    },

  });